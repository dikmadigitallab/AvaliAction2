"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  Star,
  ClipboardList,
} from "lucide-react"
import { getFormById, hasRespondedToForm, addFormResponse, maskCPF } from "@/lib/store"
import { validateCPF, formatCPF, hashCPF } from "@/lib/anonymize"
import { decodeFormFromURL } from "@/lib/form-share"
import type { FormTemplate, FormAnswer } from "@/lib/types"
import { toast } from "sonner"

type PageState = "cpf" | "form" | "success" | "already" | "not-found"

export default function ResponderFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const formId = params.id as string

  const [state, setState] = useState<PageState>("cpf")
  const [form, setForm] = useState<FormTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  // CPF state
  const [cpf, setCpf] = useState("")
  const [cpfHash, setCpfHash] = useState("")
  const [cpfMasked, setCpfMasked] = useState("")
  const [processingCpf, setProcessingCpf] = useState(false)

  // Answers state
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Try to load form from URL query param first, then fallback to localStorage
    const encodedData = searchParams.get("d")
    let formData: FormTemplate | null = null

    if (encodedData) {
      const decoded = decodeFormFromURL(encodedData)
      if (decoded) {
        formData = {
          ...decoded,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    }

    if (!formData) {
      const stored = getFormById(formId)
      if (stored) {
        formData = stored
      }
    }

    if (!formData) {
      setState("not-found")
    } else {
      setForm(formData)
    }
    setLoading(false)
  }, [formId, searchParams])

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  const handleCpfSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = cpf.replace(/\D/g, "")

    if (cleaned.length !== 11) {
      toast.error("CPF invalido. Insira exatamente 11 digitos.")
      return
    }

    if (!validateCPF(cleaned)) {
      toast.error("CPF invalido. Verifique os digitos e tente novamente.")
      return
    }

    setProcessingCpf(true)
    try {
      const hash = await hashCPF(cleaned)
      const masked = maskCPF(cleaned)
      setCpfHash(hash)
      setCpfMasked(masked)

      if (hasRespondedToForm(formId, hash)) {
        setState("already")
      } else {
        setState("form")
      }
    } catch {
      toast.error("Erro ao processar CPF. Tente novamente.")
    } finally {
      setProcessingCpf(false)
    }
  }

  const handleRatingClick = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmitForm = () => {
    if (!form) return

    // Validate all questions answered
    for (const q of form.questions) {
      const answer = answers[q.id]
      if (answer === undefined || answer === "") {
        toast.error(`Responda todas as perguntas antes de enviar.`)
        return
      }
    }

    setSubmitting(true)

    const formAnswers: FormAnswer[] = form.questions.map((q) => ({
      questionId: q.id,
      value: answers[q.id],
    }))

    addFormResponse(formId, cpfHash, cpfMasked, formAnswers)
    setState("success")
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    )
  }

  if (state === "not-found") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold text-foreground">
              Formulario nao encontrado
            </h2>
            <p className="text-sm text-muted-foreground">
              O formulario que voce esta tentando acessar nao existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "already") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">
              Voce ja respondeu
            </h2>
            <p className="text-sm text-muted-foreground">
              Este CPF ja enviou uma resposta para o formulario{" "}
              <strong>{form?.name}</strong>. Cada CPF pode responder apenas uma
              vez.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Resposta enviada
            </h2>
            <p className="text-sm text-muted-foreground">
              Obrigado por responder o formulario{" "}
              <strong>{form?.name}</strong>. Sua resposta foi registrada com
              sucesso.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // CPF entry
  if (state === "cpf") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl text-card-foreground">{form?.name}</CardTitle>
            <CardDescription>
              Informe seu CPF para responder este formulario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCpfSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="cpf-responder" className="sr-only">
                  CPF
                </label>
                <Input
                  id="cpf-responder"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="text-center text-lg tracking-wider"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={processingCpf}
                className="gap-2 text-base font-semibold"
              >
                {processingCpf ? "Verificando..." : "Continuar"}
              </Button>
              <Badge
                variant="secondary"
                className="mx-auto gap-1.5 text-xs font-normal"
              >
                <Lock className="h-3 w-3" />
                CPF anonimizado por criptografia
              </Badge>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form answering
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">{form?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Responda todas as perguntas abaixo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {form?.questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium text-card-foreground">
                      {q.text}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {q.type === "avaliacao"
                        ? `Selecione uma nota de 1 a ${q.maxScore}`
                        : "Escreva sua resposta"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {q.type === "avaliacao" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from({ length: q.maxScore || 5 }, (_, i) => i + 1).map(
                      (score) => {
                        const selected = answers[q.id] === score
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleRatingClick(q.id, score)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                            }`}
                          >
                            {score}
                          </button>
                        )
                      }
                    )}
                    {answers[q.id] !== undefined && (
                      <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-500" />
                        {answers[q.id]} / {q.maxScore}
                      </span>
                    )}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    rows={3}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-2 pb-8">
            <Button
              size="lg"
              className="gap-2 text-base font-semibold"
              onClick={handleSubmitForm}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar respostas"}
              {!submitting && <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

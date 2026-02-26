"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Pencil,
  Star,
  AlignLeft,
  CalendarDays,
  Hash,
  Clock,
  Share2,
  Copy,
  Users,
  MessageSquare,
} from "lucide-react"
import { getFormById, updateForm, getFormResponsesByFormId } from "@/lib/store"
import type { FormTemplate, FormQuestion, FormResponse } from "@/lib/types"
import { encodeFormForURL } from "@/lib/form-share"
import { FormBuilder } from "@/components/form-builder"
import { toast } from "sonner"

export default function FormConfigPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const formId = params.id as string

  const [form, setForm] = useState<FormTemplate | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = getFormById(formId)
    if (!data) {
      toast.error("Formulario nao encontrado.")
      router.push("/admin/formularios")
      return
    }
    setForm(data)
    setResponses(getFormResponsesByFormId(formId))
    setLoading(false)

    if (searchParams.get("edit") === "true") {
      setIsEditing(true)
    }
  }, [formId, router, searchParams])

  const handleUpdate = (name: string, questions: FormQuestion[]) => {
    const updated = updateForm(formId, name, questions)
    if (updated) {
      setForm(updated)
      setIsEditing(false)
      toast.success("Formulario atualizado com sucesso!")
    } else {
      toast.error("Erro ao atualizar formulario.")
    }
  }

  const handleCopyLink = () => {
    if (!form) return
    const encoded = encodeFormForURL(form)
    const url = `${window.location.origin}/responder/${formId}?d=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado para a area de transferencia!")
    }).catch(() => {
      toast.error("Nao foi possivel copiar o link.")
    })
  }

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    )
  }

  const ratingQuestions = form.questions.filter((q) => q.type === "avaliacao")
  const textQuestions = form.questions.filter((q) => q.type === "texto")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.push("/admin/formularios")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form.name}</h1>
            <p className="text-sm text-muted-foreground">
              Configuracao do formulario
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar link
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar formulario
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancelar edicao
            </Button>
          </div>
          <FormBuilder
            initialName={form.name}
            initialQuestions={form.questions}
            onSave={handleUpdate}
            submitLabel="Atualizar formulario"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Overview card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Visao geral</CardTitle>
              <CardDescription>Detalhes e estatisticas do formulario.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {form.questions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pergunta{form.questions.length !== 1 ? "s" : ""} total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {ratingQuestions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Avaliacao</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <AlignLeft className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {textQuestions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Texto</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(form.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {responses.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Resposta{responses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Perguntas do formulario</CardTitle>
              <CardDescription>
                Lista de todas as perguntas configuradas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {form.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {q.text}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1 text-xs">
                        {q.type === "avaliacao" ? (
                          <Star className="h-3 w-3" />
                        ) : (
                          <AlignLeft className="h-3 w-3" />
                        )}
                        {q.type === "avaliacao" ? "Avaliacao" : "Texto"}
                      </Badge>
                      {q.type === "avaliacao" && q.maxScore && (
                        <Badge variant="outline" className="text-xs">
                          Nota maxima: {q.maxScore}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        Tag: {q.tag}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-card-foreground">
                    Respostas recebidas
                  </CardTitle>
                  <CardDescription>
                    {responses.length === 0
                      ? "Nenhuma resposta recebida ainda."
                      : `${responses.length} resposta${responses.length !== 1 ? "s" : ""} recebida${responses.length !== 1 ? "s" : ""}.`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Compartilhe o link do formulario para comecar a receber respostas.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {responses
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((response, rIdx) => (
                      <div
                        key={response.id}
                        className="rounded-lg border border-border bg-muted/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {response.maskedCPF}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(response.createdAt).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{rIdx + 1}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                          {response.answers.map((answer) => {
                            const question = form.questions.find(
                              (q) => q.id === answer.questionId
                            )
                            if (!question) return null
                            return (
                              <div
                                key={answer.questionId}
                                className="flex flex-col gap-1 rounded-md bg-background p-3"
                              >
                                <p className="text-xs font-medium text-muted-foreground">
                                  {question.text}
                                </p>
                                {question.type === "avaliacao" ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-sm font-semibold text-foreground">
                                      {answer.value}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      / {question.maxScore}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground">
                                    {answer.value || "(sem resposta)"}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Metadados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    Criado em:{" "}
                    {new Date(form.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Atualizado em:{" "}
                    {new Date(form.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="font-mono text-xs">ID: {form.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

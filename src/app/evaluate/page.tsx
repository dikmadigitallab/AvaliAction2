"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { StarRating } from "@/components/star-rating"
import {
  initializeStore,
  maskCPF,
} from "@/lib/store"
import {
  fetchCompanies,
  fetchSupervisors,
  checkHasEvaluated,
  submitEvaluation,
  createAccessLog,
} from "@/lib/api"
import { containsProfanity } from "@/lib/profanity"
import type { Company, EvaluationRatings } from "@/lib/types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building2,
  User,
  Star,
  CheckCircle2,
  ChevronLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react"

type Step = "company" | "supervisor" | "rating" | "confirm" | "done"

interface SupervisorLocal {
  id: string
  name: string
  companyId: string
}

const EMPTY_RATINGS: EvaluationRatings = {
  lideranca: 0,
  comunicacao: 0,
  respeito: 0,
  organizacao: 0,
  apoioEquipe: 0,
}

export default function EvaluatePage() {
  const router = useRouter()
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const mounted = useRef(true)

  const [step, setStep] = useState<Step>("company")
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [supervisors, setSupervisors] = useState<SupervisorLocal[]>([])
  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorLocal | null>(null)
  const [ratings, setRatings] = useState<EvaluationRatings>({ ...EMPTY_RATINGS })
  const [comment, setComment] = useState("")
  const [profanityWarning, setProfanityWarning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [evaluatedMap, setEvaluatedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    mounted.current = true
    initializeStore()
    const id = sessionStorage.getItem("anonymous_id")
    if (!id) {
      router.replace("/")
      return
    }
    if (mounted.current) {
      setAnonymousId(id)
      fetchCompanies().then((c) => { if (mounted.current) setCompanies(c) }).catch(() => {})
      setReady(true)
    }
    return () => {
      mounted.current = false
    }
  }, [router])

  const selectCompany = useCallback(async (company: Company) => {
    setSelectedCompany(company)
    try {
      const sups = await fetchSupervisors(company.id)
      setSupervisors(sups)
      // Load evaluated status for each supervisor
      if (anonymousId) {
        const results = await Promise.all(
          sups.map((s) => checkHasEvaluated(anonymousId, s.id).then((v) => [s.id, v] as const))
        )
        setEvaluatedMap(Object.fromEntries(results))
      }
    } catch {
      setSupervisors([])
    }
    setStep("supervisor")
  }, [anonymousId])

  const selectSupervisor = useCallback(
    async (sup: SupervisorLocal) => {
      if (!anonymousId) return
      const evaluated = await checkHasEvaluated(anonymousId, sup.id)
      if (evaluated) return
      setSelectedSupervisor(sup)
      setRatings({ ...EMPTY_RATINGS })
      setComment("")
      setProfanityWarning(false)
      setStep("rating")
    },
    [anonymousId]
  )

  const allRated = CRITERIA_KEYS.every((k) => ratings[k] > 0)

  const handleCommentChange = useCallback((value: string) => {
    setComment(value)
    setProfanityWarning(containsProfanity(value))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!anonymousId || !selectedCompany || !selectedSupervisor || !allRated) return
    if (profanityWarning) return
    setSubmitting(true)

    Promise.all([
      submitEvaluation({
        anonymousId,
        companyId: selectedCompany.id,
        supervisorId: selectedSupervisor.id,
        ratings,
        comment: comment.trim() || undefined,
      }),
      createAccessLog({
        anonymousId,
        maskedCPF: "***.***.***-**",
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        action: "evaluation",
      }),
    ]).then(() => {
      setSubmitting(false)
      setStep("done")
    }).catch(() => {
      setSubmitting(false)
      setStep("done")
    })
  }, [anonymousId, selectedCompany, selectedSupervisor, allRated, profanityWarning, ratings, comment])

  const goBack = useCallback(() => {
    if (step === "supervisor") {
      setStep("company")
      setSelectedCompany(null)
    } else if (step === "rating") {
      setStep("supervisor")
      setSelectedSupervisor(null)
    } else if (step === "confirm") {
      setStep("rating")
    }
  }, [step])

  const resetFlow = useCallback(() => {
    setStep("company")
    setSelectedCompany(null)
    setSelectedSupervisor(null)
    setRatings({ ...EMPTY_RATINGS })
    setComment("")
    setProfanityWarning(false)
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Done step
  if (step === "done") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-12 text-center animate-fade-in-up sm:gap-6 sm:py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-scale-in sm:h-20 sm:w-20">
            <CheckCircle2 className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Obrigado pela sua avaliacao!</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Sua avaliacao foi registrada de forma anonima e segura. Ela contribui
            para a melhoria do ambiente de trabalho.
          </p>
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto">
            <Button onClick={resetFlow}>Avaliar outro supervisor</Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Voltar ao inicio
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const stepNumber =
    step === "company" ? 1 : step === "supervisor" ? 2 : step === "rating" ? 3 : 4
  const stepLabels = ["Empresa", "Supervisor", "Avaliacao", "Confirmar"]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Progress bar */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2 sm:text-xs">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={i + 1 <= stepNumber ? "font-semibold text-primary" : ""}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(stepNumber / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Back button */}
        {step !== "company" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-4 gap-1 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}

        {/* Company selection */}
        {step === "company" && (
          <div className="animate-fade-in-up">
            <h2 className="mb-1 text-lg font-bold text-foreground sm:mb-2 sm:text-xl">Selecione a empresa</h2>
            <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              Escolha a empresa do supervisor que deseja avaliar.
            </p>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => selectCompany(company)}
                  className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 text-center transition-all duration-200 hover:border-primary hover:bg-accent hover:scale-[1.02] hover:shadow-md sm:p-5 active:scale-[0.98]"
                >
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={160}
                      height={70}
                      className="h-14 sm:h-16 w-auto object-contain"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-14 sm:w-14">
                      <Building2 className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {companies.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Nenhuma empresa cadastrada. Contate o administrador.
              </p>
            )}
          </div>
        )}

        {/* Supervisor selection */}
        {step === "supervisor" && selectedCompany && (
          <div className="animate-fade-in-up">
            <h2 className="mb-1 text-lg font-bold text-foreground sm:mb-2 sm:text-xl">
              Selecione o supervisor
            </h2>
            <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              Supervisores de {selectedCompany.name}.
            </p>
            <div className="grid gap-2 sm:gap-3">
              {supervisors.map((sup) => {
                const evaluated = evaluatedMap[sup.id] ?? false
                return (
                  <button
                    key={sup.id}
                    onClick={() => !evaluated && selectSupervisor(sup)}
                    disabled={evaluated}
                    className={`flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all duration-200 sm:p-4 ${
                      evaluated
                        ? "cursor-not-allowed opacity-50"
                        : "hover:border-primary hover:bg-accent hover:scale-[1.01] hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium text-card-foreground">{sup.name}</span>
                    </div>
                    {evaluated && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Ja avaliado
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {supervisors.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Nenhum supervisor cadastrado para esta empresa.
              </p>
            )}
          </div>
        )}

        {/* Rating */}
        {step === "rating" && selectedSupervisor && (
          <div className="animate-fade-in-up">
            <h2 className="mb-1 text-lg font-bold text-foreground sm:mb-2 sm:text-xl">
              Avaliar: {selectedSupervisor.name}
            </h2>
            <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              Avalie cada criterio de 1 a 5 estrelas.
            </p>
            <Card>
              <CardContent className="space-y-4 pt-4 sm:space-y-6 sm:pt-6">
                {CRITERIA_KEYS.map((key) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <Label className="text-xs font-medium sm:text-sm">{CRITERIA_LABELS[key]}</Label>
                    <StarRating
                      value={ratings[key]}
                      onChange={(val) =>
                        setRatings((prev) => ({ ...prev, [key]: val }))
                      }
                    />
                  </div>
                ))}

                <div className="border-t border-border pt-4">
                  <Label className="mb-2 block text-sm font-medium">
                    Comentario (opcional)
                  </Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    placeholder="Deixe um comentario construtivo..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      {profanityWarning && (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Linguagem inadequada detectada. Revise seu comentario.
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {comment.length}/500
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!allRated || profanityWarning}
                  onClick={() => setStep("confirm")}
                >
                  Revisar avaliacao
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirm */}
        {step === "confirm" && selectedCompany && selectedSupervisor && (
          <div className="animate-fade-in-up">
            <h2 className="mb-1 text-lg font-bold text-foreground sm:mb-2 sm:text-xl">
              Confirmar avaliacao
            </h2>
            <p className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
              Revise os dados antes de enviar.
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedSupervisor.name} - {selectedCompany.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {CRITERIA_KEYS.map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {CRITERIA_LABELS[key]}
                    </span>
                    <StarRating value={ratings[key]} readonly size="sm" />
                  </div>
                ))}
                {comment.trim() && (
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Comentario:</p>
                    <p className="text-sm text-foreground">{comment}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar avaliacao"
                    )}
                  </Button>
                  <Button variant="outline" onClick={goBack} disabled={submitting}>
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

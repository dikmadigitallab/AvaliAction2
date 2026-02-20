export interface Company {
  id: string
  name: string
  logo?: string
}

export interface Supervisor {
  id: string
  name: string
  companyId: string
}

export interface EvaluationRatings {
  lideranca: number
  comunicacao: number
  respeito: number
  organizacao: number
  apoioEquipe: number
}

export interface Evaluation {
  id: string
  supervisorId: string
  companyId: string
  anonymousId: string
  ratings: EvaluationRatings
  comment?: string
  createdAt: string
}

export const CRITERIA_LABELS: Record<keyof EvaluationRatings, string> = {
  lideranca: "Lideranca",
  comunicacao: "Comunicacao",
  respeito: "Respeito",
  organizacao: "Organizacao",
  apoioEquipe: "Apoio a Equipe",
}

export const CRITERIA_KEYS = Object.keys(CRITERIA_LABELS) as (keyof EvaluationRatings)[]

export interface AccessLog {
  id: string
  anonymousId: string
  maskedCPF: string
  fullCPF?: string
  companyId?: string
  companyName?: string
  timestamp: string
  action: "login" | "evaluation" | "admin_login"
}

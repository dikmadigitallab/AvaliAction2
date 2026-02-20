import type { Company, Supervisor, Evaluation, AccessLog, FormTemplate, FormQuestion } from "./types"

const STORE_VERSION = "4"

const ADMIN_CPF = "12345678909"

const COMPANY_LOGOS: Record<string, string> = {
  dikma: "https://i.ibb.co/Z61BpdnN/download.png",
  arcelormittal: "https://i.ibb.co/hx2Cm5yN/Arcelor-Mittal-svg.png",
}

const KEYS = {
  companies: "eval_companies",
  supervisors: "eval_supervisors",
  evaluations: "eval_evaluations",
  accessLogs: "eval_access_logs",
  adminHash: "eval_admin_hash",
  initialized: "eval_initialized",
  version: "eval_store_version",
  forms: "eval_forms",
} as const

const DEFAULT_COMPANIES: Company[] = [
  { id: "dikma", name: "Dikma", logo: "https://i.ibb.co/Z61BpdnN/download.png" },
  { id: "arcelormittal", name: "ArcelorMittal", logo: "https://i.ibb.co/hx2Cm5yN/Arcelor-Mittal-svg.png" },
]

const DEFAULT_SUPERVISORS: Supervisor[] = [
  { id: "douglas-dikma", name: "Douglas", companyId: "dikma" },
]

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeStore(): void {
  if (typeof window === "undefined") return
  const currentVersion = localStorage.getItem(KEYS.version)
  if (!currentVersion || currentVersion !== STORE_VERSION) {
    setItem(KEYS.companies, DEFAULT_COMPANIES)
    setItem(KEYS.supervisors, DEFAULT_SUPERVISORS)
    setItem(KEYS.evaluations, [])
    localStorage.setItem(KEYS.initialized, "true")
    localStorage.setItem(KEYS.version, STORE_VERSION)
  }
}

// Companies
export function getCompanies(): Company[] {
  const companies = getItem<Company[]>(KEYS.companies, DEFAULT_COMPANIES)
  return companies.map((c) => ({
    ...c,
    logo: c.logo || COMPANY_LOGOS[c.id] || undefined,
  }))
}

export function addCompany(name: string): Company {
  const companies = getCompanies()
  const newCompany: Company = {
    id: crypto.randomUUID(),
    name,
  }
  companies.push(newCompany)
  setItem(KEYS.companies, companies)
  return newCompany
}

export function deleteCompany(id: string): void {
  const companies = getCompanies().filter((c) => c.id !== id)
  setItem(KEYS.companies, companies)
  // Also remove supervisors of this company
  const supervisors = getSupervisors().filter((s) => s.companyId !== id)
  setItem(KEYS.supervisors, supervisors)
}

// Supervisors
export function getSupervisors(): Supervisor[] {
  return getItem<Supervisor[]>(KEYS.supervisors, [])
}

export function getSupervisorsByCompany(companyId: string): Supervisor[] {
  return getSupervisors().filter((s) => s.companyId === companyId)
}

export function addSupervisor(name: string, companyId: string): Supervisor {
  const supervisors = getSupervisors()
  const newSupervisor: Supervisor = {
    id: crypto.randomUUID(),
    name,
    companyId,
  }
  supervisors.push(newSupervisor)
  setItem(KEYS.supervisors, supervisors)
  return newSupervisor
}

export function updateSupervisor(id: string, name: string): void {
  const supervisors = getSupervisors()
  const index = supervisors.findIndex((s) => s.id === id)
  if (index !== -1) {
    supervisors[index].name = name
    setItem(KEYS.supervisors, supervisors)
  }
}

export function deleteSupervisor(id: string): void {
  const supervisors = getSupervisors().filter((s) => s.id !== id)
  setItem(KEYS.supervisors, supervisors)
}

// Evaluations
export function getEvaluations(): Evaluation[] {
  return getItem<Evaluation[]>(KEYS.evaluations, [])
}

export function getEvaluationsByCompany(companyId: string): Evaluation[] {
  return getEvaluations().filter((e) => e.companyId === companyId)
}

export function getEvaluationsBySupervisor(supervisorId: string): Evaluation[] {
  return getEvaluations().filter((e) => e.supervisorId === supervisorId)
}

export function hasEvaluated(anonymousId: string, supervisorId: string): boolean {
  return getEvaluations().some(
    (e) => e.anonymousId === anonymousId && e.supervisorId === supervisorId
  )
}

export function addEvaluation(evaluation: Omit<Evaluation, "id" | "createdAt">): Evaluation {
  const evaluations = getEvaluations()
  const newEval: Evaluation = {
    ...evaluation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  evaluations.push(newEval)
  setItem(KEYS.evaluations, evaluations)
  return newEval
}

// Admin (CPF-based)
export function verifyAdminCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "")
  return cleaned === ADMIN_CPF
}

export function setAdminSession(name?: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem("admin_session", "true")
  if (name) sessionStorage.setItem("admin_name", name)
}

export function getAdminName(): string {
  if (typeof window === "undefined") return "Administrador"
  return sessionStorage.getItem("admin_name") || "Administrador"
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("admin_session") === "true"
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem("admin_session")
  sessionStorage.removeItem("admin_name")
}

// Access Logs
export function getAccessLogs(): AccessLog[] {
  return getItem<AccessLog[]>(KEYS.accessLogs, [])
}

export function addAccessLog(log: Omit<AccessLog, "id" | "timestamp">): AccessLog {
  const logs = getAccessLogs()
  const newLog: AccessLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  logs.push(newLog)
  setItem(KEYS.accessLogs, logs)
  return newLog
}

export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length < 11) return "***.***.***-**"
  return `***.***.***.${cleaned.slice(9, 11)}`
}

// Forms
export function getForms(): FormTemplate[] {
  return getItem<FormTemplate[]>(KEYS.forms, [])
}

export function getFormById(id: string): FormTemplate | undefined {
  return getForms().find((f) => f.id === id)
}

export function addForm(name: string, questions: FormQuestion[]): FormTemplate {
  const forms = getForms()
  const now = new Date().toISOString()
  const newForm: FormTemplate = {
    id: crypto.randomUUID(),
    name,
    questions,
    createdAt: now,
    updatedAt: now,
  }
  forms.push(newForm)
  setItem(KEYS.forms, forms)
  return newForm
}

export function updateForm(id: string, name: string, questions: FormQuestion[]): FormTemplate | null {
  const forms = getForms()
  const index = forms.findIndex((f) => f.id === id)
  if (index === -1) return null
  forms[index] = {
    ...forms[index],
    name,
    questions,
    updatedAt: new Date().toISOString(),
  }
  setItem(KEYS.forms, forms)
  return forms[index]
}

export function deleteForm(id: string): void {
  const forms = getForms().filter((f) => f.id !== id)
  setItem(KEYS.forms, forms)
}

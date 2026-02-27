import type {
  Company,
  Supervisor,
  Evaluation,
  AccessLog,
  FormTemplate,
  FormQuestion,
} from "./types"

const BASE = ""

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Companies
export async function fetchCompanies(): Promise<Company[]> {
  return fetchJSON<Company[]>("/api/companies")
}

export async function createCompany(name: string): Promise<Company> {
  return fetchJSON<Company>("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export async function removeCompany(id: string): Promise<void> {
  await fetchJSON(`/api/companies/${id}`, { method: "DELETE" })
}

// Supervisors
export async function fetchSupervisors(companyId?: string): Promise<Supervisor[]> {
  const qs = companyId ? `?companyId=${companyId}` : ""
  return fetchJSON<Supervisor[]>(`/api/supervisors${qs}`)
}

export async function createSupervisor(name: string, companyId: string): Promise<Supervisor> {
  return fetchJSON<Supervisor>("/api/supervisors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId }),
  })
}

export async function editSupervisor(id: string, name: string): Promise<Supervisor> {
  return fetchJSON<Supervisor>(`/api/supervisors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export async function removeSupervisor(id: string): Promise<void> {
  await fetchJSON(`/api/supervisors/${id}`, { method: "DELETE" })
}

// Evaluations
export async function fetchEvaluations(filters?: {
  companyId?: string
  supervisorId?: string
}): Promise<Evaluation[]> {
  const params = new URLSearchParams()
  if (filters?.companyId) params.set("companyId", filters.companyId)
  if (filters?.supervisorId) params.set("supervisorId", filters.supervisorId)
  const qs = params.toString() ? `?${params}` : ""
  return fetchJSON<Evaluation[]>(`/api/evaluations${qs}`)
}

export async function checkHasEvaluated(anonymousId: string, supervisorId: string): Promise<boolean> {
  const data = await fetchJSON<{ hasEvaluated: boolean }>(
    `/api/evaluations/check?anonymousId=${anonymousId}&supervisorId=${supervisorId}`
  )
  return data.hasEvaluated
}

export async function submitEvaluation(data: {
  supervisorId: string
  companyId: string
  anonymousId: string
  ratings: { lideranca: number; comunicacao: number; respeito: number; organizacao: number; apoioEquipe: number }
  comment?: string
}): Promise<Evaluation> {
  return fetchJSON<Evaluation>("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

// Access Logs
export async function fetchAccessLogs(): Promise<AccessLog[]> {
  return fetchJSON<AccessLog[]>("/api/access-logs")
}

export async function createAccessLog(log: Omit<AccessLog, "id" | "timestamp">): Promise<AccessLog> {
  return fetchJSON<AccessLog>("/api/access-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  })
}

// Forms
export async function fetchForms(): Promise<FormTemplate[]> {
  return fetchJSON<FormTemplate[]>("/api/forms")
}

export async function fetchFormById(id: string): Promise<FormTemplate | null> {
  try {
    return await fetchJSON<FormTemplate>(`/api/forms/${id}`)
  } catch {
    return null
  }
}

export async function createForm(name: string, questions: FormQuestion[]): Promise<FormTemplate> {
  return fetchJSON<FormTemplate>("/api/forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, questions }),
  })
}

export async function editForm(id: string, name: string, questions: FormQuestion[]): Promise<FormTemplate> {
  return fetchJSON<FormTemplate>(`/api/forms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, questions }),
  })
}

export async function removeForm(id: string): Promise<void> {
  await fetchJSON(`/api/forms/${id}`, { method: "DELETE" })
}

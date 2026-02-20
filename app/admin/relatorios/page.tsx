"use client"

import { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import {
  initializeStore,
  getCompanies,
  getSupervisorsByCompany,
  getEvaluationsBySupervisor,
} from "@/lib/store"
import type { Company, Supervisor, Evaluation, EvaluationRatings } from "@/lib/types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import {
  Building2,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
} from "lucide-react"

interface SupervisorReport {
  supervisor: Supervisor
  evaluations: Evaluation[]
  averages: Record<keyof EvaluationRatings, number>
  overallAvg: number
  totalEvals: number
  bestCriteria: string
  worstCriteria: string
}

export default function RelatoriosPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState("all")

  useEffect(() => {
    initializeStore()
    setCompanies(getCompanies())
  }, [])

  const reports: SupervisorReport[] = useMemo(() => {
    const targetCompanies =
      selectedCompany === "all"
        ? companies
        : companies.filter((c) => c.id === selectedCompany)

    const allReports: SupervisorReport[] = []

    for (const company of targetCompanies) {
      const supervisors = getSupervisorsByCompany(company.id)
      for (const sup of supervisors) {
        const evals = getEvaluationsBySupervisor(sup.id)
        if (evals.length === 0) continue

        const averages: Record<string, number> = {}
        for (const key of CRITERIA_KEYS) {
          const sum = evals.reduce((acc, e) => acc + (e.ratings[key] || 0), 0)
          averages[key] = sum / evals.length
        }

        const overallAvg =
          Object.values(averages).reduce((a, b) => a + b, 0) / CRITERIA_KEYS.length

        const sortedCriteria = CRITERIA_KEYS.sort(
          (a, b) => averages[b] - averages[a]
        )

        allReports.push({
          supervisor: sup,
          evaluations: evals,
          averages: averages as Record<keyof EvaluationRatings, number>,
          overallAvg,
          totalEvals: evals.length,
          bestCriteria: CRITERIA_LABELS[sortedCriteria[0]],
          worstCriteria: CRITERIA_LABELS[sortedCriteria[sortedCriteria.length - 1]],
        })
      }
    }

    return allReports.sort((a, b) => b.overallAvg - a.overallAvg)
  }, [companies, selectedCompany])

  const radarData = useMemo(() => {
    if (reports.length === 0) return []
    const globalAvgs: Record<string, number> = {}
    for (const key of CRITERIA_KEYS) {
      const sum = reports.reduce((acc, r) => acc + r.averages[key], 0)
      globalAvgs[key] = sum / reports.length
    }
    return CRITERIA_KEYS.map((key) => ({
      criterio: CRITERIA_LABELS[key].split(" ").slice(0, 2).join(" "),
      media: Number(globalAvgs[key].toFixed(2)),
    }))
  }, [reports])

  const rankingData = useMemo(() => {
    return reports.slice(0, 10).map((r) => ({
      name: r.supervisor.name.split(" ").slice(0, 2).join(" "),
      media: Number(r.overallAvg.toFixed(2)),
    }))
  }, [reports])

  const topPerformer = reports[0]
  const needsAttention = reports.filter((r) => r.overallAvg < 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
          <p className="text-muted-foreground mt-1">
            Analise detalhada de supervisores por criterio.
          </p>
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-full sm:w-52">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <div className="flex items-center gap-2">
                  {c.logo ? (
                    <Image src={c.logo} alt={c.name} width={80} height={30} className="h-5 w-auto" unoptimized />
                  ) : (
                    <span>{c.name}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum dado disponivel</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Os relatorios serao gerados apos avaliacoes serem registradas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Highlights */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <Award className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {topPerformer?.supervisor.name || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Melhor avaliado - {topPerformer?.overallAvg.toFixed(1)}/5
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">Supervisores avaliados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{needsAttention.length}</p>
                  <p className="text-xs text-muted-foreground">Necessitam atencao ({'<'} 3.0)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ranking de Supervisores</CardTitle>
                <CardDescription>Top 10 por media geral</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [v.toFixed(2), "Media"]}
                        contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                      />
                      <Bar dataKey="media" fill="oklch(0.60 0.13 175)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Media por Criterio</CardTitle>
                <CardDescription>Visao geral de todos os criterios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid strokeOpacity={0.3} />
                      <PolarAngleAxis dataKey="criterio" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Media"
                        dataKey="media"
                        stroke="oklch(0.60 0.13 175)"
                        fill="oklch(0.60 0.13 175)"
                        fillOpacity={0.3}
                      />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Media"]} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supervisor Detail Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhamento por Supervisor</CardTitle>
              <CardDescription>
                {reports.length} supervisor(es) com avaliacoes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.supervisor.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {r.supervisor.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.totalEvals} avaliacao(es) | {r.supervisor.role || "Supervisor"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={r.overallAvg >= 4 ? "default" : r.overallAvg >= 3 ? "secondary" : "destructive"}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {r.overallAvg.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {CRITERIA_KEYS.map((key) => (
                        <div
                          key={key}
                          className="rounded-md bg-muted/50 p-2 text-center"
                        >
                          <p className="text-xs text-muted-foreground truncate">
                            {CRITERIA_LABELS[key]}
                          </p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {r.averages[key].toFixed(1)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-600" /> Melhor: {r.bestCriteria}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500" /> A melhorar: {r.worstCriteria}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

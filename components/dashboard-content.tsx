"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"
import {
  BarChart3,
  Download,
  Users,
  Star,
  Building2,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react"
import {
  getCompanies,
  getEvaluations,
  getSupervisors,
  getAccessLogs,
} from "@/lib/store"
import { exportEvaluationsToExcel, exportEvaluationsToPDF } from "@/lib/excel-export"
import type { Company, Supervisor, Evaluation, EvaluationRatings } from "@/lib/types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "@/lib/types"
import { cn } from "@/lib/utils"

function getAverage(ratings: EvaluationRatings): number {
  return CRITERIA_KEYS.reduce((sum, key) => sum + ratings[key], 0) / CRITERIA_KEYS.length
}

export function DashboardContent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [totalAccesses, setTotalAccesses] = useState(0)

  useEffect(() => {
    setCompanies(getCompanies())
    setSupervisors(getSupervisors())
    setEvaluations(getEvaluations())
    setTotalAccesses(getAccessLogs().filter((l) => l.action === "login").length)
  }, [])

  const overallAvg = useMemo(() => {
    if (evaluations.length === 0) return 0
    return evaluations.reduce((sum, e) => sum + getAverage(e.ratings), 0) / evaluations.length
  }, [evaluations])

  const avgColor = overallAvg >= 4 ? "text-emerald-600" : overallAvg >= 3 ? "text-amber-600" : "text-red-600"
  const avgBg = overallAvg >= 4 ? "bg-emerald-50" : overallAvg >= 3 ? "bg-amber-50" : "bg-red-50"

  // Chart 1: Evaluations per company
  const companyChartData = useMemo(() => {
    return companies.map((c) => {
      const evals = evaluations.filter((e) => e.companyId === c.id)
      const avg = evals.length > 0
        ? evals.reduce((sum, e) => sum + getAverage(e.ratings), 0) / evals.length
        : 0
      return {
        name: c.name,
        avaliacoes: evals.length,
        media: Number(avg.toFixed(2)),
      }
    })
  }, [companies, evaluations])

  // Chart 2: Average per criteria
  const criteriaChartData = useMemo(() => {
    if (evaluations.length === 0) return []
    return CRITERIA_KEYS.map((key) => ({
      criterio: CRITERIA_LABELS[key],
      media: Number(
        (evaluations.reduce((sum, e) => sum + e.ratings[key], 0) / evaluations.length).toFixed(2)
      ),
    }))
  }, [evaluations])

  // Chart 3: Timeline (evaluations over time, grouped by day)
  const timelineData = useMemo(() => {
    if (evaluations.length === 0) return []
    const grouped = new Map<string, number>()
    evaluations.forEach((e) => {
      const day = new Date(e.createdAt).toLocaleDateString("pt-BR")
      grouped.set(day, (grouped.get(day) || 0) + 1)
    })
    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, avaliacoes: count }))
      .sort((a, b) => {
        const [da, ma, ya] = a.date.split("/").map(Number)
        const [db, mb, yb] = b.date.split("/").map(Number)
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
      })
  }, [evaluations])

  const handleExport = () => {
    exportEvaluationsToExcel(evaluations)
  }

  const chartConfigCompany = {
    avaliacoes: { label: "Avaliacoes", color: "oklch(0.60 0.13 175)" },
    media: { label: "Media", color: "oklch(0.55 0.12 250)" },
  }

  const chartConfigCriteria = {
    media: { label: "Media", color: "oklch(0.55 0.12 250)" },
  }

  const chartConfigTimeline = {
    avaliacoes: { label: "Avaliacoes", color: "oklch(0.60 0.13 175)" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visao geral das avaliacoes de supervisores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={evaluations.length === 0}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => exportEvaluationsToPDF(evaluations)} disabled={evaluations.length === 0}>
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Avaliacoes</p>
              <p className="text-xl font-bold text-card-foreground">{evaluations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Acessos</p>
              <p className="text-xl font-bold text-card-foreground">{totalAccesses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Empresas</p>
              <p className="text-xl font-bold text-card-foreground">{companies.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", avgBg)}>
              <Star className={cn("h-5 w-5", avgColor)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Media Geral</p>
              <p className={cn("text-xl font-bold", avgColor)}>
                {overallAvg > 0 ? overallAvg.toFixed(1) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma avaliacao encontrada</p>
            <p className="text-sm text-muted-foreground">
              As avaliacoes aparecerao aqui quando os colaboradores enviarem seus feedbacks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Evaluations by Company */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Avaliacoes por Empresa</CardTitle>
                <CardDescription>Quantidade e media por empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigCompany} className="h-64 w-full">
                  <BarChart data={companyChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avaliacoes" fill="var(--color-avaliacoes)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Average by Criteria */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Media por Criterio</CardTitle>
                <CardDescription>Desempenho medio em cada dimensao</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigCriteria} className="h-64 w-full">
                  <BarChart data={criteriaChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="criterio" type="category" width={100} tick={{ fontSize: 11 }} />
                    <XAxis type="number" domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="media" fill="var(--color-media)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          {timelineData.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-card-foreground">Evolucao de Avaliacoes</CardTitle>
                <CardDescription>Quantidade de avaliacoes ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigTimeline} className="h-56 w-full">
                  <AreaChart data={timelineData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="avaliacoes"
                      fill="var(--color-avaliacoes)"
                      fillOpacity={0.2}
                      stroke="var(--color-avaliacoes)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

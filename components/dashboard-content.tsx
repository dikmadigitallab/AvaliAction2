"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  BarChart3,
  Download,
  Users,
  Star,
  TrendingUp,
  Building2,
  MessageSquare,
} from "lucide-react"
import { StarRating } from "@/components/star-rating"
import {
  getCompanies,
  getEvaluations,
  getSupervisors,
  exportToCSV,
  downloadCSV,
} from "@/lib/store"
import type { Company, Supervisor, Evaluation, EvaluationRatings } from "@/lib/types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "@/lib/types"
import { cn } from "@/lib/utils"

type ChartConfigType = Record<string, { label: string; color: string }>

function getAverage(ratings: EvaluationRatings): number {
  return (
    CRITERIA_KEYS.reduce((sum, key) => sum + ratings[key], 0) / CRITERIA_KEYS.length
  )
}

export function DashboardContent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("all")

  useEffect(() => {
    setCompanies(getCompanies())
    setSupervisors(getSupervisors())
    setEvaluations(getEvaluations())
  }, [])

  const filteredEvals = useMemo(() => {
    if (selectedCompany === "all") return evaluations
    return evaluations.filter((e) => e.companyId === selectedCompany)
  }, [evaluations, selectedCompany])

  const totalEvaluations = filteredEvals.length

  const overallAvg = useMemo(() => {
    if (filteredEvals.length === 0) return 0
    return (
      filteredEvals.reduce((sum, e) => sum + getAverage(e.ratings), 0) /
      filteredEvals.length
    )
  }, [filteredEvals])

  const evaluatedSupervisors = useMemo(() => {
    const ids = new Set(filteredEvals.map((e) => e.supervisorId))
    return ids.size
  }, [filteredEvals])

  // Supervisor ranking data
  const supervisorRanking = useMemo(() => {
    const map = new Map<
      string,
      { name: string; company: string; evals: Evaluation[] }
    >()
    filteredEvals.forEach((e) => {
      if (!map.has(e.supervisorId)) {
        const sup = supervisors.find((s) => s.id === e.supervisorId)
        const comp = companies.find((c) => c.id === e.companyId)
        map.set(e.supervisorId, {
          name: sup?.name || "N/A",
          company: comp?.name || "N/A",
          evals: [],
        })
      }
      map.get(e.supervisorId)!.evals.push(e)
    })
    return Array.from(map.entries())
      .map(([id, data]) => {
        const avg =
          data.evals.reduce((sum, e) => sum + getAverage(e.ratings), 0) /
          data.evals.length
        const criteriaAvg: Record<string, number> = {}
        CRITERIA_KEYS.forEach((key) => {
          criteriaAvg[key] =
            data.evals.reduce((sum, e) => sum + e.ratings[key], 0) /
            data.evals.length
        })
        return {
          id,
          name: data.name,
          company: data.company,
          average: avg,
          count: data.evals.length,
          criteriaAvg,
        }
      })
      .sort((a, b) => b.average - a.average)
  }, [filteredEvals, supervisors, companies])

  // Chart: average by supervisor
  const supervisorChartData = useMemo(() => {
    return supervisorRanking.map((s) => ({
      name: s.name.length > 12 ? s.name.substring(0, 12) + "..." : s.name,
      media: Number(s.average.toFixed(2)),
    }))
  }, [supervisorRanking])

  const supervisorChartConfig: ChartConfigType = {
    media: { label: "Media Geral", color: "var(--color-chart-1)" },
  }

  // Chart: criteria overview (radar data for bar chart)
  const criteriaChartData = useMemo(() => {
    if (filteredEvals.length === 0) return []
    return CRITERIA_KEYS.map((key) => ({
      criterio: CRITERIA_LABELS[key],
      media: Number(
        (
          filteredEvals.reduce((sum, e) => sum + e.ratings[key], 0) /
          filteredEvals.length
        ).toFixed(2)
      ),
    }))
  }, [filteredEvals])

  const criteriaChartConfig: ChartConfigType = {
    media: { label: "Media", color: "var(--color-chart-2)" },
  }

  // Evaluation detail table
  const evalTableData = useMemo(() => {
    return filteredEvals
      .map((e) => {
        const sup = supervisors.find((s) => s.id === e.supervisorId)
        const comp = companies.find((c) => c.id === e.companyId)
        return {
          ...e,
          supervisorName: sup?.name || "N/A",
          companyName: comp?.name || "N/A",
          average: getAverage(e.ratings),
        }
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [filteredEvals, supervisors, companies])

  const handleExport = () => {
    const csv = exportToCSV(filteredEvals)
    const companyName =
      selectedCompany === "all"
        ? "todas"
        : companies.find((c) => c.id === selectedCompany)?.name || "empresa"
    downloadCSV(csv, `avaliacoes_${companyName}_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Visualize as avaliacoes de supervisores
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full sm:w-48">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    {c.logo ? (
                      <Image
                        src={c.logo}
                        alt={c.name}
                        width={80}
                        height={30}
                        className="h-5 w-auto"
                      />
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={filteredEvals.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-8 sm:gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
              <BarChart3 className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground sm:text-sm">Avaliacoes</p>
              <p className="text-lg font-bold text-card-foreground sm:text-2xl">{totalEvaluations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
              <Star className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground sm:text-sm">Media</p>
              <p className="text-lg font-bold text-card-foreground sm:text-2xl">
                {overallAvg > 0 ? overallAvg.toFixed(1) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
              <Users className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground sm:text-sm">Avaliados</p>
              <p className="text-lg font-bold text-card-foreground sm:text-2xl">{evaluatedSupervisors}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredEvals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhuma avaliacao encontrada
            </p>
            <p className="text-sm text-muted-foreground">
              As avaliacoes aparecerao aqui quando os colaboradores enviarem seus feedbacks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="charts" className="gap-6">
          <TabsList>
            <TabsTrigger value="charts">Graficos</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="table">Avaliacoes</TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="flex flex-col gap-4 sm:gap-6">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Bar Chart: By Supervisor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">Media por Supervisor</CardTitle>
                  <CardDescription>
                    Comparativo de medias gerais entre supervisores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {supervisorChartData.length > 0 ? (
                    <ChartContainer config={supervisorChartConfig} className="h-64 w-full">
                      <BarChart data={supervisorChartData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={80}
                          tick={{ fontSize: 12 }}
                        />
                        <XAxis type="number" domain={[0, 5]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="media"
                          fill="var(--color-media)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Sem dados
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Bar Chart: By Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">Media por Criterio</CardTitle>
                  <CardDescription>
                    Desempenho medio em cada dimensao avaliada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {criteriaChartData.length > 0 ? (
                    <ChartContainer config={criteriaChartConfig} className="h-64 w-full">
                      <BarChart data={criteriaChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="criterio"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis domain={[0, 5]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="media"
                          fill="var(--color-media)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Sem dados
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ranking de Supervisores
                </CardTitle>
                <CardDescription>
                  Ordenado pela media geral das avaliacoes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {supervisorRanking.map((sup, idx) => (
                    <div
                      key={sup.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm",
                            idx === 0 && "bg-amber-100 text-amber-700",
                            idx === 1 && "bg-gray-100 text-gray-600",
                            idx === 2 && "bg-orange-100 text-orange-700",
                            idx > 2 && "bg-muted text-muted-foreground"
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate sm:text-base">{sup.name}</p>
                          <p className="text-[10px] text-muted-foreground sm:text-xs">
                            {sup.company} - {sup.count} avaliacao(oes)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-10 sm:pl-0 sm:ml-auto">
                        <StarRating
                          value={Math.round(sup.average)}
                          readonly
                          size="sm"
                        />
                        <Badge
                          variant={sup.average >= 4 ? "default" : sup.average >= 3 ? "secondary" : "destructive"}
                          className={cn(
                            "min-w-[3rem] justify-center text-xs",
                            sup.average >= 4 && "bg-primary text-primary-foreground"
                          )}
                        >
                          {sup.average.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Todas as Avaliacoes
                </CardTitle>
                <CardDescription>
                  Lista detalhada de todas as avaliacoes recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Supervisor</TableHead>
                        {CRITERIA_KEYS.map((key) => (
                          <TableHead key={key} className="text-center">
                            {CRITERIA_LABELS[key].slice(0, 3).toUpperCase()}
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Media</TableHead>
                        <TableHead>Comentario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evalTableData.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-xs">
                            {e.companyName}
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            {e.supervisorName}
                          </TableCell>
                          {CRITERIA_KEYS.map((key) => (
                            <TableCell key={key} className="text-center text-xs">
                              {e.ratings[key]}
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <Badge
                              variant={e.average >= 4 ? "default" : e.average >= 3 ? "secondary" : "destructive"}
                              className={cn(
                                "text-xs",
                                e.average >= 4 && "bg-primary text-primary-foreground"
                              )}
                            >
                              {e.average.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {e.comment || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

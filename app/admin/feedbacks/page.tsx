"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertTriangle, Download, Filter, FileText } from "lucide-react"
import {
  getCompanies,
  getEvaluations,
  getSupervisors,
} from "@/lib/store"
import { exportEvaluationsToExcel, exportEvaluationsToPDF } from "@/lib/excel-export"
import type { Company, Supervisor, Evaluation, EvaluationRatings } from "@/lib/types"
import { CRITERIA_LABELS, CRITERIA_KEYS } from "@/lib/types"
import { cn } from "@/lib/utils"

function getAverage(ratings: EvaluationRatings): number {
  return CRITERIA_KEYS.reduce((sum, key) => sum + ratings[key], 0) / CRITERIA_KEYS.length
}

export default function FeedbacksPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filterCompany, setFilterCompany] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterSupervisor, setFilterSupervisor] = useState("all")

  useEffect(() => {
    setCompanies(getCompanies())
    setSupervisors(getSupervisors())
    setEvaluations(getEvaluations())
  }, [])

  const filteredEvals = useMemo(() => {
    let result = evaluations

    if (filterCompany !== "all") {
      result = result.filter((e) => e.companyId === filterCompany)
    }

    if (filterSupervisor !== "all") {
      result = result.filter((e) => e.supervisorId === filterSupervisor)
    }

    if (filterLevel !== "all") {
      result = result.filter((e) => {
        const avg = getAverage(e.ratings)
        if (filterLevel === "high") return avg >= 4
        if (filterLevel === "medium") return avg >= 3 && avg < 4
        if (filterLevel === "low") return avg < 3
        return true
      })
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [evaluations, filterCompany, filterLevel, filterSupervisor])

  const availableSupervisors = useMemo(() => {
    if (filterCompany === "all") return supervisors
    return supervisors.filter((s) => s.companyId === filterCompany)
  }, [supervisors, filterCompany])

  const handleExport = () => {
    exportEvaluationsToExcel(filteredEvals)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
          <p className="text-sm text-muted-foreground">
            Todas as avaliacoes recebidas ({filteredEvals.length} resultado{filteredEvals.length !== 1 ? "s" : ""})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={filteredEvals.length === 0}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => exportEvaluationsToPDF(filteredEvals)} disabled={filteredEvals.length === 0}>
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Filter className="h-4 w-4" />
            Filtros:
          </div>
          <Select value={filterCompany} onValueChange={(v) => { setFilterCompany(v); setFilterSupervisor("all") }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos supervisores</SelectItem>
              {availableSupervisors.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Nota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas notas</SelectItem>
              <SelectItem value="high">Alta (4-5)</SelectItem>
              <SelectItem value="medium">Media (3-4)</SelectItem>
              <SelectItem value="low">Baixa (1-3)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredEvals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum feedback encontrado</p>
            <p className="text-sm text-muted-foreground">Ajuste os filtros ou aguarde novas avaliacoes.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Data</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Supervisor</TableHead>
                    {CRITERIA_KEYS.map((key) => (
                      <TableHead key={key} className="text-center w-16">
                        {CRITERIA_LABELS[key].slice(0, 5)}
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-16">Media</TableHead>
                    <TableHead className="min-w-[200px]">Comentario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvals.map((e) => {
                    const sup = supervisors.find((s) => s.id === e.supervisorId)
                    const comp = companies.find((c) => c.id === e.companyId)
                    const avg = getAverage(e.ratings)
                    const isLow = avg < 2

                    return (
                      <TableRow key={e.id} className={cn(isLow && "bg-red-50/50")}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                          <br />
                          <span className="text-muted-foreground">
                            {new Date(e.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{comp?.name || "N/A"}</TableCell>
                        <TableCell className="text-sm font-medium">{sup?.name || "N/A"}</TableCell>
                        {CRITERIA_KEYS.map((key) => (
                          <TableCell key={key} className="text-center text-sm">
                            <span className={cn(
                              e.ratings[key] <= 2 && "text-red-600 font-semibold",
                              e.ratings[key] >= 4 && "text-emerald-600"
                            )}>
                              {e.ratings[key]}
                            </span>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isLow && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            <Badge
                              variant={avg >= 4 ? "default" : avg >= 3 ? "secondary" : "destructive"}
                              className={cn("text-xs", avg >= 4 && "bg-emerald-600 text-white")}
                            >
                              {avg.toFixed(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                          {e.comment ? (
                            <p className="line-clamp-2">{e.comment}</p>
                          ) : (
                            <span className="italic text-muted-foreground/50">Sem comentario</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

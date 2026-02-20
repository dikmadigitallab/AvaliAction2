"use client"

import { useEffect, useState, useMemo } from "react"
import { initializeStore, getAccessLogs } from "@/lib/store"
import type { AccessLog } from "@/lib/types"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, User, Shield, FileText } from "lucide-react"

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  login: { label: "Login", color: "bg-blue-100 text-blue-800" },
  evaluation: { label: "Avaliacao", color: "bg-emerald-100 text-emerald-800" },
  admin_login: { label: "Admin", color: "bg-amber-100 text-amber-800" },
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [filterAction, setFilterAction] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    initializeStore()
    setLogs(getAccessLogs())
  }, [])

  const filtered = useMemo(() => {
    let result = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    if (filterAction !== "all") {
      result = result.filter((l) => l.action === filterAction)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.maskedCPF.toLowerCase().includes(q) ||
          l.anonymousId.toLowerCase().includes(q) ||
          (l.companyName && l.companyName.toLowerCase().includes(q))
      )
    }
    return result
  }, [logs, filterAction, search])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs de Acesso</h1>
        <p className="text-muted-foreground mt-1">
          Historico de acessos e acoes na plataforma.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {logs.filter((l) => l.action === "login").length}
              </p>
              <p className="text-xs text-muted-foreground">Logins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <FileText className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {logs.filter((l) => l.action === "evaluation").length}
              </p>
              <p className="text-xs text-muted-foreground">Avaliacoes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Shield className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {logs.filter((l) => l.action === "admin_login").length}
              </p>
              <p className="text-xs text-muted-foreground">Acessos Admin</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros</CardTitle>
          <CardDescription>{filtered.length} registro(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por CPF, ID ou empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="evaluation">Avaliacao</SelectItem>
                <SelectItem value="admin_login">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Os logs aparecerao conforme os usuarios acessarem a plataforma.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((log) => {
                const info = ACTION_MAP[log.action] || ACTION_MAP.login
                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium ${info.color}`}
                      >
                        {info.label}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          CPF: {log.maskedCPF}
                        </p>
                        {log.companyName && (
                          <p className="text-xs text-muted-foreground">
                            Empresa: {log.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

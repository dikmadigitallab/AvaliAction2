"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight } from "lucide-react"
import { verifyAdminCPF, setAdminSession, addAccessLog, maskCPF } from "@/lib/store"
import { formatCPF } from "@/lib/anonymize"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  const [cpf, setCpf] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = cpf.replace(/\D/g, "")

    if (cleaned.length !== 11) {
      toast.error("Insira um CPF valido com 11 digitos.")
      return
    }

    setLoading(true)
    try {
      const valid = verifyAdminCPF(cleaned)
      if (valid) {
        addAccessLog({
          anonymousId: "admin",
          maskedCPF: maskCPF(cleaned),
          action: "admin_login",
        })
        setAdminSession(name.trim() || undefined)
        router.push("/admin/dashboard")
      } else {
        toast.error("CPF nao autorizado para acesso administrativo.")
      }
    } catch {
      toast.error("Erro ao verificar CPF.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex flex-col items-center gap-3 animate-fade-in-up sm:mb-8">
        <Link href="/">
          <Image
            src="https://i.ibb.co/Z61BpdnN/download.png"
            alt="Dikma"
            width={120}
            height={40}
            className="h-10 w-auto sm:h-12"
            priority
            unoptimized
          />
        </Link>
        <p className="text-xs text-muted-foreground sm:text-sm">Painel Administrativo</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg animate-scale-in animate-delay-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-card-foreground">Acesso Administrativo</CardTitle>
          <CardDescription>
            Insira seu CPF de administrador para acessar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome (opcional)"
              autoFocus
            />
            <Input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="text-center text-lg tracking-wider"
              autoComplete="off"
            />
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Verificando..." : "Entrar"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Voltar ao inicio
      </Link>
    </div>
  )
}

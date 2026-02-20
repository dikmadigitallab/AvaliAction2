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
import { Lock, ArrowRight } from "lucide-react"
import { verifyAdmin, setAdminSession } from "@/lib/store"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast.error("Insira a senha de administrador.")
      return
    }
    setLoading(true)
    try {
      const valid = await verifyAdmin(password)
      if (valid) {
        setAdminSession()
        router.push("/admin/dashboard")
      } else {
        toast.error("Senha incorreta.")
      }
    } catch {
      toast.error("Erro ao verificar senha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex flex-col items-center gap-2 animate-fade-in-up sm:mb-8 sm:gap-3 h-10 sm:h-12">
        <Link href="/">
          <Image
            src="https://i.ibb.co/Z61BpdnN/download.png"
            alt="Dikma"
            width={120}
            height={40}
            className="h-10 w-auto sm:h-12"
            priority
            loading="eager"
          />
        </Link>
        <p className="text-xs text-muted-foreground sm:text-sm">Painel Administrativo</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg animate-scale-in animate-delay-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-card-foreground">Login do Administrador</CardTitle>
          <CardDescription>
            Insira a senha para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              autoFocus
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

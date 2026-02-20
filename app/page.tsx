"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, CheckCircle2 } from "lucide-react"
import { initializeStore } from "@/lib/store"
import crypto from "crypto"

export default function LoginPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [cpf, setCpf] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeStore()
  }, [])

  const validateCPF = (value: string): boolean => {
    const cleanCPF = value.replace(/\D/g, "")
    return cleanCPF.length === 11 && /^\d{11}$/.test(cleanCPF)
  }

  const formatCPF = (value: string): string => {
    const cleanCPF = value.replace(/\D/g, "")
    if (cleanCPF.length <= 11) {
      return cleanCPF.slice(0, 3) + (cleanCPF.length > 3 ? "." : "") +
        cleanCPF.slice(3, 6) + (cleanCPF.length > 6 ? "." : "") +
        cleanCPF.slice(6, 9) + (cleanCPF.length > 9 ? "-" : "") +
        cleanCPF.slice(9, 11)
    }
    return value
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!fullName.trim()) {
      setError("Por favor, digite seu nome completo.")
      return
    }

    if (!validateCPF(cpf)) {
      setError("CPF inválido. Deve conter exatamente 11 dígitos.")
      return
    }

    setLoading(true)

    try {
      const cleanCPF = cpf.replace(/\D/g, "")
      const anonymousHash = crypto
        .createHash("sha256")
        .update(cleanCPF + Date.now())
        .digest("hex")

      sessionStorage.setItem("anonymous_id", anonymousHash)
      sessionStorage.setItem("user_name", fullName)

      router.push("/empresa")
    } catch (err) {
      setError("Erro ao processar sua solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Plataforma Confidencial
          </h1>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2 sm:text-2xl">
          Avaliação de Liderança
        </h2>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-lg animate-scale-in animate-delay-100 border-border">
        <CardHeader className="space-y-1 border-b border-border pb-6">
          <CardTitle className="text-2xl">Acesso Seguro</CardTitle>
          <CardDescription className="text-base">
            Sua opinião constrói ambientes de trabalho mais justos, eficientes e respeitosos.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="h-10 text-base"
              />
            </div>

            {/* CPF Field */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-sm font-semibold">
                CPF
              </Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                disabled={loading}
                maxLength="14"
                className="h-10 text-base font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Apenas validação local, nunca será armazenado ou vinculado às avaliações.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Security Message */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-foreground ml-2">
                Seus dados são protegidos e sua avaliação será 100% anônima.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-base font-semibold gap-2"
            >
              {loading ? "Processando..." : "Acessar Plataforma"}
              {!loading && <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Privacidade Garantida</p>
                <p>Nenhum dado seu será compartilhado ou identificado nas respostas.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground max-w-md animate-fade-in animate-delay-300">
        <p>
          Esta plataforma foi desenvolvida para coletar feedback honesto e construtivo,
          contribuindo para a melhoria contínua da liderança e do ambiente corporativo.
        </p>
      </div>
    </div>
  )
}

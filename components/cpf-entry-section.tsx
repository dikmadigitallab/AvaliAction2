"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, ArrowRight } from "lucide-react"
import { validateCPF, formatCPF, hashCPF } from "@/lib/anonymize"
import { toast } from "sonner"

export function CpfEntrySection() {
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = cpf.replace(/\D/g, "")

    if (!validateCPF(cleaned)) {
      toast.error("CPF invalido. Insira exatamente 11 digitos.")
      return
    }

    setLoading(true)
    try {
      const anonymousId = await hashCPF(cleaned)
      sessionStorage.setItem("anonymous_id", anonymousId)
      router.push("/evaluate")
    } catch {
      toast.error("Erro ao processar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 pb-16">
      <Card className="border-border shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-card-foreground">Acessar avaliacao</CardTitle>
          <CardDescription>
            Insira seu CPF para comecar. Ele nao sera armazenado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="cpf" className="sr-only">
                CPF
              </label>
              <Input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="text-center text-lg tracking-wider"
                autoComplete="off"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="gap-2">
              {loading ? "Processando..." : "Iniciar avaliacao"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
            <Badge
              variant="secondary"
              className="mx-auto gap-1.5 text-xs font-normal"
            >
              <Lock className="h-3 w-3" />
              CPF anonimizado por criptografia
            </Badge>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { initializeStore, getCompanies } from "@/lib/store"
import { ArrowRight, Building2 } from "lucide-react"
import type { Company } from "@/lib/types"

export default function EmpresaPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    initializeStore()
    const data = getCompanies()
    setCompanies(data)
  }, [])

  const handleSelectCompany = (company: Company) => {
    sessionStorage.setItem("selected_company", JSON.stringify(company))
    router.push("/supervisor")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Plataforma de Avaliação</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-12 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-foreground mb-3 sm:text-4xl">
              Selecione sua Empresa
            </h2>
            <p className="text-muted-foreground text-base">
              Escolha a empresa na qual você gostaria de realizar uma avaliação.
            </p>
          </div>

          {/* Company Cards */}
          <div className="grid gap-6 sm:grid-cols-2 animate-fade-in-up animate-delay-100">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary border-2 hover:scale-105"
                onClick={() => handleSelectCompany(company)}
              >
                <button
                  onClick={() => handleSelectCompany(company)}
                  className="w-full p-8 flex flex-col items-center justify-center gap-4 text-center"
                >
                  <div className="p-4 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {company.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Clique para continuar
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

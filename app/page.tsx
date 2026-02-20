import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { CpfEntrySection } from "@/components/cpf-entry-section"
import { FeaturesSection } from "@/components/features-section"
import { Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="flex flex-col items-center gap-4 px-4 pt-12 pb-10 text-center sm:pt-16 sm:pb-12">
        <div className="flex items-center gap-2 animate-fade-in-up">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight sm:text-xl">Dikma</span>
        </div>

        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl animate-fade-in-up animate-delay-100">
          Avaliacao anonima de supervisores
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-pretty animate-fade-in-up animate-delay-200 sm:text-lg">
          Contribua para um ambiente de trabalho melhor. Sua identidade e totalmente protegida.
        </p>
      </section>

      {/* CPF Entry */}
      <CpfEntrySection />

      {/* Features */}
      <FeaturesSection />

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Dikma - Plataforma de avaliacao anonima de supervisores</p>
      </footer>
    </div>
  )
}

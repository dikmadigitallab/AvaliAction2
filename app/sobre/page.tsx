"use client"

import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Lock,
  HelpCircle,
  Target,
  Users,
  BarChart3,
  FileText,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "Meu CPF fica armazenado?",
    answer:
      "Nao. Seu CPF e processado por um algoritmo de criptografia (SHA-256) que gera um codigo unico e irreversivel. O CPF original nunca e salvo em nenhum lugar do sistema.",
  },
  {
    question: "O administrador pode saber quem eu sou?",
    answer:
      "Nao. O administrador visualiza apenas dados agregados como medias e comentarios, sem nenhuma informacao que identifique o avaliador.",
  },
  {
    question: "Posso avaliar mais de um supervisor?",
    answer:
      "Sim! Voce pode avaliar diferentes supervisores. Porem, so e permitida uma avaliacao por supervisor para evitar duplicatas.",
  },
  {
    question: "Posso alterar minha avaliacao depois de enviada?",
    answer:
      "Nao. Apos a confirmacao, a avaliacao e registrada de forma definitiva. Revise com atencao antes de enviar.",
  },
  {
    question: "Para que servem as avaliacoes?",
    answer:
      "As avaliacoes geram relatorios anonimos que ajudam as empresas a identificar pontos fortes e oportunidades de melhoria na gestao de equipes.",
  },
  {
    question: "Comentarios ofensivos sao permitidos?",
    answer:
      "Nao. O sistema possui um filtro automatico que bloqueia linguagem inapropriada. Seja construtivo em seus comentarios.",
  },
]

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-8 pt-10 text-center sm:pb-12 sm:pt-16 md:pt-20">
            <div className="mb-3 animate-fade-in-up sm:mb-4 h-10 sm:h-12">
              <Image
                src="https://i.ibb.co/Z61BpdnN/download.png"
                alt="Dikma"
                width={120}
                height={40}
                className="h-10 w-auto animate-float sm:h-12"
                priority
                loading="eager"
              />
            </div>
            <h1 className="animate-fade-in-up animate-delay-100 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Sobre a plataforma
            </h1>
            <p className="mt-2 max-w-2xl animate-fade-in-up animate-delay-200 text-pretty text-sm text-muted-foreground sm:mt-3 sm:text-base md:text-lg">
              Uma plataforma criada para promover a melhoria continua no
              ambiente de trabalho atraves de feedbacks anonimos e construtivos.
            </p>
          </div>
        </section>

        {/* Purpose */}
        <section className="mx-auto max-w-4xl px-4 pb-8 sm:pb-12">
          <div className="grid gap-3 sm:gap-6 md:grid-cols-3 animate-fade-in-up animate-delay-300">
            <Card>
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base text-card-foreground">Proposito</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Dar voz aos colaboradores de forma segura, permitindo que
                  expressem suas percepcoes sobre a gestao sem receio de
                  retaliacao.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base text-card-foreground">Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Relatorios anonimos ajudam a identificar padroes e promover
                  acoes de melhoria baseadas em dados reais.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base text-card-foreground">Criterios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Avaliamos cinco dimensoes essenciais: Lideranca, Comunicacao,
                  Respeito, Organizacao e Apoio a Equipe.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How anonymity works */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <div className="mb-6 flex flex-col items-center gap-2 text-center animate-fade-in sm:mb-8">
              <Lock className="h-5 w-5 text-primary animate-pulse-soft sm:h-6 sm:w-6" />
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                Como funciona o anonimato
              </h2>
            </div>
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col gap-6">
                {[
                  {
                    step: "1",
                    title: "Voce insere seu CPF",
                    desc: "O CPF e utilizado apenas como entrada para o processo de anonimizacao.",
                  },
                  {
                    step: "2",
                    title: "Geramos um codigo anonimo",
                    desc: 'Um algoritmo SHA-256 transforma o CPF em um codigo irreversivel ("hash"). O CPF original e descartado imediatamente.',
                  },
                  {
                    step: "3",
                    title: "Avaliacao registrada",
                    desc: "Sua avaliacao e salva vinculada apenas ao codigo anonimo, sem qualquer dado pessoal.",
                  },
                  {
                    step: "4",
                    title: "Admin ve so dados agregados",
                    desc: "O administrador tem acesso a medias, graficos e comentarios, nunca a dados de identificacao.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <div className="mb-6 flex flex-col items-center gap-2 text-center animate-fade-in sm:mb-8">
            <HelpCircle className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-semibold text-card-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 pb-16 text-center">
          <Button asChild size="lg">
            <Link href="/">Fazer minha avaliacao</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2 h-6 sm:h-8">
            <Image src="https://i.ibb.co/Z61BpdnN/download.png" alt="Dikma" width={80} height={27} className="h-6 w-auto" />
            <span>2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

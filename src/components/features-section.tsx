import { ShieldCheck, Eye, BarChart3, MessageSquare } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "100% anonimo",
    description: "Seu CPF e convertido em um codigo irreversivel. Ninguem pode rastrear sua avaliacao.",
  },
  {
    icon: Eye,
    title: "Transparente",
    description: "Saiba exatamente como seus dados sao utilizados. Sem surpresas.",
  },
  {
    icon: BarChart3,
    title: "Resultados reais",
    description: "As avaliacoes geram relatorios que ajudam a melhorar o ambiente de trabalho.",
  },
  {
    icon: MessageSquare,
    title: "Feedback construtivo",
    description: "Avalie lideranca, comunicacao, respeito, organizacao e apoio a equipe.",
  },
]

const DELAY_CLASSES = [
  "animate-delay-100",
  "animate-delay-200",
  "animate-delay-300",
  "animate-delay-400",
]

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-20">
      <div className="grid gap-3 grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={`flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg animate-scale-in sm:gap-3 sm:p-6 ${DELAY_CLASSES[i] || ""}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:h-11 sm:w-11">
              <feature.icon className="h-5 w-5 text-primary sm:h-5 sm:w-5" />
            </div>
            <h3 className="text-xs font-semibold text-card-foreground sm:text-sm">{feature.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

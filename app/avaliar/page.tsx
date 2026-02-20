"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { EvaluationFlow } from "@/components/evaluation-flow"
import { initializeStore } from "@/lib/store"

export default function AvaliarPage() {
  const router = useRouter()
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    initializeStore()
    const id = sessionStorage.getItem("anonymous_id")
    if (!id) {
      router.replace("/")
      return
    }
    if (mounted.current) {
      setAnonymousId(id)
      setReady(true)
    }
    return () => {
      mounted.current = false
    }
  }, [router])

  if (!ready || !anonymousId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <EvaluationFlow anonymousId={anonymousId} />
    </div>
  )
}

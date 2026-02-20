"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function EvalFlow({ anonymousId }: { anonymousId?: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace("/evaluate")
  }, [router])
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  )
}

export default EvalFlow

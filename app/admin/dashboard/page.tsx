"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { DashboardContent } from "@/components/dashboard-content"
import { isAdminAuthenticated, initializeStore } from "@/lib/store"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    initializeStore()
    if (!isAdminAuthenticated()) {
      router.replace("/admin")
      return
    }
    if (mounted.current) {
      setReady(true)
    }
    return () => {
      mounted.current = false
    }
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DashboardContent />
      </main>
    </div>
  )
}

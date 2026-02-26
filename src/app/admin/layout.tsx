"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { isAdminAuthenticated, initializeStore } from "@/lib/store"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const mounted = useRef(true)

  // The login page (/admin) does not use the sidebar layout
  const isLoginPage = pathname === "/admin"

  useEffect(() => {
    mounted.current = true
    initializeStore()

    if (!isLoginPage && !isAdminAuthenticated()) {
      router.replace("/admin")
      return
    }

    if (mounted.current) setReady(true)

    return () => {
      mounted.current = false
    }
  }, [router, isLoginPage])

  // Login page renders without sidebar
  if (isLoginPage) return <>{children}</>

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-muted-foreground animate-pulse">Carregando painel...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

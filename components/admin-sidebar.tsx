"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Menu,
  UserCircle,
  ClipboardList,
} from "lucide-react"
import { clearAdminSession, getAdminName } from "@/lib/store"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/feedbacks", label: "Feedbacks", icon: MessageSquare },
  { href: "/admin/formularios", label: "Formularios", icon: ClipboardList },
  { href: "/admin/logs", label: "Logs de Acesso", icon: FileText },
  { href: "/admin/supervisores", label: "Supervisores", icon: Users },
  { href: "/admin/relatorios", label: "Relatorios", icon: BarChart3 },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const adminName = getAdminName()

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin")
  }

  return (
    <div className="flex h-full flex-col bg-[oklch(0.20_0.04_240)] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Image
          src="https://i.ibb.co/Z61BpdnN/download.png"
          alt="Dikma"
          width={100}
          height={34}
          className="h-8 w-auto brightness-0 invert"
          unoptimized
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <UserCircle className="h-5 w-5 text-white/80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white/90">{adminName}</p>
            <p className="text-xs text-white/50">Administrador</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-30 w-60">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Topbar + Sheet */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Image
          src="https://i.ibb.co/Z61BpdnN/download.png"
          alt="Dikma"
          width={80}
          height={27}
          className="h-6 w-auto"
          unoptimized
        />
      </div>
    </>
  )
}

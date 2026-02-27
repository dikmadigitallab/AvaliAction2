import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"





export const metadata: Metadata = {
  title: "Dikma | Avaliacao Anonima de Supervisores",
  description:
    "Plataforma Dikma segura e anonima para avaliacao de supervisores. Contribua para um ambiente de trabalho melhor.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="dikma-theme"
        >
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

"use server"

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const COMPANY_LOGOS: Record<string, string> = {
  dikma: "https://i.ibb.co/Z61BpdnN/download.png",
  arcelormittal: "https://i.ibb.co/hx2Cm5yN/Arcelor-Mittal-svg.png",
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    })
    const enriched = companies.map((c) => ({
      ...c,
      logo: c.logo || COMPANY_LOGOS[c.id] || undefined,
    }))
    return NextResponse.json(enriched)
  } catch (error) {
    console.error("Failed to get companies:", error)
    return NextResponse.json({ error: "Failed to get companies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const company = await prisma.company.create({
      data: { name },
    })
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Failed to create company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    const where = companyId ? { companyId } : {}
    const supervisors = await prisma.supervisor.findMany({
      where,
      orderBy: { name: "asc" },
    })
    return NextResponse.json(supervisors)
  } catch (error) {
    console.error("Failed to get supervisors:", error)
    return NextResponse.json({ error: "Failed to get supervisors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, companyId } = body
    if (!name || !companyId) {
      return NextResponse.json({ error: "Name and companyId are required" }, { status: 400 })
    }
    const supervisor = await prisma.supervisor.create({
      data: { name, companyId },
    })
    return NextResponse.json(supervisor, { status: 201 })
  } catch (error) {
    console.error("Failed to create supervisor:", error)
    return NextResponse.json({ error: "Failed to create supervisor" }, { status: 500 })
  }
}

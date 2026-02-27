import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const where = action ? { action } : {}

    const logs = await prisma.accessLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
    })

    const mapped = logs.map((l) => ({
      id: l.id,
      anonymousId: l.anonymousId,
      maskedCPF: l.maskedCPF,
      fullCPF: l.fullCPF,
      companyId: l.companyId,
      companyName: l.companyName,
      action: l.action,
      timestamp: l.timestamp.toISOString(),
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to get access logs:", error)
    return NextResponse.json({ error: "Failed to get access logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { anonymousId, maskedCPF, fullCPF, companyId, companyName, action } = body

    if (!anonymousId || !maskedCPF || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const log = await prisma.accessLog.create({
      data: {
        anonymousId,
        maskedCPF,
        fullCPF: fullCPF || null,
        companyId: companyId || null,
        companyName: companyName || null,
        action,
      },
    })

    return NextResponse.json({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create access log:", error)
    return NextResponse.json({ error: "Failed to create access log" }, { status: 500 })
  }
}

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Check if already evaluated
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const anonymousId = searchParams.get("anonymousId")
    const supervisorId = searchParams.get("supervisorId")

    if (!anonymousId || !supervisorId) {
      return NextResponse.json({ error: "anonymousId and supervisorId required" }, { status: 400 })
    }

    const existing = await prisma.evaluation.findFirst({
      where: { anonymousId, supervisorId },
    })

    return NextResponse.json({ hasEvaluated: !!existing })
  } catch (error) {
    console.error("Failed to check evaluation:", error)
    return NextResponse.json({ error: "Failed to check" }, { status: 500 })
  }
}

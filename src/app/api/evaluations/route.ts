import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const supervisorId = searchParams.get("supervisorId")
    const anonymousId = searchParams.get("anonymousId")

    const where: Record<string, string> = {}
    if (companyId) where.companyId = companyId
    if (supervisorId) where.supervisorId = supervisorId
    if (anonymousId) where.anonymousId = anonymousId

    const evaluations = await prisma.evaluation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Map flat DB rows to the nested ratings shape the frontend expects
    const mapped = evaluations.map((e) => ({
      id: e.id,
      supervisorId: e.supervisorId,
      companyId: e.companyId,
      anonymousId: e.anonymousId,
      ratings: {
        lideranca: e.lideranca,
        comunicacao: e.comunicacao,
        respeito: e.respeito,
        organizacao: e.organizacao,
        apoioEquipe: e.apoioEquipe,
      },
      comment: e.comment,
      createdAt: e.createdAt.toISOString(),
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to get evaluations:", error)
    return NextResponse.json({ error: "Failed to get evaluations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { supervisorId, companyId, anonymousId, ratings, comment } = body

    if (!supervisorId || !companyId || !anonymousId || !ratings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if already evaluated
    const existing = await prisma.evaluation.findFirst({
      where: { anonymousId, supervisorId },
    })
    if (existing) {
      return NextResponse.json({ error: "Already evaluated" }, { status: 409 })
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        supervisorId,
        companyId,
        anonymousId,
        lideranca: ratings.lideranca,
        comunicacao: ratings.comunicacao,
        respeito: ratings.respeito,
        organizacao: ratings.organizacao,
        apoioEquipe: ratings.apoioEquipe,
        comment: comment || null,
      },
    })

    return NextResponse.json({
      id: evaluation.id,
      supervisorId: evaluation.supervisorId,
      companyId: evaluation.companyId,
      anonymousId: evaluation.anonymousId,
      ratings: {
        lideranca: evaluation.lideranca,
        comunicacao: evaluation.comunicacao,
        respeito: evaluation.respeito,
        organizacao: evaluation.organizacao,
        apoioEquipe: evaluation.apoioEquipe,
      },
      comment: evaluation.comment,
      createdAt: evaluation.createdAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create evaluation:", error)
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 })
  }
}

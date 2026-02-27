import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const forms = await prisma.formTemplate.findMany({
      include: { questions: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    })

    const mapped = forms.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      questions: f.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        maxScore: q.maxScore,
        tag: q.tag,
      })),
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to get forms:", error)
    return NextResponse.json({ error: "Failed to get forms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, questions } = body

    if (!name || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Name and questions are required" }, { status: 400 })
    }

    const form = await prisma.formTemplate.create({
      data: {
        name,
        questions: {
          create: questions.map((q: { id?: string; text: string; type: string; maxScore?: number; tag: string }, index: number) => ({
            text: q.text,
            type: q.type,
            maxScore: q.maxScore || null,
            tag: q.tag,
            order: index,
          })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    return NextResponse.json({
      id: form.id,
      name: form.name,
      createdAt: form.createdAt.toISOString(),
      updatedAt: form.updatedAt.toISOString(),
      questions: form.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        maxScore: q.maxScore,
        tag: q.tag,
      })),
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create form:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}

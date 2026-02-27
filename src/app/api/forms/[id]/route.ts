import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const form = await prisma.formTemplate.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

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
    })
  } catch (error) {
    console.error("Failed to get form:", error)
    return NextResponse.json({ error: "Failed to get form" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, questions } = body

    if (!name || !questions) {
      return NextResponse.json({ error: "Name and questions are required" }, { status: 400 })
    }

    // Delete existing questions and recreate
    await prisma.formQuestion.deleteMany({ where: { formId: id } })

    const form = await prisma.formTemplate.update({
      where: { id },
      data: {
        name,
        questions: {
          create: questions.map((q: { text: string; type: string; maxScore?: number; tag: string }, index: number) => ({
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
    })
  } catch (error) {
    console.error("Failed to update form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.formTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}

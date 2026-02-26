import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const supervisor = await prisma.supervisor.update({
      where: { id },
      data: { name },
    })
    return NextResponse.json(supervisor)
  } catch (error) {
    console.error("Failed to update supervisor:", error)
    return NextResponse.json({ error: "Failed to update supervisor" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.supervisor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete supervisor:", error)
    return NextResponse.json({ error: "Failed to delete supervisor" }, { status: 500 })
  }
}

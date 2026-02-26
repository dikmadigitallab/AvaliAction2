import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.company.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete company:", error)
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 })
  }
}

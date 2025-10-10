import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rowId } = await params;

    const row = await prisma.customTableData.findUnique({
      where: { id: rowId },
    });

    if (!row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    return NextResponse.json({
      row: {
        id: row.id,
        data: row.data,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching row:", error);
    return NextResponse.json(
      { error: "Failed to fetch row" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, rowId } = await params;
    const body = await request.json();

    const row = await prisma.customTableData.findUnique({
      where: { id: rowId },
    });

    if (!row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const currentData = row.data as Record<string, unknown>;
    const updatedData = { ...currentData, ...body };

    const updatedRow = await prisma.customTableData.update({
      where: { id: rowId },
      data: {
        data: updatedData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      row: {
        id: updatedRow.id,
        data: updatedRow.data,
        createdAt: updatedRow.createdAt.toISOString(),
        updatedAt: updatedRow.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating row:", error);
    return NextResponse.json(
      { error: "Failed to update row" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rowId } = await params;

    const row = await prisma.customTableData.findUnique({
      where: { id: rowId },
    });

    if (!row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    await prisma.customTableData.delete({
      where: { id: rowId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting row:", error);
    return NextResponse.json(
      { error: "Failed to delete row" },
      { status: 500 }
    );
  }
}

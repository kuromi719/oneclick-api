import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const table = await prisma.customTable.findUnique({
      where: { id },
      include: {
        data: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({
      table: {
        id: table.id,
        name: table.name,
        displayName: table.displayName,
        projectId: table.projectId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns: (table.schema as any).columns || [],
        data: table.data.map((row) => ({
          id: row.id,
          data: row.data,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })),
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching table:", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    await prisma.customTable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { displayName, schema } = body;

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const updatedTable = await prisma.customTable.update({
      where: { id },
      data: {
        displayName: displayName || table.displayName,
        schema: schema || table.schema,
      },
    });

    return NextResponse.json({
      table: {
        id: updatedTable.id,
        name: updatedTable.name,
        displayName: updatedTable.displayName,
        projectId: updatedTable.projectId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns: (updatedTable.schema as any).columns || [],
        createdAt: updatedTable.createdAt.toISOString(),
        updatedAt: updatedTable.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    );
  }
}

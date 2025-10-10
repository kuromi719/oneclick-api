import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, columnId } = await params;

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = table.schema as any;
    const columns = schema.columns || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columnIndex = columns.findIndex((col: any) => col.id === columnId);

    if (columnIndex === -1) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    if (columns[columnIndex].name === "id" || columns[columnIndex].name === "created_at") {
      return NextResponse.json(
        { error: "Cannot delete system columns" },
        { status: 400 }
      );
    }

    const updatedColumns = columns.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_: any, index: number) => index !== columnIndex
    );

    const updatedSchema = {
      ...schema,
      columns: updatedColumns,
    };

    await prisma.customTable.update({
      where: { id },
      data: { schema: updatedSchema },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, columnId } = await params;
    const body = await request.json();

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = table.schema as any;
    const columns = schema.columns || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columnIndex = columns.findIndex((col: any) => col.id === columnId);

    if (columnIndex === -1) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    columns[columnIndex] = {
      ...columns[columnIndex],
      ...body,
      id: columnId,
      name: columns[columnIndex].name,
    };

    const updatedSchema = {
      ...schema,
      columns,
    };

    await prisma.customTable.update({
      where: { id },
      data: { schema: updatedSchema },
    });

    return NextResponse.json({ column: columns[columnIndex] });
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}

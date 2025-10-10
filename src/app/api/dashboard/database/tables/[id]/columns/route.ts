import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { name, type, required, unique, default: defaultValue } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Column name and type are required" },
        { status: 400 }
      );
    }

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = table.schema as any;
    const columns = schema.columns || [];

    const normalizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const columnExists = columns.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (col: any) => col.name === normalizedName
    );

    if (columnExists) {
      return NextResponse.json(
        { error: "Column with this name already exists" },
        { status: 400 }
      );
    }

    const newColumn = {
      id: `col_${Date.now()}`,
      name: normalizedName,
      type,
      required: required || false,
      unique: unique || false,
      default: defaultValue || null,
    };

    const updatedSchema = {
      ...schema,
      columns: [...columns, newColumn],
    };

    const updatedTable = await prisma.customTable.update({
      where: { id },
      data: { schema: updatedSchema },
    });

    return NextResponse.json(
      {
        column: newColumn,
        table: {
          id: updatedTable.id,
          name: updatedTable.name,
          displayName: updatedTable.displayName,
          columns: updatedSchema.columns,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding column:", error);
    return NextResponse.json(
      { error: "Failed to add column" },
      { status: 500 }
    );
  }
}

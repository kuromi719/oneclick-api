import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    const data = await prisma.customTableData.findMany({
      where: { tableId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: data.map((row) => ({
        id: row.id,
        data: row.data,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching table data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

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

    const table = await prisma.customTable.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const schema = table.schema as any;
    const columns = schema.columns || [];

    for (const column of columns) {
      if (
        column.required &&
        column.name !== "id" &&
        column.name !== "created_at" &&
        !body[column.name] &&
        !column.default
      ) {
        return NextResponse.json(
          { error: `Field ${column.name} is required` },
          { status: 400 }
        );
      }
    }

    const rowData: Record<string, unknown> = {};

    for (const column of columns) {
      if (column.name === "id") {
        rowData[column.name] = `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else if (column.name === "created_at") {
        rowData[column.name] = new Date().toISOString();
      } else if (body[column.name] !== undefined && body[column.name] !== null && body[column.name] !== "") {
        rowData[column.name] = body[column.name];
      } else if (column.default) {
        if (column.default === "now()") {
          rowData[column.name] = new Date().toISOString();
        } else {
          rowData[column.name] = column.default;
        }
      } else if (!column.required) {
        rowData[column.name] = null;
      }
    }

    const newRow = await prisma.customTableData.create({
      data: {
        tableId: id,
        data: rowData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(
      {
        row: {
          id: newRow.id,
          data: newRow.data,
          createdAt: newRow.createdAt.toISOString(),
          updatedAt: newRow.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating row:", error);
    return NextResponse.json(
      { error: "Failed to create row" },
      { status: 500 }
    );
  }
}

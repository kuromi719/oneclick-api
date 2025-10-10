import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const tables = await prisma.customTable.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    const tablesWithData = tables.map((table) => ({
      id: table.id,
      name: table.name,
      displayName: table.displayName,
      projectId: table.projectId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columns: (table.schema as any).columns || [],
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString(),
    }));

    return NextResponse.json({ tables: tablesWithData });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    if (!authToken || authToken.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, projectId } = body;

    if (!name || !displayName || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const existingTable = await prisma.customTable.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: normalizedName,
        },
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table with this name already exists" },
        { status: 400 }
      );
    }

    const defaultSchema = {
      columns: [
        {
          id: "id",
          name: "id",
          type: "string",
          required: true,
          unique: true,
          default: null,
        },
        {
          id: "created_at",
          name: "created_at",
          type: "date",
          required: true,
          unique: false,
          default: "now()",
        },
      ],
    };

    const table = await prisma.customTable.create({
      data: {
        name: normalizedName,
        displayName,
        projectId,
        schema: defaultSchema,
      },
    });

    return NextResponse.json(
      {
        table: {
          id: table.id,
          name: table.name,
          displayName: table.displayName,
          projectId: table.projectId,
          columns: defaultSchema.columns,
          createdAt: table.createdAt.toISOString(),
          updatedAt: table.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}

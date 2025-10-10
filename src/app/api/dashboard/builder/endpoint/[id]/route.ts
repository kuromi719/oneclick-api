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

    const endpoint = await prisma.endpoint.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    }

    return NextResponse.json({
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        projectId: endpoint.project.id,
        projectSlug: endpoint.project.slug,
        responseType: endpoint.responseType,
        statusCode: endpoint.statusCode,
        rateLimit: endpoint.rateLimit,
        rateLimitWindow: endpoint.rateLimitWindow,
        isActive: endpoint.isActive,
        flowData: endpoint.flowData,
      },
    });
  } catch (error) {
    console.error("Error fetching endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch endpoint" },
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

    let normalizedPath = body.path;
    if (normalizedPath && !normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (normalizedPath && normalizedPath.startsWith('/api/')) {
      normalizedPath = normalizedPath.replace('/api/', '/');
    }

    const updatedEndpoint = await prisma.endpoint.update({
      where: { id },
      data: {
        name: body.name,
        path: normalizedPath,
        method: body.method,
        description: body.description,
        responseType: body.responseType,
        statusCode: body.statusCode,
        rateLimit: body.rateLimit,
        rateLimitWindow: body.rateLimitWindow,
        isActive: body.isActive,
        flowData: body.flowData,
      },
    });

    console.log('✅ Endpoint updated:', {
      id: updatedEndpoint.id,
      path: updatedEndpoint.path,
      method: updatedEndpoint.method
    });

    return NextResponse.json({ success: true, endpoint: updatedEndpoint });
  } catch (error) {
    console.error("Error updating endpoint:", error);
    return NextResponse.json(
      { error: "Failed to update endpoint" },
      { status: 500 }
    );
  }
}

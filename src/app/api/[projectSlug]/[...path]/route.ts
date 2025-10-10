import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rateLimit";
import { Prisma } from "@prisma/client";

interface NodeData {
  id: string;
  type: string;
  data: {
    label: string;
    type: string;
    config?: Record<string, unknown>;
  };
  position: { x: number; y: number };
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type?: string;
}

interface FlowData {
  nodes: NodeData[];
  edges: EdgeData[];
}

type PrismaModel = {
  findMany: (args?: unknown) => Promise<unknown>;
  create: (args: { data: unknown }) => Promise<unknown>;
  updateMany: (args: { data: unknown }) => Promise<unknown>;
  deleteMany: (args: { where: unknown }) => Promise<unknown>;
};

async function executeNode(
  node: NodeData,
  context: Record<string, unknown>,
  requestData: {
    body?: unknown;
    query?: Record<string, string>;
    headers?: Record<string, string>;
  }
): Promise<unknown> {
  const config = node.data.config || {};
  const nodeType = node.data.type;

  switch (nodeType) {
    case "http-request":
      return await executeHttpRequest(config, context);
    case "database-query":
      return await executeDatabaseQuery(config, context);
    case "transform":
      return executeTransform(config, context);
    case "condition":
      return executeCondition(config, context);
    case "filter":
      return executeFilter(config, context);
    case "auth-check":
      return executeAuthCheck(config, requestData);
    case "response":
      return executeResponse(config, context);
    default:
      return context;
  }
}

async function executeHttpRequest(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  try {
    const url = config.url as string;
    const method = (config.method as string) || "GET";
    const headersStr = config.headers as string;

    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (headersStr) {
      try {
        headers = { ...headers, ...JSON.parse(headersStr) };
      } catch {
        headers = { "Content-Type": "application/json" };
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" && method !== "HEAD" ? JSON.stringify(context) : undefined,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("HTTP Request error:", error);
    return { error: "Failed to execute HTTP request" };
  }
}

async function executeDatabaseQuery(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> {
  try {
    const queryType = config.queryType as string;
    const table = config.table as string;
    const customQuery = config.query as string;

    if (!table && !customQuery) {
      return { error: "No table or query specified" };
    }

    if (customQuery) {
      const result = await prisma.$queryRawUnsafe(customQuery);
      return result;
    }

    const prismaTable = (prisma as unknown as Record<string, PrismaModel>)[table];

    if (!prismaTable) {
      return { error: "Invalid table name" };
    }

    switch (queryType) {
      case "select":
        return await prismaTable.findMany();
      case "insert":
        return await prismaTable.create({ data: context });
      case "update":
        return await prismaTable.updateMany({ data: context });
      case "delete":
        return await prismaTable.deleteMany({ where: context });
      default:
        return { error: "Invalid query type" };
    }
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to execute database query" };
  }
}

function executeTransform(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): unknown {
  try {
    const transformType = config.transformType as string;
    const transformFn = config.transformFn as string;

    if (!transformFn) {
      return context;
    }

    const fn = eval(`(${transformFn})`);

    switch (transformType) {
      case "map":
        if (Array.isArray(context)) {
          return context.map(fn);
        }
        return fn(context);
      case "reduce":
        if (Array.isArray(context)) {
          return context.reduce(fn);
        }
        return context;
      case "custom":
        return fn(context);
      default:
        return fn(context);
    }
  } catch (error) {
    console.error("Transform error:", error);
    return context;
  }
}

function executeCondition(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): { branch: "true" | "false"; data: unknown } {
  try {
    const condition = config.condition as string;

    if (!condition) {
      return { branch: "true", data: context };
    }

    const fn = eval(`(data) => ${condition}`);
    const result = fn(context);

    return {
      branch: result ? "true" : "false",
      data: context,
    };
  } catch (error) {
    console.error("Condition error:", error);
    return { branch: "false", data: context };
  }
}

function executeFilter(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): unknown {
  try {
    const filterExpr = config.filterExpr as string;

    if (!filterExpr || !Array.isArray(context)) {
      return context;
    }

    const fn = eval(`(${filterExpr})`);
    return (context as unknown[]).filter(fn);
  } catch (error) {
    console.error("Filter error:", error);
    return context;
  }
}

function executeAuthCheck(
  config: Record<string, unknown>,
  requestData: {
    headers?: Record<string, string>;
  }
): { authenticated: boolean; data?: unknown } {
  try {
    const authType = config.authType as string;
    const headerName = (config.headerName as string) || "Authorization";
    const required = config.required !== false;

    const headerValue = requestData.headers?.[headerName.toLowerCase()];

    if (!headerValue) {
      return { authenticated: !required };
    }

    switch (authType) {
      case "bearer":
        return { authenticated: headerValue.startsWith("Bearer ") };
      case "apikey":
        return { authenticated: headerValue.length > 0 };
      case "basic":
        return { authenticated: headerValue.startsWith("Basic ") };
      default:
        return { authenticated: true };
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return { authenticated: false };
  }
}

function executeResponse(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
} {
  try {
    const responseType = (config.responseType as string) || "json";
    const statusCode = (config.statusCode as number) || 200;
    const bodyTemplate = config.bodyTemplate as string;
    const customHeadersStr = config.customHeaders as string;

    let body: unknown = context;
    let headers: Record<string, string> = {};

    if (bodyTemplate) {
      try {
        const template = JSON.parse(bodyTemplate);
        body = JSON.parse(
          JSON.stringify(template).replace(/\{\{(\w+)\}\}/g, (_, key) => {
            const value = (context as Record<string, unknown>)[key];
            return JSON.stringify(value || "");
          })
        );
      } catch {
        body = context;
      }
    }

    if (customHeadersStr) {
      try {
        headers = JSON.parse(customHeadersStr);
      } catch {
        headers = {};
      }
    }

    switch (responseType) {
      case "json":
        headers["Content-Type"] = "application/json";
        break;
      case "text":
        headers["Content-Type"] = "text/plain";
        break;
      case "html":
        headers["Content-Type"] = "text/html";
        break;
      case "xml":
        headers["Content-Type"] = "application/xml";
        break;
    }

    return { statusCode, body, headers };
  } catch (error) {
    console.error("Response error:", error);
    return {
      statusCode: 500,
      body: { error: "Failed to execute response" },
      headers: { "Content-Type": "application/json" },
    };
  }
}

async function executeFlow(
  flowData: FlowData,
  requestData: {
    body?: unknown;
    query?: Record<string, string>;
    headers?: Record<string, string>;
  }
): Promise<{
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
}> {
  try {
    const { nodes, edges } = flowData;

    if (!nodes || nodes.length === 0) {
      return {
        statusCode: 200,
        body: { message: "No flow configured" },
        headers: { "Content-Type": "application/json" },
      };
    }

    const startNode = nodes[0];
    let context: Record<string, unknown> = {
      body: requestData.body,
      query: requestData.query,
      headers: requestData.headers,
    };

    let currentNodeId = startNode.id;
    const visited = new Set<string>();
    const maxIterations = 100;
    let iterations = 0;

    while (currentNodeId && iterations < maxIterations) {
      iterations++;

      if (visited.has(currentNodeId)) {
        break;
      }
      visited.add(currentNodeId);

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      const result = await executeNode(currentNode, context, requestData);

      if (currentNode.data.type === "response") {
        return result as {
          statusCode: number;
          body: unknown;
          headers: Record<string, string>;
        };
      }

      if (currentNode.data.type === "condition") {
        const conditionResult = result as { branch: "true" | "false"; data: unknown };
        context = conditionResult.data as Record<string, unknown>;

        const nextEdge = edges.find(
          (e) =>
            e.source === currentNodeId &&
            (conditionResult.branch === "true" ? true : e.type === "false")
        );

        currentNodeId = nextEdge?.target || "";
      } else if (currentNode.data.type === "auth-check") {
        const authResult = result as { authenticated: boolean };
        if (!authResult.authenticated) {
          return {
            statusCode: 401,
            body: { error: "Unauthorized" },
            headers: { "Content-Type": "application/json" },
          };
        }

        const nextEdge = edges.find((e) => e.source === currentNodeId);
        currentNodeId = nextEdge?.target || "";
      } else {
        context = result as Record<string, unknown>;
        const nextEdge = edges.find((e) => e.source === currentNodeId);
        currentNodeId = nextEdge?.target || "";
      }
    }

    return {
      statusCode: 200,
      body: context,
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Flow execution error:", error);
    return {
      statusCode: 500,
      body: { error: "Failed to execute flow" },
      headers: { "Content-Type": "application/json" },
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  return handleRequest(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  return handleRequest(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectSlug: string; path: string[] }> }
) {
  return handleRequest(request, params, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ projectSlug: string; path: string[] }>,
  method: string
) {
  try {
    const { projectSlug, path } = await params;
    const fullPath = `/${path.join("/")}`;

    console.log('🔍 Looking for endpoint:', {
      projectSlug,
      path: path,
      fullPath,
      method
    });

    const endpoint = await prisma.endpoint.findFirst({
      where: {
        project: {
          slug: projectSlug,
        },
        path: fullPath,
        method: method,
        isActive: true,
      },
      include: {
        project: true,
      },
    });

    console.log('📌 Endpoint found:', endpoint ? 'YES' : 'NO');

    if (endpoint) {
      console.log('📝 Endpoint details:', {
        id: endpoint.id,
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        isActive: endpoint.isActive,
        projectSlug: endpoint.project.slug
      });
    }

    if (!endpoint) {
      console.log('❌ Endpoint not found in database');

      const allEndpoints = await prisma.endpoint.findMany({
        where: {
          project: {
            slug: projectSlug,
          },
        },
        include: {
          project: true,
        },
      });

      console.log('📋 Available endpoints for this project:',
        allEndpoints.map(e => ({
          path: e.path,
          method: e.method,
          isActive: e.isActive
        }))
      );

      return NextResponse.json(
        { error: "Endpoint not found" },
        { status: 404 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = await checkRateLimit({
      identifier: clientIp,
      endpointId: endpoint.id,
      limit: endpoint.rateLimit,
      windowMs: endpoint.rateLimitWindow * 1000,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    let body: unknown = null;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.json();
      } catch {
        body = null;
      }
    }

    const query: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const flowData = endpoint.flowData as unknown as FlowData;

    const result = await executeFlow(flowData, { body, query, headers });

    await prisma.request.create({
      data: {
        endpointId: endpoint.id,
        method: method,
        path: fullPath,
        statusCode: result.statusCode,
        duration: 0,
        ipAddress: clientIp,
        userAgent: request.headers.get("user-agent"),
        requestBody: body as Prisma.InputJsonValue,
        response: result.body as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(result.body, {
      status: result.statusCode,
      headers: {
        ...result.headers,
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    console.error("Execute endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

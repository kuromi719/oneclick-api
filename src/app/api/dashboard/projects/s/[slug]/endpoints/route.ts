import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { slug } = await params;
        const body = await request.json();
        let { name, path, method, description, flowData } = body;

        let normalizedPath = path;
        if (normalizedPath && !normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
        }
        if (normalizedPath && normalizedPath.startsWith('/api/')) {
            normalizedPath = normalizedPath.replace('/api/', '/');
        }

        const project = await prisma.project.findUnique({
            where: { slug }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const existingEndpoint = await prisma.endpoint.findFirst({
            where: {
                projectId: project.id,
                path: normalizedPath,
                method
            }
        });

        if (existingEndpoint) {
            return NextResponse.json(
                { error: 'Endpoint with this path and method already exists' },
                { status: 400 }
            );
        }

        const endpoint = await prisma.endpoint.create({
            data: {
                name,
                path: normalizedPath,
                method,
                description,
                projectId: project.id,
                flowData: flowData || {
                    nodes: [],
                    edges: []
                },
                responseType: body.responseType || "json",
                statusCode: body.statusCode || 200,
                rateLimit: body.rateLimit || 100,
                rateLimitWindow: body.rateLimitWindow || 60,
                isActive: body.isActive !== undefined ? body.isActive : true,
            }
        });

        console.log('✅ Endpoint created:', {
            id: endpoint.id,
            path: endpoint.path,
            method: endpoint.method
        });

        return NextResponse.json({ endpoint }, { status: 201 });
    } catch (error) {
        console.error('Error creating endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { slug } = await params;

        const project = await prisma.project.findUnique({
            where: { slug },
            include: {
                endpoints: {
                    include: {
                        requests: {
                            select: {
                                id: true,
                                duration: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const endpointsWithStats = project.endpoints.map(endpoint => {
            const totalRequests = endpoint.requests.length;
            const avgDuration = totalRequests > 0
                ? Math.round(endpoint.requests.reduce((sum, req) => sum + req.duration, 0) / totalRequests)
                : 0;

            return {
                id: endpoint.id,
                name: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                description: endpoint.description,
                isActive: endpoint.isActive,
                requests: totalRequests,
                avgDuration
            };
        });

        return NextResponse.json({ endpoints: endpointsWithStats });
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
                },
                apiKeys: {
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

        const totalRequests = endpointsWithStats.reduce((sum, e) => sum + e.requests, 0);
        const activeEndpoints = endpointsWithStats.filter(e => e.isActive).length;

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                slug: project.slug,
                description: project.description,
                color: project.color,
                endpoints: project.endpoints.length,
                requests: totalRequests.toLocaleString(),
                activeEndpoints,
                apiKeys: project.apiKeys.length
            },
            endpoints: endpointsWithStats,
            apiKeys: project.apiKeys.map(key => ({
                id: key.id,
                key: key.key,
                name: key.name,
                isActive: key.isActive,
                lastUsedAt: key.lastUsedAt?.toISOString() || null,
                createdAt: key.createdAt.toISOString()
            }))
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { name, description, color } = body;

        const project = await prisma.project.findUnique({
            where: { slug }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: {
                name,
                description,
                color
            }
        });

        return NextResponse.json({ project: updatedProject });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const project = await prisma.project.findUnique({
            where: { slug }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        await prisma.project.delete({
            where: { id: project.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
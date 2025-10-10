import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const endpoints = await prisma.endpoint.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true,
                    }
                },
                _count: {
                    select: {
                        requests: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const endpointsWithStats = await Promise.all(
            endpoints.map(async (endpoint) => {
                const recentRequests = await prisma.request.findMany({
                    where: { endpointId: endpoint.id },
                    take: 100,
                    orderBy: { createdAt: 'desc' }
                });

                const avgDuration = recentRequests.length > 0
                    ? Math.round(recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length)
                    : 0;

                const last24h = await prisma.request.count({
                    where: {
                        endpointId: endpoint.id,
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                });

                return {
                    id: endpoint.id,
                    name: endpoint.name,
                    path: endpoint.path,
                    method: endpoint.method,
                    description: endpoint.description,
                    isActive: endpoint.isActive,
                    project: endpoint.project,
                    totalRequests: endpoint._count.requests,
                    last24hRequests: last24h,
                    avgDuration,
                    createdAt: endpoint.createdAt,
                    updatedAt: endpoint.updatedAt
                };
            })
        );

        return NextResponse.json({ endpoints: endpointsWithStats });
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const projects = await prisma.project.findMany({
            take: 10,
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                endpoints: {
                    where: {
                        isActive: true
                    }
                },
                _count: {
                    select: {
                        endpoints: true
                    }
                }
            }
        });

        const formattedProjects = await Promise.all(
            projects.map(async (project) => {
                const requestCount = await prisma.request.count({
                    where: {
                        endpoint: {
                            projectId: project.id
                        }
                    }
                });

                const lastRequest = await prisma.request.findFirst({
                    where: {
                        endpoint: {
                            projectId: project.id
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        createdAt: true
                    }
                });

                const getTimeAgo = (date: Date | null) => {
                    if (!date) return "Never";

                    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

                    if (seconds < 60) return `${seconds} sec ago`;
                    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
                    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
                };

                const formatRequests = (count: number) => {
                    if (count >= 1000) {
                        return `${(count / 1000).toFixed(1)}K`;
                    }
                    return count.toString();
                };

                const colorMap: { [key: string]: string } = {
                    '#f43f5e': 'rose',
                    '#a855f7': 'purple',
                    '#3b82f6': 'blue',
                    '#10b981': 'green',
                    '#f59e0b': 'amber',
                    '#ec4899': 'pink'
                };

                const color = colorMap[project.color] || 'rose';

                return {
                    id: project.id,
                    name: project.name,
                    endpoints: project._count.endpoints,
                    requests: formatRequests(requestCount),
                    status: project.endpoints.length > 0 ? "active" : "inactive",
                    lastUsed: getTimeAgo(lastRequest?.createdAt || null),
                    color: color,
                    slug: project.slug,
                    description: project.description,
                    icon: project.icon
                };
            })
        );

        return NextResponse.json(
            { projects: formattedProjects },
            { status: 200 }
        );

    } catch (error) {
        console.error("Projects API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}
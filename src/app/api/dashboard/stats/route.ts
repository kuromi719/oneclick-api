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

        const totalProjects = await prisma.project.count();

        const activeEndpoints = await prisma.endpoint.count({
            where: {
                isActive: true
            }
        });

        const totalRequests = await prisma.request.count();

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentRequests = await prisma.request.count({
            where: {
                createdAt: {
                    gte: oneDayAgo
                }
            }
        });

        const successfulRequests = await prisma.request.count({
            where: {
                createdAt: {
                    gte: oneDayAgo
                },
                statusCode: {
                    gte: 200,
                    lt: 400
                }
            }
        });

        const uptime = recentRequests > 0
            ? ((successfulRequests / recentRequests) * 100).toFixed(1)
            : "100.0";

        const formatNumber = (num: number) => {
            if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K`;
            }
            return num.toString();
        };

        const stats = [
            {
                label: "Total Projects",
                value: totalProjects.toString(),
                icon: "fa fa-database",
                gradient: "from-rose-500 via-pink-500 to-rose-600",
                iconBg: "from-rose-500/20 to-pink-500/20"
            },
            {
                label: "Active Endpoints",
                value: activeEndpoints.toString(),
                icon: "fa fa-arrow-up",
                gradient: "from-purple-500 via-violet-500 to-purple-600",
                iconBg: "from-purple-500/20 to-violet-500/20"
            },
            {
                label: "Total Requests",
                value: formatNumber(totalRequests),
                icon: "fa fa-chart-line",
                gradient: "from-blue-500 via-cyan-500 to-blue-600",
                iconBg: "from-blue-500/20 to-cyan-500/20"
            },
            {
                label: "Uptime",
                value: `${uptime}%`,
                icon: "fa fa-shield",
                gradient: "from-emerald-500 via-green-500 to-emerald-600",
                iconBg: "from-emerald-500/20 to-green-500/20"
            },
        ];

        return NextResponse.json({ stats }, { status: 200 });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
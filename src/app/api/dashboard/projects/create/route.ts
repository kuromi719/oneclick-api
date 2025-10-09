import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, description, color, icon } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: "Project name is required" },
                { status: 400 }
            );
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const existingProject = await prisma.project.findUnique({
            where: { slug }
        });

        if (existingProject) {
            return NextResponse.json(
                { error: "Project with this name already exists" },
                { status: 409 }
            );
        }

        const project = await prisma.project.create({
            data: {
                name,
                description: description || null,
                slug,
                icon: icon || null,
                color: color || "#f43f5e"
            }
        });

        return NextResponse.json(
            { success: true, project },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create Project Error:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
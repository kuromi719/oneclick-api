import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await prisma.project.delete({
            where: { id: params.id }
        });

        return NextResponse.json(
            { success: true, message: "Project deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete Project Error:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name, description, color, icon } = await request.json();

        interface ProjectUpdateData {
            name?: string;
            slug?: string;
            description?: string;
            color?: string;
            icon?: string;
        }
        const updateData: ProjectUpdateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        if (description !== undefined) updateData.description = description;
        if (color) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;

        const project = await prisma.project.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(
            { success: true, project },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Project Error:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}
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
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                color: true,
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error fetching project settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project settings' },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
        const { name, description, color } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        const newSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (newSlug !== slug) {
            const existingProject = await prisma.project.findUnique({
                where: { slug: newSlug }
            });

            if (existingProject) {
                return NextResponse.json(
                    { error: 'A project with this name already exists' },
                    { status: 400 }
                );
            }
        }

        const project = await prisma.project.update({
            where: { slug },
            data: {
                name: name.trim(),
                slug: newSlug,
                description: description?.trim() || null,
                color: color || '#f43f5e',
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                color: true,
            }
        });

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Error updating project settings:', error);
        return NextResponse.json(
            { error: 'Failed to update project settings' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        await prisma.project.delete({
            where: { slug }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
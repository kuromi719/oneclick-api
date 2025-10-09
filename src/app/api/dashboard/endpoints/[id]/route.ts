import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const endpoint = await prisma.endpoint.findUnique({
            where: { id }
        });

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint not found' },
                { status: 404 }
            );
        }

        await prisma.endpoint.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const endpoint = await prisma.endpoint.findUnique({
            where: { id },
            include: {
                project: true,
                requests: {
                    take: 100,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ endpoint });
    } catch (error) {
        console.error('Error fetching endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get("auth-token");

        if (!authToken || authToken.value !== "authenticated") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const endpoint = await prisma.endpoint.findUnique({
            where: { id }
        });

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint not found' },
                { status: 404 }
            );
        }

        const updatedEndpoint = await prisma.endpoint.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ endpoint: updatedEndpoint });
    } catch (error) {
        console.error('Error updating endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        const { isActive } = body;

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
            data: { isActive }
        });

        return NextResponse.json({ endpoint: updatedEndpoint });
    } catch (error) {
        console.error('Error toggling endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
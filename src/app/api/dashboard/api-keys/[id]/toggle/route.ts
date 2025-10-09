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

        const apiKey = await prisma.apiKey.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json({ apiKey });
    } catch (error) {
        console.error('Error toggling API key:', error);
        return NextResponse.json(
            { error: 'Failed to toggle API key' },
            { status: 500 }
        );
    }
}
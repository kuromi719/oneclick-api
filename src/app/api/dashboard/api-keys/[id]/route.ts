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

        await prisma.apiKey.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting API key:', error);
        return NextResponse.json(
            { error: 'Failed to delete API key' },
            { status: 500 }
        );
    }
}
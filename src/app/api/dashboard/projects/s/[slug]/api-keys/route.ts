import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

function generateApiKey(): string {
    const randomPart = randomBytes(24).toString('hex');
    return randomPart;
}

export async function POST(
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
        const { name } = body;

        const project = await prisma.project.findUnique({
            where: { slug }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        const apiKey = generateApiKey();

        const createdKey = await prisma.apiKey.create({
            data: {
                name,
                key: apiKey,
                projectId: project.id
            }
        });

        return NextResponse.json({
            apiKey: {
                id: createdKey.id,
                key: createdKey.key,
                name: createdKey.name,
                isActive: createdKey.isActive,
                createdAt: createdKey.createdAt.toISOString()
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
            include: {
                apiKeys: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            apiKeys: project.apiKeys.map(key => ({
                id: key.id,
                key: key.key,
                name: key.name,
                isActive: key.isActive,
                lastUsedAt: key.lastUsedAt?.toISOString() || null,
                createdAt: key.createdAt.toISOString()
            }))
        });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
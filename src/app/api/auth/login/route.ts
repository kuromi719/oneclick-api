import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        if (username === adminUsername && password === adminPassword) {
            const response = NextResponse.json(
                { success: true, message: "Login successful" },
                { status: 200 }
            );

            response.cookies.set("auth-token", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
            });

            return response;
        } else {
            return NextResponse.json(
                { error: "Username or password is incorrect" },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Server Error" },
            { status: 500 }
        );
    }
}
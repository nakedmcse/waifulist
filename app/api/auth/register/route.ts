import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByUsername } from "@/lib/db";
import { createAuthResponse, validateAuthRequest } from "@/lib/authHelpers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = await validateAuthRequest(body);

        if ("error" in validation) {
            return validation.error;
        }

        const { username, password } = validation;

        const existing = getUserByUsername(username);
        if (existing) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        const user = await createUser(username, password);
        if (!user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        return createAuthResponse(user);
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, verifyPassword } from "@/lib/db/dao/user";
import { createAuthResponse, validateAuthRequest } from "@/lib/utils/authHelpers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = await validateAuthRequest(body);

        if ("error" in validation) {
            return validation.error;
        }

        const { username, password } = validation;

        const user = getUserByUsername(username);
        if (!user) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        const validPassword = await verifyPassword(password, user.password_hash);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        return createAuthResponse(user);
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}

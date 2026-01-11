import { NextResponse } from "next/server";
import { User } from "@/lib/db";
import { setSessionCookie, signToken } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";

interface AuthRequest {
    username?: string;
    password?: string;
    turnstileToken?: string;
}

export async function validateAuthRequest(
    body: AuthRequest,
): Promise<{ error: NextResponse } | { username: string; password: string }> {
    const { username, password, turnstileToken } = body;

    if (!username || !password) {
        return { error: NextResponse.json({ error: "Username and password required" }, { status: 400 }) };
    }

    if (turnstileToken) {
        const isValidToken = await verifyTurnstileToken(turnstileToken);
        if (!isValidToken) {
            return { error: NextResponse.json({ error: "Verification failed" }, { status: 400 }) };
        }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
        return { error: NextResponse.json({ error: "Verification required" }, { status: 400 }) };
    }

    return { username, password };
}

export async function createAuthResponse(user: User): Promise<NextResponse> {
    const token = signToken(user);
    await setSessionCookie(token);

    return NextResponse.json({
        user: {
            id: user.id,
            username: user.username,
            publicId: user.public_id,
        },
    });
}

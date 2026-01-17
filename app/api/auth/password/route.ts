import { NextResponse } from "next/server";
import { getCurrentUser, setSessionCookie, signToken } from "@/lib/auth";
import { updatePassword, verifyPassword } from "@/lib/db/dao/user";

export async function PATCH(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    let body: { currentPassword?: string; newPassword?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    if (!newPassword) {
        return NextResponse.json({ error: "New password is required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordValid = await verifyPassword(currentPassword, user.password_hash);
    if (!passwordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    try {
        const updatedUser = await updatePassword(user.id, newPassword);

        const token = signToken(updatedUser);
        await setSessionCookie(token);

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                publicId: updatedUser.public_id,
            },
        });
    } catch (error) {
        console.error("Failed to update password:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}

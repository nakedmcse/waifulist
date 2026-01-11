interface TurnstileVerifyResponse {
    success: boolean;
    "error-codes"?: string[];
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey || token === "disabled") {
        return true;
    }

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        const data: TurnstileVerifyResponse = await response.json();
        return data.success;
    } catch (error) {
        console.error("Turnstile verification failed:", error);
        return false;
    }
}

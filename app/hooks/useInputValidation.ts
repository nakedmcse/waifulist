"use client";

import { useCallback, useEffect, useRef } from "react";

const SEQUENCE_HASH = process.env.NEXT_PUBLIC_THEME_KEY ?? null;
const SEQUENCE_LENGTH = 10;

async function computeHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function useInputValidation(onValidated: () => void) {
    const bufferRef = useRef("");
    const validatedRef = useRef(false);

    const handleKeyDown = useCallback(
        async (event: KeyboardEvent) => {
            if (validatedRef.current || !SEQUENCE_HASH) {
                return;
            }

            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (event.key.length !== 1) {
                return;
            }

            bufferRef.current = (bufferRef.current + event.key.toLowerCase()).slice(-SEQUENCE_LENGTH);

            if (bufferRef.current.length === SEQUENCE_LENGTH) {
                const hash = await computeHash(bufferRef.current);
                if (hash === SEQUENCE_HASH) {
                    validatedRef.current = true;
                    onValidated();
                }
            }
        },
        [onValidated],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const reset = useCallback(() => {
        validatedRef.current = false;
        bufferRef.current = "";
    }, []);

    return { reset };
}

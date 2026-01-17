"use client";

import { useCallback, useEffect, useRef } from "react";

const SEQUENCE_HASH = "ca741ffeeed687b076e465621ff569b1ba3157e3c7bba3fe6809ba76bdaaabb9";
const SEQUENCE_LENGTH = 8;

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
            if (validatedRef.current) {
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

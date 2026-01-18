"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./SecretReveal.module.scss";

interface SecretRevealProps {
    isActive: boolean;
    onComplete: () => void;
}

export function SecretReveal({ isActive, onComplete }: SecretRevealProps) {
    const [phase, setPhase] = useState<"hidden" | "dim" | "text" | "fade">("hidden");
    const prevActiveRef = useRef(isActive);

    useEffect(() => {
        const wasActive = prevActiveRef.current;
        prevActiveRef.current = isActive;

        if (!isActive && wasActive) {
            return;
        }

        if (!isActive) {
            return;
        }

        const dimTimer = setTimeout(() => {
            setPhase("dim");
        }, 0);

        const textTimer = setTimeout(() => {
            setPhase("text");
        }, 800);

        const fadeTimer = setTimeout(() => {
            setPhase("fade");
        }, 3500);

        const completeTimer = setTimeout(() => {
            setPhase("hidden");
            onComplete();
        }, 4300);

        return () => {
            clearTimeout(dimTimer);
            clearTimeout(textTimer);
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [isActive, onComplete]);

    if (phase === "hidden") {
        return null;
    }

    return (
        <div className={`${styles.overlay} ${styles[phase]}`}>
            <div className={styles.vignette} />
            <div className={styles.content}>
                <p className={styles.quote}>
                    <em>&ldquo;There are no miracles.&rdquo;</em>
                </p>
            </div>
        </div>
    );
}

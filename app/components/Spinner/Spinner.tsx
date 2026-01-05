"use client";

import React from "react";
import styles from "./Spinner.module.scss";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerVariant = "inline" | "fullpage";

interface SpinnerProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    text?: string;
}

export function Spinner({ size = "md", variant = "inline", text }: SpinnerProps) {
    const spinner = (
        <div className={`${styles.container} ${styles[variant]}`}>
            <div className={`${styles.spinner} ${styles[size]}`} />
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );

    if (variant === "fullpage") {
        return <div className={styles.overlay}>{spinner}</div>;
    }

    return spinner;
}

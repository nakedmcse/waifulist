"use client";

import React from "react";
import styles from "./Badge.module.scss";

export type BadgeVariant = "premiere" | "new" | "airing" | "finished" | "info";

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
    return <span className={`${styles.badge} ${styles[variant]} ${className ?? ""}`}>{children}</span>;
}

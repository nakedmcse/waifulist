"use client";

import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./ThemeSparkles.module.scss";

const SPARKLE_COUNT = 50;

function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

export function ThemeSparkles() {
    const { theme } = useTheme();

    const sparkles = useMemo(() => {
        const result = [];
        for (let i = 0; i < SPARKLE_COUNT; i++) {
            const style = {
                left: `${seededRandom(i * 4 + 1) * 100}%`,
                top: `${seededRandom(i * 4 + 2) * 100}%`,
                animationDelay: `${seededRandom(i * 4 + 3) * 8}s`,
                animationDuration: `${3 + seededRandom(i * 4 + 4) * 4}s`,
            };
            result.push(<div key={i} className={styles.sparkle} style={style} />);
        }
        return result;
    }, []);

    if (theme !== "bernkastel") {
        return null;
    }

    return <div className={styles.container}>{sparkles}</div>;
}

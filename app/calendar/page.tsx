"use client";

import React, { Suspense } from "react";
import { CalendarPageClient } from "./CalendarPageClient";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

function CalendarContent() {
    return <CalendarPageClient />;
}

export default function CalendarPage() {
    return (
        <Suspense
            fallback={
                <div className={styles.page}>
                    <div className={styles.loading}>
                        <Spinner text="Loading..." />
                    </div>
                </div>
            }
        >
            <CalendarContent />
        </Suspense>
    );
}

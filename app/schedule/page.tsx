"use client";

import React, { Suspense } from "react";
import { SchedulePageClient } from "./SchedulePageClient";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

function ScheduleContent() {
    return <SchedulePageClient />;
}

export default function SchedulePage() {
    return (
        <Suspense
            fallback={
                <div className={styles.page}>
                    <div className={styles.loading}>
                        <Spinner text="Loading schedule..." />
                    </div>
                </div>
            }
        >
            <ScheduleContent />
        </Suspense>
    );
}

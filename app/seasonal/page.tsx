"use client";

import React, { Suspense } from "react";
import { SeasonalPageClient } from "./SeasonalPageClient";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

function SeasonalContent() {
    return <SeasonalPageClient />;
}

export default function SeasonalPage() {
    return (
        <Suspense
            fallback={
                <div className={styles.page}>
                    <div className={styles.container}>
                        <div className={styles.loading}>
                            <Spinner text="Loading..." />
                        </div>
                    </div>
                </div>
            }
        >
            <SeasonalContent />
        </Suspense>
    );
}

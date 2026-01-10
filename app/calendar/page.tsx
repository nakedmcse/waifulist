import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";
import { CalendarPageClient } from "./CalendarPageClient";
import { Spinner } from "@/components/Spinner/Spinner";
import styles from "./page.module.scss";

export const metadata: Metadata = createMetadata(
    "Anime Calendar - WaifuList",
    "Browse seasonal anime and weekly airing schedules",
);

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
            <CalendarPageClient />
        </Suspense>
    );
}

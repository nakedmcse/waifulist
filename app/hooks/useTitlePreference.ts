"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { useMemo } from "react";

interface TitleOptions {
    title: string;
    titleEnglish?: string | null;
}

interface ResolvedTitles {
    mainTitle: string;
    subtitle: string | null;
}

export function useTitlePreference() {
    const { settings } = useSettings();
    const preferEnglish = settings.display.preferEnglishTitles;

    const resolveTitles = useMemo(() => {
        return ({ title, titleEnglish }: TitleOptions): ResolvedTitles => {
            const hasEnglishTitle = titleEnglish && titleEnglish !== title;

            if (preferEnglish && hasEnglishTitle) {
                return {
                    mainTitle: titleEnglish,
                    subtitle: title,
                };
            }

            return {
                mainTitle: title,
                subtitle: hasEnglishTitle ? titleEnglish : null,
            };
        };
    }, [preferEnglish]);

    return { resolveTitles, preferEnglishTitles: preferEnglish };
}

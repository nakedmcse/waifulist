"use client";

import { useCallback } from "react";
import { TraceQuotaInfo } from "@/types/traceMoe";
import * as traceService from "@/services/frontend/traceService";

export type { TraceSearchResponse } from "@/services/frontend/traceService";

export function useTrace() {
    const getQuota = useCallback(async (): Promise<TraceQuotaInfo | null> => {
        return traceService.getQuota();
    }, []);

    const searchImage = useCallback(
        async (file: File, cutBorders: boolean): Promise<traceService.TraceSearchResponse> => {
            return traceService.searchImage(file, cutBorders);
        },
        [],
    );

    return {
        getQuota,
        searchImage,
    };
}

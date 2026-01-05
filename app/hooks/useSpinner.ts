"use client";

import { useCallback, useState } from "react";

interface UseSpinnerReturn {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export function useSpinner(): UseSpinnerReturn {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = useCallback(() => setIsLoading(true), []);
    const stopLoading = useCallback(() => setIsLoading(false), []);

    const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
        setIsLoading(true);
        try {
            return await asyncFn();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, startLoading, stopLoading, withLoading };
}

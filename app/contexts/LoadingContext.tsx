"use client";

import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Spinner } from "@/components/Spinner/Spinner";

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const setLoading = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    const withLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
        setIsLoading(true);
        try {
            return await asyncFn();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
            {children}
            {isLoading && <Spinner variant="fullpage" size="lg" />}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

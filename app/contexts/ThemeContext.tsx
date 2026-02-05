"use client";

import React, { createContext, useCallback, useContext, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { defaultTheme, getDataThemeValue, themes, ThemeType } from "@/types/theme";
import { LocalStorage, STORAGE_KEYS } from "@/constants/localStorage";
import { useInputValidation } from "@/hooks/useInputValidation";
import { SecretReveal } from "@/components/SecretReveal/SecretReveal";
import { ThemeSparkles } from "@/components/ThemeSparkles/ThemeSparkles";
import { updateM3Api } from "@/services/frontend/settingsClientService";

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    getThemeClass: () => string;
    isLightTheme: () => boolean;
    isSecretUnlocked: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getServerSnapshot(): boolean {
    return false;
}

function subscribe(callback: () => void): () => void {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
}

function checkSecretUnlocked(): boolean {
    if (typeof window === "undefined") {
        return false;
    }
    LocalStorage.remove(STORAGE_KEYS.WL_F7_OLD);
    return LocalStorage.getString(STORAGE_KEYS.WL_M3) === "1";
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
    const mounted = useSyncExternalStore(subscribe, () => true, getServerSnapshot);

    const [theme, setThemeState] = useState<ThemeType>(() => {
        if (typeof window === "undefined") {
            return defaultTheme;
        }
        const savedTheme = LocalStorage.getString(STORAGE_KEYS.THEME) as ThemeType | null;
        const secretUnlocked = checkSecretUnlocked();
        if (savedTheme && themes.find(t => t.id === savedTheme)) {
            if (savedTheme === "bernkastel" && !secretUnlocked) {
                LocalStorage.setString(STORAGE_KEYS.THEME, defaultTheme);
                return defaultTheme;
            }
            return savedTheme;
        }
        return defaultTheme;
    });

    const [isSecretUnlocked, setIsSecretUnlocked] = useState<boolean>(() => {
        return checkSecretUnlocked();
    });

    const [showReveal, setShowReveal] = useState(false);

    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", getDataThemeValue(theme));
    }, [theme]);

    const setTheme = useCallback(
        (newTheme: ThemeType) => {
            if (newTheme === "bernkastel" && !isSecretUnlocked) {
                return;
            }
            setThemeState(newTheme);
            LocalStorage.setString(STORAGE_KEYS.THEME, newTheme);
        },
        [isSecretUnlocked],
    );

    const getThemeClass = useCallback((): string => {
        return `theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    }, [theme]);

    const isLightTheme = useCallback((): boolean => {
        const currentTheme = themes.find(t => t.id === theme);
        return currentTheme?.isLightTheme ?? false;
    }, [theme]);

    const handleSecretUnlock = useCallback(() => {
        if (isSecretUnlocked) {
            return;
        }
        setShowReveal(true);
    }, [isSecretUnlocked]);

    const handleRevealComplete = useCallback(() => {
        setShowReveal(false);
        setIsSecretUnlocked(true);
        LocalStorage.setString(STORAGE_KEYS.WL_M3, "1");
        setThemeState("bernkastel");
        LocalStorage.setString(STORAGE_KEYS.THEME, "bernkastel");
        updateM3Api(true).catch(() => {});
    }, []);

    useInputValidation(handleSecretUnlock);

    const displayTheme = mounted ? theme : defaultTheme;

    return (
        <ThemeContext.Provider
            value={{
                theme: displayTheme,
                setTheme,
                getThemeClass,
                isLightTheme,
                isSecretUnlocked,
            }}
        >
            <ThemeSparkles />
            {children}
            <SecretReveal isActive={showReveal} onComplete={handleRevealComplete} />
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

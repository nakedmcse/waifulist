import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WatchListProvider } from "@/contexts/WatchListContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Header } from "@/components/Header/Header";
import { baseMetadata, createMetadata } from "@/lib/metadata";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.scss";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    ...baseMetadata,
    ...createMetadata("WaifuList - Anime Tracker", "Track your anime watching progress with WaifuList"),
};

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <LoadingProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <SettingsProvider>
                                <WatchListProvider>
                                    <Header />
                                    <main>{children}</main>
                                </WatchListProvider>
                            </SettingsProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </LoadingProvider>
            </body>
        </html>
    );
}

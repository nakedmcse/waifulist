export type ThemeType = "anime" | "sakura" | "ocean" | "midnight" | "forest" | "bernkastel";

export interface Theme {
    id: ThemeType;
    name: string;
    description: string;
    icon: string;
    preview: string;
    isLightTheme: boolean;
    isSecret?: boolean;
    cssKey?: string;
}

export function getDataThemeValue(themeId: ThemeType): string {
    const theme = themes.find(t => t.id === themeId);
    return theme?.cssKey ?? themeId;
}

export const themes: Theme[] = [
    {
        id: "anime",
        name: "Anime",
        description: "Classic anime aesthetic with vibrant gradients",
        icon: "bi-stars",
        preview: "🌟",
        isLightTheme: false,
    },
    {
        id: "sakura",
        name: "Sakura",
        description: "Soft pink cherry blossom theme",
        icon: "bi-flower1",
        preview: "🌸",
        isLightTheme: true,
    },
    {
        id: "ocean",
        name: "Ocean",
        description: "Deep sea blue calming theme",
        icon: "bi-water",
        preview: "🌊",
        isLightTheme: false,
    },
    {
        id: "midnight",
        name: "Midnight",
        description: "Dark purple night sky theme",
        icon: "bi-moon-stars",
        preview: "🌙",
        isLightTheme: false,
    },
    {
        id: "forest",
        name: "Forest",
        description: "Natural green woodland theme",
        icon: "bi-tree",
        preview: "🌲",
        isLightTheme: false,
    },
    {
        id: "bernkastel",
        name: "Bernkastel",
        description: "The Witch of Miracles",
        icon: "bi-snow",
        preview: "🐱",
        isLightTheme: false,
        isSecret: true,
        cssKey: "_0x4e33f7",
    },
];

export const defaultTheme: ThemeType = "anime";

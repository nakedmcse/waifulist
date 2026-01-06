export interface BrowseSettings {
    sort?: "rating" | "newest";
    hideSpecials?: boolean;
}

export interface MyListSettings {
    sort?: string;
    genres?: string[];
}

export interface UserSettings {
    browse?: BrowseSettings;
    myList?: MyListSettings;
}

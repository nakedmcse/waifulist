export interface BrowseSettings {
    sort?: "rating" | "newest";
    hideSpecials?: boolean;
}

export interface MyListSettings {
    sort?: string;
    genres?: string[];
}

export interface CalendarSettings {
    showSubscribedOnly?: boolean;
}

export interface DisplaySettings {
    preferEnglishTitles?: boolean;
}

export interface UserSettings {
    browse?: BrowseSettings;
    myList?: MyListSettings;
    calendar?: CalendarSettings;
    display?: DisplaySettings;
    _m3?: boolean;
}

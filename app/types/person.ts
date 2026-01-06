import { AnimePicture } from "./anime";

export interface PersonImage {
    jpg: {
        image_url: string;
    };
}

export interface PersonAnimeEntry {
    mal_id: number;
    url: string;
    images: AnimePicture;
    title: string;
}

export interface PersonCharacterEntry {
    mal_id: number;
    url: string;
    images: {
        jpg: {
            image_url: string;
        };
        webp?: {
            image_url: string;
            small_image_url: string;
        };
    };
    name: string;
}

export interface PersonAnimePosition {
    position: string;
    anime: PersonAnimeEntry;
}

export interface PersonVoiceRole {
    role: string;
    anime: PersonAnimeEntry;
    character: PersonCharacterEntry;
}

export interface PersonFull {
    mal_id: number;
    url: string;
    website_url: string | null;
    images: PersonImage;
    name: string;
    given_name: string | null;
    family_name: string | null;
    alternate_names: string[] | null;
    birthday: string | null;
    favorites: number;
    about: string | null;
    anime: PersonAnimePosition[];
    voices: PersonVoiceRole[];
}

export interface PersonFullResponse {
    data: PersonFull;
}

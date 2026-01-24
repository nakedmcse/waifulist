export interface ProducerTitle {
    type: string;
    title: string;
}

export interface ProducerImage {
    jpg: {
        image_url: string;
    };
}

export interface ProducerFull {
    mal_id: number;
    url: string;
    titles: ProducerTitle[];
    images: ProducerImage;
    favorites: number;
    established: string | null;
    about: string | null;
    count: number;
}

export interface ProducerFullResponse {
    data: ProducerFull;
}

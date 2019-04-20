export type Config = {
    version: string;
    location: string;
    branding?: {
        name?: string;
        logo?: string;
        background?: string;
    };
    developer?: string;
    federated?: string;
    registration?: {
        defaultInstance?: string;
    };
    admin?: {
        name?: string;
        account?: string;
    };
    license: License;
    respository?: string;
}

export type License = {
    name: string;
    url: string;
}
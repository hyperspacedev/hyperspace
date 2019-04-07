export type Config = {
    branding?: {
        name?: string;
        logo?: string;
        background?: string;
    };
    federated?: string;
    registration?: {
        defaultInstance?: string;
    };
    admin?: {
        name?: string;
        account?: string;
    };
}
import { Field } from "./Field";
import { Account } from "./Account";

export type Instance = {
    uri: string;
    title: string;
    description: string;
    email: string;
    version: string;
    thumbnail: string | null;
    urls: Field;
    stats: Field;
    languages: [string];
    contact_account: Account;
};

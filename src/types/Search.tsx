import { Account } from "./Account";
import { Status } from "./Status";
import { Tag } from "./Tag";

export type Results = {
    accounts: [Account];
    statuses: [Status];
    hashtags: [Tag];
};

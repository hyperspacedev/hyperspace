import { Account } from "./Account";
import { Status } from "./Status";

export type Notification = {
    id: string;
    type: "follow" | "mention" | "reblog" | "favourite";
    created_at: string;
    account: Account;
    status: Status | null;
};

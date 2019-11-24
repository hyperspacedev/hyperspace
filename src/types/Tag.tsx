import { History } from "./History";

export type Tag = {
    name: string;
    url: string;
    history?: [History];
};

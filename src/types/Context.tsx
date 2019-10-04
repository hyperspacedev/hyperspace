import { Status } from "./Status";

export type Context = {
    ancestors: [Status];
    descendants: [Status];
};

/**
 * A Generic dictionary with the value of a specific type.
 *
 * Keys _must_ be strings.
 */
export interface Dictionary<T> {
    [Key: string]: T;
}

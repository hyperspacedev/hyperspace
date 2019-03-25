/**
 * Basic type for a table entry, usually in Account
 */
export type Field = {
    name: string;
    value: string;
    verified_at: string | null;
}
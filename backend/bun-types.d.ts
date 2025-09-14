declare module "bun:sqlite" {
  export class Database {
    constructor(
      path: string,
      options?: { readonly?: boolean; strict?: boolean },
    );
    query(sql: string): any;
    prepare(sql: string): any;
    transaction(fn: () => void): () => void;
    close(): void;
    serialize(): Uint8Array;
    static deserialize(data: Uint8Array): Database;
  }
}

import { Knex } from "knex";
import { KnextResult } from "./KnextResult";
export declare class KnexNext<T> {
    query: Knex.QueryBuilder<T>;
    private pageIndex;
    private pageSize;
    private hasPage;
    constructor(query: Knex.QueryBuilder<T>);
    search(text: string, ...fields: (keyof T)[]): this;
    filter(filter: (query: Knex.QueryBuilder<T>) => void): this;
    paginate(page: number, pageSize: number): this;
    retrieve(): Promise<KnextResult<T>>;
}
//# sourceMappingURL=KnexNext.d.ts.map
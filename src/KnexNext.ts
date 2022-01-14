import { Knex } from "knex";
import { SqlString } from "./implements/SqlString";
import { Filter, KnextFilter } from "./KnextFilter";
import { KnextResult } from "./KnextResult";
import { formatSqlString } from "./Utils";

export class KnexNext<T>{
    private pageIndex: number | undefined;
    private pageSize: number | undefined;
    private hasPage: boolean = false;
    constructor(public query: Knex.QueryBuilder<T>) { }
    search(text: string, ...fields: (keyof T)[]) {
        // sql injection security
        text = formatSqlString(text);

        this.query = this.query.where(function () {
            for (let field of fields) {
                this.orWhere(field as string, 'like', `%${text}%`);
            }
        });
        return this;
    }
    filter(filter: Filter<T>) {
        this.query = KnextFilter(this.query, filter)
        return this;
    }
    paginate(page: number, pageSize: number) {
        this.pageIndex = page;
        this.pageSize = pageSize;
        this.hasPage = true;
        return this;
    }
    async retrieve(): Promise<KnextResult<T>> {
        var isError = false;
        var error: Error;
        var query = this.query.clone();
        if (this.hasPage) {
            const cloneQuery = query.clone();
            var total: number = 0;
            await cloneQuery.clearOrder().count('* as total').then(function (result) {
                total = result[0].total;
            }).catch(function (err) {
                isError = true;
                error = err;
            });
            if (!isError) {
                var page = this.pageIndex!;
                var pageSize = this.pageSize!;
                var offset = (page - 1) * pageSize;
                var limit = pageSize;
                query = query.offset(offset).limit(limit);
            }
        }
        var records: T[] = null;
        if (!isError) {
            records = await query.select().catch(err => {
                isError = true;
                error = err;
            }) || null;
        }
        return new KnextResult<T>(records, this.hasPage ? total : (records?.length || 0), !isError, error, this.hasPage, this.pageIndex, this.pageSize);
    }
}

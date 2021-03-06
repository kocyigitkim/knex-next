import { Knex } from "knex";
import { KnexNextRequest } from "./KnexNextRequest";
import { Filter, KnextFilter } from "./KnextFilter";
import { KnextResult } from "./KnextResult";
import { formatSqlString } from "./Utils";

export class KnexNext<T>{
    private pageIndex: number | undefined;
    private pageSize: number | undefined;
    private hasPage: boolean = false;
    private query: any;
    constructor(query: T) {
        this.query = query as any;
    }
    search(text?: string | undefined, ...fields: string[]) {
        if (!text) return this;
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
    sort(column: keyof T, order: 'asc' | 'desc') {
        this.query = this.query.orderBy(column as string, order);
        return this;
    }
    build(request: KnexNextRequest<T>) {
        if (request.filter) {
            this.filter(request.filter);
        }
        if (request.pagination) {
            this.paginate(request.pagination.page, request.pagination.pageSize);
        }
        if (request.sort) {
            this.sort(request.sort.column, request.sort.order);
        }
        return this;
    }
    async retrieve(): Promise<KnextResult<any>> {
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
        return new KnextResult<any>(records, this.hasPage ? total : (records?.length || 0), !isError, error, this.hasPage, this.pageIndex, this.pageSize);
    }
}


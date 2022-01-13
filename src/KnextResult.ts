import { KnextPagination } from "./KnextPagination";

export class KnextResult<T> {
    public pagination?: KnextPagination;
    constructor(public data: T[],
        public total: number,
        public success: boolean,
        public message: Error,
        public hasPage: boolean,
        page: number,
        pageSize: number) {
        if (hasPage) {
            this.pagination = new KnextPagination(page, pageSize, Math.ceil(total * 1.0 / pageSize * 1.0));
        }
    }
}

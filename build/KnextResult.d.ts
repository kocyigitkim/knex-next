import { KnextPagination } from "./KnextPagination";
export declare class KnextResult<T> {
    data: T[];
    total: number;
    success: boolean;
    message: Error;
    hasPage: boolean;
    pagination?: KnextPagination;
    constructor(data: T[], total: number, success: boolean, message: Error, hasPage: boolean, page: number, pageSize: number);
}
//# sourceMappingURL=KnextResult.d.ts.map
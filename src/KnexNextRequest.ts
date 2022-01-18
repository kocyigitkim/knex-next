import { Filter } from "./KnextFilter";
import { KnextPagination } from "./KnextPagination";


export interface KnexNextRequest<T> {
    filter?: Filter<T>;
    pagination?: KnextPagination;
    sort?: {
        column: keyof T;
        order: 'asc' | 'desc';
    };
}

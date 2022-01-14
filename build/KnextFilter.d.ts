import { Knex } from "knex";
export declare type Filter<T> = FilterCondition<T> & {
    [key in keyof T]?: Filter<T[key]>;
};
export interface FilterCondition<T> {
    "$and"?: Filter<T>;
    "$or"?: Filter<T>;
    "$not"?: Filter<T>;
    "$eq"?: Filter<T>;
    "$ne"?: Filter<T>;
    "$gt"?: Filter<T>;
    "$gte"?: Filter<T>;
    "$lt"?: Filter<T>;
    "$lte"?: Filter<T>;
    "$in"?: Filter<T>;
    "$like"?: Filter<T>;
    "$between"?: Filter<T>;
    "$contains"?: Filter<T>;
}
export declare function KnextFilter<T>(query: Knex.QueryBuilder<T>, filter: Filter<T>): Knex.QueryBuilder<T, any>;
//# sourceMappingURL=KnextFilter.d.ts.map
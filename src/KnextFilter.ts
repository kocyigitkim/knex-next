import { Knex } from "knex";
import { formatSqlString } from "./Utils";

export type Filter<T> = FilterCondition<T> & { [key in keyof T]?: Filter<T[key]> };

export interface FilterCondition<T> {
    "$and"?: Filter<T>,
    "$or"?: Filter<T>,
    "$not"?: Filter<T>,
    "$eq"?: Filter<T>,
    "$ne"?: Filter<T>,
    "$gt"?: Filter<T>,
    "$gte"?: Filter<T>,
    "$lt"?: Filter<T>,
    "$lte"?: Filter<T>,
    "$in"?: Filter<T>,
    "$like"?: Filter<T>,
    "$between"?: Filter<T>,
    "$contains"?: Filter<T>,
}

export function KnextFilter<T>(query: Knex.QueryBuilder<T>, filter: Filter<T>) {
    for (var f in filter) {
        if (f.startsWith("$")) {
            query = KnextCondition(query, f.substring(1), filter[f]);
        }
        else {
            query = query.where(f, filter[f]);
        }
    }
    return query;
}

function KnextCondition<T>(query: Knex.QueryBuilder<T>, operator: string, condition: Filter<T>): Knex.QueryBuilder<T, any> {
    var firstKey = Object.keys(condition)[0];
    switch (operator) {
        case "and":
            return query.andWhere(function () {
                KnextFilter(this, condition);
            });
        case "or":
            return query.orWhere(function () {
                KnextFilter(this, condition);
            });
        case "not":
            return query.whereNot(function () {
                KnextFilter(this, condition);
            });
        case "eq":
            return query.where(function () {
                KnextFilter(this, condition);
            });
        case "ne":
            return query.whereNot(function () {
                KnextFilter(this, condition);
            });
        case "gt":
            return query.where(firstKey, ">", condition[firstKey]);
        case "gte":
            return query.where(firstKey, ">=", condition[firstKey]);
        case "lt":
            return query.where(firstKey, "<", condition[firstKey]);
        case "lte":
            return query.where(firstKey, "<=", condition[firstKey]);
        case "in":
            return query.whereIn(firstKey, condition[firstKey]);
        case "like":
            return query.where(firstKey, "like", `%${formatSqlString(condition[firstKey])}%`);
        case "between":
            return query.whereBetween(firstKey, condition[firstKey]);
        case "contains":
            return query.where(function () {
                this.where(firstKey, "like", `%${formatSqlString(condition[firstKey])}%`);
            });
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}

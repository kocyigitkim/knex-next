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
    "$between"?: any[],
    "$contains"?: Filter<T>,
    "$range": any[],
    "$rangeExact": any[]
}

export function KnextFilter<T>(query: Knex.QueryBuilder<T>, filter: Filter<T> | any[], fieldName: string = null) {
    for (var f in filter) {
        if (f.startsWith("$")) {
            var operator = f.substring(1);
            if (operator == "and" || operator == "or") {
                query = KnextCondition(query, null, operator, filter[f]);
            }
            else {
                query = KnextCondition(query, fieldName, f.substring(1), filter[f]);
            }
        }
        else {
            var filterV = filter[f];
            if (typeof filterV === 'object') {
                var operatorName = Object.keys(filterV)[0];
                var condition = filterV[operatorName];
                if (operatorName.startsWith("$")) operatorName = operatorName.substring(1);
                query = KnextCondition(query, f, operatorName, condition);
            }
            else {
                query = query.where(f, filterV);
            }
        }
    }
    return query;
}

function KnextCondition<T>(query: Knex.QueryBuilder<T>, fieldName: string, operator: string, condition: Filter<T> | any[]): Knex.QueryBuilder<T, any> {
    switch (operator) {
        case "and":
            return query.andWhere(function () {
                if (Array.isArray(condition)) {
                    for (var i = 0; i < condition.length; i++) {
                        var c = condition[i];
                        KnextFilter(this, c, fieldName);
                    }
                }
            });
        case "or":
            return query.orWhere(function () {
                if (Array.isArray(condition)) {
                    for (var i = 0; i < condition.length; i++) {
                        var c = condition[i];
                        KnextFilter(this, c, fieldName);
                    }
                }
            });
        case "not":
            return query.whereNot(function () {
                KnextFilter(this, condition);
            });
        case "eq":
            return query.where(fieldName, "=", condition as any);
        case "ne":
            return query.whereNot(fieldName, "<>", condition as any);
        case "gt":
            return query.where(fieldName, ">", condition as any);
        case "gte":
            return query.where(fieldName, ">=", condition as any);
        case "lt":
            return query.where(fieldName, "<", condition as any);
        case "lte":
            return query.where(fieldName, "<=", condition as any);
        case "in":
            return query.whereIn(fieldName, condition as any);
        case "like":
            return query.where(fieldName, "like", `%${formatSqlString(condition as any)}%`);
        case "range":
            {
                var rangeValue = condition;
                if (Array.isArray(rangeValue)) {
                    var begin = rangeValue[0];
                    var end = rangeValue[1];
                    if (begin && end) {
                        return query.where(fieldName, ">", begin).where(fieldName, "<", end);
                    }
                    else if (begin && !end) {
                        return query.where(fieldName, ">", begin);
                    }
                    else if (!begin && end) {
                        return query.where(fieldName, "<", end);
                    }
                    else {
                        return query;
                    }
                }
                return null;
            }
        case "rangeExact":
            {
                var rangeValue = condition;
                if (Array.isArray(rangeValue)) {
                    var begin = rangeValue[0];
                    var end = rangeValue[1];
                    if (begin && end) {
                        return query.where(fieldName, ">=", begin).where(fieldName, "<=", end);
                    }
                    else if (begin && !end) {
                        return query.where(fieldName, ">=", begin);
                    }
                    else if (!begin && end) {
                        return query.where(fieldName, "<=", end);
                    }
                    else {
                        return query;
                    }
                }
                return null;
            }
        case "between":
            return query.whereBetween(fieldName, condition as any);
        case "contains":
            return query.where(function () {
                this.where(fieldName, "like", `%${formatSqlString(condition as any)}%`);
            });
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}
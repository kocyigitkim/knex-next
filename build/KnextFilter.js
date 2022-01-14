"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnextFilter = void 0;
const Utils_1 = require("./Utils");
function KnextFilter(query, filter) {
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
exports.KnextFilter = KnextFilter;
function KnextCondition(query, operator, condition) {
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
            return query.where(firstKey, "like", `%${(0, Utils_1.formatSqlString)(condition[firstKey])}%`);
        case "between":
            return query.whereBetween(firstKey, condition[firstKey]);
        case "contains":
            return query.where(function () {
                this.where(firstKey, "like", `%${(0, Utils_1.formatSqlString)(condition[firstKey])}%`);
            });
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}
//# sourceMappingURL=KnextFilter.js.map
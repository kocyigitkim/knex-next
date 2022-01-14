"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnexNext = void 0;
const KnextFilter_1 = require("./KnextFilter");
const KnextResult_1 = require("./KnextResult");
const Utils_1 = require("./Utils");
class KnexNext {
    constructor(query) {
        this.query = query;
        this.hasPage = false;
    }
    search(text, ...fields) {
        // sql injection security
        text = (0, Utils_1.formatSqlString)(text);
        this.query = this.query.where(function () {
            for (let field of fields) {
                this.orWhere(field, 'like', `%${text}%`);
            }
        });
        return this;
    }
    filter(filter) {
        this.query = (0, KnextFilter_1.KnextFilter)(this.query, filter);
        return this;
    }
    paginate(page, pageSize) {
        this.pageIndex = page;
        this.pageSize = pageSize;
        this.hasPage = true;
        return this;
    }
    async retrieve() {
        var isError = false;
        var error;
        var query = this.query.clone();
        if (this.hasPage) {
            const cloneQuery = query.clone();
            var total = 0;
            await cloneQuery.clearOrder().count('* as total').then(function (result) {
                total = result[0].total;
            }).catch(function (err) {
                isError = true;
                error = err;
            });
            if (!isError) {
                var page = this.pageIndex;
                var pageSize = this.pageSize;
                var offset = (page - 1) * pageSize;
                var limit = pageSize;
                query = query.offset(offset).limit(limit);
            }
        }
        var records = null;
        if (!isError) {
            records = await query.select().catch(err => {
                isError = true;
                error = err;
            }) || null;
        }
        return new KnextResult_1.KnextResult(records, this.hasPage ? total : ((records === null || records === void 0 ? void 0 : records.length) || 0), !isError, error, this.hasPage, this.pageIndex, this.pageSize);
    }
}
exports.KnexNext = KnexNext;
//# sourceMappingURL=KnexNext.js.map
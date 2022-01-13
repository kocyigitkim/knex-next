"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnextResult = void 0;
const KnextPagination_1 = require("./KnextPagination");
class KnextResult {
    constructor(data, total, success, message, hasPage, page, pageSize) {
        this.data = data;
        this.total = total;
        this.success = success;
        this.message = message;
        this.hasPage = hasPage;
        if (hasPage) {
            this.pagination = new KnextPagination_1.KnextPagination(page, pageSize, Math.ceil(total * 1.0 / pageSize * 1.0));
        }
    }
}
exports.KnextResult = KnextResult;
//# sourceMappingURL=KnextResult.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knext = exports.SqlString = void 0;
const KnexNext_1 = require("./KnexNext");
var SqlString_1 = require("./implements/SqlString");
Object.defineProperty(exports, "SqlString", { enumerable: true, get: function () { return SqlString_1.SqlString; } });
function knext(query) {
    return new KnexNext_1.KnexNext(query);
}
exports.knext = knext;
//# sourceMappingURL=index.js.map
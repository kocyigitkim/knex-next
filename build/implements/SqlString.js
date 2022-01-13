"use strict";
//copied from https://github.com/mysqljs/sqlstring
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlString = void 0;
var ID_GLOBAL_REGEXP = /`/g;
var QUAL_GLOBAL_REGEXP = /\./g;
var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
var CHARS_ESCAPE_MAP = {
    '\0': '\\0',
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\x1a': '\\Z',
    '"': '\\"',
    '\'': '\\\'',
    '\\': '\\\\'
};
function escapeId(val, forbidQualified = false) {
    if (Array.isArray(val)) {
        var sql = '';
        for (var i = 0; i < val.length; i++) {
            sql += (i === 0 ? '' : ', ') + escapeId(val[i], forbidQualified);
        }
        return sql;
    }
    else if (forbidQualified) {
        return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``') + '`';
    }
    else {
        return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``').replace(QUAL_GLOBAL_REGEXP, '`.`') + '`';
    }
}
;
function escape(val, stringifyObjects = false, timeZone = 'local') {
    if (val === undefined || val === null) {
        return 'NULL';
    }
    switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val + '';
        case 'object':
            if (val instanceof Date) {
                return dateToString(val, timeZone || 'local');
            }
            else if (Array.isArray(val)) {
                return arrayToList(val, timeZone);
            }
            else if (Buffer.isBuffer(val)) {
                return bufferToString(val);
            }
            else if (typeof val.toSqlString === 'function') {
                return String(val.toSqlString());
            }
            else if (stringifyObjects) {
                return escapeString(val.toString());
            }
            else {
                return objectToValues(val, timeZone);
            }
        default: return escapeString(val);
    }
}
;
function arrayToList(array, timeZone) {
    var sql = '';
    for (var i = 0; i < array.length; i++) {
        var val = array[i];
        if (Array.isArray(val)) {
            sql += (i === 0 ? '' : ', ') + '(' + arrayToList(val, timeZone) + ')';
        }
        else {
            sql += (i === 0 ? '' : ', ') + escape(val, true, timeZone);
        }
    }
    return sql;
}
;
function format(sql, values, stringifyObjects = false, timeZone = 'local') {
    if (values == null) {
        return sql;
    }
    if (!Array.isArray(values)) {
        values = [values];
    }
    var chunkIndex = 0;
    var placeholdersRegex = /\?+/g;
    var result = '';
    var valuesIndex = 0;
    var match;
    while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
        var len = match[0].length;
        if (len > 2) {
            continue;
        }
        var value = len === 2
            ? escapeId(values[valuesIndex])
            : escape(values[valuesIndex], stringifyObjects, timeZone);
        result += sql.slice(chunkIndex, match.index) + value;
        chunkIndex = placeholdersRegex.lastIndex;
        valuesIndex++;
    }
    if (chunkIndex === 0) {
        // Nothing was replaced
        return sql;
    }
    if (chunkIndex < sql.length) {
        return result + sql.slice(chunkIndex);
    }
    return result;
}
;
function dateToString(date, timeZone) {
    var dt = new Date(date);
    if (isNaN(dt.getTime())) {
        return 'NULL';
    }
    var year;
    var month;
    var day;
    var hour;
    var minute;
    var second;
    var millisecond;
    if (timeZone === 'local') {
        year = dt.getFullYear();
        month = dt.getMonth() + 1;
        day = dt.getDate();
        hour = dt.getHours();
        minute = dt.getMinutes();
        second = dt.getSeconds();
        millisecond = dt.getMilliseconds();
    }
    else {
        var tz = convertTimezone(timeZone);
        if (tz !== false && tz !== 0) {
            dt.setTime(dt.getTime() + (tz * 60000));
        }
        year = dt.getUTCFullYear();
        month = dt.getUTCMonth() + 1;
        day = dt.getUTCDate();
        hour = dt.getUTCHours();
        minute = dt.getUTCMinutes();
        second = dt.getUTCSeconds();
        millisecond = dt.getUTCMilliseconds();
    }
    // YYYY-MM-DD HH:mm:ss.mmm
    var str = zeroPad(year, 4) + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2) + ' ' +
        zeroPad(hour, 2) + ':' + zeroPad(minute, 2) + ':' + zeroPad(second, 2) + '.' +
        zeroPad(millisecond, 3);
    return escapeString(str);
}
;
function bufferToString(buffer) {
    return 'X' + escapeString(buffer.toString('hex'));
}
;
function objectToValues(object, timeZone) {
    var sql = '';
    for (var key in object) {
        var val = object[key];
        if (typeof val === 'function') {
            continue;
        }
        sql += (sql.length === 0 ? '' : ', ') + escapeId(key) + ' = ' + escape(val, true, timeZone);
    }
    return sql;
}
;
function raw(sql) {
    if (typeof sql !== 'string') {
        throw new TypeError('argument sql must be a string');
    }
    return {
        toSqlString: function toSqlString() { return sql; }
    };
}
;
function escapeString(val) {
    var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
    var escapedVal = '';
    var match;
    while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
        escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
        chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }
    if (chunkIndex === 0) {
        // Nothing was escaped
        return "'" + val + "'";
    }
    if (chunkIndex < val.length) {
        return "'" + escapedVal + val.slice(chunkIndex) + "'";
    }
    return "'" + escapedVal + "'";
}
function zeroPad(number, length) {
    number = number.toString();
    while (number.length < length) {
        number = '0' + number;
    }
    return number;
}
function convertTimezone(tz) {
    if (tz === 'Z') {
        return 0;
    }
    var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
    if (m) {
        return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
    }
    return false;
}
exports.SqlString = {
    escapeId,
    escape,
    escapeString,
    format,
    dateToString,
    bufferToString,
    objectToValues,
    raw
};
//# sourceMappingURL=SqlString.js.map
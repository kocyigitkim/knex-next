declare function escapeId(val: Array<any> | string | object | number, forbidQualified?: boolean): string;
declare function escape(val: Array<any> | string | object | number, stringifyObjects?: boolean, timeZone?: string): string;
declare function format(sql: string, values: any, stringifyObjects?: boolean, timeZone?: string): string;
declare function dateToString(date: any, timeZone: any): string;
declare function bufferToString(buffer: any): string;
declare function objectToValues(object: any, timeZone: any): string;
declare function raw(sql: any): {
    toSqlString: () => string;
};
declare function escapeString(val: any): string;
export declare const SqlString: {
    escapeId: typeof escapeId;
    escape: typeof escape;
    escapeString: typeof escapeString;
    format: typeof format;
    dateToString: typeof dateToString;
    bufferToString: typeof bufferToString;
    objectToValues: typeof objectToValues;
    raw: typeof raw;
};
export {};
//# sourceMappingURL=SqlString.d.ts.map
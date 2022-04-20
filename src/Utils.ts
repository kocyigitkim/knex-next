export function formatSqlString(str: string): string {
    return str.replace(/[\0\x08\x09\x60\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
            case "\x08":
            case "\x09":
            case "\x1a":
            case "\n":
            case "\r":
            case '"':
            case "'":
            case "\\":
            case "%":
            case "`":
                return "%";
        }
    });
}
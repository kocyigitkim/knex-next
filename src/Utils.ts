export function formatSqlString(str: string): string {
    var v = str.replace(/[^\w\d]/g, '\\$&');
    v = v.replace("\\ ", " ");
    return v;
}
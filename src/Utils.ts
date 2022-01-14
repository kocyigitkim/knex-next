export function formatSqlString(str: string): string {
    return str.replace(/[^\w\d]/g, '\\$&');
}
import { Knex } from "knex";
import { KnexNext } from "./KnexNext";
export { KnexNextRequest } from "./KnexNextRequest";


export function knext<T>(query: Knex.QueryBuilder<T>): KnexNext<T> {
    return new KnexNext<T>(query);
}
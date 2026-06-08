import { type Result, post, put, get } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return get("/member/memberMessage/page", data);
}
 
/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function reply<T>(data?: any): Promise<Result<T>> {
  return post("/member/memberMessage/reply", data);
}
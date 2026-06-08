import { type Result, post, put, get } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/sys/notice/page", data);
}
export function update<T>(data?: any): Promise<Result<T>> {
  return post("/sys/notice/update", data);
}
export function add<T>(data?: any): Promise<Result<T>> {
  return post("/sys/notice/add", data);
}
export function updateStatus<T>(data?: any): Promise<Result<T>> {
  return get("/sys/notice/updateStatus", data);
}
export function del<T>(data?: any): Promise<Result<T>> {
  return get("/sys/notice/delete", data);
}
import { type Result, post, put, get, ExportPost } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return get("/user/page", data);
}
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/user/export", data, {
    responseType: "blob",
    timeout: 300000
  });
}

export function validateSubtree<T>(data?: any): Promise<Result<T>> {
  return get("/user/validateSubtree", data);
}

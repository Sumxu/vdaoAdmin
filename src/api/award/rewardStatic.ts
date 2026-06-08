import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/reward/static/page", data,{});
}
//发奖
export function send<T>(data?: any): Promise<Result<T>> {
  return post("/reward/static/send", data,{});
}
//导出
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/reward/static/export", data, {
    responseType: "blob",
    timeout: 300000 // 5分钟
  });
}
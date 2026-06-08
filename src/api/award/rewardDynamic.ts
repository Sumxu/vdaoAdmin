import { type Result, post, put ,get} from "../base";
/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/reward/dynamic/page", data,{});
}
//发奖
export function send<T>(data?: any): Promise<Result<T>> {
  return post("/reward/dynamic/send", data,{});
}

//导出
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/reward/dynamic/export", data, {
    responseType: "blob",
    timeout: 300000 // 5分钟
  });
}
//计算
export function calculate<T>(data?: any): Promise<Result<T>> {
  return post("/reward/dynamic/calculate", data,{
      timeout: 600000 // 5分钟
  });
}
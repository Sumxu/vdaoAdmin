import { type Result, post, put, get } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return get("/member/memberDeposit/page", data);
}

export function upTeam<T>(data?: any): Promise<Result<T>> {
  return post("/member/memberDeposit/updateBatchStatus", data);
}

export function upMember<T>(data?: any): Promise<Result<T>> {
  return post("/member/memberDeposit/updateStatus", data);
}

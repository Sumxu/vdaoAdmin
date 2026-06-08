interface ContractMap {
  vDaoPool: string;
  multiCallToken: string;
  rpcUrl: string;
}
// 开发环境合约（测试网）
const devContract: ContractMap = {
  vDaoPool: "0xA99b65d1aF7737fA22E246048a74A289c56868Ec",
  multiCallToken: "0xcA11bde05977b3631167028862bE2a173976CA11",
  rpcUrl: "https://bsc-testnet-rpc.publicnode.com/"
};
// 生产环境合约（主网）
const prodContract: ContractMap = {
  vDaoPool: "0xA99b65d1aF7737fA22E246048a74A289c56868Ec",
  multiCallToken: "0xcA11bde05977b3631167028862bE2a173976CA11",
  rpcUrl: "https://bsc.blockrazor.xyz/1915635065170173952"
};
// 根据环境选择配置
export const contractAddress: ContractMap =
  import.meta.env.MODE === "development" ? devContract : prodContract;

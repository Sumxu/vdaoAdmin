interface ContractMap {
  GaussDistributor: string;
  GaussMintage: string;
  GaussNFTContract: string;
  multiCallToken: string;
  usdtToken: string;
  GaussStake: string;
  GuassToken:string;
}
// 开发环境合约（测试网）
const devContract: ContractMap = {
  GaussDistributor: "0xE2b8E2a255fa9643deE3935Bf107e6933C0e0596",
  GaussMintage: "0xAdD2B449291E40ccf92E98fD724cB243acBB46aD",
  GaussNFTContract: "0x183d0628595219ba7f1Dc67C4F4b99628F04Ef4B",
  GaussStake: "0x0d1Be5766FD66dCED6444c2C91B03eB222349E98",
  multiCallToken: "0x1d3C076d568F3dCaF3CBbecbd724Fc901c9fCf81",
  usdtToken: "0xc8e19c19479a866142b42fb390f2ea1ff082e0d2",
  GuassToken: "0xe8b2A05c13908Cd3797e754D183f5Ca8BFbB56F0"
};
// 生产环境合约（主网）
const prodContract: ContractMap = {
  GaussDistributor: "0xE2b8E2a255fa9643deE3935Bf107e6933C0e0596",
  GaussMintage: "0xAdD2B449291E40ccf92E98fD724cB243acBB46aD",
  GaussNFTContract: "0x183d0628595219ba7f1Dc67C4F4b99628F04Ef4B",
  multiCallToken: "0x1d3C076d568F3dCaF3CBbecbd724Fc901c9fCf81",
  usdtToken: "0xc8e19c19479a866142b42fb390f2ea1ff082e0d2",
  GaussStake: "0x2f3b94fa48109809f87ae190167027a86888250a",
  GuassToken: "0xe8b2A05c13908Cd3797e754D183f5Ca8BFbB56F0"
};
// 根据环境选择配置
export const contractAddress: ContractMap =
  import.meta.env.MODE === "development" ? devContract : prodContract;

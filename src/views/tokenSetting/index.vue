<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import message from "@/utils/message";
import { multiCall } from "@/utils/multiCallUtils";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import { contractAddress } from "@/config/contract";
import tokenABI from "@/abi/tokenABI.ts";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
const pageData: any = reactive({
  totalQuota: 0,
  totalBuyUsdt: 0,
  maxStakeAmount: 0,
  settingTotalQuota: 0,
  settingMaxStakeAmount: 0,
  totalQuotaLoading: false,
  maxStakeAmountLoading: false,
  buyLoading: false,
  saleLoading: false
});

//查询额度信息
const _loadData = async () => {
  const calls = [
    {
      address: contractAddress.GuassToken,
      abi: tokenABI,
      method: "totalQuota",
      params: [] //
    },
    {
      address: contractAddress.GuassToken,
      abi: tokenABI,
      method: "totalBuyUsdt",
      params: [] //
    },
    {
      address: contractAddress.GuassToken,
      abi: tokenABI,
      method: "maxStakeAmount",
      params: [] //
    }
  ];
  try {
    const result = await multiCall(calls);
    pageData.totalQuota=result[0][0]
    pageData.totalBuyUsdt=result[1][0]
    pageData.maxStakeAmount=result[2][0]
    console.log("pageData.totalQuota==",pageData.totalQuota)
    console.log("pageData.totalQuota==",pageData.totalBuyUsdt)
    console.log("pageData.totalQuota==",pageData.maxStakeAmount)
  } catch (error) {

  }
};
const updateBuyOrSaleFn = async val => {
  try {
    val ? (pageData.buyLoading = true) : (pageData.saleLoading = true);
    const res = await callContractMethod(
      contractAddress.GuassToken,
      tokenABI,
      val ? "startBuyLaunch" : "stopBuyLaunch",
      [],
      true
    );
    message.success("设置成功");
  } catch (error) {
  } finally {
    val ? (pageData.buyLoading = false) : (pageData.saleLoading = false);
  }
};
const setMinuteQuotaFn = async () => {
  if (pageData.settingMaxStakeAmount == 0 || "")
    return message.error("请输入每分钟额度");
  try {
    pageData.maxStakeAmountLoading = true;
    const res = await callContractMethod(
      contractAddress.GuassToken,
      tokenABI,
      "setMinuteQuota",
      [toWei(pageData.settingMaxStakeAmount)],
      true
    );
  } catch (error) {
  } finally {
    pageData.maxStakeAmountLoading = false;
  }
};
const setTotalQuotaFn = async () => {
  if (pageData.settingTotalQuota == 0 || "")
    return message.error("请输入总额度");
  try {
    pageData.totalQuotaLoading = true;
    const res = await callContractMethod(
      contractAddress.GuassToken,
      tokenABI,
      "setTotalQuota",
      [toWei(pageData.settingTotalQuota)],
      true
    );
  } catch (error) {
  } finally {
    pageData.totalQuotaLoading = false;
  }
};
/**
 *
 * @param val 是否添加 移除黑名单
 */
const updateBlacklistFn = async val => {
  if (pageData.blackAddress == "") {
    return message.error("查询地址不能为空");
  }
  pageData.blackAddressLoading = true;
  val
    ? (pageData.blackAddressAddLoading = true)
    : (pageData.blackAddressCloseLoading = true);
  try {
    const res = await callContractMethod(
      contractAddress.GaussStake,
      stakeABI,
      "updateBlacklist",
      [pageData.blackAddress, val],
      true
    );
    message.success("设置成功");
  } catch (error) {
  } finally {
    pageData.blackAddressLoading = false;
    val
      ? (pageData.blackAddressAddLoading = false)
      : (pageData.blackAddressCloseLoading = false);
  }
};
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}
/**
 *
 * @param val 是否添加 移除黑名单
 */
const blackListTeamFn = async val => {
  val
    ? (pageData.blackAddressTeamAddLoading = true)
    : (pageData.blackAddressTeamOutLoading = true);
  try {
    const chunks = chunkArray(pageData.blackTeamAddressList, 300);
    for (const batch of chunks) {
      const res = await callContractMethod(
        contractAddress.GaussStake,
        stakeABI,
        "updateTeamBlacklist",
        [pageData.blackTeamAddressList, val],
        true
      );
    }
    message.success("设置成功");
  } catch (error) {
  } finally {
    val
      ? (pageData.blackAddressTeamAddLoading = false)
      : (pageData.blackAddressTeamOutLoading = false);
  }
};
onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <el-space>
      <el-card class="box-card" style="margin: 12px 0; width: 400px">
        <template #header>
          <div class="card-header">
            <span>总额度:{{ fromWei(pageData.totalQuota) }}</span>
            <span>已购买的总额度:{{ fromWei(pageData.totalBuyUsdt) }}</span>
          </div>
        </template>
        <div class="text item" style="display: flex; align-items: center">
          <el-input
            v-model="pageData.settingTotalQuota"
            placeholder="请输入额度"
          />
          <el-button
            style="margin-left: 12px"
            type="primary"
            @click="setTotalQuotaFn()"
            :disabled="pageData.totalQuotaLoading"
            :loading="pageData.totalQuotaLoading"
            >设置总额度</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 400px">
        <template #header>
          <div class="card-header">
            当前每分钟剩余额度:{{ fromWei(pageData.maxStakeAmount) }}
          </div>
        </template>
        <div class="text item" style="display: flex; align-items: center">
          <el-input
            v-model="pageData.settingMaxStakeAmount"
            placeholder="每分钟剩余额度"
          />
          <el-button
            style="margin-left: 12px"
            type="primary"
            @click="setMinuteQuotaFn()"
            :disabled="pageData.maxStakeAmountLoading"
            :loading="pageData.maxStakeAmountLoading"
            >每分钟剩余额度</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 400px">
        <template #header>
          <div class="card-header">买卖设置</div>
        </template>
        <div
          class="text item"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <el-button
            type="primary"
            @click="updateBuyOrSaleFn(true)"
            :disabled="pageData.buyLoading"
            :loading="pageData.buyLoading"
            >开启买</el-button
          >
          <el-button
            type="danger"
            @click="updateBuyOrSaleFn(true)"
            :disabled="pageData.saleLoading"
            :loading="pageData.saleLoading"
            >关闭买</el-button
          >
        </div>
      </el-card>
    </el-space>
  </el-card>
</template>
<style scoped lang="scss">
.tag-top {
  margin-top: 12px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
</style>

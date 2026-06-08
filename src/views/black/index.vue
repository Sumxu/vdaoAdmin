<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import message from "@/utils/message";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import { contractAddress } from "@/config/contract";
import * as $Api from "@/api/black/black";
import stakeABI from "@/abi/stakeABI.ts";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  blackAddress: "", //黑名单地址
  blackTeamAddressList: [], //黑名单团队地址
  blackUserAddress: "", //黑名单用户地址
  blackAddressAddLoading: false,
  blackAddressCloseLoading: false,
  checkBlackUserRes: -999, //用户地址是否是黑名单
  blackAddressLoading: false,
  blackAddressTeamLoading: false, //团队是否属于黑名单团队
  blackAddressTeamAddLoading: false, //团队移除黑名单
  blackAddressTeamOutLoading: false, //团队移除黑名单
  blackAddressUserLoading: false,
  openBtnSettingLoading: false,
  closeBtnSettingLoading: false,
  checkBlackStauts: false, //是否属于黑名单
  checkBlackAddress: "", //团队黑名单地址
  checkBlackRes: false, //是否查询出结果
  addLoading: false,
  reduceLoading: false,
  isSetting: false,
  dataSource: {},
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    info: {
      addNum: "", //增加的额度
      reduceNum: "", //减少的额度
      totalQuota: 0, //总额度
      useQuota: 0, //已使用额度
      isOpen: false //是否开启了铸造池
    },
    columns: [
      {
        label: "编号",
        prop: "id"
      },
      {
        label: "USDT购买",
        prop: "usdtBuy"
      },
      {
        label: "USD购买",
        prop: "usdBuy"
      },
      {
        label: "TUSD购买",
        prop: "tusdBuy"
      },
      { label: "购买日期", prop: "day" }
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 50,
      defaultPageSize: 50,
      currentPage: 1,
      total: 0,
      background: true,
      pageSizes: [50, 100, 200, 300, 500]
    }
  }
});

// 搜索表单变化
const _updateSearchFormData = (data: any) => (pageData.searchForm = data);

// 查询
const _searchForm = (data: any) => {
  pageData.searchForm = data;
  _loadData();
};

// 重置
const _resetSearchForm = (data?) => (pageData.searchForm = data);

// 获取分页参数
const getQueryParams = () => ({
  ...pageData.searchForm,
  current: pageData.tableParams.pagination.currentPage,
  size: pageData.tableParams.pagination.pageSize
});

// 获取表格数据
const _loadData = (page?: number) => {};

// 分页切换
const handleChangePageSize = (val: any) => {
  pageData.tableParams.pagination.pageSize = val;
  _loadData();
};

const handleChangeCurrentPage = (val: any) => {
  pageData.tableParams.pagination.currentPage = val;
  _loadData();
};
// 按钮操作
const btnClickHandle = (key: string) => {
  switch (key) {
    case "search":
      pageData.searchState = !pageData.searchState;
      break;
    case "refresh":
      _loadData();
      break;
  }
};
const getTotalQuota = async () => {};
const getUseQuota = async () => {};
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
/**
 * 查询地址是否属于黑名单团队
 */
const checkBlacklistFn = async () => {
  if (!pageData.blackTeamAddress) {
    return message.error("查询地址不能为空");
  }
  pageData.blackAddressTeamLoading = true;
  try {
    const res = await $Api.queryPage({
      address: pageData.blackTeamAddress
    });
    console.log("res=", res);
    if (res.success) {
      pageData.blackTeamAddressList = res.data;
      console.log(
        "pageData.blackTeamAddressList==",
        pageData.blackTeamAddressList
      );
    }
  } catch (error) {
  } finally {
    pageData.blackAddressTeamLoading = false;
  }
};

/**
 * 查询地址是否属于黑名单团队
 */
const blacklistFn = async () => {
  if (pageData.blackUserAddress == "") {
    return message.error("查询地址不能为空");
  }
  pageData.blackAddressUserLoading = true;
  try {
    const res = await callContractMethod(
      contractAddress.GaussStake,
      stakeABI,
      "blacklist",
      [pageData.blackUserAddress]
    );
    pageData.checkBlackUserRes = res[0];
  } catch (error) {
  } finally {
    pageData.blackAddressUserLoading = false;
  }
};
/**
 *
 * @param val 增加或减少额度
 */
const mintageQuota = async val => {
  pageData.isSetting = true;
  let abiMethodName = ""; //对应的abi方法
  let amount = 0; //对应数量
  if (val == "add") {
    pageData.addLoading = false;
    abiMethodName = "addMintageQuota";
    amount = pageData.tableParams.info.addNum;
  } else {
    pageData.reduceLoading = false;
    abiMethodName = "subMintageQuota";
    amount = pageData.tableParams.info.reduceNum;
  }
  //判断amount是否大于0
  try {
    if (amount <= 0) {
      message.warning("请输入正确的数量");
      throw new Error("请输入正确的数量");
    }
    message.success("设置成功");
    _loadData();
  } catch (error) {
    pageData.isSetting = false;
    pageData.reduceLoading = false;
    pageData.addLoading = false;
  }
};
//查询统计数据
const _loadInfo = async () => {
  getTotalQuota();
  getUseQuota();
};
onMounted(() => _loadInfo());
</script>

<template>
  <el-card :shadow="'never'">
    <el-space wrap>
      <el-card class="box-card" style="margin: 12px 0; width: 600px">
        <template #header>
          <div class="card-header">修改个人黑名单</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.blackAddress"
            placeholder="请输入钱包地址"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            @click="updateBlacklistFn(true)"
            :disabled="pageData.blackAddressLoading"
            :loading="pageData.blackAddressAddLoading"
            >添加黑名单</el-button
          >
          <el-button
            type="danger"
            @click="updateBlacklistFn(false)"
            :disabled="pageData.blackAddressLoading"
            :loading="pageData.blackAddressCloseLoading"
            >移除黑名单</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 600px">
        <template #header>
          <div class="card-header">查询地址是否是黑名单</div>
        </template>

        <div class="text item" style="display: flex; align-items: center">
          <el-input
            v-model="pageData.blackUserAddress"
            placeholder="请输入钱包地址"
          />
          <el-button
            style="margin-left: 12px"
            type="primary"
            @click="blacklistFn()"
            :disabled="pageData.blackAddressUserLoading"
            :loading="pageData.blackAddressUserLoading"
            >查询</el-button
          >
        </div>
        <div class="text item" style="margin-top: 20px">
          查询结果:<span v-if="pageData.checkBlackUserRes == -999">-</span>
          <span v-else>{{ pageData.checkBlackUserRes ? "是" : "不是" }} </span>
        </div>
      </el-card>
    </el-space>
    <div>
      <el-card class="box-card" style="margin: 12px 0; width: 100%">
        <template #header>
          <div class="card-header">查询团队伞下列表</div>
        </template>

        <div class="text item" style="display: flex; align-items: center">
          <el-input
            style="width: 390px"
            v-model="pageData.blackTeamAddress"
            placeholder="请输入钱包地址"
          />
          <el-button
            style="margin-left: 12px"
            type="primary"
            @click="checkBlacklistFn()"
            :disabled="pageData.blackAddressTeamLoading"
            :loading="pageData.blackAddressTeamLoading"
            >查询</el-button
          >
          <el-button
            style="margin-left: 12px"
            type="primary"
            @click="blackListTeamFn(true)"
            :disabled="pageData.blackAddressTeamAddLoading"
            :loading="pageData.blackAddressTeamAddLoading"
            >批量添加黑名单
          </el-button>
          <el-button
            style="margin-left: 12px"
            type="danger"
            @click="blackListTeamFn(false)"
            :disabled="pageData.blackAddressTeamOutLoading"
            :loading="pageData.blackAddressTeamOutLoading"
            >批量移除黑名单
          </el-button>
        </div>
        <div class="text item" style="margin-top: 20px">
          查询结果:伞下数量{{ pageData.blackTeamAddressList.length }}
        </div>
        <div class="text item" v-if="pageData.blackTeamAddressList.length > 0">
          <div v-for="(item, index) in pageData.blackTeamAddressList">
            <el-tag type="primary" class="tag-top" :key="index">{{
              item
            }}</el-tag>
          </div>
        </div>
        <div class="text item" v-if="pageData.blackTeamAddressList.length == 0">
          <el-empty description="暂无团队信息" />
        </div>
      </el-card>
    </div>
  </el-card>
</template>
<style scoped lang="scss">
.tag-top {
  margin-top: 12px;
}
</style>

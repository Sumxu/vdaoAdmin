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
import vDaoPoolABI from "@/abi/vDaoPoolABI";
import { multiCall } from "@/utils/multiCallUtils";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
const pageData: any = reactive({
  indexLoading: 999,
  searchState: true,
  searchForm: {},
  addLoading: false,
  reduceLoading: false,
  isSetting: false,
  dataSource: {},
  depositAmount: "", //入单额度
  snapUpAmount: "", //抢购额度
  depositLpRatio: "", //入单U进LP比例
  depositReserveRatio: "", //入单U进交互池比例
  depositFoundationRatio: "", //入单U进基金会比例
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
const initData = async () => {
  const result = await multiCall([
    {
      address: contractAddress.vDaoPool,
      abi: vDaoPoolABI,
      method: "depositAmount",
      params: []
    },
    {
      address: contractAddress.vDaoPool,
      abi: vDaoPoolABI,
      method: "snapUpAmount",
      params: []
    },
    {
      address: contractAddress.vDaoPool,
      abi: vDaoPoolABI,
      method: "depositLpRatio",
      params: []
    },
    {
      address: contractAddress.vDaoPool,
      abi: vDaoPoolABI,
      method: "depositReserveRatio",
      params: []
    },
    {
      address: contractAddress.vDaoPool,
      abi: vDaoPoolABI,
      method: "depositFoundationRatio",
      params: []
    }
  ]);
  console.log("result", result);
  pageData.depositAmount = fromWei(result[0][0]);
  pageData.snapUpAmount = fromWei(result[1][0]);
  pageData.depositLpRatio = result[2][0].toString() / 100;
  pageData.depositReserveRatio = result[3][0].toString() / 100;
  pageData.depositFoundationRatio = result[4][0].toString() / 100;
};
const settingFn = async (abiName, amount, index) => {
  if (amount < 0) {
    return message.error("不能是负数");
  }
  let inputNum = 0n;
  if (
    abiName == "setDepositLpRatio" ||
    abiName == "setDepositReserveRatio" ||
    abiName == "setDepositFoundationRatio"
  ) {
    if (amount > 100 || amount < 0) {
      return message.error("输入的值有误");
    } else {
      inputNum = BigInt(Number(amount) * 100);
    }
  } else {
    inputNum = toWei(amount);
  }
  console.log("inputNum---", inputNum);
  try {
    pageData.indexLoading = index;
    const res = await callContractMethod(
      contractAddress.vDaoPool,
      vDaoPoolABI,
      abiName,
      [inputNum],
      true
    );
  } catch (error) {
  } finally {
    pageData.indexLoading = 999;
    initData();
  }
};
//查询统计数据
const _loadInfo = async () => {
  initData();
};
onMounted(() => _loadInfo());
</script>

<template>
  <el-card :shadow="'never'">
    <el-space wrap>
      <el-card class="box-card" style="margin: 12px 0; width: 300px">
        <template #header>
          <div class="card-header">入单额度</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.depositAmount"
            placeholder="请输入修改入单额度"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            :loading="pageData.indexLoading == 1"
            @click="settingFn('setDepositAmount', pageData.depositAmount, 1)"
            >设置入单额度</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 300px">
        <template #header>
          <div class="card-header">抢单额度</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.snapUpAmount"
            placeholder="请输入修改抢单额度"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            :loading="pageData.indexLoading == 2"
            @click="settingFn('setSnapUpAmount', pageData.snapUpAmount, 2)"
            >设置抢单额度</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 300px">
        <template #header>
          <div class="card-header">入单U进LP比例%</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.depositLpRatio"
            placeholder="请输入修改入单U进LP比例"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            :loading="pageData.indexLoading == 3"
            @click="settingFn('setDepositLpRatio', pageData.depositLpRatio, 3)"
            >设置入单U进LP比例</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 300px">
        <template #header>
          <div class="card-header">入单U进交互池比例</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.depositReserveRatio"
            placeholder="请输入修改入单U进交互池比例%"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            :loading="pageData.indexLoading == 4"
            @click="
              settingFn(
                'setDepositReserveRatio',
                pageData.depositReserveRatio,
                4
              )
            "
            >设置入单U进交互池比例</el-button
          >
        </div>
      </el-card>

      <el-card class="box-card" style="margin: 12px 0; width: 300px">
        <template #header>
          <div class="card-header">入单U进基金会比例%</div>
        </template>
        <div class="text item">
          <el-input
            v-model="pageData.depositFoundationRatio"
            placeholder="请输入修改入单U进基金会比例"
          />
        </div>
        <div class="text item" style="margin-top: 12px">
          <el-button
            type="primary"
            :loading="pageData.indexLoading == 5"
            @click="
              settingFn(
                'setDepositFoundationRatio',
                pageData.depositFoundationRatio,
                5
              )
            "
            >设置入单U进基金会比例</el-button
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
</style>

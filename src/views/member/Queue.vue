<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/queue";
import message from "@/utils/message";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import { rewardTypeConvert } from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import { downloadExcel } from "@/utils/downloadExcel";
import { ElMessage } from "element-plus";
const statusMap = {
  0: "排单中",
  1: "已完成",
  2: "已取消",
  9: "排单中"
};
const pageData: any = reactive({
  searchForm: {},
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    }
  ],
  dataSource: {},
  permission: {},
  btnOpts: {
    size: "small",
    leftBtns: [],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    columns: [
      {
        label: "钱包地址",
        prop: "address",
        width: "370px"
      },
      { label: "数量", prop: "amount", width: "120px", slot: "amountSlot" },
      { label: "状态", prop: "status", slot: "statusSlot" },
      { label: "实际领取代币数量", width: "140px", slot: "amountSlot" },
      { label: "排序值", width: "170px", prop: "sort" },
      { label: "创建时间", width: "170px", prop: "createTime" }
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
onMounted(() => _loadData());

// 重置
const _resetSearchForm = (data?) => (pageData.searchForm = data);

// 获取分页参数
const getQueryParams = () => ({
  ...pageData.searchForm,
  current: pageData.tableParams.pagination.currentPage,
  size: pageData.tableParams.pagination.pageSize
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.list = [];
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;
  $Api
    .queryPage(query)
    .then((res: any) => {
      if (res.code === 200) {
        pageData.tableParams.list = res.data.records;
        pageData.tableParams.pagination.total = Number(res.data.total);
      } else {
        message.warning(res.msg);
        pageData.tableParams.list = [];
        pageData.tableParams.pagination.total = 0;
      }
    })
    .finally(() => (pageData.tableParams.loading = false));
};

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
    case "promotion":
      deriveXlsx();
      break;
  }
};

//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  pageData.btnOpts.leftBtns[0].loading = true;

  const result = await downloadExcel(
    () => $Api.exportXlsx(query),
    "团队奖励分奖列表.xlsx"
  );
  if (result.success) {
    ElMessage.success("导出成功");
    pageData.btnOpts.leftBtns[0].loading = false;
  } else {
    pageData.btnOpts.leftBtns[0].loading = false;
  }
};
</script>

<template>
  <el-card :shadow="'never'">
    <form-search
      :show="pageData.searchState"
      :form-field="pageData.searchField"
      :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData"
      @search="_searchForm"
      @reset="_resetSearchForm"
    />
    <table-buttons
      :size="pageData.btnOpts.size"
      :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns"
      @click="btnClickHandle"
    />
    <pure-table
      :data="pageData.tableParams.list"
      :columns="pageData.tableParams.columns"
      row-key="address"
      border
      stripe
      :loading="pageData.tableParams.loading"
      :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage"
      @page-size-change="handleChangePageSize"
    >
      <template #amountSlot="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #claimTypeSlot="scope">
        <span>{{ claimTypeMap[scope.row[scope.column.property]] }}</span>
      </template>
       <template #statusSlot="scope">
        <span>{{ statusMap[scope.row[scope.column.property]] }}</span>
      </template>
    </pure-table>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/teamDeposit";
import message from "@/utils/message";
import { fromWei, callContractMethod } from "@/utils/wallet";
import { ElMessage } from "element-plus";
import {
  depositStatusOptions,
  amountOptions,
  userSetLevelOptions,
  pidOptions,
  pledgeTypeOptions,
  pidMap,
  isRepetitionOptions
} from "@/constants/constants";
import {
  depositStatusConvert,
  pidMapConvert,
  pidScopeConvert
} from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
import StatusTabs from "@/components/opts/status-tabs.vue";
const depositTypeMap = {
  1: "入单",
  2: "抢单",
  3: "复投",
  4: "排单"
};
const perTypeMap = {
  1: "1%",
  2: "1.5%",
  3: "2%"
};
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  amountType: "", //派送类型
  amountNumber: "", //派送数量
  pid: "null",
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    }
  ],
  dataSource: {
    depositStatusOptions: depositStatusOptions,
    pidOptions: pidOptions,
    pledgeTypeOptions: pledgeTypeOptions,
    isRepetitionOptions: isRepetitionOptions
  },
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
    columns: [
      {
        label: "钱包地址",
        prop: "address",
        width: "370px"
      },
      {
        label: "入单数量",
        prop: "amount",
        minWidth: "120px",
        slot: "usdtScope"
      },
      {
        label: "入单类型",
        prop: "depositType",
        width: "180px",
        slot: "depositTypeScope"
      },
      {
        label: "类型收益",
        prop: "perType",
        minWidth: "120px",
        slot: "perTypeScope"
      },
      {
        label: "是否手续费抵扣",
        prop: "useFee",
        minWidth: "140px",
        slot: "useFeeScope"
      },
      {
        label: "出局额度",
        prop: "quota",
        minWidth: "120px",
        slot: "usdtScope"
      },
      { label: "已出局", prop: "dept", minWidth: "120px", slot: "usdtScope" },
      {
        label: "已产出",
        prop: "production",
        minWidth: "120px",
        slot: "usdtScope"
      },
      { label: "下次产出时间", prop: "lastTime", width: "180px" },
      { label: "状态", prop: "status", width: "180px", slot: "statusScope" },
      { label: "更新时间", prop: "updateTime", width: "180px" },
      { label: "创建时间", prop: "createTime", width: "180px" }
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
  size: pageData.tableParams.pagination.pageSize,
  pid: pageData.pid
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
    "用户质押.xlsx"
  );
  if (result.success) {
    ElMessage.success("导出成功");
    pageData.btnOpts.leftBtns[0].loading = false;
  } else {
    pageData.btnOpts.leftBtns[0].loading = false;
  }
};

const handleClick = (tabName: any) => {
  pageData.pid = tabName;
  _loadData();
};
onMounted(() => _loadData());
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
      <template #statusScope="scope">
        <el-tag
          :type="scope.row[scope.column.property] == 0 ? 'primary' : 'danger'"
        >
          {{ depositStatusConvert(scope.row[scope.column.property]) }}
        </el-tag>
      </template>
      <template #useFeeScope="scope">
        <el-tag
          :type="
            scope.row[scope.column.property] == true ? 'primary' : 'danger'
          "
        >
          {{ scope.row[scope.column.property] == true ? "使用" : "没使用" }}
        </el-tag>
      </template>
      <template #usdtScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #perTypeScope="scope">
        <span>{{ perTypeMap[scope.row[scope.column.property]] }}</span>
      </template>
      <template #depositTypeScope="scope">
        <span>{{ depositTypeMap[scope.row[scope.column.property]] }}</span>
      </template>
    </pure-table>
  </el-card>
</template>

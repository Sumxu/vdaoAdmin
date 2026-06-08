<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/award/rewardDynamic";
import message from "@/utils/message";
import { downloadExcel } from "@/utils/downloadExcel";
import {
  fromWei,
  callContractMethod,
  toWei,
  createWallet
} from "@/utils/wallet";
import { ElMessage, ElMessageBox, ElDatePicker } from "element-plus";
import { rewardDynamicOptions } from "@/constants/constants";
import { rewardDynamicMapConvert } from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
import distributorABI from "@/abi/distributorABI.ts";
import Erc20ABI from "@/abi/Erc20.ts";
import { storeToRefs } from "pinia";
import { useWalletStoreHook } from "@/store/modules/wallet";
import { MaxUint256 } from "ethers";
const walletStore = useWalletStoreHook();
const { currentAddress, addressList } = storeToRefs(walletStore);
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  multipleSelection: [],
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    },
    {
      type: "date",
      dateType: "datetimerange",
      label: "日期范围",
      prop: "dates",
      placeholder: "请输入日期范围",
      startPlaceholder: "请输入开始日期范围",
      endPlaceholder: "请输入结束日期范围"
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      placeholder: "请选择",
      dataSourceKey: "rewardDynamicOptions",
      options: {
        filterable: true,
        keys: {
          prop: "value",
          value: "value",
          label: "label"
        }
      }
    }
  ],
  dataSource: {
    rewardDynamicOptions: rewardDynamicOptions
  },
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
      {
        key: "promotion",
        label: "导出报表",
        icon: "ep:promotion",
        state: true
      },
      {
        key: "calculate",
        label: "计算",
        icon: "ep:check",
        type: "primary",
        state: true,
        loading: false
      },
      {
        key: "pass",
        label: "发奖",
        icon: "ep:check",
        type: "success",
        state: true,
        loading: false
      }
    ],
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
      { label: "额度", prop: "amount", minWidth: "120px", slot: "amountScope" },
      { label: "状态", prop: "status", minWidth: "120px", slot: "statusScope" },
      { label: "日期", prop: "createDay" }
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
const handleCalculate = async () => {
  const date = ref<string | null>(null);
  ElMessageBox({
    title: "请查询指定日期",
    message: () =>
      h("div", [
        h(ElDatePicker, {
          modelValue: date.value,
          type: "date",
          valueFormat: "YYYY-MM-DD",
          placeholder: "选择日期",
          style: "width: 100%; margin-bottom: 10px;",
          "onUpdate:modelValue": (value: number) => (date.value = value)
        })
      ]),
    showCancelButton: true,
    confirmButtonText: "计算",
    cancelButtonText: "取消",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (!date.value) {
          message.error("请填写完整信息！");
          return;
        }
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = "计算中...";
        $Api
          .calculate<any>({
            date: date.value
          })
          .then((res: any) => {
            console.log("res===", res);
            if (res.code === 200) {
              message.success("计算成功");
              _loadData();
              done();
            } else {
              instance.confirmButtonText = "计算";
              instance.confirmButtonLoading = false;
              message.warning(res.msg);
            }
          })
          .catch(e => {
            instance.confirmButtonLoading = false;
            instance.confirmButtonText = "计算";
          });
      } else {
        done();
      }
    }
  });
};
const handlePass = async () => {
  const date = ref<string | null>(null);
  ElMessageBox({
    title: "设置自动发送",
    message: () =>
      h("div", [
        h(ElDatePicker, {
          modelValue: date.value,
          type: "date",
          valueFormat: "YYYY-MM-DD",
          placeholder: "选择日期",
          style: "width: 100%; margin-bottom: 10px;",
          "onUpdate:modelValue": (value: number) => (date.value = value)
        })
      ]),
    showCancelButton: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (!date.value) {
          message.error("请填写完整信息！");
          return;
        }
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = "计算中...";
        $Api
          .send<any>({
            date: date.value
          })
          .then((res: any) => {
            console.log("res===", res);
            if (res.code === 200) {
              message.success("设置成功");
              _loadData();
              done();
            } else {
              instance.confirmButtonText = "确认";
              instance.confirmButtonLoading = false;
              message.warning(res.msg);
            }
          })
          .catch(e => {
            instance.confirmButtonLoading = false;
            instance.confirmButtonText = "确认";
          });
      } else {
        done();
      }
    }
  });
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
    case "calculate":
      handleCalculate();
      break;
    case "pass":
      handlePass();
      break;
  }
};

const handleSelectionChange = val => {
  pageData.multipleSelection = val;
};
//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  pageData.btnOpts.leftBtns[0].loading = true;
  const result = await downloadExcel(
    () => $Api.exportXlsx(query),
    "静态记录.xlsx"
  );
  if (result.success) {
    ElMessage.success("导出成功");
    pageData.btnOpts.leftBtns[0].loading = false;
  } else {
    pageData.btnOpts.leftBtns[0].loading = false;
  }
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
      border
      stripe
      :loading="pageData.tableParams.loading"
      :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage"
      @selection-change="handleSelectionChange"
      @page-size-change="handleChangePageSize"
    >
      <template #statusScope="scope">
        <span>{{
          rewardDynamicMapConvert(scope.row[scope.column.property])
        }}</span>
      </template>
      <template #amountScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
    </pure-table>
  </el-card>
</template>

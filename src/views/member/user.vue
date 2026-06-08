<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/user";
import message from "@/utils/message";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import {
  levelOptions,
  userLevelOptions,
  userTypeMap,
  userTypeOptions,
  isNodeTypeOptions,
  amountOptions,
  userSetLevelOptions,
  pledgeTypeOptions
} from "@/constants/constants";
import {
  userlevelConvert,
  levelConvert,
  userTypeConvert
} from "@/constants/convert";
import {
  ElMessageBox,
  ElSelect,
  ElOption,
  ElInput,
  ElMessage
} from "element-plus";
import { downloadExcel } from "@/utils/downloadExcel";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  amountType: "", //派送类型
  amountNumber: "", //派送数量
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址",
      width: "370"
    },
    {
      type: "radio",
      label: "类型",
      prop: "queryType",
      default: 1,
      dataSourceKey: "pledgeTypeOptions",
      options: {
        filterable: true,
        keys: {
          prop: "prop",
          value: "value",
          label: "label"
        }
      }
    },
    {
      type: "input",
      label: "上级地址",
      prop: "parentAddress",
      placeholder: "请输入上级地址",
      width: "370"
    },
    {
      type: "select",
      label: "用户等级",
      prop: "level",
      placeholder: "请选择用户等级",
      dataSourceKey: "userLevelOptions",
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
    userLevelOptions: userLevelOptions,
    userTypeOptions: userTypeOptions,
    isNodeTypeOptions: isNodeTypeOptions,
    pledgeTypeOptions: pledgeTypeOptions
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
        state: true,
        loading: false
      },
      {
        key: "validateSubtree",
        label: "验证伞下关系",
        icon: "ep:aim",
        state: true
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
      {
        label: "上级地址",
        prop: "parentAddress",
        width: "370px"
      },
      { label: "团队人数", prop: "teamCount", minWidth: "120px" },
      { label: "直推人数", prop: "directCount", minWidth: "120px" },
      {
        label: "直推业绩",
        prop: "directPerf",
        minWidth: "120px",
        slot: "directPerfScope"
      },
      {
        label: "团队业绩",
        prop: "teamPerf",
        minWidth: "120px",
        slot: "teamPerfScope"
      },
      {
        label: "用户投入",
        prop: "myPerf",
        minWidth: "120px",
        slot: "myPerfScope"
      },
      {
        label: "团队待释放",
        prop: "teamReward",
        minWidth: "120px",
        slot: "teamPerfScope"
      },
      { label: "等级", prop: "level", minWidth: "120px", slot: "levelScope" },
      {
        label: "是否为节点",
        prop: "isNode",
        minWidth: "120px",
        slot: "nodeScope"
      },
      { label: "权重", prop: "weight", minWidth: "120px" },
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
const validateSubtreeFn = () => {
  const ancestorAddress = ref("");
  const descendantAddress = ref("");
  ElMessageBox({
    title: "验证是否是伞下",
    customClass: "subtree-message-box",
    message: () =>
      h(
        "div",
        {
          style:
            "width: 480px; display: flex; flex-direction: column; gap: 16px;"
        },
        [
          h("div", { style: "display: flex; gap: 8px;" }, [
            h("span", { style: "white-space: nowrap;" }, "上级用户地址"),
            h(ElInput, {
              modelValue: ancestorAddress.value,
              "onUpdate:modelValue": (val: string) =>
                (ancestorAddress.value = val)
            })
          ]),
          h("div", { style: "display: flex; gap: 8px;" }, [
            h("span", { style: "white-space: nowrap;" }, "下级用户地址"),
            h(ElInput, {
              modelValue: descendantAddress.value,
              "onUpdate:modelValue": (val: string) =>
                (descendantAddress.value = val)
            })
          ])
        ]
      ),
    showCancelButton: true,
    confirmButtonText: "查询",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (!ancestorAddress.value || !descendantAddress.value) {
          ElMessage.warning("请填写完整地址");
          return;
        }
        instance.confirmButtonLoading = true;
        instance.confirmButtonText = "查询中...";
        try {
          const result = await $Api.validateSubtree({
            ancestorAddress: ancestorAddress.value,
            descendantAddress: descendantAddress.value
          });
          ElMessageBox.alert(
            result.data
              ? "✅ 下级用户在上级用户的伞下"
              : "❌ 下级用户不在上级用户的伞下",
            "验证结果",
            { confirmButtonText: "确定" }
          );
        } catch (e) {
          ElMessage.error("查询失败");
        } finally {
          instance.confirmButtonLoading = false;
          instance.confirmButtonText = "查询";
        }
      } else {
        done();
      }
    }
  });
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
    case "validateSubtree":
      validateSubtreeFn();
      break;
  }
};

//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  pageData.btnOpts.leftBtns[0].loading = true;

  const result = await downloadExcel(
    () => $Api.exportXlsx(query),
    "会员列表.xlsx"
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
      row-key="address"
      border
      stripe
      :loading="pageData.tableParams.loading"
      :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage"
      @page-size-change="handleChangePageSize"
    >
      <template #levelScope="scope">
        <span>{{ userlevelConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #nodeScope="scope">
        <el-switch v-model="scope.row[scope.column.property]" disabled />
      </template>
      <template #directPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #teamPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #myPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
    </pure-table>
  </el-card>
</template>
<style>
.subtree-message-box {
  width: 600px !important;
  max-width: 600px !important;
}
</style>

<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/message/list";
import message from "@/utils/message";
import { fromWei, callContractMethod } from "@/utils/wallet";
import { downloadExcel } from "@/utils/downloadExcel";
import { ElMessage, ElMessageBox, ElInput } from "element-plus";
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
      { label: "留言", prop: "message", minWidth: "120px" },
      {
        label: "回复",
        prop: "reply"
      },
      { label: "联系方式", prop: "contacts", minWidth: "120px" },
      { label: "回复时间", prop: "replyTime", width: "180px" },
      { label: "创建时间", prop: "createTime", width: "180px" },
      { label: "操作", fixed: "right", slot: "operation" }
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
const handleEdit = row => {
  if (row.reply) {
    return;
  }
  const replyContent = ref("");
  const id = row.id;
  ElMessageBox({
    title: "回复留言",
    message: () =>
      h(ElInput, {
        modelValue: replyContent.value,
        "onUpdate:modelValue": val => {
          replyContent.value = val;
        },
        type: "textarea",
        rows: 5,
        style: {
          width: "400px"
        },
        placeholder: "请输入回复内容"
      }),
    showCancelButton: true,
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (!replyContent.value?.trim()) {
          message.warning("请输入回复内容");
          return;
        }

        try {
          instance.confirmButtonLoading = true;

          const res: any = await $Api.reply({
            id,
            reply: replyContent.value
          });

          if (res.code === 200) {
            message.success(res.msg);
            _loadData();
            done();
          } else {
            message.warning(res.msg);
          }
        } catch (err: any) {
          message.error(err?.message || "请求失败");
        } finally {
          instance.confirmButtonLoading = false;
        }
      } else {
        done();
      }
    }
  });
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
      <template #operation="{ row }">
        <el-link type="primary" @click="handleEdit(row)">{{
          row.reply ? "已回复" : "回复"
        }}</el-link>
      </template>
    </pure-table>
  </el-card>
</template>

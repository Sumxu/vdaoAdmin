<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/sysNotice/list";
import message from "@/utils/message";
import noticeDialog from "@/views/sysNotice/components/noticeDialog.vue";
import {
  formatAddressnoticeDialog,
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
  dialogInfo: {},
  dialogVisible: false,
  switchLoading: false,
  mode: "",
  searchField: [
    {
      type: "date",
      dateType: "datetimerange",
      label: "日期范围",
      prop: "dates",
      placeholder: "请输入日期范围",
      startPlaceholder: "请输入开始日期范围",
      endPlaceholder: "请输入结束日期范围"
    }
  ],
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
      {
        key: "promotion",
        label: "添加公告",
        icon: "ep:promotion",
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
        label: "公告标题",
        prop: "title"
      },
      { label: "状态", prop: "status", minWidth: "120px", slot: "statusScope" },
      { label: "发布时间", prop: "publishTime", minWidth: "120px" },
      {
        label: "创建时间",
        prop: "createdTime",
        minWidth: "120px"
      },
      { label: "操作", fixed: "right", slot: "operation", minWidth: "240px" }
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
const handleSubmit = async e => {
  if (e.id) {
    //修改
    try {
      const result = await $Api.update(e);
    } catch (error) {
    } finally {
      _loadData();
    }
  } else {
    //新增
    try {
      const result = await $Api.add({
        status: e.status,
        content: e.content,
        title: e.title
      });
    } catch (error) {
    } finally {
      _loadData();
    }
  }
};
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
const handleView = row => {
  pageData.mode = "view";
  console.log(" pageData.dialogInfo==", pageData.dialogInfo);
  pageData.dialogVisible = true;
};
const handleUpdate = e => {
  pageData.mode = "edit";
  pageData.dialogInfo = e ? { ...e } : null;
  pageData.dialogVisible = true;
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

const delFn = async row => {
  try {
    await ElMessageBox.confirm("是否删除此公告？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 👉 用户点击“确定”才会走到这里
    await $Api.del({ id: row.id });
    ElMessage.success("删除成功");
    _loadData(); // ✅ 刷新列表
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};
const handleBeforeChange = async row => {
  row.loading = true;

  try {
    const newVal = !row.status; // 即将切换的值

    await $Api.updateStatus({
      id: row.id,
      status: newVal ? 1 : 0
    });
    _loadData();
    return true; // ✅ 允许切换
  } catch (e) {
  } finally {
    row.loading = false;
  }
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
      handleAddNotice();
      break;
  }
};
const handleAddNotice = () => {
  pageData.dialogInfo={
    content:'',
    title:"",
    status:0,
  }
  pageData.mode = "add";
  pageData.dialogVisible = true;
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
        <el-switch
          v-model="scope.row[scope.column.property]"
          :active-value="1"
          :inactive-value="0"
          active-text="上架"
          inactive-text="下架"
          :before-change="() => handleBeforeChange(scope.row)"
          :loading="pageData.switchLoading"
        />
      </template>
      <template #operation="{ row }">
        <el-link type="primary" @click="handleUpdate(row)">修改公告</el-link>
        <el-link  type="success" style="margin: 0 12px" @click="handleView(row)">查看公告</el-link>
        <el-link type="danger" @click="delFn(row)">删除公告</el-link>
      </template>
    </pure-table>
    <noticeDialog
      :mode="pageData.mode"
      v-model:visible="pageData.dialogVisible"
      :initialData="pageData.dialogInfo"
      @submit="handleSubmit"
    />
  </el-card>
</template>
<style>
.subtree-message-box {
  width: 600px !important;
  max-width: 600px !important;
}
</style>

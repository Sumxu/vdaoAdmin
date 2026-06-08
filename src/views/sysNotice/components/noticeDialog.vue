<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import EditorBase from "@/components/EditorBase/index.vue";

// 模式类型
type Mode = "add" | "edit" | "view";

// props
interface noticeInfoProps {
  visible: boolean;
  mode?: Mode;
  initialData?: {
    id?: number;
    title?: string;
    status: number;
    content?: string;
  };
}

const props = defineProps<noticeInfoProps>();

// emit
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "submit", data: any): void;
}>();

// 是否查看模式
const isView = computed(() => props.mode === "view");

// 弹窗显示控制
const innerVisible = ref(props.visible);

watch(
  () => props.visible,
  val => {
    innerVisible.value = val;
  }
);

watch(innerVisible, val => {
  emit("update:visible", val);
});

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  title: "",
  status: 0,
  content: ""
});

// 初始化数据
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      Object.assign(formData, {
        ...newData,
        content: newData.content || ""
      });
    } else {
      formData.id = undefined;
      formData.title = "";
      formData.status = 0;
      formData.content = "";
    }
  },
  { immediate: true }
);

// 关闭确认
const handleBeforeClose = (done: () => void) => {
  if (isView.value) {
    done(); // 查看模式直接关
    return;
  }

  ElMessageBox.confirm("确定要关闭吗？未保存的数据将丢失")
    .then(() => done())
    .catch(() => {});
};

// 取消
const handleCancel = () => {
  innerVisible.value = false;
};

// 提交
const handleSubmit = () => {
  if (isView.value) return; // 👈 防御

  const fieldLabels: Record<string, string> = {
    title: "公告标题",
    status: "状态",
    content: "富文本内容"
  };

  for (const key in fieldLabels) {
    const value = formData[key as keyof typeof formData];
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      ElMessage.warning(`请填写${fieldLabels[key]}`);
      return;
    }
  }

  if (formData.content === "<p><br></p>") {
    ElMessage.warning(`请填写富文本内容`);
    return;
  }

  emit("submit", { ...formData });
  innerVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="innerVisible"
    style="height: 700px; overflow-y: scroll"
    width="800px"
    :title="isView ? '查看公告' : formData.id ? '编辑公告' : '新增公告'"
    :before-close="handleBeforeClose"
  >
    <el-form label-width="100px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-input
          v-model="formData.title"
          placeholder="请输入公告标题"
          :disabled="isView"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="上架"
          inactive-text="下架"
          :disabled="isView"
        />
      </el-form-item>

      <!-- 富文本 -->
      <el-form-item label="富文本">
        <EditorBase v-model="formData.content" :disabled="isView" />
      </el-form-item>
    </el-form>

    <!-- 底部 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">
          {{ isView ? "关闭" : "取消" }}
        </el-button>

        <el-button v-if="!isView" type="primary" @click="handleSubmit">
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

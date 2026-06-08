import { ElMessage } from "element-plus";

/**
 * 下载后端返回的 Excel，并返回操作结果
 * @param fetchBlobFn - 异步函数，返回 Blob，比如 $Api.exportXlsx
 * @param fileName - 下载文件名
 * @returns {Promise<{ success: boolean; msg?: string }>}
 */
export async function downloadExcel(
  fetchBlobFn: () => Promise<Blob>,
  fileName: string = "导出数据.xlsx"
): Promise<{ success: boolean; msg?: string }> {
  try {
    const blob = await fetchBlobFn();

    // ===== 判断是否是后端异常 JSON =====
    if (blob.type === "application/json") {
      const text = await blob.text();
      const err = JSON.parse(text);
      ElMessage.error(err.msg || "导出失败");
      return { success: false, msg: err.msg || "导出失败" };
    }

    // ===== 正常下载 =====
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error("下载 Excel 失败", error);
    ElMessage.error(error.message || "下载失败");
    return { success: false, msg: error.message || "下载失败" };
  }
}

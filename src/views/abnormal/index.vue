<template>
  <div class="abnormal">
    <div class="abnormal_back">
      <el-icon size="20" @click="back"><CaretLeft /></el-icon>
      <span class="abnormal_back_span">重点人员管理</span>
    </div>
    <div class="abnormal_content">
      <div class="abnormal_content_button">
        <el-switch
          v-model="switchType"
          inactive-text="是否隐藏敏感信息"
          class="abnormal_content_button_switch abnormal_content_button_item"
        />
        <el-select
          v-model="personnelType"
          class="abnormal_content_button_select abnormal_content_button_item"
          popper-class="abnormal_content_button_select"
          style="width: 240px"
        >
          <el-option
            v-for="item in abnormalTypeArray"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="abnormal_content_button_date abnormal_content_button_item">
          <el-date-picker
            v-model="date"
            type="datetimerange"
            start-placeholder="开始日期"
            :picker-options="pickerOptions"
            end-placeholder="结束日期"
            format="YYYY/MM/DD hh:mm:ss"
            value-format="YYYY-MM-DD h:m:s"
            style="width: 100%"
          />
        </div>
        <el-button
          color="#fff"
          class="abnormal_content_button_search abnormal_content_button_item"
          @click="getPageData"
        >
          搜索
        </el-button>
        <el-button
          type="default"
          @click="dialogTableVisible = true"
          class="abnormal_content_button_item"
          >标记重点人员</el-button
        >
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        height="500px"
        class="abnormal_content_table"
      >
        <el-table-column prop="name" label="照片">
          <template #default="scope">
            <el-avatar :size="60" :src="scope.row.facePath" />
          </template>
        </el-table-column>
        <el-table-column prop="faceId" label="FaceId" min-width="120" />
        <el-table-column prop="userKeyType" label="类型">
          <template #default="scope">
            {{ getAbnormalType(scope.row.userKeyType) }}
          </template>
        </el-table-column>
        <el-table-column prop="community" label="社区" min-width="120" />
        <el-table-column prop="building" label="楼号-单元" min-width="120" />
        <el-table-column prop="floor" label="楼层" min-width="120" />
        <el-table-column prop="userType" label="类别">
          <template #default="scope">
            {{ getPopulationType(scope.row.userType) }}</template
          >
        </el-table-column>
        <el-table-column prop="timeStamp" label="时间" min-width="120" />
        <el-table-column prop="name" label="姓名">
          <template #default="scope">
            {{ (switchType ? scope.row.name : "***") || "" }}
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" min-width="120">
          <template #default="scope">
            {{ (switchType ? scope.row.idCard : "***") || "" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <el-button link type="primary" @click="deleteAbnormal(scope.row)"
              >删除</el-button
            >
            <el-button link type="primary" @click="goAbnormalDeatil(scope.row)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="custom-pagination"
        :page-size="pageSize"
        :pager-count="10"
        :page-count="pageCount"
        layout="prev, pager, next"
        :total="total"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <div id="my-dialog">
    <el-dialog v-model="dialogTableVisible" title="标记重点人员">
      <el-form
        ref="abnormalFormRef"
        :rules="abnormalFormRules"
        :model="abnormalForm"
        label-width="120px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="abnormalForm.name" />
        </el-form-item>
        <el-form-item label="身份证件号" style="color: #fff" prop="idCard">
          <el-input v-model="abnormalForm.idCard" />
        </el-form-item>
        <el-form-item label="人员类型" prop="userKeyType">
          <el-select
            v-model="abnormalForm.userKeyType"
            class="abnormal_content_button_select abnormal_content_button_item"
            popper-class="abnormal_content_button_select"
            style="width: 240px"
          >
            <el-option
              v-for="item in abnormalTypeArray2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSubmit(abnormalFormRef)">提交</el-button>
          <el-button @click="onCancel(abnormalFormRef)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  keypersonnelStatistics,
  deleteRecord,
  addRecord,
  getKeypersonnelPage,
} from "../../api/keypersonnel";
import { getAbnormalType, getPopulationType } from "../../utils/typeConversion";
import { ElMessage } from "element-plus";
const router = useRouter();
const back = () => {
  router.back();
};

// 控制节点
const abnormalFormRef = ref(null);
// 重点人员列表
const tableData = ref([]);
// 是否显示敏感信息
const switchType = ref(false);
// 人员类型
const personnelType = ref("");
// 查询日期
const date = ref([]);

// 计算属性，格式化日期
const formattedDate = (item) => {
  const selectedDate = new Date(item);
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.getDate()).padStart(2, "0");
  const hours = String(selectedDate.getHours()).padStart(2, "0");
  const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
  const seconds = String(selectedDate.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 设置对应的日期查询样式
const pickerOptions = reactive({
  disabledDate(time) {
    return time.getTime() < Date.now();
  },
  styles: {
    color: "#fff", // 设置日期文字颜色为白色
    backgroundColor: "#fff", // 设置日期选择器面板背景颜色为深灰色
  },
});

// 各类人员
const abnormalTypeArray = ref([
  {
    label: "全部",
    value: "",
  },
  {
    label: "涉恐人员",
    value: "1",
  },
  {
    label: "涉稳人员",
    value: "2",
  },
  {
    label: "重大刑事犯罪前科人员",
    value: "3",
  },
  {
    label: "涉毒人员",
    value: "4",
  },
  {
    label: "在逃人员",
    value: "5",
  },
  {
    label: "肇事肇祸精神病人",
    value: "6",
  },
  {
    label: "重点上访人员",
    value: "7",
  },
  {
    label: "标记人员",
    value: "8",
  },
]);

// 各类人员
const abnormalTypeArray2 = ref([
  {
    label: "涉恐人员",
    value: "1",
  },
  {
    label: "涉稳人员",
    value: "2",
  },
  {
    label: "重大刑事犯罪前科人员",
    value: "3",
  },
  {
    label: "涉毒人员",
    value: "4",
  },
  {
    label: "在逃人员",
    value: "5",
  },
  {
    label: "肇事肇祸精神病人",
    value: "6",
  },
  {
    label: "重点上访人员",
    value: "7",
  },
  {
    label: "标记人员",
    value: "8",
  },
]);

//实现分页查询
const currentPage = ref(1); //当前页数
const pageSize = ref(10); //每页显示条目个数
const pageCount = ref(1); //总页数
const total = ref(10); //总条数

// 初始化数据
const getPageData = async () => {
  let startDate = "";
  let endDate = "";
  if (date.value && date.value.length > 0) {
    startDate = date && formattedDate(date.value[0]);
    endDate = date && formattedDate(date.value[1]);
  } else {
    startDate = "";
    endDate = "";
  }
  const params = {
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    startDate: startDate,
    endDate: endDate,
    userKeyType: personnelType.value,
  };
  try {
    const res = await getKeypersonnelPage(params);
    if (res && res.data) {
      let data = res.data;
      data.forEach((item) => {
        item.facePath = item.facePath || "";
      });
      tableData.value = data;
      currentPage.value = res.currentPage;
      total.value = parseInt(res.total);
      pageCount.value = parseInt(res.pageCount);
    }
  } catch (error) {
    ElMessage.info(error);
  }
};

const handleCurrentChange = async (item) => {
  currentPage.value = item;
  let startDate = "";
  let endDate = "";
  if (date.value && date.value.length > 0) {
    startDate = date && formattedDate(date.value[0]);
    endDate = date && formattedDate(date.value[1]);
  } else {
    startDate = "";
    endDate = "";
  }
  const params = {
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    startDate: startDate,
    endDate: endDate,
    userKeyType: personnelType.value,
  };
  try {
    const res = await getKeypersonnelPage(params);
    if (res && res.data) {
      let data = res.data;
      data.forEach((item) => {
        item.facePath = item.facePath || "";
      });
      tableData.value = data;
      currentPage.value = res.currentPage;
      total.value = parseInt(res.total);
      pageCount.value = parseInt(res.pageCount);
    }
  } catch (error) {
    ElMessage.info(error);
  }
};

// 删除小区重点人员
const deleteAbnormal = async (item) => {
  const res = await deleteRecord({ idCard: item.idCard });
  if (res === "删除成功") {
    ElMessage.success(res);
    getList();
  } else {
    ElMessage.info("操作失败");
  }
};

// 查看详情
const goAbnormalDeatil = (item) => {
  router.push({
    name: "AbnormalDetail",
    query: {
      data: JSON.stringify(item),
    },
  });
};

// 控制弹窗是否显示
const dialogTableVisible = ref(false);
// 定义表单结构
const abnormalForm = reactive({
  name: "",
  idCard: "",
  userKeyType: "",
});

// 重点人员提交校验
const abnormalFormRules = reactive({
  name: [{ required: true, message: "请输入人员姓名", trigger: "blur" }],
  idCard: [
    { required: true, message: "请输入身份证件号码", trigger: "blur" },
    // {
    //   pattern: /^\d{17}(\d|x)$/i,
    //   message: "身份证号格式不正确",
    //   trigger: "blur",
    // },
  ],
  userKeyType: [{ required: true, message: "请选择人员类型", trigger: "blur" }],
});

//新增重点人员功能
const onSubmit = (abnormalFormRef) => {
  abnormalFormRef.validate(async (valid) => {
    if (valid) {
      // 表单校验通过，可以执行提交等操作
      if (abnormalForm) {
        const res = await addRecord(abnormalForm);
        if (res === "添加成功") {
          abnormalForm.name = "";
          abnormalForm.idCard = "";
          abnormalForm.userKeyType = "";
          dialogTableVisible.value = false;
          ElMessage.success(res);
        }
      }
    } else {
      ElMessage.error("表单填写有误");
    }
  });
};

// 取消提交重点人员
const onCancel = (abnormalFormRef) => {
  abnormalFormRef.resetFields();
  abnormalForm.name = "";
  abnormalForm.idCard = "";
  abnormalForm.userKeyType = "";
  dialogTableVisible.value = false;
};

onMounted(() => {
  getPageData();
});
</script>

<style lang="scss" scoped>
.abnormal {
  display: flex;
  flex-direction: column;
  height: 92.5vh;
  overflow: hidden;
  background-color: #010936;
  margin: 0px;
  padding: 0;
}

.abnormal_back {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 2rem;
  font-size: 2rem;
  height: 5rem;
}

.abnormal_back_span {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}

.abnormal_content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.abnormal_content_button {
  display: flex;
  flex-wrap: wrap; /* 允许自动换行 */
  flex-direction: row;
  width: 60%;
  margin: 2rem 0 5rem 0;
}

.abnormal_content_button_item {
  margin-right: 20px;
  margin-bottom: 10px;
}

/* 当视图宽度小于600像素时应用的样式 */
@media screen and (max-width: 630px) {
  .abnormal_content_button {
    min-width: auto;
  }
  .abnormal_content_button_item {
    margin: 10px 0;
  }
}

.abnormal_content_button_switch :deep(.el-switch__label) {
  min-width: 120px;
  color: #fff !important;
}

.abnormal_content_button :deep(.el-input__wrapper) {
  background-color: transparent !important;
  color: #fff !important;
}

.abnormal_content_button :deep(.el-input__inner) {
  color: #fff;
}

.abnormal_content_button_date {
  width: 300px;
}

.abnormal_content_button_search {
  margin-left: 10px;
}

/* 使用类名或者标签选择器来选中 el-button 元素 */
.abnormal_content_button .el-button {
  background-color: rgba(0, 0, 0, 0); /* 设置背景色为透明 */
  color: #ffffff; /* 可选：设置文本颜色 */
}

/* 如果想要在按钮悬停时有一些效果，可以添加 hover 样式 */
.abnormal_content_button .el-button:hover {
  border: 1px solid #409efc; /* 设置悬停时的背景色为淡淡的透明色 */
  color: #409efc; /* 可选：设置文本颜色 */
}

.abnormal_content_table {
  width: 60%;
  --el-table-border-color: rgba(222, 253, 255, 0.16);
}

// 设置列表的样式
:deep(.el-table) {
  background-color: transparent;
}

:deep(.el-table) {
  color: #fff;
  box-shadow: 0 0 0.2vw #fff inset;
}

:deep(.el-table__body-wrapper) {
  background-repeat: no-repeat;
  background-size: 2px 20px;
}

:deep(.el-table__expanded-cell) {
  background-color: transparent;
  color: #ffffff;
}

:deep(.el-table th) {
  background-color: rgba(0, 238, 246, 0.08) !important;
  color: #ffffff;
}

:deep(.el-table tr) {
  background-color: transparent !important;
  color: #ffffff;
}

:deep(.el-table td) {
  background-color: transparent !important;
}

:deep(.el-table__fixed)::before {
  background-color: transparent;
}

v-deep .el-table::-webkit-scrollbar {
  width: 12px;
}

v-deep .el-table::-webkit-scrollbar-thumb {
  background-color: #f7f4f4;
  border-radius: 10px;
}

v-deep .el-table::-webkit-scrollbar-track {
  background-color: #fff;
}

// 设置弹窗的样式
:deep(.my-dialog) {
  background-color: transparent;
}

// 使用深度是选择器也生效了
:deep(.el-dialog) {
  background: rgba(0, 0, 0, 0.2) !important;
  border: rgb(57, 140, 255) 1px solid;
  backdrop-filter: blur(3px);
}

.el-dialog__header,
:deep(.el-dialog__title) {
  color: #fff;
}

:deep(.el-form-item__label) {
  color: #fff;
}
.el-dialog__headerbtn {
  color: #fff;
}

.el-dialog .el-button {
  background-color: rgba(0, 0, 0, 0); /* 设置背景色为透明 */
  color: #ffffff; /* 可选：设置文本颜色 */
}

.el-dialog .el-button:hover {
  border: 1px solid #409efc; /* 设置悬停时的背景色为淡淡的透明色 */
  color: #409efc; /* 可选：设置文本颜色 */
}

:deep(.el-dialog__title) {
  color: rgb(255, 255, 255);
  font-weight: 900;
}

:deep(.el-dialog__header) {
  color: #fff;
  text-align: center;
  box-shadow: 0 0 1.5vw rgb(57, 140, 255) inset;
  background-repeat: no-repeat;
  margin-right: 0 !important;
}

.el-dialog__header .el-dialog__headerbtn :deep(.el-dialog__close) {
  color: #fff !important;
}

:deep(.el-dialog__body) {
  padding: 20px;
  color: #fff;
  box-shadow: 0 0 1.5vw rgb(57, 140, 255) inset;
  background-repeat: no-repeat;
}

:deep(.el-form-item__content) {
  background-repeat: no-repeat;
  border-radius: 10px;
}

:deep(.planTitle) {
  padding: 0 0 0 20px;
  color: #8ae3e9;
  font-size: 18px;
  font-weight: 600;
}

:deep(.planContent) {
  color: #e6feff;
  font-size: 16px;
}

:deep(.el-dialog) :deep(.el-button--primary) {
  color: #fff;
  border-color: rgb(57, 140, 255);
  position: absolute;
  margin-left: 374px;
}

.el-dialog .el-form .el-form-item :deep(.el-input__wrapper) {
  background-color: transparent !important;
}

:deep(.el-pagination) {
  margin-top: 20px;
  --el-pagination-bg-color: #010936;
  --el-pagination-button-disabled-color: #fff;
  --el-pagination-text-color: #fff;
}
:deep(.el-pagination) button {
  color: #fff;
  background-color: transparent !important;
}

:deep(.el-pagination) button:hover {
  color: var(--el-pagination-hover-color);
}

:deep(.el-pagination) button:disabled {
  background-color: transparent !important;
}

:deep(.el-pagination) .btn-next .el-icon {
  font-size: 18px;
}
:deep(.el-pagination) .btn-prev .el-icon {
  font-size: 18px;
}

:deep(.el-pagination) .el-pager li {
  color: #fff;
}

:deep(.el-pagination) .el-pager li.is-active {
  color: var(--el-pagination-hover-color);
}
</style>
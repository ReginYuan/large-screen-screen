<template>
  <div class="moveInOutDetail">
    <div class="moveInOutDetail_back">
      <el-icon size="20" @click="back"><CaretLeft /></el-icon>
      <span class="moveInOutDetail_back_span">人员详情</span>
    </div>
    <div class="moveInOutDetail_content">
      <div class="moveInOutDetail_content_detail">
        <el-avatar
          class="moveInOutDetail_content_detail_avatar"
          :size="80"
          :src="avatar"
        />
        <div class="moveInOutDetail_content_detail_name">
          {{ name || "匿名" }}
        </div>
      </div>
      <div class="moveInOutDetail_content_button">
        <div
          class="moveInOutDetail_content_button_item moveInOutDetail_content_button_trajectory"
        >
          人员轨迹:
        </div>
        <div
          class="moveInOutDetail_content_button_date moveInOutDetail_content_button_item"
        >
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
          class="moveInOutDetail_content_button_search moveInOutDetail_content_button_item"
          @click="getPageData"
        >
          搜索
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        height="500px"
        class="moveInOutDetail_content_table"
      >
        <el-table-column prop="name" label="照片">
          <template #default="scope">
            <el-avatar :size="60" :src="scope.row.facePath" />
          </template>
        </el-table-column>
        <el-table-column prop="faceId" label="FaceId" min-width="150" />
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
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="idCard" label="身份证" min-width="120" />
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
</template>
<script setup>
import { onMounted, ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getPersonalPage } from "../../../api/moveInout";
import {
  getAbnormalType,
  getPopulationType,
} from "../../../utils/typeConversion";
import { ElMessage } from "element-plus";
const router = useRouter();
const route = useRoute();
const back = () => {
  router.back();
};
// 个人身份证号
const idCard = ref("");
// 头像
const avatar = ref("");
// 名字
const name = ref("");
// 重点人员列表
const tableData = ref([]);

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

//实现分页查询
const currentPage = ref(1); //当前页数
const pageSize = ref(10); //每页显示条目个数
const pageCount = ref(1); //总页数
const total = ref(10); //总条数

// 初始化分页
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
    idCard: idCard.value,
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    startDate: startDate,
    endDate: endDate,
  };
  try {
    const res = await getPersonalPage(params);
    if (res && res.data) {
      let data = res.data;
      data.forEach((item) => {
        item.facePath = item.facePath || "";
      });
      currentPage.value = res.currentPage;
      total.value = parseInt(res.total);
      pageCount.value = parseInt(res.pageCount);
      tableData.value = data;
    }
  } catch (error) {
    ElMessage.info(error);
  }
};

//分页查询
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
    idCard: idCard.value,
    pageSize: pageSize.value,
    currentPage: currentPage.value,
    startDate: startDate,
    endDate: endDate,
  };
  try {
    const res = await getPersonalPage(params);
    if (res && res.data) {
      let data = res.data;
      data.forEach((item) => {
        item.facePath = item.facePath || "";
      });
      currentPage.value = res.currentPage;
      total.value = parseInt(res.total);
      pageCount.value = parseInt(res.pageCount);
      tableData.value = data;
    }
  } catch (error) {
    ElMessage.info(error);
  }
};

onMounted(() => {
  const data = route.query && JSON.parse(route.query.data);
  idCard.value = data && data.idCard;
  avatar.value = data && data.facePath;
  name.value = data && data.name;
  getPageData();
});
</script>
    
    <style lang="scss" scoped>
.moveInOutDetail {
  display: flex;
  flex-direction: column;
  height: 92.5vh;
  overflow: hidden;
  background-color: #010936;
  margin: 0px;
  padding: 0;
}

.moveInOutDetail_back {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 2rem;
  font-size: 2rem;
  height: 5rem;
}

.moveInOutDetail_back_span {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}

.moveInOutDetail_content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.moveInOutDetail_content_button {
  display: flex;
  flex-wrap: wrap; /* 允许自动换行 */
  flex-direction: row;
  width: 60%;
  margin: 2rem 0;
}

.moveInOutDetail_content_button_item {
  margin-right: 20px;
  margin-bottom: 10px;
}

/* 当视图宽度小于600像素时应用的样式 */
@media screen and (max-width: 630px) {
  .moveInOutDetail_content_button {
    min-width: auto;
  }
  .moveInOutDetail_content_button_item {
    margin: 10px 0;
  }
}

.moveInOutDetail_content_button_switch :deep(.el-switch__label) {
  min-width: 120px;
  color: #fff !important;
}

.moveInOutDetail_content_button :deep(.el-input__wrapper) {
  background-color: transparent !important;
  color: #fff !important;
}

.moveInOutDetail_content_button :deep(.el-input__inner) {
  color: #fff;
}

.moveInOutDetail_content_button_date {
  width: 300px;
}

.moveInOutDetail_content_button_search {
  margin-left: 10px;
}

/* 使用类名或者标签选择器来选中 el-button 元素 */
.moveInOutDetail_content_button .el-button {
  background-color: rgba(0, 0, 0, 0); /* 设置背景色为透明 */
  color: #ffffff; /* 可选：设置文本颜色 */
}

/* 如果想要在按钮悬停时有一些效果，可以添加 hover 样式 */
.moveInOutDetail_content_button .el-button:hover {
  border: 1px solid #409efc; /* 设置悬停时的背景色为淡淡的透明色 */
  color: #409efc; /* 可选：设置文本颜色 */
}

.moveInOutDetail_content_table {
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

:deep(.el-form-item__content) {
  background-repeat: no-repeat;
  border-radius: 10px;
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

.moveInOutDetail_content_detail_avatar {
  border: 1px solid #fff;
}

.moveInOutDetail_content_detail_name {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
}

.moveInOutDetail_content_button_trajectory {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}
</style>
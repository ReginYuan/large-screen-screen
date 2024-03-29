//定义路由相关代码
import { createRouter, createWebHashHistory } from "vue-router";
const routes = [
  {
    path: "/",
    name: "home",
    meta: {
      title: "首页"
    },
    component: () => import("../views/home.vue"),
    redirect: "/Index",
    children: [
      {
        name: "Index",
        path: "/Index",
        component: () => import("@/views/index.vue")
      },
      {
        name: "Map",
        path: "/Map",
        component: () => import("@/views/map.vue")
      },
      {
        name: "VariousPeople",
        path: "/VariousPeople",
        component: () => import("@/views/variousPeople.vue")
      },
      {
        name: "ManagementCenter",
        path: "/ManagementCenter",
        component: () => import("@/views/managementCenter/index.vue")
      },
      {
        name: "Abnormal",
        path: "/Abnormal",
        component: () => import("@/views/abnormal/index.vue")
      },
      {
        name: "AbnormalDetail",
        path: "/Abnormal/abnormalDetail",
        component: () => import("@/views/abnormal/abnormalDetail/index.vue")
      },
      {
        name: "MoveInOut",
        path: "/MoveInOut",
        component: () => import("@/views/moveInOut/index.vue")
      },
      {
        name: "moveInOutDetail",
        path: "/moveInOutDetail",
        component: () => import("@/views/moveInOut/moveInOutDetail/index.vue")
      },
    ]
  },
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录页"
    },
    component: () => import("@/views/login.vue")
  }
];
const router = createRouter({
  //内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes // `routes: routes` 的缩写
});

export default router;

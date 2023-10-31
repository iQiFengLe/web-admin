import * as VueRouter from "vue-router";
import { getNodeById } from "../config/navMenu";

// 路由列表
export const routes: VueRouter.RouteRecordRaw[] = []

// 自动扫描并注册路由
const pages = import.meta.glob("@/pages/**/index.tsx")
for (const path in pages) {
    const p = path.substring(path.indexOf('/pages/') + 7, path.length - 10)
    const keepAlive = p.replaceAll('/', '-')
    routes.push({
        path: "/" + p,
        name: getNodeById(keepAlive)?.title,
        component: pages[path],
        meta: {
            keepAlive: keepAlive,
            id: keepAlive
        }
    })
}


// 创建 hash 路由对象
export const history: VueRouter.RouterHistory = VueRouter.createWebHashHistory();


// 创建路由
export const router: VueRouter.Router = VueRouter.createRouter({
    history: history,
    routes: routes,
});

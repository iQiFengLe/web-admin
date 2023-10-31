<template>
    <ElMain class="container-content">
        <ElScrollbar wrap-class="container-content-scroll" viewClass="h-100">
            <router-view v-slot="{ Component }">
                <keep-alive :include="keepAliveList" key="top-keep-alive">
                    <component :is="Component" :key="activeKeepAlive" />
                </keep-alive>
            </router-view>
        </ElScrollbar>
    </ElMain>
</template>


<script lang="ts" setup>
/**
 * 外部自定义的 element-plus 样式表及其导入
 * 这里由于存在自动导入
 * 所以vue 文件中不可使用 element-plus 中的全局组件名 如：el-main 
 * 如果使用了会导致 重复加载 element-plus css 
 */
import { computed, watch } from "vue"
import { ElMain, ElScrollbar } from "element-plus"
import { useRoute } from "vue-router"
import { useNavStore } from "@/store/nav"

const store = useNavStore()

const route = useRoute()

const keepAliveList = computed(() => {
    return store.tabs.map(v => v.id.toString())
})
const activeKeepAlive = computed(() => {
    return store.activeTab?.id
})

watch(() => route.path, (curr) => {
    if (route.meta.keepAlive) {
        store.addTab({
            id: route.meta.keepAlive as string,
            title: route.name as string,
            closed: true,
            route: {
                name: route.name as string,
                path: route.path,
            } as any
        })
    }
})

</script>
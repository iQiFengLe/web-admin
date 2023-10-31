import { DefineComponent, defineComponent, ref, watch } from "vue";

import { Dedent } from "@/components/icon/shapes/FontAwesome"
import logoUrl from "@/assets/logo.png"
import "./styles/layout.scss"

import NavTabs from "./NavTabs";
import NavMenu from "./NavMenu";
import { RouteLocationRaw, useRoute, useRouter } from "vue-router";
import Main from "./Main.vue";

import NavMenuNodes from "@/config/navMenu"
import { useNavStore } from "@/store/nav";
import { forEachTree } from "@/utils";


/**
 * 导航菜单项组件数据结构定义
 */
export interface NavMenuNodeData {
    id: string,
    title: string,
    type?: 'group' | 'sub',
    icon?: DefineComponent | JSX.Element,
    metaData?: Record<string, any>,
    children?: NavMenuNodeData[],
    disabled?: boolean,
    route?: RouteLocationRaw,
}

/**
 * 导航菜单项组件
 */
interface NavMenuItemComponentProps {
    nodes: NavMenuNodeData[],
    index?: string,
}
const NavMenuItemComponent = defineComponent(
    (props: NavMenuItemComponentProps, { slots }) => {

        return () => {
            return props.nodes.map((node, k) => {


                switch (node.type) {
                    case 'sub':
                        return <el-sub-menu index={props.index ? `${props.index}-${k}` : k.toString()}
                            v-slots={{
                                title() {
                                    return <>
                                        {node.icon ? <m-icon size={18}>{node.icon}</m-icon> : undefined}
                                        <span>
                                            {slots.subTitle?.call(this, node)}
                                        </span>
                                    </>
                                }
                            }}
                        >
                            {
                                node.children?.length ? <NavMenuItemComponent
                                    nodes={node.children}
                                    index={props.index ? `${props.index}-${k}` : k.toString()}
                                    v-slots={slots}
                                /> : undefined
                            }
                        </el-sub-menu>

                    case 'group':
                        return <el-menu-item-group title={node.title}>
                            {
                                node.children?.length ? <NavMenuItemComponent
                                    nodes={node.children}
                                    index={props.index ? `${props.index}-${k}` : k.toString()}
                                    v-slots={slots}
                                /> : undefined
                            }
                        </el-menu-item-group>

                    default:
                        return <el-menu-item index={props.index ? `${props.index}-${k}` : k.toString()}
                            route={node.route} disabled={node.disabled}>
                            {node.icon ? <m-icon size={18}>{node.icon}</m-icon> : undefined}
                            <span>
                                {slots.item?.call(this, node)}
                            </span>
                        </el-menu-item>
                }
            })
        }
    }
);
NavMenuItemComponent.props = ['nodes', 'index']


/**
 * 默认布局组件
 */
const DefaultLayout = defineComponent(() => {

    const state = ref<{
        // 导航菜单节点列表
        asideNodes: NavMenuNodeData[],
        // 侧边栏折叠状态
        asideFoldState: boolean,
        // 活跃菜单 index
        activeMenuIndex: string,

    }>({
        asideNodes: NavMenuNodes,
        asideFoldState: false,
        activeMenuIndex: '0'
    })

    const router = useRouter()
    const route = useRoute()

    watch(() => route.path, (_: string) => {
        forEachTree(state.value.asideNodes, ({ value, indexPath }) => {
            if (value.id === route.meta.id) {
                state.value.activeMenuIndex = indexPath.join('-')
                return false
            }
        })
    })

    // 切换侧边栏折叠状态
    const switchAsideFoldState = () => {
        state.value.asideFoldState = !state.value.asideFoldState
    }

    const store = useNavStore()

    const navMenuItemSlots = {
        subTitle(node: NavMenuNodeData) {
            return node.title
        },
        item(node: NavMenuNodeData) {
            return node.title
        }
    }

    const onMenuSelect = (index: string) => {
        // 查找 Menu node
        const paths = index.split('-').map(v => Number(v))
        let node = state.value.asideNodes[paths[0]]
        let i = 1;
        while (i < paths.length) {
            if (!node.children || !node.children.length) {
                return
            }
            node = node.children[paths[i]]
            i++
        }
        if (node.route) {
            router.push(node.route)
        }
    }

    return () => {
        return <el-container class="layout-container h-100">
            <el-aside width="260px" class={`container-aside${state.value.asideFoldState ? ' aside-collapse' : ''}`}>
                <header class="aside-header">
                    <div class="aside-logo">
                        <img src={logoUrl} alt="" />
                    </div>
                    <m-icon size={20} clazz="aside-fold" onClick={switchAsideFoldState}><Dedent /></m-icon>
                </header>
                <el-scrollbar class="aside-menu-scrollbar">
                    <el-menu default-active={state.value.activeMenuIndex} onSelect={onMenuSelect} collapse={state.value.asideFoldState} mode="vertical">
                        <NavMenuItemComponent
                            nodes={state.value.asideNodes}
                            v-slots={navMenuItemSlots}
                        />
                    </el-menu>
                </el-scrollbar>

            </el-aside >
            <el-container>
                <el-header class="container-header">
                    <NavTabs />
                    <NavMenu class="ml-auto mr-0" />
                </el-header>
                <Main />
            </el-container>
        </el-container>
    }
})

export default DefaultLayout;
import { DefineComponent, h } from "vue";
import { RouteLocationRaw } from "vue-router";
import { Dashboard, Users, Role, NineGrid, Cubes, Cogs, Cog } from "@/components/icon/shapes/FontAwesome"
import { forEachTree } from "@/utils";

/**
 * 导航菜单项组件数据结构定义
 */
export interface NavMenuNode {
    // 唯一 
    id: string,
    title: string,
    type?: 'group' | 'sub',
    icon?: DefineComponent | JSX.Element,
    meta?: Record<string, any>,
    children?: NavMenuNode[],
    disabled?: boolean,
    route?: RouteLocationRaw,
}

const navMenus: NavMenuNode[] = [
    {
        id: 'dashboard',
        title: "控制台",
        icon: h(Dashboard, {}),
        route: {
            path: '/dashboard'
        }
    },
    {
        title: "权限管理",
        icon: h(Users),
        type: 'sub',
        id: 'promission-manager',
        children: [
            {
                id: 'user-role',
                title: '角色管理',
                icon: h(Role),
                route: {
                    path: '/user/role'
                }
            },
            {
                id: 'user-group',
                title: '用户组管理',
                icon: h(Users),
                route: {
                    path: '/user/group'
                }
            },
            {
                id: 'user-permission',
                title: '资源管理',
                icon: h(Cubes),
                route: {
                    path: '/user/permission'
                }
            },
            {
                id: 'user-menu',
                title: '菜单规则管理',
                icon: h(NineGrid),
                route: {
                    path: '/user/menu'
                }
            },
        ]
    },
    {
        title: "系统管理",
        icon: h(Cog),
        type: 'sub',
        id: 'system-manager',
        children: [
            {
                id: 'system-config',
                title: '系统配置',
                icon: h(Cogs),
                route: {
                    path: '/system/config'
                }
            },
        ]
    },
]


export const getNodeById = (id: string): NavMenuNode | undefined => {

    let node = undefined

    forEachTree(navMenus, ({ value }) => {
        if (value.id === id) {
            node = value
            return false
        }
    })

    return node

}

export default navMenus
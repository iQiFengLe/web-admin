import { STableColunm } from "@/components/STable"
import { Key } from "@/types"
import { getObjectProperty, removeKeys } from "@/utils"
import { del, HttpResult, patch, post } from "@/utils/request"
import { SUFFIX, USER_MENU } from "../common"

export interface MenuRecord {
    // id
    id: Key,
    // 名称
    name: string,
    // 权重
    weight: number,
    // 父 id
    parentId: number,
    // 图标
    icon: string,
    // 路径
    path: string,
    // 标识
    mark: string,
    // 类型
    type: 'nav' | 'btn',
    // 状态
    state: boolean,
    // 备注
    remark: string,
    // 代码
    code: string,

    createdAt: string,
    updatedAt: string,
}

export declare type MenuFormRecord = Omit<MenuRecord, 'createdAt' | 'updatedAt'>

export declare type MenuFilterFormRecord = Partial<MenuFormRecord>

// 表单keys
export const MenuFormDataKeys = ['id', 'name', 'type', 'wieght', 'path', 'state', 'remark', 'parentId', 'mark', 'icon', 'data', 'code']

/**
 * 添加数据
 * @param data 数据 
 * @returns 
 */
export const add = (data: Omit<MenuFormRecord, 'id'>): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(removeKeys(data, ['id']), MenuFormDataKeys) as any
    return post(`${USER_MENU}/add`, data)
}

/**
 * 更新数据
 * @param data 数据 
 * @returns 
 */
export const update = (data: Partial<Omit<MenuFormRecord, 'id'>> & { id: Key }): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(data, MenuFormDataKeys) as any
    return patch(`${USER_MENU}/update/${data.id}`, data)
}

/**
 * 删除数据
 * @param id id 获取 id array 
 * @returns 
 */
export const remove = (id: Key[] | Key): Promise<HttpResult<void>> => {
    
    if (Array.isArray(id)) {
        return del(`${USER_MENU}/batchDelete${SUFFIX}`, { idList: id })
    }
    return del(`${USER_MENU}/delete/${id}${SUFFIX}`)
}

/**
 * 切换数据状态
 * @param id id 获取 id array 
 * @param state 状态
 * @returns 
 */
export const switchState = (id: Key[] | Key, state: boolean): Promise<HttpResult<void>> => {
    if (Array.isArray(id)) {
        return patch(`${USER_MENU}/batchSwtichState${SUFFIX}`, { idList: id })
    }
    return del(`${USER_MENU}/switchState/${id}${SUFFIX}`)
}

/**
 * 查询列表
 */
export const queryList = (filter?: MenuFilterFormRecord): Promise<HttpResult<MenuRecord[]>> => {

    return post(`${USER_MENU}/queryList${SUFFIX}`, filter)

}


/**
 * 查询table colunms
 * @returns 
 */
export const qeuryTalbeColumn = () => {
    return Promise.resolve(new HttpResult({
        data: {
            code: "SUCCESS",
            msg: "OK",
            data: [
                {
                    type: 'selection'
                },
                {
                    type: 'index'
                },
                {
                    label: '名称',
                    prop: 'name'
                },
                {
                    label: '图标',
                    prop: 'icon'
                },
                {
                    label: '权重',
                    prop: 'weight'
                },
                {
                    label: '标识',
                    prop: 'mark'
                },
                {
                    label: '路径',
                    prop: 'path'
                },
                {
                    label: '状态',
                    prop: 'state',
                    slots: {
                        default({ row }) {
                            return <el-switch
                                v-model={row.state}
                                inline-prompt
                                size="large"
                                width="60px"
                                active-text="启用"
                                inactive-text="停用"
                            />
                        },
                    }
                }
            ] as STableColunm<MenuRecord>[],
            timestamp: new Date().getTime()
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {}
    }))
}

/**
 * 查询 字段注释
 * @returns 
 */
export const qeuryFieldComment = () => {
    return Promise.resolve(new HttpResult({
        data: {
            code: "SUCCESS",
            msg: "OK",
            data: {
                id: "菜单规则唯一ID",
                name: "菜单规则名称",
                type: "菜单规则类型",
                path: "菜单规则路径",
                icon: "菜单规则图标",
                mark: "菜单规则标识",
                depth: "菜单规则深度",
                data: "自定义数据",
                state: "菜单规则状态",
                weight: "菜单规则权重",
                remark: "菜单规则备注",
                parentId: "父菜单规则ID",
                createdAt: "创建时间",
                updatedAt: "更新时间"
            },
            timestamp: new Date().getTime()
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {}
    }))
}
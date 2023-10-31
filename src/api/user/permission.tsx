import { STableColunm } from "@/components/STable"
import { Key } from "@/types"
import { del, HttpResult, PageBody, patch, post } from "@/utils/request"
import { SUFFIX, USER_PERMISSION } from "../common"


export interface PermissionRecord {
    // id
    id: Key,
    // 名称
    name: string,
    // 资源代码
    code: string,
    // 资源路径
    path: string,
    // 备注
    remark: string,
    // 状态
    state: boolean,
    // 允许匿名访问
    allowAnonymousAccess: boolean,
    // 模块名称
    moduleName: string,
    // 方法
    method: string,

    createdAt: string,
    updatedAt: string,
}

export declare type PermissionFormRecord = Omit<PermissionRecord, 'createdAt' | 'updatedAt'>

export declare type PermissionFilterFormRecord = Partial<PermissionFormRecord>

/**
 * 添加数据
 * @param data 数据 
 * @returns 
 */
export const add = (data: Omit<PermissionFormRecord, 'id'>): Promise<HttpResult<void>> => {
    return Promise.resolve(new HttpResult({
        data: {
            code: "SUCCESS",
            msg: "OK",
            data: [],
            timestamp: new Date().getTime()
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {}
    }))
    // return post(`${USER_PERMISSION}/add`, data)
}

/**
 * 更新数据
 * @param data 数据 
 * @returns 
 */
export const update = (data: Omit<PermissionFormRecord, 'id'> & { id: Key }): Promise<HttpResult<void>> => {
    return Promise.resolve(new HttpResult({
        data: {
            code: "SUCCESS",
            msg: "OK",
            data: [],
            timestamp: new Date().getTime()
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {}
    }))
    // return patch(`${USER_PERMISSION}/update/${data.id}`, data)
}

/**
 * 删除数据
 * @param id id 获取 id array 
 * @returns 
 */
export const remove = (id: Key[] | Key): Promise<HttpResult<void>> => {
    return Promise.resolve(new HttpResult({
        data: {
            code: "SUCCESS",
            msg: "OK",
            data: [],
            timestamp: new Date().getTime()
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {}
    }))
    // if (Array.isArray(id)) {
    //     return del(`${USER_PERMISSION}/batchDelete${SUFFIX}`, { idList: id })
    // }
    // return del(`${USER_PERMISSION}/delete/${id}${SUFFIX}`)
}

/**
 * 查询列表
 */
export const queryList = (filter?: PermissionFilterFormRecord): Promise<HttpResult<PageBody<PermissionRecord>>> => {

    return post(`${USER_PERMISSION}/queryList${SUFFIX}`, filter)

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
                    label: '代码',
                    prop: 'code'
                },
                {
                    label: '方法',
                    prop: 'method'
                },
                {
                    label: '路径',
                    prop: 'path'
                },
                {
                    label: '模块名称',
                    prop: 'moduleName'
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
                },
                {
                    label: '允许匿名访问',
                    prop: 'allowAnonymousAccess',
                    slots: {
                        default({ row }) {
                            return <el-switch
                                v-model={row.allowAnonymousAccess}
                                size="large"
                                width="60px"
                                inline-prompt
                                active-text="允许"
                                inactive-text="禁止"
                            />
                        },
                    }
                }
            ] as STableColunm<PermissionRecord>[],
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
                id: "权限唯一ID",
                name: "权限名称",
                code: "权限代码",
                method: "权限方法",
                path: "权限路径",
                moduleName: "模块名称",
                remark: "权限备注",
                state: "权限状态",
                allowAnonymousAccess: "是否允许匿名访问",
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
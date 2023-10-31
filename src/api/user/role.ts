import { Key } from "@/types"
import { getObjectProperty, removeKeys } from "@/utils"
import { del, get, HttpResult, patch, post } from "@/utils/request"
import { SUFFIX, USER_ROLE } from "../common"


export interface RoleRecord {
    // id
    id: Key,
    // 名称
    name: string,
    // 权重
    weight: number,
    // 父 id
    parentId: number,
    // 状态
    state: boolean,
    // 最大分配用户数
    maxUsers: number,
    // 已分配用户数
    allocatedUsers: number,
    // 备注
    remark: string,
    createdAt: string,
    updatedAt: string,
}

export declare type TreeDataRecord = RoleRecord & { children: RoleRecord[] }

export declare type RoleFormRecord = Omit<RoleRecord, 'createdAt' | 'updatedAt'> & {menuIds: Key[]}

export declare type RoleFilterFormRecord = Partial<RoleFormRecord>

// 表单keys
export const RoleFormDataKeys = ['id', 'name', 'wieght', 'menuIds', 'state', 'remark', 'parentId', 'maxUsers', 'resourceIds']

/**
 * 添加数据
 * @param data 数据 
 * @returns 
 */
export const add = (data: Omit<RoleFormRecord, 'id'>): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(removeKeys(data, ['id']), RoleFormDataKeys) as any
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
    // return post(`${USER_ROLE}/add`, data)
}

/**
 * 更新数据
 * @param data 数据 
 * @returns 
 */
export const update = (data: Omit<RoleFormRecord, 'id'> & { id: Key }): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(data, RoleFormDataKeys) as any
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
    // return patch(`${USER_ROLE}/update/${data.id}`, data)
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
    //     return del(`${USER_ROLE}/batchDelete${SUFFIX}`, { idList: id })
    // }
    // return del(`${USER_ROLE}/delete/${id}${SUFFIX}`)
}

/**
 * 切换数据状态
 * @param id id 获取 id array 
 * @param state 状态
 * @returns 
 */
export const switchState = (id: Key[] | Key, state: boolean): Promise<HttpResult<void>> => {
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
    //     return patch(`${USER_ROLE}/batchSwtichState${SUFFIX}`, { idList: id })
    // }
    // return del(`${USER_ROLE}/switchState/${id}${SUFFIX}`)
}

/**
 * 查询列表
 */
export const queryList = (filter?: RoleFilterFormRecord): Promise<HttpResult<RoleRecord[]>> => {

    return post(`${USER_ROLE}/queryList${SUFFIX}`, filter)

}

/**
 * 查询编辑数据
 */
 export const queryEditData = (id: Key): Promise<HttpResult<RoleFormRecord>> => {
    return get(`${USER_ROLE}/edit${SUFFIX}`)
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
                    label: '权重',
                    prop: 'weight'
                },
                {
                    label: '最大分配用户数',
                    prop: 'maxUsers'
                },
                {
                    label: '已分配用户数',
                    prop: 'allocatedUsers'
                }
            ],
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
                id: "角色唯一ID",
                name: "角色名称",
                weight: "角色权重",
                parentId: "角色父id",
                remark: "角色备注",
                maxUsers: "角色最大分配用户数",
                allocatedUsers: "角色已分配用户数",
                state: "角色状态",
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

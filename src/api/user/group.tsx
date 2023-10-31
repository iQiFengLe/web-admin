import { STableColunm } from "@/components/STable"
import { Key } from "@/types"
import { getObjectProperty, removeKeys } from "@/utils"
import { del, get, HttpResult, patch, post } from "@/utils/request"
import { SUFFIX, USER_GROUP } from "../common"


export interface GroupRecord {
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
    // 备注
    remark: string,

    createdAt: string,
    updatedAt: string,
}

export declare type TreeDataRecord = GroupRecord & { children: GroupRecord[] }

export declare type GroupFormRecord = Omit<GroupRecord, 'createdAt' | 'updatedAt' | 'depth'> & { roleIds: number[] }

export declare type GroupFilterFormRecord = Partial<GroupFormRecord>

// 表单keys
export const GroupFormDataKeys = ['id', 'name', 'wieght', 'state', 'remark', 'parentId']

/**
 * 添加数据
 * @param data 数据 
 * @returns 
 */
export const add = (data: Omit<GroupFormRecord, 'id'>): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(removeKeys(data, ['id']), GroupFormDataKeys) as any
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
    // return post(`${USER_GROUP}/add`, data)
}

/**
 * 更新数据
 * @param data 数据 
 * @returns 
 */
export const update = (data: Partial<Omit<GroupFormRecord, 'id'>> & { id: Key }): Promise<HttpResult<void>> => {
    // 确保不提交任何多余字段
    data = getObjectProperty(data, GroupFormDataKeys) as any
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
    // return patch(`${USER_GROUP}/update/${data.id}`, data)
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
    //     return del(`${USER_GROUP}/batchDelete${SUFFIX}`, { idList: id })
    // }
    // return del(`${USER_GROUP}/delete/${id}${SUFFIX}`)
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
    //     return patch(`${USER_GROUP}/batchSwtichState${SUFFIX}`, { idList: id })
    // }
    // return del(`${USER_GROUP}/switchState/${id}${SUFFIX}`)
}

/**
 * 查询列表
 */
export const queryList = (filter?: GroupFilterFormRecord): Promise<HttpResult<GroupRecord[]>> => {

    return post(`${USER_GROUP}/queryList${SUFFIX}`, filter)

}

/**
 * 查询编辑数据
 */
 export const queryEditData = (id: Key): Promise<HttpResult<GroupFormRecord>> => {
    return get(`${USER_GROUP}/edit${SUFFIX}`)
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
            ] as STableColunm<GroupRecord>[],
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
                id: "用户组规则唯一ID",
                name: "用户组规则名称",
                state: "用户组状态",
                weight: "用户组权重",
                remark: "用户组备注",
                parentId: "父用户组ID",
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

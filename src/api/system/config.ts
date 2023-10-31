import { get, HttpResult } from "@/utils/request"
import { SUFFIX, SYSTEM_CONFIG } from "../common"

export interface SystemMailConfigRecord {
    // SMTP 服务器地址
    SMTPServer: string,
    // SMTP 端口号
    SMTPPort: number,
    // SMTP 用户名
    SMTPUser: string,
    // SMTP 密码 或授权码
    SMTPPwd: string,
    // SMTP 验证方式
    SMTPVerifyMode: 'SSL' | 'TLS',
    // SMTP 发件人邮箱
    SMTPSender: string
}

export interface SystemBasicConfigRecord {
    // 系统名称
    name: string,
    // 备案号
    recordNumber: string,
    // 系统状态 1正常 0 关闭 2 维护
    state: 1 | 0 | 2,
    // 状态描述
    stateDesc: string,
}

export interface SystemConfigRecord {
    basic: SystemBasicConfigRecord,
    mail: SystemMailConfigRecord
}

export declare type SystemConfigFormRecord = {
    [K in keyof SystemConfigRecord]?: Partial<SystemConfigRecord[K]>
}

/**
 * 查询全部配置
 * @returns 
 */
export const queryAllConfig = (): Promise<HttpResult<SystemConfigRecord>> => {
    return get(`${SYSTEM_CONFIG}/config${SUFFIX}`)
}

/**
 * 更新数据
 * @param data 数据 
 * @returns 
 */
export const update = (data: SystemConfigFormRecord): Promise<HttpResult<void>> => {
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
    // return patch(`${SYSTEM_CONFIG}/update/${data.id}`, data)
}





import axios, { Axios, AxiosRequestConfig, AxiosResponse } from "axios";
import log from "./log"
axios.defaults.baseURL = 'http://127.0.0.1:8001';
export function getAxios(): Axios {
    return axios;
}

export interface PageBody<E> {
    records?: Array<E>,
    total: number,
    pageSize: number,
    current: number
}

export interface PageParameter {
    current: number,
    pageSize: number
}

// 定义统一结果体
export interface ResponseBody<E> {

    code: string,
    msg: string,
    data: E,
    timestamp: number,
}

export class HttpResult<E> implements ResponseBody<E>{

    code: string = "ERR";
    msg: string = '系统异常';
    data!: E;
    timestamp: number = -1;
    response!: AxiosResponse;

    constructor(resp: AxiosResponse) {
        this.response = resp;
        if (this.response.status === 200) {
            this.code = resp.data.code;
            this.msg = resp.data.msg;
            this.data = resp.data.data;
            this.timestamp = resp.data.timestamp;
        }
    }

    getResponse(): AxiosResponse {
        return this.response;
    }

    isOK(): boolean {
        return this.response.status === 200 && this.code.toUpperCase() === "SUCCESS";
    }

    getMsg(state?: {}): string {
        if (!state)
            return this.msg;
        if (state.hasOwnProperty(this.code)) {
            // @ts-ignore
            return state[this.code]
        }
        return this.code.toUpperCase() === "SYSTEM_ERR" ? "系统错误，请联系管理员！" : this.msg;
    }

    getData(): E {
        return this.data;
    }
}

const cacheKeys = new Map<string, (msg?: string) => void>();

export const cancelRequest = (cacheKey: string) => {
    const c = cacheKeys.get(cacheKey);
    if (c) {
        try {
            c();
        } catch (_) { }
        cacheKeys.delete(cacheKey);
    }
}

export declare type RequestConfig = AxiosRequestConfig & { cacheKey?: string }

axios.interceptors.request.use((conf: RequestConfig) => {

    if (!conf.cancelToken && conf.cacheKey && conf.cacheKey.trim()) {

        const f = cacheKeys.get(conf.cacheKey)
        if (f) {
            f("_request_cancel_");
        }
        conf.cancelToken = new axios.CancelToken(c => {
            // @ts-ignore
            cacheKeys.set(conf.cacheKey, c)
        });
    }
    return conf
})
axios.interceptors.response.use((resp: AxiosResponse<any, any>) => {
    const conf: RequestConfig = resp.config
    if (conf.cacheKey && conf.cacheKey.trim()) cacheKeys.delete(conf.cacheKey)
    if (resp.status === 200)
        return Promise.resolve(resp)
    return Promise.reject(resp)
})

export function request<T = any>(conf: RequestConfig): Promise<HttpResult<T>> {

    return new Promise<HttpResult<T>>((resolve, reject) => {
        axios.request(conf).then(data => {
            resolve(new HttpResult<T>(data));
        }).catch(err => {
            if (typeof err == 'object' && err.message === "_request_cancel_") {
                log.debug("请求已被取消, cacheKey={}", conf.cacheKey)
            } else {
                reject(err)
            }
        })
    });
}


export function get<T = any>(url: string, data?: any, conf?: RequestConfig): Promise<HttpResult<T>> {

    if (!conf) {
        conf = {}
    }

    conf.data = data;
    conf.url = url;
    conf.method = "GET";

    return request(conf);

}


export function post<T = any>(url: string, data?: any, conf?: RequestConfig): Promise<HttpResult<T>> {

    if (!conf) {
        conf = {}
    }

    conf.data = data;
    conf.url = url;
    conf.method = "POST";

    return request(conf);

}

export function patch<T = any>(url: string, data?: any, conf?: RequestConfig): Promise<HttpResult<T>> {

    if (!conf) {
        conf = {}
    }

    conf.data = data;
    conf.url = url;
    conf.method = "PATCH";

    return request(conf);

}

export function put<T = any>(url: string, data?: any, conf?: RequestConfig): Promise<HttpResult<T>> {

    if (!conf) {
        conf = {}
    }

    conf.data = data;
    conf.url = url;
    conf.method = "PUT";

    return request(conf);

}

export function del<T = any>(url: string, data?: any, conf?: RequestConfig): Promise<HttpResult<T>> {

    if (!conf) {
        conf = {}
    }

    conf.data = data;
    conf.url = url;
    conf.method = "DELETE";

    return request(conf);

}
export function mapToQueryString(obj: object) {

    const query = [];
    for (let k in obj) {
        // @ts-ignore
        query.push(`${k}=${encodeURIComponent(obj[k])}`)
    }
    return query.join('&')
}
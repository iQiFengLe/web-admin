
export function parseQuery(url: string, decode: boolean = false): Record<string, string | null> {

    if (url.includes("?")) {
        url = url.split("?")[1];
    }

    let params = url.split("&");

    let result: Record<string, string | null> = {};

    params.forEach(item => {
        let tmp = item.split('=');
        if (tmp.length === 2)
            result[tmp[0]] = decode ? decodeURIComponent(tmp[1]) : tmp[1]
        else if (tmp.length === 1)
            result[tmp[0]] = null;
    });

    return result;

}

export function buildQuery(map: any, encode: boolean = true): string {

    let result = [];

    for (let k in map) {
        result.push(`${k}=${encode ? encodeURIComponent(map[k]) : map[k]}`)
    }
    return result.join('&')

}

export function removeKeys<T extends object>(collection?: T, keys?: object | Array<any>): T {

    let res: any = {}
    if (!collection) return res
    if (!keys) {
        // @ts-ignore
        return collection
    }

    let hasKeys = Array.isArray(keys) ? keys : Object.keys(keys)

    for (let k in collection) {
        if (!hasKeys.includes(k)) {
            // @ts-ignore
            res[k] = collection[k]
        }
    }
    return res;
}


export function toOrderBy<T extends object>(sort: T): T {

    let res: any = {};

    for (let k in sort) {
        let mode = (sort[k] + "").toLowerCase();
        if (mode.indexOf('desc') === 0) {
            res[k] = 'desc'
        } else if (mode.indexOf('asc') === 0) {
            res[k] = 'asc'
        }
    }
    return res;
}

/**
 * 对象深层次克隆
 * @param {*} obj 
 * @param ignoreKeys 忽略key
 * @param {*} ignore 
 */
export function cloneData<T = any>(obj: T, ignoreKeys: Array<any> = [], ignore: Array<any> = [],): T {


    if (typeof obj != 'object' || obj === null) return obj;

    let res: any;

    if (obj instanceof Array) {
        res = [];
        for (let i = 0; i < obj.length; i++) {
            if (ignoreKeys.includes(i)) continue;
            if (typeof obj[i] == 'object' && obj[i] !== null && !ignore.includes(obj[i])) {
                ignore.push(obj[i]);
                res[i] = cloneData(obj[i], ignoreKeys, ignore);
            } else {
                res[i] = obj[i];
            }
        }
    } else {
        res = {};
        for (let key in obj) {
            if (ignoreKeys.includes(key)) continue;
            // @ts-ignore
            if (obj.hasOwnProperty(key)) {

                if (typeof obj[key] == 'object' && obj[key] !== null && !ignore.includes(obj[key])) {
                    ignore.push(obj[key]);
                    res[key] = cloneData(obj[key], ignoreKeys, ignore);
                } else {
                    res[key] = obj[key];
                }
            }
        }
    }
    return res;
}


export interface ListToTreeOption {
    children?: string,
    parent?: string,
    sub?: string,
    // 下级为空的情况下需要存在该字段？ undefined=不需要 其它值则表示为空的值
    empty?: any,
    // 是否需要双向 如果需要填写字段名即可
    bilateral?: string,
}
export const defaultListToTreeOption: ListToTreeOption = {
    children: 'children',
    parent: 'id',
    sub: 'parentId',
    empty: [],
    bilateral: ''
}
/**
 * 列表转树形结构
 */
export function listToTree<T extends object>(data: Array<T>, opt?: ListToTreeOption): Array<T> {
    opt = opt ? Object.assign({}, defaultListToTreeOption, opt) : defaultListToTreeOption

    // 结果
    let res = [],
        // 零时存放
        tmp: any = {},
        // 分组
        group: any = {};

    // 索引比直接遍历快，所以这里进行转换
    for (let key = 0; key < data.length; key++) {
        let item: any = data[key];

        // 保存到零时数据集合中
        // @ts-ignore
        tmp[item[opt.parent]] = item;
        // 按照 opt.subKey 进行分组
        // 提前找出同一父级下的子集
        // 并且使用 opt.subKey 作为 key
        // @ts-ignore
        if (!group.hasOwnProperty(item[opt.sub])) {
            // @ts-ignore
            group[item[opt.sub]] = [item];
        } else {
            // @ts-ignore
            group[item[opt.sub]].push(item);
        }
    }

    for (let key in tmp) {
        let current = tmp[key];

        // 将关系一一对应
        // @ts-ignore
        if (group.hasOwnProperty(current[opt.parent])) {
            // @ts-ignore
            current[opt.children] = group[current[opt.parent]];

            if (opt.bilateral) {
                // @ts-ignore
                group[current[opt.parent]].forEach(item => {
                    // @ts-ignore
                    item[opt.bilateral] = current;
                })
            }

            // // 验证循环树
            // // @ts-ignore
            // group[current[opt.parent]].forEach(val => {
            //     // @ts-ignore
            //     if (val[opt.parent] === current[opt.sub]) {
            //         // @ts-ignore
            //         console.log("循环树, ", `下级 ${val.name}: ${val[opt.parent]} `, `上级 ${current.name}: ${current[opt.sub]}`)
            //     }
            // })

        } else {
            if (opt.empty !== undefined) {
                // @ts-ignore
                current[opt.children] = opt.empty;
            }

        }
        // 为根元素时加入结果
        // @ts-ignore
        if (!tmp.hasOwnProperty(current[opt.sub])) {
            res.push(current);
            if (opt.bilateral) {
                // @ts-ignore
                current[opt.bilateral] = null
            }
        }
    }
    return res;
}


export interface EachTreeItem<T> {
    value: T,
    index: number,
    indexPath: number[],
    layer: number,
    data: Array<T>,
    parent: T | null
}
export interface EachTreeOption<T> {
    layer: number,
    parent: T | null,
    indexPath: number[]
}
/**
 * 遍历树
 * @param data 数据
 * @param cb  回调函数
 * @param cName 下级key
 * @param option 选项
 */
export function forEachTree<T extends object = Record<string, any>>(
    data: Array<T>,
    cb: (item: EachTreeItem<T>) => false | void,
    cName: string = 'children',
    option?: Partial<EachTreeOption<T>>,
    ignoreArr: any[] = []
) {

    for (let i = 0; i < data.length; i++) {
        let item: any = data[i];
        if (ignoreArr.includes(item)) continue

        const indexPath = [...(option?.indexPath || []), i]
        const layer = option?.layer || 0
        if (cb({
            value: item,
            index: i,
            indexPath: indexPath,
            layer: layer,
            data: data,
            parent: option?.parent || null
        }) === false) {
            break;
        }
        ignoreArr.push(item)
        if (item[cName] && item[cName].length) {
            forEachTree(item[cName], cb, cName, {
                layer: layer,
                parent: item,
                indexPath: indexPath,
            }, ignoreArr)
        }
    }
}

/**
 * 获取树型数据中某列的数据集合
 * @param data 树型数据
 * @param col 列
 * @param cName 下级 key
 * @returns 
 */
export function getTreeColumn(data: Record<string, any>[], col: string, cName: string = 'children'): any[] {

    const res: any[] = []

    forEachTree(data, ({ value }) => {
        res.push(value[col])
    }, cName)
    return res;
}

/**
 * 过滤树
 * @param data 数据 
 * @param cb 回调
 * @param cName 下级
 * @returns 
 */
export function filterTree<T extends object = Record<string, any>>(data: T[], cb: (item: T) => boolean, cName: string = 'children') {

    return data.filter((v: any) => {
        if (!cb(v)) return false
        if (v[cName] && v[cName].length > 0) {
            v[cName] = filterTree(v[cName], cb, cName)
        }
        return true
    })
}
/**
 * Date 转 字符串日期
 * @param date 日期
 * @param format 格式
 * @return 日期
 */
export function formatDate(date: Date | null | string, format = 'Y-m-d H:i:s'): string {

    date = date ? date : new Date();
    if (typeof date == 'string') {
        date = new Date(date.replace(/-/g, '/'));
    }

    let year = date.getFullYear() + '',
        month = (date.getMonth() + 1) + '',
        day = date.getDate() + '',
        hours = date.getHours() + '',
        minutes = date.getMinutes() + '',
        seconds = date.getSeconds() + '';

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (seconds.length < 2) seconds = '0' + seconds;

    format = format.replace(/Y/i, year);
    format = format.replace(/m/i, month);
    format = format.replace(/d/i, day);
    format = format.replace(/H/i, hours);
    format = format.replace(/i/i, minutes);
    format = format.replace(/s/i, seconds);
    format = format.replace(/(ms)/i, date.getMilliseconds().toString());

    return format;
}

/**
 * 获取文件url
 * @param file 文件 
 */
export function getFileUrl(file: File | Array<File>): Array<string> {
    let url = [],
        getUrlObj = null;
    // @ts-ignore
    if (window.createObjcectURL) {
        // @ts-ignore
        getUrlObj = window.createOjcectURL;
    } else if (window.URL) {
        getUrlObj = window.URL.createObjectURL;
    } else if (window.webkitURL) {
        getUrlObj = window.webkitURL.createObjectURL;
    }
    if (file instanceof Array) {
        for (let i = 0; i < file.length; i++) {
            url.push(getUrlObj(file[i]));
        }
    } else {
        url = getUrlObj(file);
    }
    return url;
}
/**
 * 解析文件类型
 * @param type 类型
 * @param symbol  为空时替代符号 
 */
function _parseFileType(type: string, symbol: string = '*', filename: string = ''): Array<string> {
    type = type.trim().toLocaleLowerCase();
    if (!type) {
        // 检测是否存在文件名后缀
        let idx = filename.lastIndexOf('.');
        if (idx > 1) {
            return [symbol, filename.substring(idx + 1)]
        }
        return [symbol, symbol]
    }
    let idx = type.indexOf('/');

    if (idx > 0) {
        return idx === type.length - 1 ? [type.substring(0, type.length - 1), symbol] : type.split('/');
    }
    return [symbol, type];

}

export interface CheckFileWhere {
    mimeType: string,
    min?: number,
    max?: number,
}

/**
 * 效验文件
 * @param file 文件
 * @param wheres 条件列表
 * @returns 返回 'pass' 通过 | 'large' 文件太大 | 'small' 文件太小 | 'type' 类型不允许
 */
export function checkFile(file: File, wheres: CheckFileWhere[]): 'pass' | 'large' | 'small' | 'type' {
    const [fileMainType, fileSubType] = _parseFileType(file.type, '', file.name);

    // 寻找匹配条件
    const where = wheres.find(where => {
        let [mainType, subType] = _parseFileType(where.mimeType, '*');

        return (mainType === "*" || mainType === fileMainType) && (subType === "*" && subType === fileSubType);
    });
    if (!where) return 'type';
    if (where.min !== undefined && where.min > file.size) return 'small';
    if (where.max !== undefined && where.max < file.size) return 'large';

    return 'pass';
}

export function varType(obj: any) {


    let type = Object.prototype.toString.call(obj).toLowerCase().split(' ')[1];
    type = type.substring(0, type.length - 1);
    if (type === "number" && isNaN(obj)) {
        return "nan";
    }
    return type
}

/**
 * 是否可迭代
 * @param obj 对象
 * @returns true false
 */
export function isIterator(obj: any): boolean {
    if (typeof obj == 'string') return false;
    return obj && (Array.isArray(obj) || obj[Symbol.iterator] instanceof Function || varType(obj) === 'object')
}

/**
 * 迭代查找
 * @param obj 对象 
 * @param key 查找索引
 */
export function iteratorFind(obj: any, key: string | number): any | undefined {

    if (!isIterator(obj)) {
        return undefined;
    }

    if (key.toString().indexOf('.') === -1) {
        if (obj instanceof Array) {
            // 允许通配符
            if (key === '*') {
                return obj.length ? obj[0] : undefined;
            }
            key = Number(key);
            if (isNaN(key)) return undefined;
            return obj.length > key ? undefined : obj[key];
        } else {
            if (key === '*') {
                let objKeys = Object.keys(obj)[0];
                return obj.hasOwnProperty(objKeys) ? obj[objKeys] : undefined;
            }
            return obj.hasOwnProperty(key) ? obj[key] : undefined;
        }
    }

    let keys = key.toString().split('.');
    let val = obj;
    while (keys.length) {
        // @ts-ignore
        key = keys.shift();
        val = iteratorFind(val, key);
        if (val === null || !keys.length) {
            return val;
        }
    }
    return null;
}

/**
 * 生成范围随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机值
 */
export function randId(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * 生成随机字符串
 * @param len 长度
 * @param extStr 扩展字符串
 * @returns 随机值
 */
export function randString(len: number, extStr?: string): string {

    const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" + (extStr !== undefined ? extStr : '');

    const arr: string[] = []
    for (let i = 0; i < len; i++) {
        arr.push(base.charAt(randId(0, base.length - 1)))
    }
    return arr.join()
}

/**
 * 解析样式字符串
 * @param style css字符串
 * @returns Record<string, string | number>
 */
export function parseStyle(style?: string): Record<string, string | number> {
    let result: Record<string, string | number> = {}

    style?.trim().split(';').forEach(item => {
        let tmp = item.split(':');
        if (tmp.length === 2) {
            let val = tmp[1].trim();
            result[tmp[0].trim()] = isNaN(Number(val)) ? Number(val) : val;
        }
    })
    return result
}
/**
 * 解析样式字符串
 * @param style css字符串
 * @returns Record<string, string | number>
 */
export function styleMapToCssStyle(style?: Record<string, string | number>): string {

    if (!style) return '';
    let result: string[] = []
    for (let k in style) {
        if (k && (typeof style[k] == 'string' && style[k].toString().trim()))
            result.push(`${k}: ${style[k]}`)
    }
    return result.join(';')
}

export function toArray<T = any>(data: Iterator<T>): T[] {
    let v = undefined
    let res: T[] = [];
    do {
        let t = data.next()
        if (!t.done) {
            v = t.value
            res.push(t.value)
        } else {
            v = undefined
        }
    } while (v !== undefined)
    return res;
}

export function equal(left: any, right: any): boolean {

    const type = varType(left);
    if (type !== varType(right)) return false;

    switch (type) {

        case "undefined":
        case "null":
        case "number":
        case "string":
        case "function":
        case "boolean":
            return left === right;
        case "nan":
            return true;
        case "symbol":
            return left.description === right.description;
        case "array":
        case "object":
        default:
            return left.toString() === right.toString();

    }
}

export function arrayEqual(arr1: any[], arr2?: any[]): boolean {

    if (arr2 === undefined || arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (!equal(arr1[i], arr2[i])) return false;
    }
    return true;
}

/**
 * 获取对象属性集合
 * @param obj 对象 
 * @param keys 属性名集合
 * @returns 集合
 */
export function getObjectProperty(obj: {} | object, keys: string[]): Record<string, any> {


    let data: any = {}

    for (let k in obj) {
        if (keys.includes(k)) {
            // @ts-ignore
            data[k] = obj[k]
        }
    }
    return data;
}

/**
 * 数字精度
 * @param num 数字 
 * @param precision 需要精度 
 * @returns 
 */
export function numberPrecision(num: number, precision: number = 2): number {

    if (precision <= 0 || num === 0)
        return Math.floor(num)
    if (precision === 1)
        return Math.floor(num * 100) / 100;

    let pow = Math.pow(10, precision - 1)

    return Math.floor(num * pow) / pow
}

export function arrayDiff(arr1: any[], arr2: any[]): any[] {
    return arr1.filter((v) => !arr2.includes(v))
}

export function arrayIntersect(arr1: any[], arr2: any[]): any[] {
    return arr1.filter((v) => arr2.includes(v))
}

export function forEach<T = any>(data: T, cb: (key: number | string, value: any, data: T) => false | void) {

    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (cb(i, data[i], data) === false)
                break;
        }
    } else {
        for (let k in data) {
            if (cb(k, data[k], data) === false)
                break;
        }
    }

}

type CompareKeyPath = (string | number)[]
type CompareObjectType = object | Record<string | number, any>
interface CompareOption {
    result?: (isEq: boolean, keyPath: CompareKeyPath, left: any, right: any) => void,
    remove?: (keyPath: CompareKeyPath, value: any) => void,
    add?: (keyPath: CompareKeyPath, value: any) => void,
    end?: () => void
}


export class DataCompare {

    static defaultOption: CompareOption = {

    }


    static getOption(option?: CompareOption): CompareOption {
        return Object.assign({}, this.defaultOption, option)
    }


    static start(left: any, right: any, option?: CompareOption, keyPath?: CompareKeyPath): boolean {
        let res = this.compare(left, right, option, keyPath);
        option?.end && option.end();
        return res;
    }

    static compare(left: any, right: any, option?: CompareOption, keyPath?: CompareKeyPath): boolean {

        option = this.getOption(option)
        keyPath = keyPath || [];

        let type;
        let isEq = false;
        if (left === right) {
            isEq = true;
        } else if ((type = varType(left)) === varType(right)) {
            switch (type) {
                case "undefined":
                case "null":
                case "number":
                case "string":
                case "function":
                case "boolean":
                    isEq = left === right;
                    break;
                case "nan":
                    isEq = true;
                    break;
                case "symbol":
                    isEq = left.description === right.description;
                    break;
                case "array":
                    isEq = this.arrayCompare(left, right, option, [...keyPath]);
                    break;
                case "object":
                    isEq = this.objectCompare(left, right, option, [...keyPath]);
                    break;
            }
        }
        option.result && option.result(isEq, [...keyPath], left, right)
        return isEq;
    }


    static arrayCompare(left: any[], right: any[], option?: CompareOption, keyPath?: CompareKeyPath): boolean {

        option = this.getOption(option)
        keyPath = keyPath || [];

        let i = 0;

        let isEq = true;

        while (true) {
            if (left.length <= i && right.length <= i) break;

            const paths = [...keyPath, i];

            if (left.length <= i) {
                isEq = false;
                // 在左侧找不到, 则为新增
                option.add && option.add(paths, right[i])
            } else if (right.length <= i) {
                isEq = false;
                // 在右侧找不到, 则为删除
                option.remove && option.remove(paths, left[i])
            } else {
                let res = this.compare(left[i], right[i], option, paths)
                if (isEq) isEq = res;
            }
            i++;
        }
        return isEq;
    }

    static objectCompare(left: CompareObjectType, right: CompareObjectType, option?: CompareOption, keyPath?: CompareKeyPath): boolean {

        let isEq = true;
        const leftKeys = Object.keys(left),
            rightKeys = Object.keys(right);

        option = this.getOption(option);
        keyPath = keyPath || [];

        forEach(arrayDiff(leftKeys, rightKeys), (_, key) => {
            isEq = false;
            // 移除的key
            // @ts-ignore
            option?.remove && option.remove([...(keyPath as CompareKeyPath), key], left[key]);
        })

        forEach(arrayDiff(rightKeys, leftKeys), (_, key) => {
            isEq = false;
            // 新增的key
            // @ts-ignore
            option?.add && option.add([...(keyPath as CompareKeyPath), key], right[key]);
        })

        const compareKeys = arrayIntersect(leftKeys, rightKeys);
        while (compareKeys.length > 0) {
            const key = compareKeys.pop();
            // @ts-ignore
            let res = this.compare(left[key], right[key], option, [...keyPath, key])
            if (isEq) isEq = res;
        }

        return isEq;
    }

}

/**
 * 最大数字
 * @param arr 数组
 * @returns 
 */
export const maxNumber = (arr: number[]) => {
    return Math.max(...arr)
}

/**
 * 最小数字
 * @param arr 数组
 * @returns 
 */
export const minNumber = (arr: number[]) => {
    return Math.min(...arr)
}


/**
 * 获取前缀属性值
 * @param record 记录
 * @param prefix 前缀
 * @returns 
 */
export const getPrefixAttribute = (record: Record<string, any>, prefix: string) => {

    const res: Record<string, any> = {}

    for (let k in record) {
        if (k.toString().startsWith(prefix)) {
            res[k] = record[k]
        }
    }

    return res;
}
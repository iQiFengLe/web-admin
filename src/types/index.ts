// Key 类型
export declare type Key = number | string
// 树型数据类型
export declare type TreeDataRecord<T> = T & { children: T[] }
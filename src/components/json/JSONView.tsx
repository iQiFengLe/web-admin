import { defineComponent, ref, VNode, watch } from "vue";
import "./style.scss"


const types = ['boolean', 'string', 'number', 'bigint', 'undefined'];

function isObject(v: any) {
    if (v === null || types.includes(typeof v))
        return false;

    if (Array.isArray(v)) return false;

    return true;
}

function isBasicType(v: any) {

    return v instanceof Function || !(isObject(v) || Array.isArray(v))
}

function getSymbol(v: any, start: boolean) {
    if (start)
        return isObject(v) ? "{" : '['
    return isObject(v) ? "}" : ']'
}

interface MapNodeOption {
    keyLenSort?: 'desc' | 'asc',
}

function mapNode(data: any,
    cb: (item: any, key: number | string, isLast: boolean, data: any) => VNode,
    opt?: MapNodeOption
): VNode[] {
    opt = opt || { keyLenSort: 'asc' }
    0
    let nodes: VNode[] = [];
    if (Array.isArray(data)) {
        data.forEach((item, key) => {
            nodes.push(cb(item, key, key === data.length - 1, data))
        })
    } else {
        let keys = Object.keys(data).sort((v1, v2) => {
            if (v1.length === v2.length) return 0;
            if (opt?.keyLenSort === 'asc') {
                return v1.length < v2.length ? -1 : 1
            }
            return v1.length < v2.length ? -1 : 1
        });

        keys.forEach((key, i) => {
            nodes.push(cb(data[key], key, i === keys.length - 1, data))
        })
    }
    return nodes;
}

interface CommentItem {
    comment: string,
    chlidren?: Record<any, string | CommentItem>
}

export declare type CommentType = Record<any, CommentItem | string>

interface JsonItemProps {
    data: any,
    // 数组情况下是否显示数组下标 默认不显示
    arrayKey?: boolean,
    dept?: number,
    // 将key转为字符串, 非array元素生效
    keyString?: boolean,
    // 注释
    fieldComment?: CommentType,
    // 注释代替key
    commentReplaceKey?: boolean,
}

export const JSONItem = defineComponent(
    (props: JsonItemProps) => {

        const { data, fieldComment, ...rest } = props
        const dept = props.dept === undefined ? 0 : props.dept + 1
        rest.dept = dept
        const jsonData = ref(data)
        const comment = ref(fieldComment || {})

        watch(() => props.data, (curr) => {
            jsonData.value = curr
        })
        watch(() => props.fieldComment, (curr) => {
            comment.value = curr || {}
        })

        const getCommentValue = (key: string | number) => {
            const item = comment.value[key]
            if (props.commentReplaceKey || item === undefined)
                return undefined
            const str = typeof item == 'string' ? item : item.comment
            return <span class="json-comment"> {"// " + str} </span>
        }

        const getCommentChildren = (key: string | number): CommentType | undefined => {
            const item = comment.value[key]
            if (item === undefined)
                return undefined
            if (typeof item == 'string')
                return undefined
            return item.chlidren
        }

        return () => {
            const data = jsonData.value

            if (typeof data == 'string') {
                return <span key="json-value" class="json-item-value string">"{data}"</span>
            } else if (data instanceof Number || typeof data == 'number') {
                // @ts-ignore
                if (isNaN(data))
                    return <span key="json-value" class="json-item-value NaN">NaN</span>
                else
                    return <span key="json-value" class="json-item-value number">{data}</span>

            } else if (data === null) {
                return <span key="json-value" class="json-item-value null">null</span>
            } else if (data === undefined) {
                return <span key="json-value" class="json-item-value undefined">undefined</span>
            } else if (data instanceof Boolean || typeof data == 'boolean') {
                return <span key="json-value" class="json-item-value boolean">{data ? 'true' : 'false'}</span>
            } else if (data instanceof Function) {
                return <span key="json-value" class="json-item-value function">{data.toString()}</span>
            }
            else {
                const nodes = mapNode(data, (item, key, isLast) => {
                    let basic = isBasicType(item)

                    let name = props.commentReplaceKey && comment.value[key] ? comment.value[key] : key;

                    let keys = [
                        rest.keyString ? <span class="json-item-key" key="0">"{name}"</span>
                            :
                            <span class="json-item-key" key="0">{name}</span>,
                        <span class="json-item-separate" key="1">:</span>
                    ];
                    if (Array.isArray(data) && !rest.arrayKey) {
                        keys = []
                    }

                    if (basic) {
                        return <div class="json-item" key={key}>
                            {keys}
                            <JSONItem key="2" data={item} fieldComment={getCommentChildren(key)} {...rest} />
                            {isLast ? undefined : <span class="json-item-end-symbol">,</span>}
                            {getCommentValue(key)}
                        </div>
                    } else {
                        return <div class="json-item complex" key={key}>
                            <div class="json-item-head" key="0">
                                {keys}
                                <span key="2" class="json-item-symbol">{getSymbol(item, true)}</span>
                                {getCommentValue(key)}
                            </div>
                            <JSONItem key="1" data={item} fieldComment={getCommentChildren(key)} {...rest} />
                            <div class="json-item-end" key="2">
                                <span class="json-item-symbol">{getSymbol(item, false)}</span>
                                {isLast ? undefined : <span class="json-item-end-symbol">,</span>}
                            </div>
                        </div>
                    }

                })

                if (dept === 0) {
                    return <div class="json-object">
                        <span key="json-start" class="json-item-symbol">{getSymbol(data, true)}</span>
                        {nodes}
                        <span key="json-end" class="json-item-symbol">{getSymbol(data, false)}</span>
                    </div>
                } else {
                    return nodes
                }

                // return <div class="json-object">
                //     {dept === 0 ? <span key="json-start" class="json-item-symbol">{getSymbol(data, true)}</span> : undefined}
                //     {nodes}
                //     {dept === 0 ? <span key="json-end" class="json-item-symbol">{getSymbol(data, false)}</span> : undefined}
                // </div>
            }
        }
    },
    {
        name: "JSONItem",
        props: ['data', 'arrayKey', 'keyString', 'fieldComment', 'dept', 'commentReplaceKey']
    }
)


interface JSONViewProps extends JsonItemProps {
    data: any,
    theme?: "light" | "dark",
    emptyText?: string,
}
const JSONView = defineComponent(
    (props: JSONViewProps) => {

        const jsonData = ref<any>(props.data)

        watch(() => props.data, (curr) => {
            jsonData.value = curr
        })

        return () => {
            let { data, theme, ...rest } = props
            theme = props.theme || "dark"
            const className = theme ? "json-view json-view-theme-" + theme : 'json-view';
            if (!jsonData.value) {
                return <div class={className}> {props.emptyText ? props.emptyText : '暂无数据！'} </div>
            }
            return <div class={className}>
                <JSONItem data={jsonData.value} {...rest} />
            </div>
        }
    },
    {
        name: "JSONView",
        props: ['theme', 'emptyText', 'data', 'arrayKey', 'keyString', 'fieldComment', 'dept', 'commentReplaceKey']
    }
)

export default JSONView


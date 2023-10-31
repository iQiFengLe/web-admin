
import { forEachTree } from "@/utils"
import { ElTree } from "element-plus"
import { TreeComponentProps } from "element-plus/es/components/tree/src/tree.type"
import Node from "element-plus/lib/components/tree/src/model/node"
import { defineComponent, onMounted, Ref, ref, watch } from "vue"
import { Key } from "../common"

export declare type DataType = Record<string, any> | any

export declare type NodeType<T = DataType> = Node & { data: T }

export interface TreeOnCheckInfoType<T = DataType> {
    checkedNodes: NodeType<T>[],
    checkedKeys: Key[],
    halfCheckedNodes: NodeType<T>[],
    halfCheckedKeys: Key[]
}

export interface TreeProps<T = DataType> {
    tree?: Partial<Omit<TreeComponentProps,
        'defaultExpandedKeys' | 'defaultCheckedKeys' | 'nodeKey' | 'data' | 'showCheckbox' | 'emptyText'
        | 'expandOnClickNode' | 'checkStrictly'>>
    data: T[],
    // 支持 v-model
    selectedKeys?: Key[],
    expandKeys?: Key[],
    pk: string,
    showCheckbox?: boolean,
    emptyText?: string,
    expandOnClickNode?: boolean,
    checkStrictly?: boolean,

    onCheck?: (rowData: DataType, info: TreeOnCheckInfoType<any | T>) => void
}

export interface TreeInstance {
    getInstance: () => Ref<undefined | InstanceType<typeof ElTree>>,
}

const Tree = defineComponent(
    (props: TreeProps, { slots, attrs, emit, expose }) => {


        const selectedKeys = ref<any[]>(props.selectedKeys || [])

        const tree = ref<InstanceType<typeof ElTree>>()

        const eventMethods = {
            onCheck(
                current: DataType,
                info: TreeOnCheckInfoType
            ) {
                selectedKeys.value = info.checkedNodes.map((v: any) => v.data[props.pk])
                emit('update:selectedKeys', selectedKeys.value)
                // @ts-ignore
                attrs['onCheck']?.(current, info)
            },
        }

        watch(() => props.selectedKeys, (curr: any) => {
            selectedKeys.value = curr ? curr : []
        })

        const setExpand = (keys: any[]) => {
            forEachTree(props.data, ({ value }) => {
                const pkVal = value[props.pk]
                const node = tree.value?.getNode(pkVal)
                if (keys.includes(pkVal)) {
                    node?.expand(undefined, props.checkStrictly ? false : true)
                } else if (node) {
                    node.expanded = false
                }
            }, props.tree?.props?.children || 'children')
        }

        watch(() => props.expandKeys, (curr: any) => {
            setExpand((curr || []) as any[])
        })

        onMounted(() => {
            if (props.expandKeys && props.expandKeys.length) {
                setExpand(props.expandKeys)
            }
        })

        expose({
            getInstance(): Ref<undefined | InstanceType<typeof ElTree>> {
                return tree
            }
        })

        return () => {
            return <el-tree
                ref={(comp: any) => {
                    if (comp) tree.value = comp
                }}
                {...props.tree}
                showCheckbox={props.showCheckbox}
                check-strictly={props.checkStrictly}
                emptyText={props.emptyText}
                expandOnClickNode={props.expandOnClickNode}
                data={props.data}
                nodeKey={props.pk}
                default-checked-keys={selectedKeys.value}
                {...attrs}
                onCheck={eventMethods.onCheck}
                v-slots={slots}
            />
        }
    },
    {
        emits: ['update:selectedKeys'],
        props: ['selectedKeys', 'pk', 'tree', 'data', 'expandKeys', 'showCheckbox', 'emptyText', 'expandOnClickNode', 'checkStrictly']

    }
)

export default Tree



const obj = {
    id: 0,
    name: '',
    remark: '',
    state: true,
    parentId: 0,
    weight: 1,
    maxUsers: 111,
    allocatedUsers: 1,
    createdAt: '2099-12-31 23:59:59',
    updatedAt: '2099-12-31 23:59:59',
}


const names = [
    {
        name: '混元境',
        list: [
            '混元至道境',
            '混元大道境',
            '混元天道境',
            '混元道境',
            '混元无极金仙境',
            '混元太极金仙境',
            '混元太上金仙境',
            '混元大罗金仙境',
            '混元金仙境'
        ],
    },
    {
        name: '仙境',
        list: ['大罗金仙', '太乙金仙', '金仙', '至仙', '玄仙', '真仙', '天仙', '地仙', '人仙'],
    },
    {
        name: '凡境',
        list: ['蜕凡境', '渡劫境', '合道境', '元神境', '元婴境', '元丹境', '筑基境', '先天境', '后天境'],
    },
]

const res: any[] = []
var i = 0;
names.forEach(item => {
    i++
    res.push(Object.assign({}, obj, { id: i, name: item.name }))
    const pid = i

    item.list.forEach(value => {
        i++
        res.push(Object.assign({}, obj, { id: i, name: value, parentId: pid }))
    })
})

// console.log(JSON.stringify(res))

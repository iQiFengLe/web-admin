import { cloneData, filterTree, forEachTree, getPrefixAttribute, removeKeys } from "@/utils"
import { Menu } from "@element-plus/icons-vue"
import { FormProps, FormInstance, PaginationProps, ElPagination, ElForm, ElFormItem, ElTable, ElButton, ElDropdown, ElTooltip, ElTableColumn, ElTree, ElMessage } from "element-plus"
import { TableProps as ElTableProps } from "element-plus/es/components/table/src/table/defaults"
import { TableColumnCtx } from "element-plus/lib/components/table/src/table-column/defaults"
import { defineComponent, inject, onMounted, onUnmounted, provide, Ref, ref, watch } from "vue"
import { DragSwapCore } from "../drag/swap"
import { Refresh } from "../icon/shapes/FontAwesome"
import "./style.scss"

interface PaginationRecord {
    pageSize: number,
    current: number,
    total: number,
}
interface RequestReturn<R = Record<string, any>> {
    isOK: boolean
    data: R[],
    total?: number,
}

export declare type TableRow = Record<string, any>

export declare type STablePageParameter = Omit<PaginationRecord, 'total'>

export declare type DataResultType = Omit<RequestReturn, 'isOK'>

// 提供注入key
export const InjectKeys = {
    // 状态数据
    state: "stable-state",
    // 元素 refs 
    refs: "stable-refs",
}

export declare type STableColunm<T = Record<string, any>> = Partial<TableColumnCtx<T>> & {
    checkboxDisabled?: boolean,
    isHide?: boolean,
    displaycolumn?: boolean,
    slots?: {
        default?: (parameter: { row: T, column: STableColunm<T>, $index: any }) => any | JSX.Element,
        header?: (parameter: { column: STableColunm<T>, $index: any }) => any | JSX.Element,
    }
}



export interface STableInstance {
    // 刷新数据
    refreshData: (whereData?: Record<string, any>) => void,
    // 设置选中
    setSelectedKeys: (selectedKeys: any[]) => void,
    // 展开指定项，不传递参数则展开所有
    expand: (keys?: any[]) => void,
    // 收缩指定项，不传递参数则收缩所有
    shrink: (keys?: any[]) => void,
}
/**
 * 表格表单
 */
interface STableFormProps {
    form?: FormProps,
    data?: Record<string, any>,
    onSubmit: (data: Record<string, any>) => void
}
interface STableFormInstance {
    resetForm: () => void,
    setFormData: (data: Record<string, any>) => void,
    getFormData: () => Record<string, any>
}
const STableForm = defineComponent<STableFormProps>(
    (props: STableFormProps, { slots, expose }) => {

        const formData = ref<Record<string, any>>(props.data || {})
        const formRef = ref<FormInstance>();
        const setFormRef = (el: any) => {
            if (el) {
                formRef.value = el;
            }
        }
        const onFormSubmit = () => {
            formRef.value?.validate().then((isOK: boolean) => {
                if (isOK) {
                    props.onSubmit(formData.value);
                }
            })
        }

        watch(() => props.data, (v: Record<string, any>) => {
            formData.value = v;
        })

        const methods: STableFormInstance = {
            resetForm() {
                formRef.value?.resetFields()
            },
            setFormData(data: Record<string, any>) {
                formData.value = data;
            },
            getFormData() {
                return formData.value;

            }
        }
        expose(methods)

        return () => {
            return <ElForm {...props.form} v-model:model={formData.value} ref={setFormRef}>
                {slots.default?.call(this)}
                <ElFormItem>
                    <ElButton type="primary" onClick={onFormSubmit}>提交</ElButton>
                    <ElButton onClick={methods.resetForm}>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }

    },
    {
        name: "STableForm",
        props: ['form', 'onSubmit']
    }
)

/**
 * 分页组件
 */
const STablePagination = defineComponent((props: {
    pagination?: PaginationProps,
    total: number,
    current: number,
    pageSize: number,
    onPageChange: (v: STablePageParameter) => void,
}, { slots }) => {


    const info = ref({
        total: props.total,
        current: props.current,
        pageSize: props.pageSize,
    })

    watch(() => info.value, (val) => {
        props.onPageChange(val)
    })


    return () => {
        return <ElPagination
            background={true}
            layout="sizes, prev, pager, next, jumper"
            {...props.pagination}
            v-model:currentPage={info.value.current}
            v-model:pageSize={info.value.pageSize}
            total={info.value.total}
        >{slots.default?.call(this)}</ElPagination>
    }
},
    {
        name: "STableForm",
        props: ['pagination', 'total', 'current', 'pageSize'],
    }
)

// 表格列
const STableColumns = defineComponent(
    (props: { cols?: STableColunm[] }) => {
        return () => {
            return props.cols?.filter(col => {
                return col.displaycolumn || col.displaycolumn === undefined
            }).map(col => {

                return <ElTableColumn {...col} v-slots={col.slots}>
                    {col.columns?.length ? <STableColumns cols={col.columns} /> : undefined}
                </ElTableColumn>
            })
        }
    },
    {
        name: "STableColumns",
        props: ["cols"]
    }
)

// 表格列控制器
const STableColunmController = defineComponent(
    (props: { cols?: STableColunm[], selectedKeys?: any[] }, { emit }) => {

        // 是否可用
        const isAvailable = (item: STableColunm): boolean => {
            return item.type !== 'selection' && item.type !== 'index' && item.isHide !== true
        }

        // 获取列信息
        const getColsInfo = (cols: STableColunm[]) => {
            cols = cloneData(cols)
            const selectedKeys: any = []
            let i = 0
            const treeData = filterTree(cols, (value) => {
                if (value.id === undefined)
                    value.id = `STableColId-${i++}`
                selectedKeys.push(value.id)
                return isAvailable(value)
            }, 'columns')
            return { cols, selectedKeys, treeData };
        }

        const state = ref(getColsInfo(props.cols || []))

        const onCurrentChange = (_: STableColunm, info: { checkedKeys: string[], checkedNodes: STableColunm[] }) => {
            forEachTree(state.value.treeData, ({ value }) => {
                value.displaycolumn = info.checkedKeys.includes(value.id as any)
            }, 'columns')
            emit('update:cols', state.value.cols)
            emit('update:selectedKeys', info.checkedKeys)
            state.value.selectedKeys = info.checkedKeys
        }
        watch(() => props.cols, (curr) => {
            let tmp = getColsInfo(curr || [])
            if (state.value.cols.length > 0) {
                tmp.selectedKeys = state.value.selectedKeys
            }
            state.value = tmp
        })

        const slots = {
            dragdown: () => {
                return <ElTree
                    class="s-table-col-controller-tree"
                    data={state.value.treeData}
                    checkOnClickNode={true}
                    defaultCheckedKeys={state.value.selectedKeys}
                    showCheckbox
                    nodeKey="id"
                    onCheck={onCurrentChange}
                    props={{ label: 'label', children: 'columns', }}
                />
            }
        }

        return () => {
            return <div class="s-table-col-controller">
                <ElDropdown trigger="click" v-slots={slots}>
                    <ElButton><m-icon><Menu /></m-icon></ElButton>
                </ElDropdown>
            </div>
        }
    },
    {
        name: "STableColunmController",
        props: ["cols", 'selectedKeys']
    }
)

interface TrDragProps<T = any> {
    // 拖拽开始
    onDragStart?: () => void,
    // 拖拽结束
    onDragEnd?: () => void,
    // 拖拽完成
    dragComplete?: (val: { oldData: T, newData: T }) => Promise<boolean>,
}

const TrDrag = defineComponent(
    (props: TrDragProps, { emit }) => {

        const tableState = inject(`${InjectKeys.state}`) as Ref<STableStateData>
        const tableRefs = inject(`${InjectKeys.refs}`) as Ref<STableRefs>

        const swapData = (val: { oldData: any, newData: any }) => {
            const { oldData, newData } = val
            const pk = tableState.value.pk
            let arr: TableRow[] = []
            const data = tableState.value.dataSource.data
            forEachTree(data, ({ value, parent }) => {
                if (value[pk] === oldData[pk]) {
                    arr = parent ? parent[tableState.value.childrenName] : data
                    return false
                }
            }, tableState.value.childrenName)

            // 交换两个值
            const oldIndex = arr.findIndex(v => v[pk] === oldData[pk])
            const newIndex = arr.findIndex(v => v[pk] === newData[pk])
            const tmp = arr[newIndex]
            arr[newIndex] = arr[oldIndex]
            arr[oldIndex] = tmp
            // 重新赋值让 vue 监听到数据变动
            tableState.value.dataSource.data = data
        }

        const dragCore = new DragSwapCore({
            dragListenContainer: tableRefs.value.container as HTMLElement,
            onDragStart() {
                emit('DragStart')
            },
            onDragEnd() {
                emit('DragEnd')
            },
            readOperateModel(el) {
                if (el.tagName !== 'TR')
                    return false
                let res: any = true
                // @ts-ignore
                const key = el.__vnode.key
                forEachTree(tableState.value.dataSource.data, ({ value, parent }) => {
                    if (value[tableState.value.pk].toString() === key) {
                        res = value
                        return false
                    }
                }, tableState.value.childrenName)
                return res
            },
            dragContainer(el) {
                el = el as HTMLElement
                while (el && el.tagName !== "TBODY")
                    el = el.parentNode as HTMLElement
                return el;
            },
            isSwap({ oldModel, newModel }) {

                // @ts-ignore
                const oldKey = oldModel.el.__vnode.key
                // @ts-ignore
                const newKey = newModel.el.__vnode.key

                if (!oldKey || !newKey) {
                    ElMessage.info("缺少Key禁止拖拽！")
                    return false
                }
                let items: any[] | null = null
                forEachTree(tableState.value.dataSource.data, ({ value, parent }) => {
                    if (value[tableState.value.pk].toString() === oldKey) {
                        if (parent) {
                            items = parent[tableState.value.childrenName] || []
                        }
                        return false
                    }
                }, tableState.value.childrenName)
                let isSameLevel = false
                if (items === null) {
                    // 扫描顶级
                    isSameLevel = tableState.value.dataSource.data.find(v => v[tableState.value.pk].toString() === newKey) !== undefined
                } else {
                    isSameLevel = (items as any[]).find(v => v[tableState.value.pk].toString() === newKey) !== undefined
                }
                if (!isSameLevel) {
                    ElMessage.info("仅允许同级拖拽！")
                }

                return isSameLevel
            },
            onSwap({ oldModel, newModel }) {
                const parameter = {
                    oldData: oldModel.data,
                    newData: newModel.data
                }
                if (props.dragComplete) {
                    props.dragComplete(parameter).then(res => {
                        if (res) {
                            swapData(parameter)
                        }
                    })
                } else {
                    swapData(parameter)
                }
            },
        })

        onMounted(() => {
            dragCore.listen()
        })
        onUnmounted(() => {
            dragCore.unlisten()
        })

        watch(() => tableRefs.value.container, (curr) => {
            dragCore.setDragListenContainer(curr as HTMLElement)
            dragCore.listen()
        })

        return () => {
            return undefined
        }
    },
    {
        name: "TrDrag",
        props: ["dragComplete"],
        emits: ['DragStart', "DragEnd"]
    }
)

export interface STableProps<R = Record<string, any> | any, FR = Record<string, any>> {
    // table 配置
    table?: Partial<Omit<ElTableProps<R>, 'data' | 'rowKey'>>,
    data?: R[],
    // 远程加载数据
    request?: (filter: FR, pagination?: STablePageParameter) => Promise<RequestReturn<R>>,
    // 分页配置
    pagination?: PaginationProps | false,
    // 表单配置
    form?: FormProps,
    // 表头列
    columns?: STableColunm<R>[],
    // 主键
    pk?: string,
    // 打开拖拽排序
    draging?: boolean,

    // 拖拽完成
    dragComplete?: TrDragProps<R>['dragComplete']

    // onSelectChange?: (selection: TableRow[]) => void,
    // 刷新
    // onRefresh?: () => void,

    // 拖拽开始
    // onDragStart?: () => void,
    // 拖拽结束
    // onDragEnd?: () => void,

}

interface STableEmits{
    [key: string]: (...args: any[]) => void,
    onSelectChange: (selection: TableRow[]) => void,
    // 刷新
    onRefresh: () => void,
    // 拖拽开始
    onDragStart: () => void,
    // 拖拽结束
    onDragEnd: () => void,
}


// 表格状态数据
export interface STableStateData {
    // 数据源
    dataSource: DataResultType,
    // 数据列
    cols: STableColunm[],
    // 主键
    pk: string,
    // 分页信息
    pageInfo: STablePageParameter,
    // 下级名称
    childrenName: string,
}
// 表格 refs 集合
export interface STableRefs {
    form?: STableFormInstance,
    table?: InstanceType<typeof ElTable>,
    container?: HTMLElement,
}
const STable = defineComponent<STableProps, STableEmits>(
    (props: STableProps, { slots, attrs, emit, expose }) => {

        const $data = ref<STableStateData>({
            dataSource: {
                data: props.data ? props.data : [],
                total: props.data?.length || 0,
            },
            cols: props.columns || [],
            pk: props.pk || "id",
            pageInfo: {
                pageSize: props.pagination !== false ? props.pagination?.pageSize as number || 10 : 10,
                current: props.pagination !== false ? props.pagination?.pageSize as number || 1 : 1,
            },
            childrenName: props.table?.treeProps?.children || "children"
        })

        const $refs = ref<STableRefs>({})


        provide(InjectKeys.state, $data)
        provide(InjectKeys.refs, $refs)

        watch(() => props.data, (current) => {
            $data.value.dataSource.data = current || []
            $data.value.dataSource.total = current === undefined ? 0 : current.length
        })
        watch(() => props.columns, (current) => {
            $data.value.cols = current || []
        })

        const loadRequest = (data?: Record<string, any>, page?: STablePageParameter) => {
            if (props.request) {
                if (!page && props.pagination !== false) {
                    page = $data.value.pageInfo
                }
                if (!data) {
                    data = $refs.value.form?.getFormData();
                }

                props.request(data || {}, page).then(res => {
                    if (!res.isOK) return;
                    if (props.pagination === false || res.total === undefined) {
                        res.total === res.data.length
                    }
                    $data.value.dataSource = res
                })
            }
        }

        const publicMethods: STableInstance = {
            refreshData(whereData?: Record<string, any>, page?: STablePageParameter) {
                loadRequest(whereData, page)
            },
            setSelectedKeys(selectedKeys: any[]) {
                $refs.value.table?.clearSelection()
                $data.value.dataSource.data.forEach(item => {
                    if (selectedKeys.includes(item[$data.value.pk])) {
                        $refs.value.table?.setCurrentRow(item)
                    }
                })

            },
            expand(keys?: any[]) {
                forEachTree($data.value.dataSource.data, ({ value }) => {
                    if (keys !== undefined) {
                        if (keys.includes(value[$data.value.pk]))
                            $refs.value.table?.toggleRowExpansion(value, true)
                    } else {
                        $refs.value.table?.toggleRowExpansion(value, true)
                    }
                }, props.table?.treeProps?.children || "children")
            },
            shrink(keys?: any[]) {
                forEachTree($data.value.dataSource.data, ({ value }) => {

                    if (keys !== undefined) {
                        if (keys.includes(value[$data.value.pk]))
                            $refs.value.table?.toggleRowExpansion(value, false)
                    } else {
                        $refs.value.table?.toggleRowExpansion(value, false)
                    }

                }, props.table?.treeProps?.children || "children")
            },
        }
        expose(publicMethods)

        const privateMethods = {
            onPageChange(val: STablePageParameter) {
                $data.value.pageInfo = val
                publicMethods.refreshData()
            },
            onRefresh() {
                emit('refresh')
                publicMethods.refreshData()
            },
            onDragStart() {
                emit('DragStart')
            },
            onDragEnd() {
                emit('DragEnd')
            },

        }

        onMounted(() => {
            publicMethods.refreshData()
        })

        const tableEvents = removeKeys(getPrefixAttribute(attrs, 'on'), Object.keys(privateMethods))
        // 解决树型表格中 多选框选择时下级不被选中的问题
        const _onSelectedAll = tableEvents['onSelect-all']
        const _onSelected = tableEvents['onSelect']
        tableEvents['onSelect-all'] = (selection: TableRow[]) => {
            selection = [...selection]
            const keys = selection.map(v => v[$data.value.pk])
            const isAll = $data.value.dataSource.data.map(v => v[$data.value.pk]).filter(v => !keys.includes(v))
                .length === 0

            if (isAll) {
                forEachTree(selection, ({ value }) => {
                    $refs.value.table?.toggleRowSelection(value, true)
                    if (!keys.includes(value[$data.value.pk]))
                        selection.push(value)
                }, props.table?.treeProps?.children || "children")
            } else {
                $refs.value.table?.clearSelection()
                selection = []
            }
            _onSelectedAll?.(selection)
            emit('SelectChange', selection)
        }
        tableEvents['onSelect'] = (selection: TableRow[], row: TableRow) => {
            selection = [...selection]
            const keys = selection.map(v => v[$data.value.pk])
            const state = keys.includes(row[$data.value.pk])
            const cName = props.table?.treeProps?.children || "children"
            forEachTree(row[cName] || [], ({ value }) => {
                $refs.value.table?.toggleRowSelection(value, state)
                if (state) {
                    selection.push(value)
                } else {
                    const idx = keys.indexOf(value[$data.value.pk])
                    if (idx > -1) {
                        selection.splice(idx, 1)
                        keys.splice(idx, 1)
                    }
                }
            }, cName)
            _onSelected?.(selection, row)
            emit('SelectChange', selection)
        }

        // 放入el-table 中的 slots
        const tableSlots: Record<string, any> = {
            empty: () => {
                return "暂无数据"
            },
            append: slots.append,
            default: () => {
                return <>
                    {slots.default?.call(this)}
                    <STableColumns cols={$data.value.cols} />
                </>
            }
        }
        return () => {

            return <div class="s-table" ref={el => {
                if (el) {
                    $refs.value.container = el as HTMLElement
                }
            }}>
                {
                    props.draging ?
                        <TrDrag dragComplete={props.dragComplete} onDragStart={privateMethods.onDragStart} onDragEnd={privateMethods.onDragEnd} />
                        : undefined
                }
                <div class="s-table-header">
                    <div class="s-table-header-btns">
                        <ElTooltip
                            effect="dark"
                            content="刷新"
                            placement="top"
                        >
                            <ElButton color="#40485b" onClick={privateMethods.onRefresh}><m-icon><Refresh /></m-icon></ElButton>
                        </ElTooltip>
                        {slots.operate?.call(this)}
                        <STableColunmController v-model:cols={$data.value.cols} />
                    </div>
                </div>
                <ElTable
                    rowKey={$data.value.pk}
                    {...props.table}
                    {...tableEvents}
                    ref={(comp) => {
                        $refs.value.table = comp as any
                    }}
                    v-slots={tableSlots}
                    data={$data.value.dataSource.data}
                />
                <div class="s-table-footer">
                    {
                        props.pagination !== false ?
                            <STablePagination
                                onPageChange={privateMethods.onPageChange}
                                current={$data.value.pageInfo.current as number}
                                pageSize={$data.value.pageInfo.pageSize as number}
                                total={$data.value.dataSource.total as number}
                            />
                            : undefined
                    }
                </div>
            </div>
        }

    },
    {
        name: "STable",
        props: ['table', 'form', 'pagination', 'request', 'data', 'columns', 'draging', 'pk'],
        emits: ['SelectChange', 'refresh', 'DragStart', 'DragEnd']
    }
)
export default STable;


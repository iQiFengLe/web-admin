import { Book, Pencil, Plus, Trash } from "@/components/icon/shapes/FontAwesome"
import STable, { STableColunm, STableInstance } from "@/components/STable"
import { defineComponent, nextTick, onMounted, ref, watch } from "vue"
import { isEmpty, debounce, cloneDeep } from "lodash"
import { ElMessage, FormInstance } from "element-plus"
import * as request from "@/api/user/permission"
import JSONView, { CommentType } from "@/components/json/JSONView"
import XPan from "@/components/transition/pan/XPan"

export interface PermissionFormPanelInstance {
    show: (data?: Record<string, any>) => void,
    hide: () => void,
    toggle: () => void,
    setData: (data: Record<string, any>) => void,
}
export const PermissionFormPanel = defineComponent(
    (props: { visible?: boolean, data?: Record<string, any> }, { emit, expose }) => {


        const formData = ref(props.data || {})
        const modalVisible = ref(!!props.visible)

        const formRef = ref<FormInstance>()

        const setFormRef = (el: any) => {
            if (el)
                formRef.value = el
        }

        watch(() => props.data, (curr) => {
            formData.value = curr || {}
        })
        watch(() => props.visible, (curr) => {
            modalVisible.value = !!curr
        })

        const exposeInfo: PermissionFormPanelInstance = {
            show(data?: Record<string, any>) {
                if (data !== undefined) {
                    exposeInfo.setData(data)
                }
                modalVisible.value = true

            },
            hide() {
                modalVisible.value = false
            },
            toggle() {
                modalVisible.value = !modalVisible.value
            },
            setData(data: Record<string, any>) {
                formData.value = data || {}
                nextTick(() => {
                    nextTick(() => {
                        formRef.value?.clearValidate()
                    })
                })
            },
        }
        expose(exposeInfo)

        const onConfirm = debounce(() => {
            formRef.value?.validate().then(res => {
                if (!res) return
                if (formData.value.id) {
                    request.update(formData.value as request.PermissionFormRecord)
                        .then((result) => {
                            if (result.isOK()) {
                                ElMessage.success('更新权限数据成功！')
                                exposeInfo.hide()
                            } else {
                                ElMessage.info(result.getMsg())
                            }
                        })
                } else {
                    request.add(formData.value as request.PermissionFormRecord).then((result) => {
                        if (result.isOK()) {
                            ElMessage.success('添加权限数据成功！')
                            exposeInfo.hide()
                        } else {
                            ElMessage.info(result.getMsg())
                        }
                    })
                }
            })
        }, 500)

        const rules = {
            name: [
                { required: true, message: "名称不可为空！" }
            ]
        }

        const formMethods = [
            { label: "POST", value: "POST" },
            { label: "GET", value: "GET" },
            { label: "PUT", value: "PUT" },
            { label: "PATCH", value: "PATCH" },
            { label: "DELETE", value: "DELETE" },
            { label: "OPTIONS", value: "OPTIONS" },
        ]

        return () => {

            const formMethodNode = formMethods.map((method, i) => {
                return <el-option
                    key={i}
                    label={method.label}
                    value={method.value}
                />
            })

            return <el-dialog
                v-model={modalVisible.value}
                draggable
                closeOnClickModal={false}
                title={isEmpty(formData.value) ? "添加" : "编辑"}
                width="800px"

                v-slots={{
                    footer() {
                        return <>
                            <el-button onClick={exposeInfo.hide} > 取消</el-button>
                            <el-button type="primary" onClick={onConfirm} > 提交</el-button>
                        </>
                    }
                }}
            >
                <el-form rules={rules} ref={setFormRef} v-model:model={formData.value} label-width="120px">
                    <el-row>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="name"
                                label="权限名称"
                            >
                                <el-input v-model={formData.value.name} placeholder="输入权限名称" />
                            </el-form-item>
                        </el-col>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="code"
                                label="权限代码"
                            >
                                <el-input v-model={formData.value.code} placeholder="输入权限代码" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="moduleName"
                                label="模块名称"
                            >
                                <el-input v-model={formData.value.moduleName} placeholder="输入模块名称" />
                            </el-form-item>
                        </el-col>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="method"
                                label="权限方法"
                            >
                                <el-select v-model={formData.value.method} placeholder="选择权限方法">
                                    {formMethodNode}
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item
                        required
                        prop="path"
                        label="权限路径"
                    >
                        <el-input v-model={formData.value.path} placeholder="输入权限路径" />
                    </el-form-item>
                    <el-form-item
                        prop="remark"
                        label="权限备注"
                    >
                        <el-input maxlength={255} row={3} type="textarea" v-model={formData.value.remark} placeholder="输入权限备注" />
                    </el-form-item>
                    <el-row>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="allowAnonymousAccess"
                                label="允许匿名访问"
                            >
                                <el-switch
                                    v-model={formData.value.allowAnonymousAccess}
                                    inline-prompt
                                    active-text="是"
                                    inactive-text="否"
                                />
                            </el-form-item>

                        </el-col>
                        <el-col span={12}>
                            <el-form-item
                                required
                                prop="state"
                                label="是否启用"
                            >
                                <el-switch
                                    v-model={formData.value.state}
                                    inline-prompt
                                    active-text="是"
                                    inactive-text="否"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>

            </el-dialog>

        }
    }
)

const PermissionPage = defineComponent(
    () => {

        // 选中行
        const selectedRows = ref<any[]>([])

        const cols = ref<STableColunm<request.PermissionRecord>[]>([])

        const formPanelRef = ref<PermissionFormPanelInstance>()

        const tableRef = ref<STableInstance>()

        // 视图活动项
        const viewActive = ref<string>('index')

        // json 视图 数据
        const jsonViewData = ref<request.PermissionRecord>()
        // json 视图 字段注释
        const jsonViewFieldComment = ref<CommentType>({})

        const actionMethods = {
            delete(id: any[] | any) {
                request.remove(id).then(result => {
                    if (result.isOK()) {
                        ElMessage.success('删除权限成功！')
                        tableRef.value?.refreshData()
                    } else {
                        ElMessage.error(result.getMsg())
                    }
                })
            },
            edit(row: request.PermissionRecord) {
                formPanelRef.value?.show(cloneDeep(row))
            },
            add() {
                formPanelRef.value?.show({})
            },
            detail(row: request.PermissionRecord) {
                jsonViewData.value = row;
                viewActive.value = 'json-view'
            }
        }

        const eventMethods = {
            onSelectedDelete() {
                if (!selectedRows.value.length) {
                    return
                }
                actionMethods.delete(selectedRows.value.map(v => v.id))
            },
            onSelectedEdit() {
                if (selectedRows.value.length != 1) {
                    return
                }
                actionMethods.edit(selectedRows.value[0])
            },
            // 表格选中行变动事件
            onTableSelectionChange(selection: any[]) {
                selectedRows.value = selection
            },
            // 表格行双击事件
            onTableRowDoubleClick(row: request.PermissionRecord) {
                formPanelRef.value?.show(cloneDeep(row))
            }

        }


        const tableActionColumn: STableColunm<request.PermissionRecord> = {
            label: '操作',
            width: "120px",
            isHide: true,
            slots: {
                default({ row }) {
                    return <>
                        <el-tooltip
                            effect="dark"
                            content="编辑"
                            placement="top"
                        >
                            <el-button
                                onClick={actionMethods.edit.bind(this, row)}
                                class="table-operate" type="primary" size="small"><m-icon><Pencil /></m-icon>
                            </el-button>
                        </el-tooltip>
                        <el-popconfirm
                            title="确定删除记录？"
                            onConfirm={actionMethods.delete.bind(this, row.id)}
                            v-slots={{
                                reference() {
                                    return <div class="btn-block">
                                        <el-tooltip
                                            effect="dark"
                                            content="删除"
                                            placement="top"
                                        >
                                            <el-button
                                                class="table-operate" type="danger" size="small"><m-icon><Trash /></m-icon>
                                            </el-button>
                                        </el-tooltip>
                                    </div>
                                }
                            }
                            }>
                        </el-popconfirm>
                        <el-tooltip
                            effect="dark"
                            content="详情"
                            placement="top"
                        >
                            <el-button
                                onClick={actionMethods.detail.bind(this, row)}
                                class="table-operate btn-block" type="info" size="small"><m-icon><Book /></m-icon>
                            </el-button>
                        </el-tooltip>
                    </>
                },
            }
        }

        const stableSlots = {
            operate: () => {
                return <>
                    <el-tooltip
                        effect="dark"
                        content="添加记录"
                        placement="top"
                    >
                        <el-button onClick={actionMethods.add} type="primary">
                            <m-icon style={{ marginRight: "5px" }}><Plus /></m-icon> 添加
                        </el-button>
                    </el-tooltip>
                    <el-tooltip
                        effect="dark"
                        content="编辑选中行"
                        placement="top"
                    >
                        <el-button onClick={eventMethods.onSelectedEdit} type="primary" disabled={selectedRows.value.length != 1}>
                            <m-icon style={{ marginRight: "5px" }}><Pencil /></m-icon> 编辑
                        </el-button>
                    </el-tooltip>
                    <el-popconfirm
                        title="确定删除选中记录？"
                        onConfirm={eventMethods.onSelectedDelete}
                        v-slots={{
                            reference() {
                                return <div class="btn-block">
                                    <el-tooltip
                                        effect="dark"
                                        content="删除选中行"
                                        placement="top"
                                    >
                                        <el-button type="danger" disabled={selectedRows.value.length == 0}>
                                            <m-icon style={{ marginRight: "5px" }}><Trash /></m-icon> 删除
                                        </el-button>
                                    </el-tooltip>

                                </div>
                            }
                        }
                        }>
                    </el-popconfirm>
                </>
            }
        }


        const queryList = async () => {

            const result = await request.queryList({})
            const data = result.getData()
            return Promise.resolve({
                isOK: result.isOK(),
                data: data.records || [],
                total: data.total
            })
        }

        onMounted(() => {
            request.qeuryTalbeColumn().then(result => {
                if (result.isOK()) {
                    const data = result.getData() as STableColunm<request.PermissionRecord>[]
                    data.push(tableActionColumn)
                    cols.value = data
                } else {
                    ElMessage.error(result.getMsg())
                }
            })

            request.qeuryFieldComment().then(result => {
                if (result.isOK()) {
                    jsonViewFieldComment.value = result.getData() as CommentType
                } else {
                    ElMessage.error(result.getMsg())
                }
            })
        })



        return () => {
            return <div>
                <PermissionFormPanel ref={(comp) => formPanelRef.value = comp as unknown as PermissionFormPanelInstance} />

                <XPan keys={['index', 'json-view']} active={viewActive.value}>
                    <div key="index">
                        <STable
                            ref={(comp) => tableRef.value = comp as unknown as STableInstance}
                            columns={cols.value}
                            onSelection-change={eventMethods.onTableSelectionChange}
                            onRow-dblclick={eventMethods.onTableRowDoubleClick}
                            v-slots={stableSlots}
                            request={queryList}
                        />
                    </div>
                    <div key="json-view" class="page-item">
                        <el-page-header class="page-header" content="详情" onBack={() => viewActive.value = 'index'} />
                        <JSONView data={jsonViewData.value} fieldComment={jsonViewFieldComment.value} />
                    </div>
                </XPan>
            </div>
        }

    }
)
PermissionPage.name = "user-permission"
export default PermissionPage
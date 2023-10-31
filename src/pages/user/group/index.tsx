import { defineComponent, nextTick, onMounted, ref, TransitionGroup, watch } from "vue"
import { cloneDeep, isEmpty, throttle } from "lodash"
import { ElMessage, FormInstance } from "element-plus"
import * as api from "@/api/user/group"
import * as roleApi from "@/api/user/role"
import JSONView, { CommentType } from "@/components/json/JSONView"
import { forEachTree, getTreeColumn, listToTree, removeKeys } from "@/utils"
import { ArrowDown } from "@element-plus/icons-vue"
import { FileText } from "@/components/icon/shapes/FontAwesome"
import Result from "@/components/result"
import { FORM_RULE_WEIGHT, MAX_WEIGHT, MIN_WEIGHT } from "@/common/constant"
import Tree, { TreeOnCheckInfoType } from "@/components/tree"

export declare type TreeDataRecord = api.GroupRecord & { children: api.GroupRecord[] }

export interface GroupFormProps {
    data?: Partial<api.GroupFormRecord>,
    treeData?: TreeDataRecord[]
}

export const GroupForm = defineComponent(
    (props: GroupFormProps, { emit }) => {


        const state = ref<{
            formData: Partial<api.GroupFormRecord>,
            treeRoleData: roleApi.TreeDataRecord[],
            loadingText: 'ok' | string,
        }>({
            loadingText: 'ok',
            formData: props.data || {},
            treeRoleData: [],
        })

        const refs = ref<{
            form?: FormInstance,
        }>({})

        const clearFormValid = () => {
            nextTick(() => {
                nextTick(() => {
                    refs.value.form?.clearValidate()
                })
            })
        }

        const setData = (curr?: Partial<api.GroupFormRecord>) => {
            state.value.formData = curr || {}
            if (state.value.formData.id) {
                state.value.loadingText = '数据加载中...'
                // 编辑数据
                api.queryEditData(state.value.formData.id!).then(res => {
                    if (res.isOK()) {
                        state.value.formData = res.getData()
                        state.value.loadingText = 'ok'
                    } else {
                        state.value.loadingText = `加载数据失败：${res.getMsg()}`
                    }
                    clearFormValid()
                }).catch(err => {
                    state.value.loadingText = `加载数据失败！`
                    throw err
                })
            } else {
                clearFormValid()
            }

        }
        const loadAllRoles = () => {
            roleApi.queryList().then((res) => {
                if (res.isOK()) {
                    state.value.treeRoleData = listToTree(res.getData() || []) as roleApi.TreeDataRecord[]
                } else {
                    ElMessage.error(`角色加载失败：${res.getMsg()}`)
                }
            })
        }

        watch(() => props.data, (curr) => {
            setData(curr)
        })

        const onReset = () => {
            setData()
            emit('update:data', state.value.formData)
        }

        onMounted(() => {
            loadAllRoles()
        })

        const onConfirm = throttle(() => {
            refs.value.form?.validate().then(res => {
                if (!res) return
                if (state.value.formData.id) {
                    api.update(state.value.formData as api.GroupFormRecord)
                        .then((result) => {
                            if (result.isOK()) {
                                ElMessage.success('更新用户组数据成功！')
                            } else {
                                ElMessage.info(result.getMsg())
                            }
                            emit('comfirm', result)
                        })
                } else {
                    api.add(state.value.formData as api.GroupFormRecord).then((result) => {
                        if (result.isOK()) {
                            ElMessage.success('添加用户组数据成功！')
                        } else {
                            ElMessage.info(result.getMsg())
                        }
                        emit('comfirm', result)
                    })
                }
            }).catch((err) => {

            })
        }, 500)

        const rules = {
            name: [
                { required: true, message: "名称不可为空！" },
                { max: 50, message: "名称最长50个字符！" },
            ],
            weight: [
                { required: true, message: "权重是必填的！" },
                ...FORM_RULE_WEIGHT
            ],
            state: [
                { required: true, message: "状态必选！" },
            ],
            remark: [
                { max: 128, message: "备注最长128个字符！" },
            ],
        }
        const renderSelectOption = () => {
            const parentOptions: any[] = []
            forEachTree(props.treeData || [], ({ value, layer }) => {
                parentOptions.push(<el-option
                    value={value.id}
                    label={value.name}
                ><span style={{ paddingLeft: `${layer * 10}px` }}>{value.name}</span></el-option>)
            })
            return parentOptions
        }

        return () => {
            return <el-form ref={(comp: any) => {
                if (comp)
                    refs.value.form = comp
            }}
                rules={rules}
                v-model:model={state.value.formData}
                label-width="120px"
                onReset={onReset}
                v-loading={state.value.loadingText != 'ok'}
                element-loading-text={state.value.loadingText == 'ok' ? undefined : state.value.loadingText}
            >
                <el-form-item
                    required
                    prop="name"
                    label="用户组名称"
                >
                    <el-input maxLength={50} v-model={state.value.formData.name} placeholder="输入用户组名称" />
                </el-form-item>
                <el-form-item
                    required
                    prop="parentId"
                    label="用户组父级"
                >
                    <el-select v-model={state.value.formData.parentId} placeholder="请选择父级用户组">
                        <el-option value={0} label="作为顶级" />
                        {renderSelectOption()}
                    </el-select>
                </el-form-item>
                <el-form-item
                    required
                    prop="name"
                    label="用户组权重"
                >
                    <el-input-number min={MIN_WEIGHT} max={MAX_WEIGHT} step={1} precision={0} v-model={state.value.formData.weight} placeholder="输入用户组权重" />
                </el-form-item>
                <el-form-item
                    required
                    prop="state"
                    label="用户组状态"
                >
                    <el-radio-group v-model={state.value.formData.state}>
                        <el-radio label={true}>启用</el-radio>
                        <el-radio label={false}>停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item
                    prop="remark"
                    label="用户组备注"
                >
                    <el-input maxLength={128} v-model={state.value.formData.remark} type="textarea" rows={3} placeholder="输入用户组备注" />
                </el-form-item>
                <el-form-item
                    prop="roleIds"
                    label="分配角色"
                >
                    <Tree
                        v-model:selectedKeys={state.value.formData.roleIds}
                        pk="id"
                        data={state.value.treeRoleData}
                        tree={{
                            props: { label: 'name' },
                        }}
                    />
                </el-form-item>
                <el-form-item>
                    <div class="d-inline-flex gap-8 ml-auto">
                        <el-button native-type="reset">重置</el-button>
                        <el-button type="primary" onClick={onConfirm}>提交</el-button>
                    </div>
                </el-form-item>
            </el-form>
        }
    }
)

GroupForm.name = 'group-form'
GroupForm.props = ['treeData', 'data']
GroupForm.emits = ['confirm', 'update:data']


const GroupPage = defineComponent(
    () => {

        const state = ref<{
            // 展开 keys 列表
            expandKeys: any[],
            // 选中的行
            selectedRows: api.GroupRecord[],
            // 活动行
            activeRow?: api.GroupRecord,
            // json view 数据
            jsonViewData?: api.GroupRecord,
            // json 视图 字段注释
            jsonViewFieldComment: CommentType,
            // 树型数据
            treeData: TreeDataRecord[],
            // 活动视图
            activeView: string,
            // 树是否级联
            isTreeCascade: boolean,
            // 表单数据
            formData?: Partial<api.GroupFormRecord>
        }>({
            expandKeys: [],
            selectedRows: [],
            jsonViewFieldComment: {},
            treeData: [],
            activeView: 'index',
            isTreeCascade: true,
        })


        const actionMethods = {
            delete(id: any[] | any) {
                api.remove(id).then(result => {
                    if (result.isOK()) {
                        ElMessage.success('删除用户组成功！')
                        queryList()
                    } else {
                        ElMessage.error(result.getMsg())
                    }
                })
            },
            edit(row: api.GroupRecord) {
                state.value.formData = cloneDeep(row)
                state.value.activeView = 'form-view'
            },
            addChild() {
                if (state.value.activeRow) {
                    state.value.formData = {
                        parentId: state.value.activeRow.id as number
                    }
                    state.value.activeView = 'form-view'
                }
            },
            add() {
                state.value.formData = {}
                state.value.activeView = 'form-view'
            },
            detail(row: api.GroupRecord) {
                state.value.jsonViewData = removeKeys(row, ['children']);
                state.value.activeView = 'json-view'
            },
        }

        const eventMethods = {
            onGroupTreeSelectedChange(_: any, { checkedNodes }: TreeOnCheckInfoType<api.GroupRecord>) {
                state.value.selectedRows = checkedNodes.map(v => v.data)
            },
            onGroupTreeClick(current: api.GroupRecord, _: any) {
                if (current.id === state.value.activeRow?.id) {
                    state.value.activeRow = undefined
                } else {
                    state.value.activeRow = current
                }
            },
            onMoreOperateCommand(command: string) {
                switch (command) {
                    case 'refresh':
                        queryList()
                        break;
                    case 'up':
                        api.switchState(state.value.selectedRows.map(val => val.id), true)
                            .then(res => {
                                if (res.isOK()) {
                                    ElMessage.success({
                                        message: "启用成功！",
                                        onClose() {
                                            queryList()
                                        }
                                    })
                                } else {
                                    ElMessage.error(res.getMsg())
                                }
                            })
                        break;
                    case 'down':
                        api.switchState(state.value.selectedRows.map(val => val.id), false)
                            .then(res => {
                                if (res.isOK()) {
                                    ElMessage.success({
                                        message: "禁用成功！",
                                        onClose() {
                                            queryList()
                                        }
                                    })
                                } else {
                                    ElMessage.error(res.getMsg())
                                }
                            })
                        break;
                    case 'assignRole':
                        // 分配角色
                        break;
                    case 'shrinkAll':
                        state.value.expandKeys = []
                        break;
                    case 'expandOne':
                        state.value.expandKeys = state.value.treeData.map(v => v.id)
                        break;
                    case 'expandTwo':
                        const keys: any[] = []
                        state.value.treeData.forEach(v => {
                            keys.push(v.id)
                            keys.push(...v.children.map(v => v.id))
                        })
                        state.value.expandKeys = keys
                        break;
                    case 'expandAll':
                        state.value.expandKeys = getTreeColumn(state.value.treeData, 'id')
                        break;
                    case 'delete':
                        api.remove(state.value.selectedRows.map(val => val.id))
                            .then(res => {
                                if (res.isOK()) {
                                    ElMessage.success({
                                        message: "删除成功！",
                                        onClose() {
                                            queryList()
                                        }
                                    })
                                } else {
                                    ElMessage.error(res.getMsg())
                                }
                            })
                        break;
                }
            }
        }

        const queryList = () => {

            api.queryList({}).then(result => {
                if (result.isOK()) {
                    state.value.treeData =
                        listToTree(result.getData()) as (api.GroupRecord & { children: api.GroupRecord[] })[]
                } else {
                    ElMessage.error(result.getMsg())
                }
            })
        }

        onMounted(() => {
            queryList()
            api.qeuryFieldComment().then(result => {
                if (result.isOK()) {
                    state.value.jsonViewFieldComment = result.getData() as CommentType
                } else {
                    ElMessage.error(result.getMsg())
                }
            })
        })


        const treeSlots = {
            default({ node, data }: { node: any, data: api.GroupRecord }) {
                return <>
                    {data.name}
                    <div
                        class="d-inline-flex ml-auto mr-0 align-items-center gap-5"
                    >
                        <el-switch
                            v-model={data.state}
                            inline-prompt
                            width="40px"
                            active-text="Y"
                            inactive-text="N"
                            style={{ marginRight: "5px" }}
                        />
                        <el-popconfirm
                            onConfirm={actionMethods.delete.bind(this, data.id)}
                            title="确认删除吗?"
                            v-slots={{
                                reference() {
                                    return <a>删除</a>
                                }
                            }}
                        >
                        </el-popconfirm>

                        <a onClick={actionMethods.edit.bind(this, data)}>编辑</a>
                        <a onClick={actionMethods.detail.bind(this, data)}>详情</a>
                    </div>
                </>
            }
        }

        return () => {

            return <el-container direction="vertical" class="h-100">
                <el-row class="h-100">
                    <el-col span={7} class="d-flex flex-column page-item gap-4">
                        <el-space>
                            <el-switch
                                v-model={state.value.isTreeCascade}
                                inline-prompt
                                width="55px"
                                size="large"
                                active-text="级联"
                                inactive-text="级联"
                            />
                            <el-button onClick={actionMethods.add} type="primary">
                                添加顶级用户组
                            </el-button>
                            <el-button
                                type="primary"
                                onClick={actionMethods.addChild}
                                disabled={state.value.activeRow === undefined}
                            >
                                添加下级用户组
                            </el-button>
                            <el-dropdown
                                onCommand={eventMethods.onMoreOperateCommand}
                                trigger="click"
                                v-slots={{
                                    dropdown() {
                                        return <el-dropdown-menu>
                                            <el-dropdown-item command="refresh">刷新</el-dropdown-item>
                                            <el-dropdown-item disabled={!state.value.activeRow} command="assignRole">分配角色</el-dropdown-item>
                                            <el-dropdown-item disabled={!state.value.selectedRows.length} command="up">批量启用</el-dropdown-item>
                                            <el-dropdown-item disabled={!state.value.selectedRows.length} command="down">批量停用</el-dropdown-item>
                                            <el-dropdown-item disabled={!state.value.selectedRows.length} command="delete">批量删除</el-dropdown-item>
                                            <el-dropdown-item command="shrinkAll">全部收缩</el-dropdown-item>
                                            <el-dropdown-item command="expandOne">展开一级</el-dropdown-item>
                                            <el-dropdown-item command="expandTwo">展开两级</el-dropdown-item>
                                            <el-dropdown-item command="expandAll">全部展开</el-dropdown-item>
                                        </el-dropdown-menu>
                                    }
                                }}
                            >
                                <el-button>
                                    更多操作 <m-icon style={{ marginLeft: "5px" }}><ArrowDown /></m-icon>
                                </el-button>
                            </el-dropdown>
                        </el-space>
                        <el-alert type="success" title={`当前选择编辑：${state.value.activeRow?.name}`} closable={false} />
                        <el-scrollbar>
                            <Tree
                                expandKeys={state.value.expandKeys}
                                onCurrent-change={eventMethods.onGroupTreeClick}
                                onCheck={eventMethods.onGroupTreeSelectedChange}
                                showCheckbox
                                data={state.value.treeData}
                                pk="id"
                                v-slots={treeSlots}
                                emptyText="暂无数据"
                                expandOnClickNode={false}
                                checkStrictly={!state.value.isTreeCascade}
                            />
                        </el-scrollbar>
                    </el-col>
                    <el-col span={17} class="h-100">
                        <el-scrollbar viewClass="h-100">
                            <TransitionGroup
                                leaveActiveClass="animate__animated animate__fadeOutUp p-a top-0 w-100"
                                enterActiveClass="animate__animated animate__fadeInUp p-a top-0 w-100"
                            >
                                <Result
                                    v-show={state.value.activeView === 'index'}
                                    key="index"
                                    class="h-100"
                                    desc="点击详情或编辑则显示对应内容"
                                    title="数据展示与编辑"
                                    v-slots={{ icon: () => <FileText /> }}
                                />
                                <div
                                    v-show={state.value.activeView === 'json-view'}
                                    key="json-view"
                                >
                                    <h2 class="page-item mt-0 mb-0">{`详情：${state.value.jsonViewData?.name}`}</h2>
                                    <JSONView
                                        emptyText="请先点击详情！"
                                        theme="light"
                                        data={state.value.jsonViewData}
                                        fieldComment={state.value.jsonViewFieldComment}
                                    />
                                </div>
                                <div key="form-view" class="page-item pl-0" v-show={state.value.activeView === 'form-view'}>
                                    <h2 class="page-item mt-0 mb-0">{
                                        !isEmpty(state.value.formData) ?
                                            `${state.value.formData?.parentId ? `添加下级：${state.value.activeRow?.name}` : `编辑：${state.value.formData?.name}`}`
                                            : '添加顶级'
                                    }
                                    </h2>
                                    <GroupForm
                                        treeData={state.value.treeData}
                                        v-model:data={state.value.formData}
                                    />
                                </div>
                            </TransitionGroup>
                        </el-scrollbar>
                    </el-col>
                </el-row>
            </el-container>
        }

    }
)
GroupPage.name = "user-group"
export default GroupPage
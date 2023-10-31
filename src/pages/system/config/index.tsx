import { FormItem } from "@/components/form"
import { ElMessage, FormInstance } from "element-plus"
import { throttle } from "lodash"
import { ref, defineComponent, nextTick, watch, onMounted } from "vue"
import * as api from "@/api/system/config"

import "./style.scss"

// 基础配置表单
export interface BaiscConfigFormProps {
    data?: api.SystemBasicConfigRecord,
}
export const BaiscConfigForm = defineComponent(
    (props: BaiscConfigFormProps, { emit }) => {


        const state = ref<{
            formData: Partial<api.SystemBasicConfigRecord>
        }>({
            formData: props.data || {}
        })

        const refs = ref<{
            form?: FormInstance
        }>({})

        const setData = (curr?: Partial<api.SystemBasicConfigRecord>) => {
            state.value.formData = curr || {}
            nextTick(() => {
                nextTick(() => {
                    refs.value.form?.clearValidate()
                })
            })
        }

        watch(() => props.data, (curr) => {
            setData(curr)
        })

        const onConfirm = throttle(() => {
            refs.value.form?.validate().then(res => {
                if (!res) return
                api.update({ basic: state.value.formData })
                    .then((result) => {
                        if (result.isOK()) {
                            ElMessage.success('更新菜单规则数据成功！')
                        } else {
                            ElMessage.info(result.getMsg())
                        }
                        emit('confirm', result)
                    })
            }).catch((err) => {

            })
        }, 500)

        const rules = {
            name: [
                { required: true, message: "名称不可为空！" },
                { type: 'string', max: 50, message: "名称最长50个字符！" },
            ],
            state: [
                { required: true, message: "状态必选！" },
            ],
            recordNumber: [
                { type: 'string', max: 50, message: "备案号最长50个字符！" },
            ],
            stateDesc: [
                { type: 'string', max: 500, message: "备案号最长500个字符！" },
            ],
        }
        return () => {
            return <el-form ref={(comp: any) => {
                if (comp)
                    refs.value.form = comp
            }}
                rules={rules}
                v-model:model={state.value.formData}
                label-width="130px"
            >
                <el-form-item
                    required
                    prop="name"
                    label="系统名称"
                >
                    <el-input maxLength={50} v-model={state.value.formData.name} placeholder="输入系统名称" />
                </el-form-item>

                <el-form-item
                    prop="recordNumber"
                    label="备案号"
                >
                    <el-input maxLength={30} v-model={state.value.formData.recordNumber} placeholder="输入备案号" />
                </el-form-item>
                <el-form-item
                    required
                    prop="state"
                    label="系统状态"
                >
                    <el-radio-group v-model={state.value.formData.state}>
                        <el-radio-button label={1}>正常</el-radio-button>
                        <el-radio-button label={0}>关闭</el-radio-button>
                        <el-radio-button label={2}>维护</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <FormItem
                    prop="stateDesc"
                    label="状态描述"
                    tooltip="在系统状态非正常的情况下会将该文本显示在用户端"
                >
                    <el-input
                        maxLength={500}
                        type="textarea" rows={3}
                        v-model={state.value.formData.stateDesc}
                        placeholder="输入状态描述" />
                </FormItem>
                <el-form-item>
                    <div class="d-inline-flex gap-8 ml-auto">
                        <el-button type="primary" onClick={onConfirm} >提交</el-button>
                    </div>
                </el-form-item>
            </el-form>
        }
    },
    {
        name: "system-config-baisc-form",
        props: ["data"],
        emits: ['confirm', 'update:data']
    }
)


// 邮箱配置表单
export interface MailConfigFormProps {
    data?: api.SystemMailConfigRecord,
}
export const MailConfigForm = defineComponent(
    (props: MailConfigFormProps, { emit }) => {


        const state = ref<{
            formData: Partial<api.SystemMailConfigRecord>
        }>({
            formData: props.data || {}
        })

        const refs = ref<{
            form?: FormInstance
        }>({})

        const setData = (curr?: Partial<api.SystemMailConfigRecord>) => {
            state.value.formData = curr || {}
            nextTick(() => {
                nextTick(() => {
                    refs.value.form?.clearValidate()
                })
            })
        }

        watch(() => props.data, (curr) => {
            setData(curr)
        })

        const onConfirm = throttle(() => {
            refs.value.form?.validate().then(res => {
                if (!res) return
                api.update({ mail: state.value.formData })
                    .then((result) => {
                        if (result.isOK()) {
                            ElMessage.success('更新菜单规则数据成功！')
                        } else {
                            ElMessage.info(result.getMsg())
                        }
                        emit('confirm', result)
                    })
            }).catch((err) => {

            })
        }, 500)

        const rules = {
            SMTPServer: [
                { required: true, message: "SMTP服务器必填！" },
                { type: 'string', max: 50, message: "名称最长50个字符！" },
            ],
            SMTPPort: [
                { required: true, message: "SMTP端口号必填！" },
            ],
            SMTPUser: [
                { required: true, message: "SMTP用户必填！" },
            ],
            SMTPVerifyMode: [
                { required: true, message: "SMTP验证方式必选！" },
            ],
            SMTPSender: [
                { required: true, message: "SMTP发件人邮箱必填！" },
            ]
        }
        return () => {
            return <el-form ref={(comp: any) => {
                if (comp)
                    refs.value.form = comp
            }}
                rules={rules}
                v-model:model={state.value.formData}
                label-position="top"
            >
                <el-form-item
                    required
                    prop="SMTPServer"
                    label="SMTP服务器"
                >
                    <el-input v-model={state.value.formData.SMTPServer} placeholder="输入SMTP服务器" />
                </el-form-item>
                <el-form-item
                    required
                    prop="SMTPPort"
                    label="SMTP端口"
                >
                    <el-input v-model={state.value.formData.SMTPPort} placeholder="输入SMTP端口" />
                </el-form-item>
                <el-form-item
                    required
                    prop="SMTPUser"
                    label="SMTP账号"
                >
                    <el-input v-model={state.value.formData.SMTPUser} placeholder="输入SMTP用户" />
                </el-form-item>
                <FormItem
                    prop="SMTPPwd"
                    label="SMTP密码"
                    tooltip="SMTP账号密码或授权码"
                >
                    <el-input v-model={state.value.formData.SMTPPwd} placeholder="输入SMTP密码" />
                </FormItem>

                <el-form-item
                    required
                    prop="SMTPVerifyMode"
                    label="SMTP验证方式"
                >
                    <el-select v-model={state.value.formData.SMTPVerifyMode}>
                        <el-option label="SSL">SSL</el-option>
                        <el-option label="TLS">TLS</el-option>
                    </el-select>
                </el-form-item>
                <el-form-item
                    required
                    prop="SMTPSender"
                    label="SMTP发件人邮箱"
                >
                    <el-input v-model={state.value.formData.SMTPSender} placeholder="输入SMTP发件人邮箱" />
                </el-form-item>
                <el-form-item>
                    <div class="d-inline-flex gap-8 ml-auto">
                        <el-button type="primary" onClick={onConfirm} >提交</el-button>
                    </div>
                </el-form-item>
            </el-form>
        }
    },
    {
        name: "system-config-mail-form",
        props: ["data"],
        emits: ['confirm', 'update:data']
    }
)

const SystemConfigPage = defineComponent(
    () => {

        const state = ref<{
            activeTab: string,
            config: api.SystemConfigFormRecord
        }>({
            activeTab: 'basic',
            config: {
                basic: {}
            }
        })

        onMounted(() => {
            api.queryAllConfig().then(res => {
                if (res.isOK()) {
                    state.value.config = res.getData()
                }
            })
        })


        return () => {
            return <div>
                <el-tabs type="border-card" v-model={state.value.activeTab} class="page-item pt-0 pl-0 pr-0 system-config-tabs">
                    <el-tab-pane label="基础配置" name="basic">
                        <BaiscConfigForm v-model:data={state.value.config.basic} />
                    </el-tab-pane>
                    <el-tab-pane label="邮箱配置" name="mail">
                        <MailConfigForm v-model:data={state.value.config.mail} />
                    </el-tab-pane>
                </el-tabs>
            </div>
        }
    },
    {
        name: "system-config",
    }
)

export default SystemConfigPage

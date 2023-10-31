import { ElFormItem, FormItemProps as OriginFormItemProps } from "element-plus"
import { defineComponent } from "vue"
import { QuestionCircleO } from "../icon/shapes/FontAwesome"
import "./style.scss"

export interface FormItemProps extends Partial<OriginFormItemProps> {
    tooltip?: string
}

export const FormItem = defineComponent(
    (props: FormItemProps, { slots }) => {


        const slotsMap = {
            label(val: any) {
                return <div class="form-item-label">
                    {val.label}
                    {
                        props.tooltip !== undefined ?
                            <el-tooltip
                                effect="dark"
                                content={props.tooltip}
                                placement="top"
                            ><span class="icon"><QuestionCircleO /></span></el-tooltip>
                            : undefined
                    }
                </div>
            },
            ...slots,
        }


        return () => {
            const { tooltip, ...rest } = props
            return <el-form-item {...rest} v-slots={slotsMap} />
        }
    },
    {
        name: "FormItem",
        props: {
            tooltip: {
                required: false,
                type: String,
            },
            ...ElFormItem.props

        }
    }
)


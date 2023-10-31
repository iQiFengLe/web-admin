
import { defineComponent, ref } from "vue"

import "./style.scss"

interface Props {
    title?: string,
    desc?: string,
    state?: 'success' | 'error' | 'info' | 'warning' | string,
    extra?: string,
    class?: string
}

const Result = defineComponent(
    (props: Props, { slots }) => {

        const state = ref<Props>(props)


        return () => {

            let nodes = []
            if (slots.icon) {
                nodes.push(<div class="result-icon">
                    {slots.icon()}
                </div>)
            } else {
                // TODO 成功 失败 其它
            }
            if (state.value.title !== undefined || slots.title) {
                nodes.push(<div class="result-title">
                    {slots.title ? slots.title() : state.value.title}
                </div>)
            }
            if (state.value.desc !== undefined || slots.desc) {
                nodes.push(<div class="result-desc">
                    {slots.desc ? slots.desc() : state.value.desc}
                </div>)
            }

            if (state.value.extra !== undefined || slots.extra) {
                nodes.push(<div class="result-extra">
                    {slots.extra ? slots.extra() : state.value.extra}
                </div>)
            }

            if (slots.actions) {
                nodes.push(<div class="result-actions">
                    {slots.actions()}
                </div>)
            }

            return <div class="result-container">
                {nodes}
            </div>
        }

    },
    {
        name: "Result",
        props: ['title', 'desc', 'state', 'extra', "class"]
    }
)

export default Result
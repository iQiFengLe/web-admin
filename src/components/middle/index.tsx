
import { defineComponent } from "vue"


import "./style.scss"


const Middle = defineComponent(
    (props: {}, {slots}) => {

        return () => {
            return <div class="layout-comp-middle">
                {slots.default?.()}
            </div>
        }

    }
)

export default Middle
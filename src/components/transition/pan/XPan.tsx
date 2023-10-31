
import { isEqual } from "lodash"
import { defineComponent, ref, watch } from "vue"
import "./style.scss"

const XPan = defineComponent(
    (props: {
        active: string,
    }, { slots }) => {

        
        const keys = ref<string[]>([])

        const index = ref(0)

        const styles = ref({
            transitionDuration: '0.3s',
            transform: `translateX(-${index.value * 100}%)`
        })

        const animate = () => {
            styles.value.transform = `translateX(-${index.value * 100}%)`
        }
        watch(() => index.value, () => {
            animate()
        })

        watch(() => props.active, (curr) => {
            index.value = keys.value.indexOf(curr)
        })

        return () => {
            const nodes = slots.default?.()
            const k = nodes?.map(v => v.key)
            if (k && !isEqual(k, keys.value)) {
                keys.value = k as string[]
                index.value = keys.value.indexOf(props.active)
            }

            return <div class="transition-pan-container">
                <div class="transition-x-pan" style={styles.value}>
                    {nodes}
                </div>
            </div>
        }

    }
)

XPan.props = ['active']

export default XPan
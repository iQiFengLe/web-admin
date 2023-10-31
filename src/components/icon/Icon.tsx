import { defineComponent } from "vue";


interface IconProps {
    size?: number | string,
    color?: string,
    clazz?: string,
}

const Icon = defineComponent((props: IconProps, { slots, attrs }) => {

    const styles: Record<string, any> = {}
    if (props.size !== undefined) {
        styles.fontSize = typeof props.size === 'string' ? props.size : props.size + 'px';
    }
    if (props.color !== undefined) {
        styles.color = props.color;
    }

    return () => {
        return <span class={`m-icon el-icon${props.clazz ? ` ${props.clazz}` : ''}`} style={styles}>
            {slots.default?.call(this)}
        </span>
    }

}, {
    props: ['clazz', 'size', 'color']
});

export default Icon;
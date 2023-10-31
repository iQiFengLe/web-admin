
import { defineComponent, ref } from "vue"

import "./style.scss"

interface ScrollContainerConfig {
    // 移动开始点
    moveStartX: number,
    // 移动点
    moveX: number,
    // x
    x: number,
    status: boolean,
    downTime: number
}
interface ScrollConfig {
    left: boolean,
    right: boolean,
    // 方向 left or right
    direction: "" | 'left' | 'right',
    // 动画id
    animateId: any,
    // 步长
    speed: number,
}
interface XDragMoveProps {
    scrollConfig?: Partial<ScrollConfig>,
    scrollContainerConfig?: Partial<ScrollContainerConfig>

}
const XDragMove = defineComponent((props: XDragMoveProps, { slots }) => {

    const $container = ref<HTMLElement>()
    // 滚动配置
    const scrollConfig = ref<ScrollConfig>(Object.assign({
        left: false,
        right: false,
        direction: "",
        animateId: null,
        speed: 3,
    }, props.scrollConfig || {}))
    // 滚动容器配置
    const scrollContainerConfig = ref<ScrollContainerConfig>(Object.assign({
        moveStartX: 0,
        moveX: 0,
        x: 0,
        status: false,
        downTime: 0
    }, props.scrollContainerConfig || {}))
    // 计算滚动信息
    const countScrollInfo = () => {
        if ($container.value) {
            const $el = $container.value
            let w = $el.scrollWidth - $el.clientWidth;
            scrollConfig.value.right = w > 0 && w > $el.scrollLeft;
            scrollConfig.value.left = w > 0 && $el.scrollLeft > 0;
        }
    }

    // 滚动动画
    const scroll = (speed?: number) => {
        let drag = $container.value as HTMLElement;
        let info = scrollConfig.value;
        speed = speed || info.speed;

        if (info.direction == "left" && info.left) {
            drag.scrollLeft =
                drag.scrollLeft - speed > 0 ? drag.scrollLeft - speed : 0;
        } else if (info.direction == "right" && info.right) {
            let w = drag.scrollWidth - drag.clientWidth;
            drag.scrollLeft =
                drag.scrollLeft + speed < w ? drag.scrollLeft + speed : w;
        }
        countScrollInfo();
    }

    // drag 滚动动画
    const startDragScroll = (d: 'left' | 'right' | '') => {
        scrollConfig.value.direction = d;
        if (scrollConfig.value.animateId === null) {
            let animate = () => {
                scroll();
                scrollConfig.value.animateId = requestAnimationFrame(animate);
            };
            scrollConfig.value.animateId = requestAnimationFrame(animate);
        }
    }

    // 停止滚动
    const stopDragScroll = () => {
        cancelAnimationFrame(scrollConfig.value.animateId);
        scrollConfig.value.animateId = null;
    }

    // 移动
    const onDragContainerMouseMove = (ev: MouseEvent) => {
        let x = ev.clientX - scrollContainerConfig.value.moveStartX;
        if (
            new Date().getTime() - scrollContainerConfig.value.downTime >=
            100
        ) {
            scrollContainerConfig.value.status = true;
            scrollConfig.value.direction = x > 0 ? "left" : "right";
            scroll(Math.abs(x));
            scrollContainerConfig.value.moveStartX = ev.clientX;
        }
    }

    // 松开
    const onDragContainerMouseUp = () => {
        window.removeEventListener(
            "mousemove",
            onDragContainerMouseMove
        );
        // 移除松开监听
        window.removeEventListener("mouseup", onDragContainerMouseUp);
        scrollContainerConfig.value.moveStartX = 0;
        scrollContainerConfig.value.x = 0;
        setTimeout(() => {
            scrollContainerConfig.value.status = false;
        }, 30);
    }

    // 按下
    const onDragContainerMousedown = (e: MouseEvent) => {
        scrollContainerConfig.value.moveStartX = e.clientX;
        scrollContainerConfig.value.downTime = new Date().getTime();

        window.addEventListener("mousemove", onDragContainerMouseMove);
        // 监听松开
        window.addEventListener("mouseup", onDragContainerMouseUp);
    }

    // 禁止拖拽
    const onDisableDraw = (e: Event) => {
        e.preventDefault();
        return false;
    }

    const startDragScrollLeft = startDragScroll.bind(this, "left")

    const startDragScrollRight = startDragScroll.bind(this, 'right')


    return () => {
        return <div class="x-drag x no-select">
            <div onMouseenter={startDragScrollLeft} onMouseleave={stopDragScroll}
                class={`scroll-arrow left${!scrollConfig.value.left ? ' disable' : ''}`}>

                {slots.prefix ? slots.prefix() : <i class="el-icon-d-arrow-left" > </i>}
            </div>

            <div class="`${prefix}-drag-container`" ref={$container} onDragstart={onDisableDraw}
                onMousedown={onDragContainerMousedown} onMouseup={onDragContainerMouseUp}>
                {slots.default?.call(this)}
            </div>

            < div onMouseenter={startDragScrollRight} onMouseleave={stopDragScroll}
                class={`scroll-arrow right${!scrollConfig.value.right ? ' disable' : ''}`} >
                {slots.suffix ? slots.suffix() : <i class="el-icon-d-arrow-right" > </i>}
            </div>
        </div>
    }
})

XDragMove.props = ['scrollContainerConfig', 'scrollConfig']

export default {
    XDragMove,
};
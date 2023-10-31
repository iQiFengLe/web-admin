
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import "./style.scss"

export const getElementIndex = (current: any, elList: HTMLCollection | undefined): number => {

    if (!current || !elList || !elList.length) return -1;

    for (let i = 0; i < elList.length; i++) {
        if (elList.item(i) === current)
            return i;
    }

    return -1;
}


// const eachCollection = (coll: HTMLCollection | undefined, cb: (e: HTMLElement) => boolean | void) => {
//     if (!coll) return;
//     for (let i = 0; i < coll.length; i++) {
//         if (cb(coll.item(i) as HTMLElement) === false)
//             break;
//     }
// }


type TargetHTMLElement = HTMLElement & { animated?: any | boolean }

// 读取操作模型数据，返回false 则会继续沿着DOM树向上查找
type ReadOperateModelType = (el: HTMLElement) => boolean | any

type ContainerType = HTMLElement | ((el?: HTMLElement) => HTMLElement)

// 操作模型结构
export interface OperateModel<D = any> {
    // 操作元素
    el: TargetHTMLElement,
    // 操作数据
    data: D,
    index: number,
}


export interface DragSwapCoreOption {
    // 动画时长
    duration?: number,
    // 交换事件
    onSwap?: (opt: { newModel: OperateModel, oldModel: OperateModel }) => void,

    // 读取操作模型
    readOperateModel: ReadOperateModelType,
    // 拖拽监听容器
    dragListenContainer: ContainerType,
    // 拖拽容器
    dragContainer?: ContainerType,
    // 是否允许交换
    isSwap?: (value: { newModel: OperateModel, oldModel: OperateModel }) => boolean,

    onDragStart?: () => void,

    onDragEnd?: () => void,

}



export class DragSwapCore {

    oldModel?: OperateModel

    newModel?: OperateModel

    // 监听方法集合
    listenMethods: Record<string, Function> = {}

    // 配置
    private props: DragSwapCoreOption

    constructor(option: DragSwapCoreOption) {
        this.props = Object.assign({
            duration: 300,
        }, option)
        this.listenMethods = {
            dragstart: this.onDragStart.bind(this),
            dragover: this.onDragOver.bind(this),
            dragend: this.onDragEnd.bind(this),
        }
    }

    setDragListenContainer(el: HTMLElement) {
        this.unlisten()
        this.props.dragListenContainer = el
    }


    listen() {
        this.unlisten()

        const container = this.getDragListenContainer()
        if (!container) {
            return
        }

        for (let k in this.listenMethods) {
            // @ts-ignore
            container.addEventListener(k, this.listenMethods[k])
        }
    }

    unlisten() {
        const container = this.getDragListenContainer()
        if (!container) {
            return
        }
        for (let k in this.listenMethods) {
            // @ts-ignore
            container.removeEventListener(k, this.listenMethods[k])
        }
    }

    /**
     * 获取操作模型
     * @param el 
     * @returns 
     */
    getOperateModel(el: HTMLElement | any): OperateModel | undefined {
        if (!el) return undefined;

        do {
            if (el instanceof HTMLElement) {

                const data = this.props.readOperateModel(el)
                if (data !== false) return {
                    el,
                    data,
                    index: getElementIndex(el, this.getDragContainer(el)?.children)
                };

            }
            el = el.parentNode as HTMLElement;
        } while (el && el !== document.body);

        return undefined;
    }

    /**
     * 获取拖拽监听容器元素
     * @param el 
     * @returns 
     */
    getDragListenContainer(el?: HTMLElement) {
        if (this.props.dragListenContainer instanceof Function) {
            return this.props.dragListenContainer(el)
        }
        return this.props.dragListenContainer
    }

    /**
     * 获取拖拽容器
     * @param el 
     * @returns 
     */
    getDragContainer(el: HTMLElement) {
        if (!this.props.dragContainer) {
            return this.getDragListenContainer(el)
        }
        if (this.props.dragContainer instanceof Function) {
            return this.props.dragContainer(el)
        }
        return this.props.dragContainer
    }


    getDragInfo(e: DragEvent | HTMLElement): { newModel: OperateModel, oldModel: OperateModel } | undefined {
        if (!this.oldModel) return undefined;

        const newModel = this.getOperateModel(e instanceof Event ? e.target : e);
        if (!newModel) return undefined;

        if (newModel.el === this.oldModel.el) return undefined;
        if (newModel.index === -1 || this.oldModel.index === -1) return undefined;

        return { newModel: newModel, oldModel: this.oldModel };
    }


    onDragStart(e: DragEvent) {
        this.props.onDragStart?.()
        this.oldModel = this.getOperateModel(e.target);
        // @ts-ignore
        e.dataTransfer?.setData("te", (e.target as HTMLElement).innerHTML); //不能使用text，firefox会打开新tab
        //event.dataTransfer.setData("self", event.target);
    }

    onDragEnd(e: DragEvent) {
        this.props.onDragEnd?.()
        const newModel = this.newModel as OperateModel
        const oldModel = (this.oldModel ? this.oldModel : this.getOperateModel(e.target)) as OperateModel
        
        this.oldModel = undefined;
        this.newModel = undefined;
        
        if(!oldModel || !newModel || oldModel.index === newModel.index) return


        const isSwap = this.props.isSwap ? this.props.isSwap({ oldModel, newModel }) : true

        if (isSwap) {
            this.props.onSwap?.({ oldModel, newModel })
        } else {
            // 将元素恢复至拖拽前位置
            const oldEl = oldModel.el
            const newEl = newModel.el
            // 重置
            const prveDragRect = oldEl.getBoundingClientRect()
            const prveTargetRect = newEl.getBoundingClientRect()

            const container = this.getDragContainer(oldEl)

            if (oldModel.index == 0) {
                // 插入到开头
                container.prepend(oldEl)
            } else if (oldModel.index === container.children.length - 1) {
                // 插入到结尾
                container.appendChild(oldEl)
            } else {
                const child =  container.children[oldModel.index]
                if (oldModel.index < newModel.index) {
                    // 向上
                    this.getDragContainer(oldEl).insertBefore(oldEl, child)
                } else {
                    // 向下
                    this.getDragContainer(oldEl).insertBefore(oldEl, child.nextSibling)
                }
            }
            this.animate(prveDragRect, oldEl)
            this.animate(prveTargetRect, newEl)
        }



    }

    onDragOver(e: DragEvent) {
        e.preventDefault();

        const info = this.getDragInfo(e)
        if (!info) return;
        const { newModel, oldModel } = info

        if (newModel.el.animated) return

        const oldEl = oldModel.el
        const newEl = newModel.el

        const prveDragRect = oldEl.getBoundingClientRect();
        const prveTargetRect = newEl.getBoundingClientRect();

        if (oldModel.index < newModel.index) {
            // 向下
            this.getDragContainer(oldEl).insertBefore(oldEl, newEl.nextSibling)
        } else {
            // 向上
            this.getDragContainer(oldEl).insertBefore(oldEl, newEl)
        }
        this.newModel = newModel
        this.animate(prveDragRect, oldEl)
        this.animate(prveTargetRect, newEl)
    }

    animate(prevRect: DOMRect, target: TargetHTMLElement) {
        const duration = this.props.duration as number
        if (duration > 0) {
            let currentRect = target.getBoundingClientRect()
            target.style.transition = 'none';
            target.style.transform = `translate3d(${prevRect.left - currentRect.left}px, ${prevRect.top - currentRect.top}px, 0)`;

            if (target.offsetWidth) {
                // 该语句主要为触发重绘
            }

            target.style.transition = `all ${duration}ms`;
            target.style.transform = 'translate3d(0,0,0)';

            // 事件到了之后把transition和transform清空
            clearTimeout(target.animated);
            target.animated = setTimeout(function () {
                target.style.transition = '';
                target.style.transform = '';
                target.animated = false;
            }, duration);
        }
    }
}

interface DragSwapProps {
    onSwap?: DragSwapCoreOption["onSwap"],
    readOperateModel?: DragSwapCoreOption["readOperateModel"],
    dragContainer?: DragSwapCoreOption["dragContainer"]
}

const DragSwap = defineComponent(
    (props: DragSwapProps, { slots, emit }) => {

        const readOperateModel = (el: HTMLElement) => {
            return el.getAttribute('data-drag-id')
        }

        const containerRef = ref<HTMLDivElement>();
        const dragCore = new DragSwapCore({
            dragListenContainer: () => {
                return containerRef.value as HTMLElement
            },
            readOperateModel: props.readOperateModel || readOperateModel,
            dragContainer: props.dragContainer,
            onSwap(opt) {
                console.log('xxxx')
                emit('swap', opt)
            },
        })

        onMounted(() => {
            dragCore.listen()
        })
        onUnmounted(() => {
            dragCore.unlisten()
        })
        return () => {
            return <div ref={containerRef}>{slots.default?.()}</div>
        }
    }
)
DragSwap.props = ['readOperateModel', 'dragContainer']
DragSwap.emits = ['swap']

export default DragSwap


import { Close, Refresh, Minus, Stop } from "@/components/icon/shapes/FontAwesome"
import { FullScreen } from "@element-plus/icons-vue"
import { computed, defineComponent, nextTick, ref, watchEffect } from "vue"
import "./styles/nav-tabs.scss"
import { useRouter } from "vue-router"
import { useNavStore } from "@/store/nav"


const NavTabs = defineComponent(() => {


    const items = ref<HTMLDivElement[]>([]);

    const active = ref<HTMLDivElement>();

    const router = useRouter()

    const addItems = (el: any) => {
        if (el) {
            items.value.push(el)
        }
    }
    const store = useNavStore()

    const navTabs = computed(() => store.tabs)

    const activeTab = computed(() => store.activeTab)

    const setActiveStyles = ($el?: HTMLElement) => {
        if ($el && $el.classList.contains('nav-tabs-item'))
            $el = $el.parentNode as HTMLElement

        if ($el && active.value) {

            active.value.style.width = $el.clientWidth + 'px'
            active.value.style.left = $el.offsetLeft + 'px'
        }
    }

    const swtichActiveTab = (e: Event) => {
        if ((e.target as HTMLElement).classList.contains('nav-tabs-item')) {
            const el = (e.target as HTMLElement)
            const tab = navTabs.value.find(v => v.id === el.dataset.id)
            if (tab) {
                setActiveStyles(el)
                if (tab.route) {
                    router.push(tab.route)
                }
            }
        }
    }

    const removeNavTab = (id: string | number) => {
        store.removeTab(id)
        nextTick(() => {
            setActiveStyles(items?.value[0])
        })
    }

    watchEffect(() => {
        const tab = activeTab.value
        if (tab) {
            setActiveStyles(items.value.find(el => el.dataset.id === tab.id))
        }
    })

    const onTabsCommand = (command: string) => {
        switch (command) {
            case 'reload':
                break;
            case 'close':
                break;
            case 'fullScreen':
                break;
            case 'closeOther':
                break;
            case 'closeAll':
                break;
        }
    }

    const itemslots = {
        dropdown: () => {
            return <el-dropdown-menu>
                <el-dropdown-item command="reload"><m-icon style={{ marginRight: "5px" }}><Refresh /></m-icon> 重新加载</el-dropdown-item>
                <el-dropdown-item command="close"><m-icon style={{ marginRight: "5px" }}><Close /></m-icon> 关闭标签</el-dropdown-item>
                <el-dropdown-item command="fullScreen"><m-icon style={{ marginRight: "5px" }}><el-icon><FullScreen /></el-icon></m-icon> 当前标签全屏</el-dropdown-item>
                <el-dropdown-item command="closeOther"><m-icon style={{ marginRight: "5px" }}><Minus /></m-icon> 关闭其它标签</el-dropdown-item>
                <el-dropdown-item command="closeAll"><m-icon style={{ marginRight: "5px" }}><Stop /></m-icon> 关闭全部标签</el-dropdown-item>
            </el-dropdown-menu>
        }
    }



    return () => {
        const tabs = navTabs.value.map((v) => {
            return <el-dropdown onCommand={onTabsCommand} trigger="contextmenu" placement="bottom" v-slots={itemslots}>
                <div class="nav-tabs-item" ref={addItems} data-id={v.id} onClick={swtichActiveTab}>
                    {v.title}
                    <m-icon clazz="nav-tabs-item-close" onClick={removeNavTab.bind(this, v.id)}><Close /></m-icon>
                </div>
            </el-dropdown>
        })

        return <section class="nav-tabs">
            {tabs}
            <div class="nav-tabs-item-active" ref={active}></div>
        </section>
    }

});

export default NavTabs;
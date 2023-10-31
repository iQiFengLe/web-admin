import { Cogs, Compress, Expand } from "@/components/icon/shapes/FontAwesome";
import { Monitor } from "@element-plus/icons-vue";
import { defineComponent, ref } from "vue"
import "./styles/nav-menu.scss"


const NavMenu = defineComponent(() => {

    const state = ref<{
        isFullScreen: boolean,
    }>({
        isFullScreen: false
    })


    const eventMethods = {
        onFullScreen() {
            if (state.value.isFullScreen) {
                document.exitFullscreen?.();
            } else {
                document.documentElement.requestFullscreen?.();
            }
            state.value.isFullScreen = !state.value.isFullScreen
        }
    }

    return () => {
        return <section class="nav-menu">
            <div class="nav-menu-item hover-scale" title="首页">
                <m-icon><Monitor /></m-icon>
            </div>
            <div class="nav-menu-item hover-scale" title={`${state.value.isFullScreen ? '取消全屏' : '全屏'}`} onClick={eventMethods.onFullScreen}>
                <m-icon>{state.value.isFullScreen ? <Compress /> : <Expand />}</m-icon>
            </div>
            <div class="nav-menu-item">
                <el-avatar shape="circle" size={25}></el-avatar>
                <span style={{ marginLeft: '5px' }}>Admin</span>
            </div>
            <div class="nav-menu-item hover-scale">
                <m-icon><Cogs /></m-icon>
            </div>
        </section>

    }



})


export default NavMenu;
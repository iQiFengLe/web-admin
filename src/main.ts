import { createApp } from 'vue'
import './styles/index.scss'
import App from './App'
import ElementPlus from 'element-plus'
import { RouterView, RouterLink } from "vue-router"
import Icon from './components/icon/Icon'
import VNode from "./components/VNode"
import { router } from "./common/router"
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.component('router-view', RouterView)
app.component('router-link', RouterLink)
app.component('m-icon', Icon)
app.component('v-node', VNode)
app.use(router)
app.use(ElementPlus)

app.config.performance = true
app.mount('#app')

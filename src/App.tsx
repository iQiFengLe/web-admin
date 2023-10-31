import { ElConfigProvider } from 'element-plus';
import { defineComponent } from 'vue';
import DefaultLayout from './layout/default';
// import zhCn from 'element-plus/lib/locale/lang/zh-cn'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const App = defineComponent(
	() => {
		return () => {
			return <ElConfigProvider locale={zhCn}>
				<DefaultLayout />
			</ElConfigProvider>
		}
	}
)

export default App;
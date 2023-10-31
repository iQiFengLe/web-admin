import { defineStore } from "pinia"
import { RouteRecordRaw } from "vue-router"

export interface TabNode {
    title: string,
    closed: boolean,
    id: string | number,
    route?: RouteRecordRaw,
}
export interface NavState {
    tabs: TabNode[],
    activeTab: Partial<TabNode> & { id: string | number } | null | undefined
}

const useNavStore = defineStore('navStore', {
    state(): NavState {
        return {
            tabs: [],
            activeTab: undefined
        }
    },
    actions: {
        addTab(node: TabNode) {

            const index = this.tabs.findIndex((v) => v.id === node.id)
            if (index == -1) {
                this.tabs.push(node)
            }
            this.setActiveTab(node.id)
        },
    
        setActiveTab(val: string | number | null) {
            if (val === null || val === undefined) {
                this.activeTab = null
                return
            }
    
            const node = this.tabs.find((v) => v.id === val)
            if (node) {
                this.activeTab = node
            }
        },
    
        removeTab(val: string | number) {
            const index = this.tabs.findIndex((v) => v.id === val);
    
    
            if (index > -1) {
                const activeNode = this.tabs.length - 1 >= index && index != 0 ? this.tabs[index - 1] : null
                this.tabs.splice(index, 1)
                this.setActiveTab(activeNode ? activeNode.id : null)
            }
        },
    
        clearTab() {
            if (this.tabs.length) {
                this.tabs.slice(0, this.tabs.length)
            }
            this.setActiveTab(null)
        }
    }
})

export {
    useNavStore
}

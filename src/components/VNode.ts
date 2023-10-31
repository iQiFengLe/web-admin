
import { defineComponent } from "vue"


const VNode = defineComponent({
    name: 'v-node',
    
    props: {
        node: Object,
    },
    render(){
        return this.node;
    }    
});



export default VNode;

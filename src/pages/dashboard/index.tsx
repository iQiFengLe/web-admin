
import { defineComponent, onMounted, onUnmounted, ref } from "vue"
import { Line } from "vue-chartjs"
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    ChartData,
    ChartOptions,
    LineController,
    Filler,
} from 'chart.js'
import { maxNumber } from "@/utils"
import gsap from "gsap"

import welcomeImgUrl from "@/assets/images/welcome.svg"
import coffeeImgUrl from "@/assets/images/coffee.svg"

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
)

import "./style.scss"
import { AngleRight } from "@/components/icon/shapes/FontAwesome"

// ********* 数据汇总组件-开始 *********
const DataOverviewComponent = defineComponent(() => {
    const dataOverview = ref({
        registerNumber: 0,
        uploadNumber: 0,
        memberNumber: 0,
        articleNumber: 0,
    })

    onMounted(() => {
        gsap.to(dataOverview.value, {
            duration: 1.5,
            registerNumber: 65963,
            uploadNumber: 863269,
            memberNumber: 100632,
            articleNumber: 63500,
        })
    })

    return () => {
        return <el-row gutter={16}>
            <el-col span={6}>
                <div class="data-overview-card">
                    <div class="data-overview-card-title">注册量</div>
                    <div class="data-overview-card-content">
                        <div class="content-left">
                            {dataOverview.value.registerNumber.toFixed(0)}
                        </div>
                        <div class="content-right">
                            + 80%
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col span={6}>
                <div class="data-overview-card">
                    <div class="data-overview-card-title">附加上传量</div>
                    <div class="data-overview-card-content">
                        <div class="content-left">
                            {dataOverview.value.uploadNumber.toFixed(0)}
                        </div>
                        <div class="content-right">
                            + 1%
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col span={6}>
                <div class="data-overview-card">
                    <div class="data-overview-card-title">会员总数</div>
                    <div class="data-overview-card-content">
                        <div class="content-left">
                            {dataOverview.value.memberNumber.toFixed(0)}
                        </div>
                        <div class="content-right">
                            + 2%
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col span={6}>
                <div class="data-overview-card">
                    <div class="data-overview-card-title">文章总数</div>
                    <div class="data-overview-card-content">
                        <div class="content-left">
                            {dataOverview.value.articleNumber.toFixed(0)}
                        </div>
                        <div class="content-right">
                            + 0.85%
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    }
})
// ********* 数据汇总组件-结束 *********

interface MemberChartsInfoProps {
    height?: number
}
// 会员信息图表
const MemberChartsInfo = defineComponent<MemberChartsInfoProps>((props) => {

    // const cvs = ref<HTMLCanvasElement>()

    const chartData: ChartData<'line'> = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        datasets: [
            {
                label: "访问量",
                fill: "origin",
                // @ts-ignore
                lineTension: 0.4,
                backgroundColor: "rgba(50,50,200,0.4)",
                borderColor: "rgba(50,50,200,1)",
                data: [40, 39, 10, 40, 39, 80, 40],
                animation: {
                    easing: "easeInOutQuart"
                },
                borderWidth: 2,
            },
            {
                label: "注册量",
                fill: "origin",
                // @ts-ignore
                lineTension: 0.4,
                backgroundColor: "rgba(200,100,200,0.4)",
                borderColor: "rgba(200,100,200,1)",
                data: [10, 30, 80, 0, 20, 75, 25],
                animation: {
                    easing: "easeInOutQuart"
                },
                borderWidth: 2,
            }
        ],
    }


    const yMax = maxNumber(chartData.datasets.map(v => maxNumber((v.data as number[]))));
    const chartOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
            y: {
                min: 0,
                max: yMax + yMax * 0.25,
            },
            x: {
                grid: {
                    display: false,
                    color: 'rgba(0,0,0, 0.6)'
                },
            }
        },


    }

    return () => {
        return <Line
            data={chartData} options={chartOptions} />
    }
}, {
    name: "MemberChartsInfo",
    props: ['height']
})

const initDateTime = Math.floor(new Date().getTime() / 1000);

const WorkingComponent = defineComponent(() => {


    const hourTime = ref("00小时00分00秒")

    const refresh = ref(false)

    const countTime = () => {

        const time = Math.floor(new Date().getTime() / 1000) - initDateTime

        if (time == 0) {
            hourTime.value = "00小时00分00秒";
        } else if (time < 60) {
            hourTime.value = `00小时00分${time}秒`;
        } else if (time < 3600) {
            hourTime.value = `00小时${Math.floor(time / 60)}分${(time % 60)}秒`;
        } else {
            let lastSec = time % 3600;
            const minute = lastSec < 60 ? 0 : Math.floor(lastSec / 60)
            lastSec = lastSec - minute * 60;
            hourTime.value = `${Math.floor(time / 3600)}小时${minute}分${lastSec}秒`;
        }
    }

    let timer = ref<number | null>(null);
    onMounted(() => {
        timer.value = setInterval(countTime, 1000)
    })

    onUnmounted(() => {
        timer.value && clearInterval(timer.value)
        timer.value = null
    })

    const onStartOrStop = () => {
        if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
        } else {
            timer.value = setInterval(countTime, 1000)
        }
    }

    return () => {
        return <div class="working">
            <img class="working-img" src={coffeeImgUrl} alt="" />
            <div class="working-text">
                您今天已工作了
                <span class="time">{hourTime.value}</span>
            </div>
            <div class="working-opt" onClick={onStartOrStop}>{timer.value === null ? '继续工作' : '休息片刻'}</div>
        </div>
    }

})


const timestampToFriendlyString = (time: number): string => {
    const items = [
        { min: 0, max: 60, unit: '秒' },
        { min: 60, max: 3600, unit: '分钟' },
        { min: 3600, max: 86400, unit: '小时' },
        { min: 86400, max: 86400 * 30, unit: '天' },
        { min: 86400 * 30, max: 86400 * 30 * 12, unit: '月' },
        { min: 86400 * 30 * 12, max: -1, unit: '年' },
    ]

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.min == 0 && item.max > time) {
            return time + item.unit
        }
        if ((item.max == -1 || item.max > time) && item.min <= time) {
            return Math.floor(time / item.min) + item.unit
        }
    }
    return ''
}

const getWebcomeSlogan = () => {

    const hour = new Date().getHours();

    const items = [
        { min: 0, max: 8, msg: '早上好！' },
        { min: 8, max: 11, msg: '上午好！' },
        { min: 11, max: 13, msg: '中午好！' },
        { min: 13, max: 18, msg: '下午好！' },
        { min: 18, max: 24, msg: '晚上好！' },
    ]
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        0
        if (item.max > hour && item.min <= hour) {
            return item.msg
        }
    }
    return ''
}

const exampleData = {
    newUsers: [
        {
            name: "马上开花",
            time: 16 * 60,
            avatar: '',
        },
        {
            name: "PX",
            time: 8 * 60,
            avatar: '',
        },
        {
            name: "操纵",
            time: 36,
            avatar: '',
        },
        {
            name: "纵",
            time: 6,
            avatar: '',
        }
    ]
};

// 仪表盘组件
const Dashboard = defineComponent(() => {

    const newUsers = ref(exampleData.newUsers)

    return () => {
        return <el-space size={20} direction="vertical" style={{ display: 'flex' }} alignment="stretch">
            <el-row gutter={16}>
                <el-col span={18}>
                    <div class="welcome">
                        <img class="welcome-img" src={welcomeImgUrl} alt="" />
                        <div class="welcome-text">
                            <div class="welcome-title">
                                超级管理员，{getWebcomeSlogan()}
                            </div>
                            <div class="welcome-note">
                                开源等于互助；开源需要大家一起来支持，支持的方式有很多种，比如使用、推荐、写教程、保护生态、贡献代码、回答问题、分享经验、打赏赞助等；
                            </div>
                        </div>
                    </div>
                </el-col>
                <el-col span={6}>
                    <WorkingComponent />
                </el-col>
            </el-row>
            <DataOverviewComponent />
            <el-row gutter={16}>
                <el-col span={9}>
                    <el-card shadow="hover" header="会员增长情况" bodyStyle={{ padding: "10px 15px" }}>
                        <MemberChartsInfo />
                    </el-card>
                </el-col>
                <el-col span={9}>
                    <el-card shadow="hover" header="会员信息" bodyStyle={{ padding: "10px 15px" }}>
                        <MemberChartsInfo />
                    </el-card>
                </el-col>
                <el-col span={6}>
                    <el-card shadow="hover" v-slots={{ header: () => "刚刚加入的会员" }} bodyStyle={{ padding: "0px", height: "300px" }}>
                        <el-scrollbar>
                            {newUsers.value?.map(v => {
                                return <div class="new-user-item">
                                    <el-avatar size={45} src={v.avatar}>
                                        无
                                    </el-avatar>
                                    <div class="new-user-base">
                                        <div class="new-user-base-name">{v.name}</div>
                                        <div class="new-user-base-time">{timestampToFriendlyString(v.time)}前加入了</div>
                                    </div>
                                    <m-icon class="new-user-arrow"><AngleRight /></m-icon>
                                </div>
                            })}
                        </el-scrollbar>
                    </el-card>
                </el-col>
            </el-row>
        </el-space>
    }
}, {
    name: "dashboard"
})
export default Dashboard
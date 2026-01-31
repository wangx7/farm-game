import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'
import { useUserStore } from './user'

export const useFarmStore = defineStore('farm', () => {
    const plots = ref([])
    const crops = ref([])
    const loading = ref(false)

    async function fetchFarm() {
        loading.value = true
        try {
            const res = await api.get('/farm')
            plots.value = res.plots
            crops.value = res.crops

            const userStore = useUserStore()
            userStore.updateUser(res.user)

            return res
        } finally {
            loading.value = false
        }
    }

    async function plant(plotIndex, cropType) {
        const res = await api.post('/farm/plant', { plotIndex, cropType })

        // 更新地块
        const index = plots.value.findIndex(p => p.plot_index === plotIndex)
        if (index !== -1) {
            plots.value[index] = res.plot
        }

        // 更新用户金币
        const userStore = useUserStore()
        userStore.updateUser(res.user)

        return res
    }

    async function harvest(plotIndex) {
        const res = await api.post('/farm/harvest', { plotIndex })

        // 清空地块
        const index = plots.value.findIndex(p => p.plot_index === plotIndex)
        if (index !== -1) {
            plots.value[index] = {
                ...plots.value[index],
                crop_type: null,
                planted_at: null,
                stage: 0,
                isReady: false
            }
        }

        // 更新用户
        const userStore = useUserStore()
        userStore.updateUser(res.user)

        return res
    }

    return {
        plots,
        crops,
        loading,
        fetchFarm,
        plant,
        harvest
    }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useUserStore = defineStore('user', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const token = ref(localStorage.getItem('token') || '')

    const isLoggedIn = computed(() => !!token.value && !!user.value)

    async function login(username, password) {
        const res = await api.post('/auth/login', { username, password })
        token.value = res.token
        user.value = res.user
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        return res
    }

    async function register(username, password) {
        const res = await api.post('/auth/register', { username, password })
        token.value = res.token
        user.value = res.user
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        return res
    }

    function logout() {
        token.value = ''
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    function updateUser(newUser) {
        user.value = newUser
        localStorage.setItem('user', JSON.stringify(newUser))
    }

    return {
        user,
        token,
        isLoggedIn,
        login,
        register,
        logout,
        updateUser
    }
})

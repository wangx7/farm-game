import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useFriendsStore = defineStore('friends', () => {
    const friends = ref([])
    const searchResults = ref([])
    const loading = ref(false)

    async function fetchFriends() {
        loading.value = true
        try {
            const res = await api.get('/friends')
            friends.value = res.friends
            return res
        } finally {
            loading.value = false
        }
    }

    async function searchUsers(keyword) {
        if (!keyword) {
            searchResults.value = []
            return
        }
        const res = await api.get('/friends/search', { params: { keyword } })
        searchResults.value = res.users
        return res
    }

    async function addFriend(friendId) {
        const res = await api.post('/friends/add', { friendId })
        await fetchFriends()
        return res
    }

    async function removeFriend(friendId) {
        await api.delete(`/friends/${friendId}`)
        friends.value = friends.value.filter(f => f.id !== friendId)
    }

    return {
        friends,
        searchResults,
        loading,
        fetchFriends,
        searchUsers,
        addFriend,
        removeFriend
    }
})

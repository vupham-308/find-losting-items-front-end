import { useAuthStore } from "../stores/authStore.js"

// Hook tiện dụng cho component: lấy state + action auth từ store.
// Chọn từng field bằng selector để component chỉ re-render khi field đó đổi.
export function useAuth() {
    const user = useAuthStore((s) => s.user)
    const login = useAuthStore((s) => s.login)
    const register = useAuthStore((s) => s.register)
    const googleLogin = useAuthStore((s) => s.googleLogin)
    const logout = useAuthStore((s) => s.logout)

    return { user, login, register, googleLogin, logout }
}

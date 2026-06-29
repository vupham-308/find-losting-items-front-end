import { create } from "zustand"
import { persist } from "zustand/middleware"
import * as authService from "../services/authService.js"

// Store toàn cục giữ trạng thái đăng nhập (user, token).
// persist tự đồng bộ vào localStorage (key "auth-storage") nên không cần lưu tay.
export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,

            login: async (credentials) => {
                const res = await authService.login(credentials)
                const user = res?.data ?? null
                set({ user, token: user?.accessToken ?? null })
                return user
            },

            register: async (data) => {
                const res = await authService.register(data)
                const user = res?.data ?? null
                set({ user, token: user?.accessToken ?? null })
                return user
            },

            googleLogin: async (payload) => {
                const res = await authService.googleLogin(payload)
                const user = res?.data ?? null
                set({ user, token: user?.accessToken ?? null })
                return user
            },

            logout: async () => {
                try {
                    await authService.logout()
                } catch {
                    // bỏ qua lỗi server, vẫn đăng xuất phía client
                } finally {
                    set({ user: null, token: null })
                }
            },

            // Cập nhật access token mới (dùng khi refresh token thành công).
            setToken: (token) => set({ token }),

            // Xoá toàn bộ auth state (dùng khi refresh token thất bại → buộc đăng xuất).
            clearAuth: () => set({ user: null, token: null }),
        }),
        { name: "auth-storage" }
    )
)

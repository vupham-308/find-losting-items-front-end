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
            // Đã có mật khẩu cục bộ chưa? null = chưa xác định (phiên cũ), true/false = đã biết.
            // Dùng để bắt buộc tài khoản Google thiết lập mật khẩu trước khi vào app.
            hasPassword: null,

            login: async (credentials) => {
                const res = await authService.login(credentials)
                const user = res?.data ?? null
                // Đăng nhập bằng email/mật khẩu ⇒ chắc chắn đã có mật khẩu cục bộ.
                set({ user, token: user?.accessToken ?? null, hasPassword: true })
                return user
            },

            register: async (data) => {
                const res = await authService.register(data)
                const user = res?.data ?? null
                // Đăng ký luôn kèm mật khẩu ⇒ đã có mật khẩu cục bộ.
                set({ user, token: user?.accessToken ?? null, hasPassword: true })
                return user
            },

            googleLogin: async (payload) => {
                const res = await authService.googleLogin(payload)
                const user = res?.data ?? null
                // Đặt token trước để getMe() bên dưới đính kèm được Bearer token.
                set({ user, token: user?.accessToken ?? null })

                // Xác định tài khoản đã có mật khẩu cục bộ chưa.
                // Ưu tiên field từ response; nếu backend không trả thì hỏi getMe().
                let hasPassword = user?.hasPassword
                if (hasPassword === undefined || hasPassword === null) {
                    try {
                        const me = await authService.getMe()
                        hasPassword = me?.data?.hasPassword
                    } catch {
                        // Không xác định được → coi như đã có để tránh khoá nhầm người dùng.
                        hasPassword = true
                    }
                }
                set({ hasPassword: !!hasPassword })
                return user
            },

            logout: async () => {
                try {
                    await authService.logout()
                } catch {
                    // bỏ qua lỗi server, vẫn đăng xuất phía client
                } finally {
                    set({ user: null, token: null, hasPassword: null })
                }
            },

            // Cập nhật access token mới (dùng khi refresh token thành công).
            setToken: (token) => set({ token }),

            // Đánh dấu đã thiết lập mật khẩu cục bộ (dùng sau khi setup thành công).
            setHasPassword: (hasPassword) => set({ hasPassword }),

            // Xoá toàn bộ auth state (dùng khi refresh token thất bại → buộc đăng xuất).
            clearAuth: () => set({ user: null, token: null, hasPassword: null }),
        }),
        { name: "auth-storage" }
    )
)

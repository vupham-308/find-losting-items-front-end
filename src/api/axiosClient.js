import axios from "axios"
import { useAuthStore } from "../stores/authStore.js"

// Instance axios dùng chung cho toàn app.
// baseURL để rỗng khi dev (request /api đi qua Vite proxy); đặt VITE_API_URL khi build production.
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "",
    headers: { "Content-Type": "application/json" },
})

// Request interceptor: tự gắn Bearer token (lấy từ store, dùng getState() ngoài React).
axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Response interceptor: trả thẳng response.data và chuẩn hoá lỗi thành Error có message dễ đọc.
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const data = error.response?.data
        const message =
            data?.message || data?.title || data?.error || error.message || "Đã có lỗi xảy ra"
        const err = new Error(message)
        err.status = error.response?.status
        err.data = data
        return Promise.reject(err)
    }
)

export default axiosClient

import axios from "axios"
import { useAuthStore } from "../stores/authStore.js"
import { AUTH_ENDPOINTS } from "./endpoints.js"

// Instance axios dùng chung cho toàn app.
// baseURL để rỗng khi dev (request /api đi qua Vite proxy); đặt VITE_API_URL khi build production.
const axiosClient = axios.create({
    // Dev: để rỗng → request /api đi qua Vite proxy (same-origin) nên cookie SameSite=Lax
    // mới được browser chấp nhận. Production: đặt VITE_API_URL để trỏ thẳng backend.
    baseURL: "https://sba301-lost-and-found-backend.onrender.com",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Gửi/nhận cookie (refresh token) với mọi request
})

// Request interceptor: tự gắn Bearer token (lấy từ store, dùng getState() ngoài React).
axiosClient.interceptors.request.use((config) => {
    // Không gắn Bearer token cho refresh endpoint — endpoint này chỉ cần cookie,
    // nếu gắn token hết hạn, Spring Security sẽ redirect (302) → browser chuyển POST thành GET → 405.
    if (config.url !== AUTH_ENDPOINTS.refreshToken) {
        const token = useAuthStore.getState().token
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    // Debug: log mọi request để tìm lỗi 405 GET
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
})

// ---------- Auto Refresh Token ----------
// Dùng biến module-level để tránh gọi refresh song song (race condition).
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token)
    })
    failedQueue = []
}

// Response interceptor: trả thẳng response.data và chuẩn hoá lỗi thành Error có message dễ đọc.
axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config

        // Nếu lỗi 401 và chưa retry → thử refresh token.
        // Chỉ refresh khi đang có token (tức là từng có phiên, có thể đã hết hạn).
        // Nếu chưa đăng nhập (không có token), refresh chắc chắn vô nghĩa và còn ném
        // "Network Error" (backend không bật Access-Control-Allow-Credentials) → bỏ qua,
        // để lỗi 401 thật của backend được hiển thị thay vì "Network Error".
        if (
            error.response?.status === 401 &&
            useAuthStore.getState().token &&
            !originalRequest._retry &&
            originalRequest.url !== AUTH_ENDPOINTS.refreshToken &&
            originalRequest.url !== AUTH_ENDPOINTS.login
        ) {
            // Nếu đang refresh → xếp hàng chờ
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return axiosClient(originalRequest)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Gọi API refresh — refresh token nằm trong HTTP-only cookie.
                // Dùng axiosClient (không phải axios gốc) để giữ đúng baseURL, headers, withCredentials.
                // Vòng lặp vô hạn không xảy ra vì condition ở trên đã loại trừ url === refreshToken.
                const res = await axiosClient.post(AUTH_ENDPOINTS.refreshToken)
                // axiosClient interceptor đã unwrap response.data →
                // res = envelope { status, message, data: { accessToken, ... } }
                const newToken = res?.data?.accessToken ?? res?.accessToken
                console.log("[Refresh Token] Response:", { hasToken: !!newToken, res })
                if (newToken) {
                    // Cập nhật token mới vào store
                    useAuthStore.getState().setToken(newToken)
                    // Retry các request đang chờ
                    processQueue(null, newToken)
                    // Retry request gốc
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return axiosClient(originalRequest)
                }
                throw new Error("Không nhận được access token mới")
            } catch (refreshError) {
                processQueue(refreshError, null)
                // Refresh thất bại → đăng xuất
                useAuthStore.getState().clearAuth()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Lỗi khác: chuẩn hoá thành Error có message dễ đọc
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

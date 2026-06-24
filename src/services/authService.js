// Lớp service: chỉ gọi API và trả dữ liệu (thuần, không đụng state/localStorage).
// Việc lưu token/user do stores/authStore.js lo.

import axiosClient from "../api/axiosClient.js"
import { AUTH_ENDPOINTS } from "../api/endpoints.js"

// axiosClient đã trả về response.data (envelope dạng { status, message, data, ... })

export function login({ mail, password }) {
    return axiosClient.post(AUTH_ENDPOINTS.login, { mail, password })
}

export function register({ name, mail, password, phone }) {
    return axiosClient.post(AUTH_ENDPOINTS.register, { name, mail, password, phone })
}

// Đăng nhập/đăng ký bằng Google: gửi idToken lấy từ Google Identity Services.
export function googleLogin({ idToken }) {
    return axiosClient.post(AUTH_ENDPOINTS.google, { idToken })
}

export function logout() {
    return axiosClient.post(AUTH_ENDPOINTS.logout)
}

// Quên mật khẩu: backend gửi mã OTP tới email.
export function forgotPassword({ mail }) {
    return axiosClient.post(AUTH_ENDPOINTS.forgotPassword, { mail })
}

// Đặt lại mật khẩu bằng mã OTP.
export function resetPassword({ mail, otp, newPassword }) {
    return axiosClient.post(AUTH_ENDPOINTS.resetPassword, { mail, otp, newPassword })
}

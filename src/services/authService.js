// Lớp service: chỉ gọi API và trả dữ liệu (thuần, không đụng state/localStorage).
// Việc lưu token/user do stores/authStore.js lo.

import axiosClient from "../api/axiosClient.js"
import { AUTH_ENDPOINTS } from "../api/endpoints.js"

// axiosClient đã trả về response.data (envelope dạng { status, message, data, ... })

export function login({ mail, password }) {
    return axiosClient.post(AUTH_ENDPOINTS.login, { mail, password }, { withCredentials: true })
}

export function register({ name, mail, password, phone }) {
    return axiosClient.post(AUTH_ENDPOINTS.register, { name, mail, password, phone }, { withCredentials: true })
}

// Đăng nhập/đăng ký bằng Google: gửi idToken lấy từ Google Identity Services.
export function googleLogin({ idToken }) {
    return axiosClient.post(AUTH_ENDPOINTS.google, { idToken }, { withCredentials: true })
}

export function logout() {
    return axiosClient.post(AUTH_ENDPOINTS.logout, null, { withCredentials: true })
}

// Quên mật khẩu: backend gửi mã OTP tới email.
export function forgotPassword({ mail }) {
    return axiosClient.post(AUTH_ENDPOINTS.forgotPassword, { mail })
}

// Đặt lại mật khẩu bằng mã OTP.
export function resetPassword({ mail, otp, newPassword }) {
    return axiosClient.post(AUTH_ENDPOINTS.resetPassword, { mail, otp, newPassword })
}

// Làm mới access token bằng refresh token (gửi qua HTTP-only cookie).
export function refreshToken() {
    return axiosClient.post(AUTH_ENDPOINTS.refreshToken, null, { withCredentials: true })
}

// Lấy thông tin người dùng hiện tại (cần Bearer token).
export function getMe() {
    return axiosClient.get(AUTH_ENDPOINTS.me)
}

// Thiết lập mật khẩu cục bộ cho tài khoản Google (chưa có password).
export function setupPassword({ newPassword, confirmPassword }) {
    return axiosClient.post(AUTH_ENDPOINTS.setupPassword, { newPassword, confirmPassword })
}

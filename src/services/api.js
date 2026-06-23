// API client dùng chung cho toàn bộ app.
// Base URL lấy từ biến môi trường VITE_API_URL (xem file .env).

const BASE_URL = import.meta.env.VITE_API_URL ?? ""

// Lấy token đã lưu (nếu có) để gắn vào header Authorization
export function getToken() {
    return localStorage.getItem("token")
}

// Hàm gọi API chung: tự gắn base URL, header JSON, token, và xử lý lỗi.
async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json", ...headers },
    }

    if (auth) {
        const token = getToken()
        if (token) opts.headers.Authorization = `Bearer ${token}`
    }

    if (body !== undefined) {
        opts.body = JSON.stringify(body)
    }

    const res = await fetch(`${BASE_URL}${path}`, opts)

    // Cố gắng đọc JSON; một số response (204) không có body
    let data = null
    const text = await res.text()
    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            data = text
        }
    }

    if (!res.ok) {
        // Lấy message lỗi từ backend nếu có, không thì dùng status
        const message =
            (data && (data.message || data.title || data.error)) ||
            `Lỗi ${res.status}`
        const err = new Error(message)
        err.status = res.status
        err.data = data
        throw err
    }

    return data
}

export const api = {
    get: (path, opts) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
    put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
    delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
}

// ----- Auth -----

// Đăng nhập bằng email (mail) + mật khẩu.
// Response backend dạng: { status, message, data: { accessToken, tokenType, userId, name, mail, userType }, ... }
export async function login({ mail, password }) {
    const res = await api.post("/api/v1/auth/login", { mail, password })

    const user = res?.data
    if (user?.accessToken) {
        localStorage.setItem("token", user.accessToken)
        localStorage.setItem("user", JSON.stringify(user))
    }

    return user
}

// Đăng ký tài khoản. Backend nhận { name, mail, password, phone }
// và trả về giống login (data.accessToken...). Đăng ký xong là đăng nhập luôn.
export async function register({ name, mail, password, phone }) {
    const res = await api.post("/api/v1/auth/register", { name, mail, password, phone })

    const user = res?.data
    if (user?.accessToken) {
        localStorage.setItem("token", user.accessToken)
        localStorage.setItem("user", JSON.stringify(user))
    }

    return user
}

// Đăng xuất: báo cho backend (cần token), rồi xóa session phía client.
// Dù API lỗi vẫn xóa local để người dùng không bị kẹt đăng nhập.
export async function logout() {
    try {
        await api.post("/api/v1/auth/logout", undefined, { auth: true })
    } catch {
        // bỏ qua lỗi server, vẫn đăng xuất phía client
    } finally {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }
}

// Quên mật khẩu: backend gửi mã OTP tới email của người dùng.
export async function forgotPassword({ mail }) {
    return api.post("/api/v1/auth/forgot-password", { mail })
}

// Đặt lại mật khẩu bằng mã OTP nhận qua email.
export async function resetPassword({ mail, otp, newPassword }) {
    return api.post("/api/v1/auth/reset-password", { mail, otp, newPassword })
}

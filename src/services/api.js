// API client dùng chung cho toàn bộ app.
// Base URL lấy từ biến môi trường VITE_API_URL (xem file .env).

const BASE_URL = "https://sba301-lost-and-found-backend.onrender.com"

// Lấy token đã lưu (nếu có) để gắn vào header Authorization
export function getToken() {
    return localStorage.getItem("token")
}

// Hàm gọi API chung: tự gắn base URL, header JSON, token, và xử lý lỗi.
async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
    const isFormData = body instanceof FormData
    const opts = {
        method,
        headers: isFormData ? { ...headers } : { "Content-Type": "application/json", ...headers },
    }

    if (isFormData) {
        delete opts.headers["Content-Type"]
    }

    if (auth) {
        const token = getToken()
        if (token) opts.headers.Authorization = `Bearer ${token}`
    }

    if (body !== undefined) {
        opts.body = isFormData ? body : JSON.stringify(body)
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

function buildPostFormData(postData) {
    const formData = new FormData();

    if (postData.title) formData.append("title", postData.title);
    if (postData.description) formData.append("description", postData.description);
    if (postData.eventTime) formData.append("eventTime", postData.eventTime);
    if (postData.userId) formData.append("userId", postData.userId);
    if (postData.phone) formData.append("phone", postData.phone);
    if (postData.name) formData.append("name", postData.name);
    formData.append("hidePostType", postData.hidePostType || "PUBLIC");
    if (postData.address) formData.append("address", postData.address);
    if (postData.city) formData.append("city", postData.city);
    if (postData.district) formData.append("district", postData.district);

    if (postData.latitude) formData.append("latitude", postData.latitude);
    if (postData.longitude) formData.append("longitude", postData.longitude);
    if (postData.locationLevel) formData.append("locationLevel", postData.locationLevel);

    if (postData.image) {
        formData.append("image", postData.image);
    }

    if (postData.customQuestionsJson) {
        formData.append("customQuestionsJson", postData.customQuestionsJson);
    }

    return formData;
}

export async function createLostPost(postData) {
    try {
        const formData = buildPostFormData(postData);
        const response = await api.post("/api/v1/posts", formData, {
            auth: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo bài viết báo mất:", error);
        throw error;
    }
}

export async function createFoundPost(postData) {
    try {
        const formData = buildPostFormData(postData);
        const response = await api.post("/api/v1/posts/found", formData, {
            auth: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo bài viết tìm thấy:", error);
        throw error;
    }
}

export async function suggestQuestions(description, image) {
    try {
        const formData = new FormData();
        formData.append("description", description || "");
        if (image) {
            formData.append("image", image);
        }

        const response = await api.post("/api/v1/posts/suggest-questions", formData, {
            auth: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API gợi ý câu hỏi:", error);
        throw error;
    }
}

export async function generateDescription(image) {
    try {
        const formData = new FormData();
        if (image) {
            formData.append("image", image);
        }

        const response = await api.post("/api/v1/posts/generate-description", formData, {
            auth: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API tự động sinh mô tả:", error);
        throw error;
    }
}




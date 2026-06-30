// Admin API service – gọi các endpoint quản trị
// Dùng axiosClient (Axios) để token tự động được gắn qua interceptor.
import axiosClient from "../api/axiosClient.js"

// ===== Quản lý người dùng =====

/**
 * Lấy danh sách người dùng (phân trang).
 * GET /api/v1/admin/users?page={page}&size={size}&keyword={keyword}
 */
export async function getUsers({ page = 0, size = 10, search = "" } = {}) {
    const params = new URLSearchParams({ page, size })
    if (search) params.append("search", search)
    return axiosClient.get(`/api/v1/admin/users?${params}`)
    // axiosClient interceptor trả về response.data → { status, message, data: { content, ... } }
}

/**
 * Lấy chi tiết 1 người dùng.
 * GET /api/v1/admin/users/{id}
 */
export async function getUserById(id) {
    return axiosClient.get(`/api/v1/admin/users/${id}`)
}

/**
 * Khoá / mở khoá tài khoản người dùng.
 * PUT /api/v1/admin/users/{id}/toggle-lock
 */
export async function toggleLockUser(id) {
    return axiosClient.put(`/api/v1/admin/users/${id}/toggle-lock`)
}

/**
 * Cập nhật thông tin người dùng (tên, số điện thoại).
 * PUT /api/v1/admin/users/{id}
 */
export async function updateUser(id, { name, phone }) {
    return axiosClient.put(`/api/v1/admin/users/${id}`, { name, phone })
}

/**
 * Xoá người dùng.
 * DELETE /api/v1/admin/users/{id}
 */
export async function deleteUser(id) {
    return axiosClient.delete(`/api/v1/admin/users/${id}`)
}

// ===== Quản lý bài đăng =====

/**
 * Lấy danh sách bài đăng (phân trang).
 * GET /api/v1/admin/posts?page={page}&size={size}&keyword={keyword}
 */
export async function getPosts({ page = 0, size = 10, keyword = "" } = {}) {
    const params = new URLSearchParams({ page, size })
    if (keyword) params.append("keyword", keyword)
    return axiosClient.get(`/api/v1/admin/posts?${params}`)
}

/**
 * Xoá bài đăng.
 * DELETE /api/v1/admin/posts/{id}
 */
export async function deletePost(id) {
    return axiosClient.delete(`/api/v1/admin/posts/${id}`)
}

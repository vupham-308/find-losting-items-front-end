// Admin API service – gọi các endpoint quản trị
// Dùng axiosClient (Axios) để token tự động được gắn qua interceptor.
import axiosClient from "../api/axiosClient.js"

// ===== Quản lý người dùng =====

/**
 * Vai trò dùng cho bộ lọc danh sách người dùng — khớp enum của backend.
 */
export const USER_ROLES = [
    { value: "USER", label: "Người dùng" },
    { value: "ADMIN", label: "Admin" },
]

/**
 * Các trường được backend cho phép sắp xếp (id | name | mail | createdAt).
 */
export const USER_SORT_FIELDS = [
    { value: "id", label: "ID" },
    { value: "name", label: "Họ tên" },
    { value: "mail", label: "Email" },
    { value: "createdAt", label: "Ngày tạo" },
]

/**
 * Lấy danh sách người dùng (phân trang, tìm kiếm, lọc theo vai trò, sắp xếp).
 * GET /api/v1/admin/users?page&size&search&role&sortBy&sortDir
 * size tối đa 50; sortBy ∈ {id, name, mail, createdAt}; sortDir ∈ {asc, desc}.
 */
export async function getUsers({
    page = 0,
    size = 10,
    search = "",
    role = "",
    sortBy = "id",
    sortDir = "asc",
} = {}) {
    const params = new URLSearchParams({ page, size, sortBy, sortDir })
    if (search) params.append("search", search)
    if (role) params.append("role", role)
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
 * Đổi vai trò người dùng giữa USER và ADMIN.
 * PATCH /api/v1/admin/users/{id}/role
 * Body: { newRole: "ADMIN" | "USER" }
 *
 * Lưu ý: backend không cho admin tự đổi vai trò của chính mình, và sẽ thu hồi
 * toàn bộ refresh token của người dùng bị đổi vai trò ngay lập tức.
 */
export async function changeUserRole(id, newRole) {
    return axiosClient.patch(`/api/v1/admin/users/${id}/role`, { newRole })
}

/**
 * Xoá người dùng.
 * DELETE /api/v1/admin/users/{id}
 */
export async function deleteUser(id) {
    return axiosClient.delete(`/api/v1/admin/users/${id}`)
}

// ===== Hệ thống =====

/**
 * Kiểm tra tình trạng các thành phần hệ thống.
 * GET /api/v1/system/health
 * data: { backend, database, clip, ollama, checkedAt }
 * errors: map { <tên thành phần>: <thông báo lỗi> } — chỉ có khi thành phần gặp sự cố.
 */
export async function getSystemHealth() {
    return axiosClient.get("/api/v1/system/health")
}

// ===== Quản lý bài đăng =====

// Backend không có nhóm endpoint riêng /api/v1/admin/posts — quản trị viên dùng
// chung các endpoint bài đăng công khai (đã được phân quyền ở phía server).

/** Loại bài đăng. */
export const POST_TYPES = [
    { value: "LOST", label: "Tìm đồ mất" },
    { value: "FOUND", label: "Nhặt được đồ" },
]

/** Trạng thái bài đăng. */
export const POST_STATUSES = [
    { value: "ACTIVE", label: "Đang hiển thị" },
    { value: "RESOLVED", label: "Đã giải quyết" },
    { value: "DELETED", label: "Đã xoá" },
]

/** Các trường được phép sắp xếp bài đăng. */
export const POST_SORT_FIELDS = [
    { value: "createdAt", label: "Ngày tạo" },
    { value: "id", label: "ID" },
    { value: "title", label: "Tiêu đề" },
]

export function getPostTypeLabel(value) {
    return POST_TYPES.find((t) => t.value === value)?.label || value || "—"
}

export function getPostStatusLabel(value) {
    return POST_STATUSES.find((s) => s.value === value)?.label || value || "—"
}

/**
 * Lấy danh sách bài đăng (phân trang, lọc theo loại / trạng thái, sắp xếp).
 * GET /api/v1/posts/all?page&size&sortBy&sortDir&type&status
 * Lưu ý: endpoint này không hỗ trợ tìm kiếm theo từ khoá.
 */
export async function getPosts({
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "DESC",
    type = "",
    status = "",
} = {}) {
    const params = new URLSearchParams({ page, size, sortBy, sortDir })
    if (type) params.append("type", type)
    if (status) params.append("status", status)
    return axiosClient.get(`/api/v1/posts/all?${params}`)
}

/**
 * Lấy chi tiết đầy đủ 1 bài đăng.
 * GET /api/v1/posts/{id}
 */
export async function getPostById(id) {
    return axiosClient.get(`/api/v1/posts/${id}`)
}

/**
 * Đổi trạng thái bài đăng (ACTIVE | RESOLVED | DELETED).
 * PATCH /api/v1/posts/{id}/status?status={status}
 */
export async function updatePostStatus(id, status) {
    return axiosClient.patch(`/api/v1/posts/${id}/status?status=${status}`)
}

/**
 * Xoá bài đăng.
 * DELETE /api/v1/posts/{id}
 */
export async function deletePost(id) {
    return axiosClient.delete(`/api/v1/posts/${id}`)
}

// ===== Quản lý ảnh mặc định (stock image) =====
// Ảnh mẫu theo danh mục để người dùng chọn khi đăng bài mà không có ảnh chụp thật,
// tránh việc bài đăng bị thiếu ảnh.

/**
 * Danh mục ảnh mặc định — khớp enum của backend.
 */
export const STOCK_IMAGE_CATEGORIES = [
    { value: "WALLET", label: "Ví / Bóp" },
    { value: "BAG_BACKPACK", label: "Túi / Ba lô" },
    { value: "DOCS_CARDS", label: "Giấy tờ / Thẻ" },
    { value: "ELECTRONICS", label: "Đồ điện tử" },
    { value: "KEYS", label: "Chìa khoá" },
    { value: "APPAREL_ACC", label: "Quần áo / Phụ kiện" },
    { value: "BOOKS_STATIONERY", label: "Sách / Văn phòng phẩm" },
    { value: "PETS", label: "Thú cưng" },
    { value: "OTHER", label: "Khác" },
]

/** Đổi mã danh mục sang nhãn tiếng Việt (fallback về chính mã nếu không khớp). */
export function getCategoryLabel(value) {
    return STOCK_IMAGE_CATEGORIES.find((c) => c.value === value)?.label || value || "—"
}

/**
 * Lấy danh sách ảnh mặc định. Không phân trang — backend trả về mảng.
 * GET /api/v1/admin/stock-images?category={category}
 */
export async function getStockImages({ category = "" } = {}) {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    const qs = params.toString()
    return axiosClient.get(`/api/v1/admin/stock-images${qs ? `?${qs}` : ""}`)
}

/**
 * Lấy chi tiết 1 ảnh mặc định.
 * GET /api/v1/admin/stock-images/{id}
 */
export async function getStockImageById(id) {
    return axiosClient.get(`/api/v1/admin/stock-images/${id}`)
}

/**
 * Thêm ảnh mặc định mới.
 * POST /api/v1/admin/stock-images
 * Body: { category, label, image_url } — category và image_url bắt buộc.
 */
export async function createStockImage({ category, label, imageUrl }) {
    return axiosClient.post("/api/v1/admin/stock-images", {
        category,
        label,
        image_url: imageUrl,
    })
}

/**
 * Cập nhật ảnh mặc định.
 * PUT /api/v1/admin/stock-images/{id}
 */
export async function updateStockImage(id, { category, label, imageUrl }) {
    return axiosClient.put(`/api/v1/admin/stock-images/${id}`, {
        category,
        label,
        image_url: imageUrl,
    })
}

/**
 * Xoá ảnh mặc định.
 * DELETE /api/v1/admin/stock-images/{id}
 */
export async function deleteStockImage(id) {
    return axiosClient.delete(`/api/v1/admin/stock-images/${id}`)
}

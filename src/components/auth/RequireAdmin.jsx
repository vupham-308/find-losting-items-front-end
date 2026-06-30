import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore.js"

// Bảo vệ các route /admin: chỉ cho phép người dùng đã đăng nhập với quyền ADMIN.
// - Chưa đăng nhập (không có token) → chuyển về /login.
// - Đã đăng nhập nhưng không phải ADMIN → chuyển về trang chủ.
// Nhờ guard này, trang admin không bao giờ gọi API quản trị khi chưa có phiên hợp lệ
// (tránh 401 → luồng refresh hỏng → "Network Error").
export default function RequireAdmin({ children }) {
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    if (user?.userType !== "ADMIN") {
        return <Navigate to="/" replace />
    }

    return children
}

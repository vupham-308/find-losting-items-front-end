import { Navigate } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore.js"

// Bắt buộc có mật khẩu cục bộ trước khi vào app.
// - Đã đăng nhập (có token) nhưng chắc chắn CHƯA có mật khẩu cục bộ → đẩy về /login
//   để thiết lập mật khẩu (trang login sẽ hiển thị form thiết lập).
// - Chưa đăng nhập hoặc chưa xác định (hasPassword === null, phiên cũ) → cho qua bình thường.
export default function RequirePassword({ children }) {
    const token = useAuthStore((s) => s.token)
    const hasPassword = useAuthStore((s) => s.hasPassword)

    if (token && hasPassword === false) {
        return <Navigate to="/login" replace />
    }

    return children
}

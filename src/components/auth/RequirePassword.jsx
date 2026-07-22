// RequirePassword giữ lại cho tương thích cấu trúc routes.
// Không còn bắt buộc mật khẩu cục bộ — tài khoản Google được phép vào app tự do.
// Người dùng có thể tuỳ chọn thiết lập mật khẩu trong Hồ sơ > Bảo mật.
export default function RequirePassword({ children }) {
    return children
}

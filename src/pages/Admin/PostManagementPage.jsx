import { FileText } from "lucide-react"

export default function PostManagementPage() {
    return (
        <>
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Quản lý bài đăng</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Bài đăng</span>
                    </div>
                </div>
            </div>
            <div className="admin-content">
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <FileText size={36} color="#005bbf" />
                    </div>
                    <h2>Quản lý bài đăng</h2>
                    <p>
                        Tính năng quản lý bài đăng đang được phát triển. Bạn sẽ có thể xem, duyệt
                        và xoá các bài đăng mất / tìm thấy đồ tại đây.
                    </p>
                </div>
            </div>
        </>
    )
}

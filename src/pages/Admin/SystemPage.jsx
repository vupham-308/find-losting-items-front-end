import { Settings } from "lucide-react"

export default function SystemPage() {
    return (
        <>
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Hệ thống</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Cài đặt hệ thống</span>
                    </div>
                </div>
            </div>
            <div className="admin-content">
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <Settings size={36} color="#005bbf" />
                    </div>
                    <h2>Cài đặt hệ thống</h2>
                    <p>
                        Trang cài đặt hệ thống đang được xây dựng. Bạn sẽ có thể cấu hình các
                        tuỳ chọn chung, quản lý phân quyền và theo dõi log hệ thống tại đây.
                    </p>
                </div>
            </div>
        </>
    )
}

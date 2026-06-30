import { Users, FileText, TrendingUp, Eye } from "lucide-react"

/**
 * Trang Dashboard – hiển thị thống kê tổng quan.
 */
export default function DashboardPage() {
    const stats = [
        {
            label: "Tổng người dùng",
            value: "1,245",
            change: "+12%",
            up: true,
            icon: Users,
            color: "blue",
        },
        {
            label: "Bài đăng",
            value: "3,847",
            change: "+8.2%",
            up: true,
            icon: FileText,
            color: "purple",
        },
        {
            label: "Lượt truy cập hôm nay",
            value: "892",
            change: "+24%",
            up: true,
            icon: Eye,
            color: "emerald",
        },
        {
            label: "Tỷ lệ tìm thấy",
            value: "67.3%",
            change: "+3.1%",
            up: true,
            icon: TrendingUp,
            color: "amber",
        },
    ]

    return (
        <>
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Dashboard</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Tổng quan</span>
                    </div>
                </div>
            </div>

            <div className="admin-content">
                {/* Stats */}
                <div className="stats-grid">
                    {stats.map((s) => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-info">
                                <h3>{s.label}</h3>
                                <div className="stat-value">{s.value}</div>
                                <div className={`stat-change ${s.up ? "up" : "down"}`}>
                                    {s.up ? "↑" : "↓"} {s.change}
                                </div>
                            </div>
                            <div className={`stat-icon ${s.color}`}>
                                <s.icon size={22} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Info cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title">
                                Bài đăng gần đây
                                <span className="badge">Mới</span>
                            </div>
                        </div>
                        <div style={{ padding: "24px" }}>
                            {[
                                { title: "Mất ví da đen tại Q1", time: "2 phút trước", type: "lost" },
                                { title: "Tìm thấy chìa khoá ở công viên", time: "15 phút trước", type: "found" },
                                { title: "Mất điện thoại iPhone 15", time: "1 giờ trước", type: "lost" },
                                { title: "Tìm thấy túi xách nữ", time: "3 giờ trước", type: "found" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px 0",
                                        borderBottom:
                                            i < 3 ? "1px solid #ebeef4" : "none",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#181c20",
                                            }}
                                        >
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#727785", marginTop: 2 }}>
                                            {item.time}
                                        </div>
                                    </div>
                                    <span
                                        className="badge-type"
                                        style={{
                                            background:
                                                item.type === "lost"
                                                    ? "rgba(158,67,0,0.08)"
                                                    : "rgba(13,124,62,0.08)",
                                            color:
                                                item.type === "lost" ? "#9e4300" : "#0d7c3e",
                                        }}
                                    >
                                        {item.type === "lost" ? "Mất đồ" : "Tìm thấy"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title">
                                Người dùng mới
                                <span className="badge">Hôm nay</span>
                            </div>
                        </div>
                        <div style={{ padding: "24px" }}>
                            {[
                                { name: "Nguyễn Văn A", mail: "nguyenvana@gmail.com", color: "#005bbf" },
                                { name: "Trần Thị B", mail: "tranthib@gmail.com", color: "#1a73e8" },
                                { name: "Lê Minh C", mail: "leminhc@gmail.com", color: "#795900" },
                                { name: "Phạm Đức D", mail: "phamducd@gmail.com", color: "#0d7c3e" },
                            ].map((u, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 0",
                                        borderBottom:
                                            i < 3 ? "1px solid #ebeef4" : "none",
                                    }}
                                >
                                    <div
                                        className="user-cell-avatar"
                                        style={{ background: u.color }}
                                    >
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#181c20",
                                            }}
                                        >
                                            {u.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#727785", marginTop: 2 }}>
                                            {u.mail}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

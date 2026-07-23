import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Users, FileText, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react"
import {
    getUsers,
    getPosts,
    getPostTypeLabel,
    getCategoryLabel,
} from "../../services/adminService.js"

// Palette cho avatar — trùng với trang quản lý người dùng.
const AVATAR_COLORS = [
    "#005bbf", "#1a73e8", "#0d7c3e", "#795900", "#9e4300",
    "#ba1a1a", "#004493", "#5c4300",
]

function getAvatarColor(id) {
    return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]
}

// Backend chưa có endpoint thống kê riêng ⇒ lấy tổng số từ `totalElements`
// của các endpoint danh sách (gọi với size=1 cho nhẹ).
async function fetchDashboardData() {
    const [allPosts, activePosts, resolvedPosts, allUsers, recentPosts, newUsers] =
        await Promise.all([
            getPosts({ page: 0, size: 1 }),
            getPosts({ page: 0, size: 1, status: "ACTIVE" }),
            getPosts({ page: 0, size: 1, status: "RESOLVED" }),
            getUsers({ page: 0, size: 1 }),
            getPosts({ page: 0, size: 5, sortBy: "createdAt", sortDir: "DESC" }),
            getUsers({ page: 0, size: 5, sortBy: "createdAt", sortDir: "desc" }),
        ])

    return {
        totalPosts: allPosts?.data?.totalElements ?? 0,
        activePosts: activePosts?.data?.totalElements ?? 0,
        resolvedPosts: resolvedPosts?.data?.totalElements ?? 0,
        totalUsers: allUsers?.data?.totalElements ?? 0,
        recentPosts: recentPosts?.data?.content ?? [],
        newUsers: newUsers?.data?.content ?? [],
    }
}

// "3 giờ trước" — dựa trên thời điểm tạo.
function timeAgo(value) {
    if (!value) return "—"
    const diffMs = Date.now() - new Date(value).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return "Vừa xong"
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    return new Date(value).toLocaleDateString("vi-VN")
}

/**
 * Trang Dashboard – hiển thị thống kê tổng quan (dữ liệu thật từ API).
 */
export default function DashboardPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            setData(await fetchDashboardData())
        } catch (err) {
            setError(err.message || "Không thể tải dữ liệu tổng quan")
        } finally {
            setLoading(false)
        }
    }

    // Tải lần đầu — state khởi tạo đã là loading nên không cần setState đồng bộ ở đây.
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const d = await fetchDashboardData()
                if (!cancelled) setData(d)
            } catch (err) {
                if (!cancelled) setError(err.message || "Không thể tải dữ liệu tổng quan")
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    // Tỷ lệ giải quyết = số bài đã giải quyết / tổng số bài.
    const resolvedRate =
        data && data.totalPosts > 0
            ? ((data.resolvedPosts / data.totalPosts) * 100).toFixed(1) + "%"
            : "0%"

    const stats = [
        {
            label: "Tổng người dùng",
            value: data ? data.totalUsers.toLocaleString("vi-VN") : "—",
            icon: Users,
            color: "blue",
        },
        {
            label: "Tổng bài đăng",
            value: data ? data.totalPosts.toLocaleString("vi-VN") : "—",
            icon: FileText,
            color: "purple",
        },
        {
            label: "Bài đang hiển thị",
            value: data ? data.activePosts.toLocaleString("vi-VN") : "—",
            icon: CheckCircle2,
            color: "emerald",
        },
        {
            label: "Tỷ lệ đã giải quyết",
            value: data ? resolvedRate : "—",
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
                <div className="topbar-actions">
                    <button className="filter-btn" onClick={load} disabled={loading}>
                        <RefreshCw size={14} /> {loading ? "Đang tải..." : "Tải lại"}
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {error && <div className="admin-error">⚠️ {error}</div>}

                {/* Stats */}
                <div className="stats-grid">
                    {stats.map((s) => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-info">
                                <h3>{s.label}</h3>
                                <div className="stat-value">
                                    {loading ? "…" : s.value}
                                </div>
                            </div>
                            <div className={`stat-icon ${s.color}`}>
                                <s.icon size={22} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Info cards */}
                <div className="dashboard-grid">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title">Bài đăng gần đây</div>
                            <div className="admin-card-actions">
                                <Link className="filter-btn" to="/admin/posts">
                                    Xem tất cả
                                </Link>
                            </div>
                        </div>
                        <div style={{ padding: "8px 24px 16px" }}>
                            {loading ? (
                                <div className="admin-loading">
                                    <div className="admin-loading-spinner" />
                                    <span>Đang tải...</span>
                                </div>
                            ) : data?.recentPosts.length === 0 ? (
                                <div className="admin-empty">
                                    <div>Chưa có bài đăng nào</div>
                                </div>
                            ) : (
                                data?.recentPosts.map((p, i) => (
                                    <div
                                        key={p.id}
                                        className={`dashboard-list-row${
                                            i < data.recentPosts.length - 1 ? " divided" : ""
                                        }`}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div className="dashboard-list-title">
                                                {p.title || "(Không có tiêu đề)"}
                                            </div>
                                            <div className="dashboard-list-sub">
                                                {getCategoryLabel(p.category)} ·{" "}
                                                {timeAgo(p.created_at)}
                                            </div>
                                        </div>
                                        <span
                                            className={`badge-type ${
                                                p.type === "LOST" ? "admin" : "user"
                                            }`}
                                        >
                                            {getPostTypeLabel(p.type)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <div className="admin-card-title">Người dùng mới</div>
                            <div className="admin-card-actions">
                                <Link className="filter-btn" to="/admin/users">
                                    Xem tất cả
                                </Link>
                            </div>
                        </div>
                        <div style={{ padding: "8px 24px 16px" }}>
                            {loading ? (
                                <div className="admin-loading">
                                    <div className="admin-loading-spinner" />
                                    <span>Đang tải...</span>
                                </div>
                            ) : data?.newUsers.length === 0 ? (
                                <div className="admin-empty">
                                    <div>Chưa có người dùng nào</div>
                                </div>
                            ) : (
                                data?.newUsers.map((u, i) => (
                                    <div
                                        key={u.id}
                                        className={`dashboard-list-row${
                                            i < data.newUsers.length - 1 ? " divided" : ""
                                        }`}
                                    >
                                        <div className="user-cell">
                                            <div
                                                className="user-cell-avatar"
                                                style={{ background: getAvatarColor(u.id) }}
                                            >
                                                {(u.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-cell-info">
                                                <span className="user-cell-name">{u.name}</span>
                                                <span className="user-cell-email">{u.mail}</span>
                                            </div>
                                        </div>
                                        <span className="dashboard-list-sub">
                                            {timeAgo(u.createdAt)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

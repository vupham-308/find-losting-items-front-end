import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
    LayoutDashboard, Users, FileText, Settings, ChevronLeft,
    ChevronRight, Bell, LogOut, Shield
} from "lucide-react"
import useAdminStore from "../../stores/adminStore.js"
import { useAuth } from "../../hooks/useAuth.js"

const navSections = [
    {
        label: "Tổng quan",
        items: [
            { to: "/admin", icon: LayoutDashboard, text: "Dashboard", end: true },
        ],
    },
    {
        label: "Quản lý",
        items: [
            { to: "/admin/users", icon: Users, text: "Quản lý người dùng" },
            { to: "/admin/posts", icon: FileText, text: "Quản lý bài đăng" },
        ],
    },
    {
        label: "Cài đặt",
        items: [
            { to: "/admin/system", icon: Settings, text: "Hệ thống" },
        ],
    },
]

export default function AdminLayout() {
    const collapsed = useAdminStore((s) => s.sidebarCollapsed)
    const toggle = useAdminStore((s) => s.toggleSidebar)
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const initials = (user?.name || "A").charAt(0).toUpperCase()

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <div className="admin-layout">
            {/* ---- Sidebar ---- */}
            <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}`}>
                <button className="sidebar-toggle" onClick={toggle} title="Thu gọn">
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Shield size={20} color="#fff" />
                    </div>
                    <div className="sidebar-brand-text">
                        <div className="sidebar-brand-title">Admin Panel</div>
                        <div className="sidebar-brand-sub">Quản trị hệ thống</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <div className="sidebar-section-label">{section.label}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `sidebar-item${isActive ? " active" : ""}`
                                    }
                                >
                                    <span className="sidebar-item-icon">
                                        <item.icon size={18} />
                                    </span>
                                    <span className="sidebar-item-text">{item.text}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Profile */}
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-profile-info">
                        <div className="sidebar-profile-name">{user?.name || "Admin"}</div>
                        <div className="sidebar-profile-role">{user?.userType || "ADMIN"}</div>
                    </div>
                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                        title="Đăng xuất"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* ---- Main ---- */}
            <div className="admin-main">
                <Outlet />
            </div>
        </div>
    )
}

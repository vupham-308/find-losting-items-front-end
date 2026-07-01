import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/Home/HomePage.jsx"
import LoginPage from "../pages/Auth/LoginPage.jsx"
import RegisterPage from "../pages/Auth/RegisterPage.jsx"
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage.jsx"
import CreateItemPage from "../pages/Items/CreatePost.jsx"
import ItemDetailPage from "../pages/Items/ItemDetailPage.jsx"
import ProfilePage from "../pages/Auth/Profile.jsx"
import TermsOfServicePage from "../pages/Home/TermsOfService.jsx"
import PrivacyPolicyPage from "../pages/Home/PrivacyPolicy.jsx"

// Guards
import RequirePassword from "../components/auth/RequirePassword.jsx"

// Admin
import RequireAdmin from "../components/auth/RequireAdmin.jsx"
import AdminLayout from "../pages/Admin/AdminLayout.jsx"
import DashboardPage from "../pages/Admin/DashboardPage.jsx"
import UserManagementPage from "../pages/Admin/UserManagementPage.jsx"
import PostManagementPage from "../pages/Admin/PostManagementPage.jsx"
import SystemPage from "../pages/Admin/SystemPage.jsx"

export default function AppRoutes() {
    return (
        <Routes>
            {/* Trang công khai / dùng để thiết lập mật khẩu — không chặn bởi RequirePassword */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Trang app — bắt buộc đã có mật khẩu cục bộ mới được vào */}
            <Route path="/" element={<RequirePassword><HomePage /></RequirePassword>} />
            <Route path="/create-post" element={<RequirePassword><CreateItemPage /></RequirePassword>} />
            <Route path="/posts/:id" element={<RequirePassword><ItemDetailPage /></RequirePassword>} />
            <Route path="/profile" element={<RequirePassword><ProfilePage /></RequirePassword>} />

            {/* Admin Dashboard */}
            <Route
                path="/admin"
                element={
                    <RequirePassword>
                        <RequireAdmin>
                            <AdminLayout />
                        </RequireAdmin>
                    </RequirePassword>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="posts" element={<PostManagementPage />} />
                <Route path="system" element={<SystemPage />} />
            </Route>
        </Routes>
    )
}

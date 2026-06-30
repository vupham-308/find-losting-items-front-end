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
import SearchImagePage from "../pages/Home/SearchImage.jsx"

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/create-post" element={<CreateItemPage />} />
            <Route path="/posts/:id" element={<ItemDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/search-image" element={<SearchImagePage />} />
        </Routes>
    )
}

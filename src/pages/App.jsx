import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import CreatePost from "./CreatePost.jsx";
import { Routes, Route, useLocation } from 'react-router-dom'
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import DetailPost from "./DetailPost.jsx";
import TermsOfService from "./TermsOfService.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import SearchImage from "./SearchImage.jsx";

// Những trang hiển thị toàn màn hình, không có Header/Footer
const BARE_ROUTES = ["/login", "/register"]

export default function App() {
    const { pathname } = useLocation()
    const hideChrome = BARE_ROUTES.includes(pathname)

    return (
        <div className="bg-background min-h-screen text-on-background font-sans">
            {!hideChrome && <Header />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/posts/:id" element={<DetailPost />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/search-image" element={<SearchImage />} />
                {/*<Route path="/profile" element={<Profile />} />*/}
            </Routes>
            {!hideChrome && <Footer />}
        </div>
    )
}
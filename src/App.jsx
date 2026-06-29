import { useLocation } from "react-router-dom"
import Header from "./components/layout/Header.jsx"
import Footer from "./components/layout/Footer.jsx"
import AppRoutes from "./routes/AppRoutes.jsx"

// Những trang hiển thị toàn màn hình, không có Header/Footer
const BARE_ROUTES = ["/login", "/register", "/forgot-password"]

export default function App() {
    const { pathname } = useLocation()
    const hideChrome = BARE_ROUTES.includes(pathname)

    return (
        <div className="bg-background min-h-screen text-on-background font-sans">
            {!hideChrome && <Header />}
            <AppRoutes />
            {!hideChrome && <Footer />}
        </div>
    )
}

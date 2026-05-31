import { useState } from "react"
import { Link } from "react-router-dom"

function getUserFromStorage() {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
        try {
            return JSON.parse(user)
        } catch {
            return null
        }
    }
    return null
}

export default function Header() {
    const [user, setUser] = useState(getUserFromStorage)

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }
    return (
        <header className="sticky top-0 w-full z-50 flex justify-between items-center px-gutter-desktop py-stack-sm max-w-[1200px] mx-auto bg-surface-container-lowest shadow-sm">
            {/* Logo */}
            <Link to={"/"}>
            <div className="flex items-center gap-2">
                <img src="/logo.svg" className="h-8 w-8 object-contain" alt="logo" />
                <span className="text-[20px] font-bold text-primary">Sài Gòn Tìm Đồ</span>
            </div>
        </Link>

            {/* Right side */}
            <div className="flex items-center gap-stack-sm">
                {/* Search */}
                <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        search
                    </span>
                    <input
                        className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-[14px] w-48 lg:w-64 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Tìm kiếm đồ vật..."
                        type="text"
                    />
                </div>

                {/* Auth: chưa login */}
                {!user && (
                    <div className="flex items-center gap-2">
                    <a
                        href="/login"
                        className="px-4 py-2 text-[14px] font-semibold bg-primary text-on-primary rounded-full hover:opacity-90 transition-all"                        >
                        Đăng nhập
                    </a>
                    </div>
                    )}

                {/* Auth: đã login — Account dropdown */}
                {user && (
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full transition-all">
                            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <span className="text-[12px] font-bold tracking-widest text-on-surface">
                                {user.name}
                            </span>
                            <span className="material-symbols-outlined text-outline">arrow_drop_down</span>
                        </button>

                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] overflow-hidden">
                            <div className="p-3 border-b border-outline-variant bg-surface-container-low">
                                <p className="text-[12px] font-bold tracking-widest text-on-surface">{user.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{user.email}</p>
                            </div>
                            <div className="py-1">
                                <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-[14px] text-on-surface transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">post_add</span>
                                    Tin đã đăng
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-[14px] text-on-surface transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">send_and_archive</span>
                                    Yêu cầu tìm đồ đã gửi
                                </a>
                            </div>
                            <div className="py-1 border-t border-outline-variant">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-[14px] text-error transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [mail, setMail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!mail || !password) {
            setError("Vui lòng nhập đầy đủ thông tin")
            return
        }

        setLoading(true)
        try {
            await login({ mail, password })
            navigate("/")
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-background">

            {/* ===== Cột trái: panel thương hiệu (chỉ hiện trên desktop) ===== */}
            <aside className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-on-primary">
                {/* Ảnh nền */}
                <img
                    src="/thumnail-login.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Lớp phủ gradient xanh để chữ luôn đọc rõ */}
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(150deg, rgba(0,68,147,0.92) 0%, rgba(0,91,191,0.80) 45%, rgba(26,115,232,0.55) 100%)" }}
                />

                {/* Logo + tên */}
                <div className="relative flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                        <span className="material-symbols-outlined text-[26px]">travel_explore</span>
                    </div>
                    <span className="text-[22px] font-bold tracking-tight">Sài Gòn Tìm Đồ</span>
                </div>

                {/* Thông điệp + điểm tin cậy */}
                <div className="relative max-w-md">
                    <h2 className="text-[34px] xl:text-[40px] font-bold leading-tight tracking-tight">
                        Tìm lại món đồ thất lạc của bạn
                    </h2>
                    <p className="mt-4 text-[16px] text-white/80 leading-relaxed">
                        Nền tảng kết nối cộng đồng giúp người mất và người nhặt được tìm thấy nhau một cách an toàn, nhanh chóng.
                    </p>

                    <ul className="mt-10 space-y-5">
                        {[
                            { icon: "verified_user", title: "An toàn & bảo mật", desc: "Thông tin cá nhân của bạn được mã hoá và bảo vệ." },
                            { icon: "groups", title: "Cộng đồng uy tín", desc: "Hàng nghìn người dùng tin tưởng mỗi ngày." },
                            { icon: "bolt", title: "Kết nối nhanh chóng", desc: "Đăng tin và nhận phản hồi chỉ trong vài phút." },
                        ].map((item) => (
                            <li key={item.icon} className="flex items-start gap-4">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px]">{item.title}</p>
                                    <p className="text-[13px] text-white/70 leading-relaxed">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Chân panel */}
                <p className="relative text-[13px] text-white/60">
                    © {new Date().getFullYear()} Sài Gòn Tìm Đồ. Bảo lưu mọi quyền.
                </p>
            </aside>

            {/* ===== Cột phải: form đăng nhập ===== */}
            <main className="flex-1 flex items-center justify-center p-gutter-mobile sm:p-8 relative">

                {/* Nút quay về trang chủ */}
                <Link
                    to="/"
                    className="absolute top-6 left-6 inline-flex items-center gap-1 px-3 py-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low text-[14px] font-medium transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Trang chủ
                </Link>

                <div className="w-full max-w-md">

                    {/* Logo cho mobile */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-stack-lg">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                            <span className="material-symbols-outlined">travel_explore</span>
                        </div>
                        <span className="text-[20px] font-bold text-primary tracking-tight">Sài Gòn Tìm Đồ</span>
                    </div>

                    {/* Tiêu đề */}
                    <div className="mb-stack-lg">
                        <h1 className="text-on-surface text-[28px] font-bold tracking-tight">Đăng nhập</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-stack-md">

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-[14px]">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="mail">
                                Email
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">mail</span>
                                <input
                                    id="mail"
                                    type="email"
                                    value={mail}
                                    onChange={(e) => setMail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="password">
                                Mật khẩu
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu của bạn"
                                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Quên mật khẩu */}
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-primary text-[13px] font-semibold hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-[16px] font-semibold hover:bg-primary-container active:scale-[0.99] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    Đăng nhập
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-1">
                            <div className="h-px flex-grow bg-outline-variant" />
                            <span className="text-outline text-[12px] font-medium">hoặc tiếp tục với</span>
                            <div className="h-px flex-grow bg-outline-variant" />
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-on-surface text-[15px] font-medium"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                            Đăng nhập bằng Google
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="mt-stack-lg text-center text-on-surface-variant text-[14px]">
                        Bạn chưa có tài khoản?{" "}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>

                </div>
            </main>
        </div>
    )
}

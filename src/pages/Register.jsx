import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import GoogleLoginButton from "../components/GoogleLoginButton.jsx"

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [form, setForm] = useState({
        fullName: "",
        mail: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    // Các điều kiện của mật khẩu, dùng để hiển thị checklist trực tiếp
    const pwRules = [
        { label: "Tối thiểu 8 ký tự", ok: form.password.length >= 8 },
        { label: "Có chữ thường (a-z)", ok: /[a-z]/.test(form.password) },
        { label: "Có chữ hoa (A-Z)", ok: /[A-Z]/.test(form.password) },
        { label: "Có chữ số (0-9)", ok: /[0-9]/.test(form.password) },
        { label: "Có ký tự đặc biệt", ok: /[^a-zA-Z0-9]/.test(form.password) },
    ]

    const validate = () => {
        if (!form.fullName.trim()) return "Vui lòng nhập họ tên"
        if (!form.mail.trim()) return "Vui lòng nhập email"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) return "Email không hợp lệ"
        if (!form.phone.trim()) return "Vui lòng nhập số điện thoại"
        if (!/^[0-9]{9,10}$/.test(form.phone)) return "Số điện thoại không hợp lệ"
        if (!form.password) return "Vui lòng nhập mật khẩu"
        if (form.password.length < 8) return "Mật khẩu tối thiểu 8 ký tự"
        if (!/[a-z]/.test(form.password)) return "Mật khẩu phải có chữ thường"
        if (!/[A-Z]/.test(form.password)) return "Mật khẩu phải có chữ hoa"
        if (!/[0-9]/.test(form.password)) return "Mật khẩu phải có chữ số"
        if (!/[^a-zA-Z0-9]/.test(form.password)) return "Mật khẩu phải có ký tự đặc biệt"
        if (form.password !== form.confirmPassword) return "Mật khẩu xác nhận không khớp"
        return ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const err = validate()
        if (err) { setError(err); return }

        setLoading(true)
        try {
            await register({
                name: form.fullName,
                mail: form.mail,
                password: form.password,
                phone: form.phone,
            })
            navigate("/")
        } catch (err) {
            setError(err.message || "Đăng ký thất bại, vui lòng thử lại")
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
                        Tham gia cộng đồng tìm đồ
                    </h2>
                    <p className="mt-4 text-[16px] text-white/80 leading-relaxed">
                        Tạo tài khoản để đăng tin, kết nối và cùng nhau tìm lại những món đồ thất lạc một cách an toàn.
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

            {/* ===== Cột phải: form đăng ký ===== */}
            <main className="flex-1 flex items-center justify-center p-gutter-mobile sm:p-8 relative">

                {/* Nút quay về đăng nhập */}
                <Link
                    to="/login"
                    className="absolute top-6 left-6 inline-flex items-center gap-1 px-3 py-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low text-[14px] font-medium transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Đăng nhập
                </Link>

                <div className="w-full max-w-md py-16 lg:py-12">

                    {/* Logo cho mobile */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-stack-lg">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                            <span className="material-symbols-outlined">travel_explore</span>
                        </div>
                        <span className="text-[20px] font-bold text-primary tracking-tight">Sài Gòn Tìm Đồ</span>
                    </div>

                    {/* Tiêu đề */}
                    <div className="mb-stack-lg">
                        <h1 className="text-on-surface text-[28px] font-bold tracking-tight">Tạo tài khoản</h1>
                        <p className="text-on-surface-variant text-[15px] mt-1">
                            Tham gia cộng đồng Sài Gòn Tìm Đồ ngay hôm nay
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-stack-md">

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-[14px]">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="fullName">
                                Họ và tên
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">person</span>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={update("fullName")}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                />
                            </div>
                        </div>

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
                                    value={form.mail}
                                    onChange={update("mail")}
                                    placeholder="email@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="phone">
                                Số điện thoại
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">phone</span>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={update("phone")}
                                    placeholder="Số điện thoại của bạn"
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
                                    value={form.password}
                                    onChange={update("password")}
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

                            {/* Password rules checklist */}
                            <ul className="space-y-1 pt-1">
                                {pwRules.map((rule) => (
                                    <li
                                        key={rule.label}
                                        className={`text-[12px] flex items-center gap-1 transition-colors ${
                                            rule.ok ? "text-primary" : "text-on-surface-variant"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">
                                            {rule.ok ? "check_circle" : "radio_button_unchecked"}
                                        </span>
                                        {rule.label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="confirmPassword">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock_clock</span>
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={update("confirmPassword")}
                                    placeholder="Nhập lại mật khẩu"
                                    className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low border rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none ${
                                        form.confirmPassword && form.password !== form.confirmPassword
                                            ? "border-error focus:ring-error/15 focus:border-error"
                                            : "border-outline-variant"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
                                    aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showConfirm ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {/* Match indicator */}
                            {form.confirmPassword && (
                                <p className={`text-[12px] flex items-center gap-1 ${
                                    form.password === form.confirmPassword ? "text-primary" : "text-error"
                                }`}>
                                    <span className="material-symbols-outlined text-[14px]">
                                        {form.password === form.confirmPassword ? "check_circle" : "cancel"}
                                    </span>
                                    {form.password === form.confirmPassword ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                                </p>
                            )}
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
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản
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
                        <GoogleLoginButton onError={setError} />
                    </form>

                    {/* Login link */}
                    <p className="mt-stack-lg text-center text-on-surface-variant text-[14px]">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </p>

                    {/* Tín hiệu bảo mật */}
                    <div className="mt-stack-md flex items-center justify-center gap-1.5 text-outline text-[12px]">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        Kết nối được bảo mật &amp; mã hoá
                    </div>
                </div>
            </main>
        </div>
    )
}

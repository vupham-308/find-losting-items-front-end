import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

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
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-gutter-mobile">

            {/* Logo */}
            <header className="mb-stack-lg">
                <div className="flex flex-col items-center gap-stack-sm">
                    <span className="text-primary text-[20px] font-bold tracking-tight">Sài Gòn Tìm Đồ</span>
                    <div className="h-1 w-12 bg-primary-container rounded-full" />
                </div>
            </header>

            <main className="w-full max-w-md">
                <div
                    className="bg-surface-container-lowest rounded-lg p-stack-lg md:p-10"
                    style={{ boxShadow: "0 4px 12px rgba(0,91,191,0.05), 0 2px 8px rgba(0,0,0,0.05)" }}
                >
                    {/* Title */}
                    <div className="text-center mb-stack-lg">
                        <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Tạo tài khoản</h1>
                        <p className="text-on-surface-variant text-[16px]">
                            Tham gia cộng đồng Sài Gòn Tìm Đồ ngay hôm nay
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-stack-md">

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-lg text-[14px]">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="fullName">
                                HỌ VÀ TÊN
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">person</span>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={update("fullName")}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="mail">
                                EMAIL
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">mail</span>
                                <input
                                    id="mail"
                                    type="email"
                                    value={form.mail}
                                    onChange={update("mail")}
                                    placeholder="email@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="phone">
                                SỐ ĐIỆN THOẠI
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">phone</span>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={update("phone")}
                                    placeholder="Số điện thoại của bạn"
                                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="password">
                                MẬT KHẨU
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={update("password")}
                                    placeholder="Tối thiểu 8 ký tự, có hoa/thường/số/đặc biệt"
                                    className="w-full pl-12 pr-12 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-on-surface-variant hover:text-on-surface transition-colors"
                                >
                                    <span className="material-symbols-outlined">
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
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="confirmPassword">
                                XÁC NHẬN MẬT KHẨU
                            </label>
                            <div className="relative flex items-center">
                                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">lock_clock</span>
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={update("confirmPassword")}
                                    placeholder="Nhập lại mật khẩu"
                                    className={`w-full pl-12 pr-12 py-4 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none ${
                                        form.confirmPassword && form.password !== form.confirmPassword
                                            ? "border-error focus:ring-error"
                                            : "border-outline-variant"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 text-on-surface-variant hover:text-on-surface transition-colors"
                                >
                                    <span className="material-symbols-outlined">
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
                            className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg text-[20px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-stack-sm">
                            <div className="h-px flex-grow bg-outline-variant" />
                            <span className="text-outline text-[12px] font-bold tracking-widest">HOẶC</span>
                            <div className="h-px flex-grow bg-outline-variant" />
                        </div>

                        {/* Social */}
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-on-surface text-[12px] font-bold tracking-widest"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Google
                        </button>
                    </form>

                    {/* Login link */}
                    <div className="mt-stack-lg text-center">
                        <p className="text-on-surface-variant text-[14px]">
                            Đã có tài khoản?{" "}
                            <a href="/login" className="text-primary font-bold hover:underline">
                                Đăng nhập ngay
                            </a>
                        </p>
                    </div>
                </div>

            </main>
        </div>
    )
}
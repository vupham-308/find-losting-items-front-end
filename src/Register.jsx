import { useState } from "react"

function VietnamFlag() {
    return (
        <span style={{
            width: 24, height: 16,
            background: "#da251d",
            borderRadius: 2,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "#ffff00",
            flexShrink: 0
        }}>★</span>
    )
}

export default function Register() {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [agreed, setAgreed] = useState(false)

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const validate = () => {
        if (!form.fullName.trim()) return "Vui lòng nhập họ tên"
        if (!form.phone.trim()) return "Vui lòng nhập số điện thoại"
        if (!/^[0-9]{9,10}$/.test(form.phone)) return "Số điện thoại không hợp lệ"
        if (!form.password) return "Vui lòng nhập mật khẩu"
        if (form.password.length < 6) return "Mật khẩu tối thiểu 6 ký tự"
        if (form.password !== form.confirmPassword) return "Mật khẩu xác nhận không khớp"
        if (!agreed) return "Vui lòng đồng ý với điều khoản sử dụng"
        return ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const err = validate()
        if (err) { setError(err); return }

        setLoading(true)
        try {
            // TODO: thay bằng API thật
            // const res = await fetch("/api/auth/register", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         fullName: form.fullName,
            //         phone: form.phone,
            //         password: form.password,
            //     })
            // })
            // const data = await res.json()
            // if (!res.ok) throw new Error(data.message)
            // localStorage.setItem("token", data.token)
            // localStorage.setItem("user", JSON.stringify(data.user))
            // window.location.href = "/"

            console.log("Register:", form)
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

                        {/* Phone */}
                        <div className="space-y-stack-sm">
                            <label className="text-on-surface text-[12px] font-bold tracking-widest" htmlFor="phone">
                                SỐ ĐIỆN THOẠI
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 flex items-center gap-2 border-r border-outline-variant pr-3 py-1">
                                    <VietnamFlag />
                                    <span className="text-on-surface-variant text-[14px]">+84</span>
                                </div>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={update("phone")}
                                    placeholder="Số điện thoại của bạn"
                                    className="w-full pl-24 pr-4 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
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
                                    placeholder="Tối thiểu 6 ký tự"
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

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-[14px] text-on-surface-variant cursor-pointer">
                                Tôi đồng ý với{" "}
                                <a href="/terms" className="text-primary font-bold hover:underline">Điều khoản sử dụng</a>
                                {" "}và{" "}
                                <a href="/privacy" className="text-primary font-bold hover:underline">Chính sách bảo mật</a>
                            </label>
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
                        <div className="grid grid-cols-2 gap-stack-md">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-on-surface text-[12px] font-bold tracking-widest"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Google
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors text-on-surface text-[12px] font-bold tracking-widest"
                            >
                                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                        </div>
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
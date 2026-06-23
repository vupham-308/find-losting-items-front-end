import { useState } from "react"
import { Link } from "react-router-dom"
import { forgotPassword, resetPassword } from "../services/api.js"

const STEPS = { EMAIL: "email", RESET: "reset", SUCCESS: "success" }

export default function ForgotPassword() {
    const [step, setStep] = useState(STEPS.EMAIL)
    const [mail, setMail] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)

    // Các điều kiện của mật khẩu mới
    const pwRules = [
        { label: "Tối thiểu 8 ký tự", ok: newPassword.length >= 8 },
        { label: "Có chữ thường (a-z)", ok: /[a-z]/.test(newPassword) },
        { label: "Có chữ hoa (A-Z)", ok: /[A-Z]/.test(newPassword) },
        { label: "Có chữ số (0-9)", ok: /[0-9]/.test(newPassword) },
        { label: "Có ký tự đặc biệt", ok: /[^a-zA-Z0-9]/.test(newPassword) },
    ]

    // --- OTP input logic ---
    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return
        const next = [...otp]
        next[index] = value
        setOtp(next)
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (text.length === 6) {
            setOtp(text.split(""))
            document.getElementById("otp-5")?.focus()
        }
        e.preventDefault()
    }

    // --- Countdown gửi lại OTP ---
    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) { clearInterval(timer); return 0 }
                return c - 1
            })
        }, 1000)
    }

    // --- Bước 1: gửi email lấy OTP ---
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setError("")
        if (!mail.trim()) { setError("Vui lòng nhập email"); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setError("Email không hợp lệ"); return }

        setLoading(true)
        try {
            await forgotPassword({ mail })
            setStep(STEPS.RESET)
            startCountdown()
        } catch (err) {
            setError(err.message || "Gửi yêu cầu thất bại, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }

    // --- Gửi lại OTP ---
    const handleResend = async () => {
        setError("")
        try {
            await forgotPassword({ mail })
            setOtp(["", "", "", "", "", ""])
            startCountdown()
        } catch (err) {
            setError(err.message || "Gửi lại OTP thất bại")
        }
    }

    // --- Bước 2: xác nhận OTP + mật khẩu mới ---
    const handleReset = async (e) => {
        e.preventDefault()
        setError("")

        const code = otp.join("")
        if (code.length < 6) { setError("Vui lòng nhập đủ 6 số OTP"); return }
        if (!pwRules.every((r) => r.ok)) { setError("Mật khẩu chưa đủ điều kiện"); return }
        if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp"); return }

        setLoading(true)
        try {
            await resetPassword({ mail, otp: code, newPassword })
            setStep(STEPS.SUCCESS)
        } catch (err) {
            setError(err.message || "Đặt lại mật khẩu thất bại, vui lòng thử lại")
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
                        Lấy lại quyền truy cập tài khoản
                    </h2>
                    <p className="mt-4 text-[16px] text-white/80 leading-relaxed">
                        Đừng lo nếu bạn quên mật khẩu. Chỉ cần nhập email, chúng tôi sẽ gửi mã xác thực để đặt lại ngay cho bạn.
                    </p>

                    <ul className="mt-10 space-y-5">
                        {[
                            { icon: "mark_email_read", title: "Xác thực qua email", desc: "Nhận mã OTP đặt lại mật khẩu an toàn qua email." },
                            { icon: "verified_user", title: "An toàn & bảo mật", desc: "Thông tin cá nhân của bạn luôn được bảo vệ." },
                            { icon: "schedule", title: "Nhanh chóng", desc: "Chỉ mất vài phút để lấy lại tài khoản." },
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

            {/* ===== Cột phải: form ===== */}
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

                    {/* Error (chung cho mọi bước, trừ success) */}
                    {error && step !== STEPS.SUCCESS && (
                        <div className="flex items-center gap-2 px-4 py-3 mb-stack-md bg-error-container text-on-error-container rounded-xl text-[14px]">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* ── BƯỚC 1: Nhập email ── */}
                    {step === STEPS.EMAIL && (
                        <>
                            <div className="mb-stack-lg">
                                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-stack-md">
                                    <span className="material-symbols-outlined text-on-primary-container text-[28px]">lock_reset</span>
                                </div>
                                <h1 className="text-on-surface text-[28px] font-bold tracking-tight">Quên mật khẩu?</h1>
                                <p className="text-on-surface-variant text-[15px] mt-1">
                                    Nhập email của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                                </p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-stack-md">
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[13px] font-semibold" htmlFor="mail">Email</label>
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-[16px] font-semibold hover:bg-primary-container active:scale-[0.99] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Đang gửi...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[20px]">send</span> Gửi mã OTP</>
                                    )}
                                </button>
                            </form>

                            <p className="mt-stack-lg text-center text-on-surface-variant text-[14px]">
                                Nhớ mật khẩu rồi?{" "}
                                <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
                            </p>
                        </>
                    )}

                    {/* ── BƯỚC 2: OTP + mật khẩu mới ── */}
                    {step === STEPS.RESET && (
                        <>
                            <div className="mb-stack-lg">
                                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-stack-md">
                                    <span className="material-symbols-outlined text-on-primary-container text-[28px]">password</span>
                                </div>
                                <h1 className="text-on-surface text-[28px] font-bold tracking-tight">Đặt lại mật khẩu</h1>
                                <p className="text-on-surface-variant text-[15px] mt-1">
                                    Nhập mã OTP đã gửi tới{" "}
                                    <span className="font-semibold text-on-surface">{mail}</span> và mật khẩu mới.
                                </p>
                            </div>

                            <form onSubmit={handleReset} className="space-y-stack-md">
                                {/* OTP */}
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[13px] font-semibold">Mã OTP</label>
                                    <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                id={`otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                className={`w-full aspect-square text-center text-[22px] font-bold border-2 rounded-xl outline-none transition-all ${
                                                    digit
                                                        ? "border-primary bg-primary-container text-on-primary-container"
                                                        : "border-outline-variant bg-surface-container-low text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/15"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-right">
                                        {countdown > 0 ? (
                                            <span className="text-on-surface-variant text-[13px]">
                                                Gửi lại sau <span className="font-semibold text-primary">{countdown}s</span>
                                            </span>
                                        ) : (
                                            <button type="button" onClick={handleResend} className="text-primary text-[13px] font-semibold hover:underline">
                                                Gửi lại mã OTP
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Mật khẩu mới */}
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[13px] font-semibold" htmlFor="newPassword">Mật khẩu mới</label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock</span>
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu mới"
                                            className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                        </button>
                                    </div>
                                    <ul className="space-y-1 pt-1">
                                        {pwRules.map((rule) => (
                                            <li key={rule.label} className={`text-[12px] flex items-center gap-1 transition-colors ${rule.ok ? "text-primary" : "text-on-surface-variant"}`}>
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {rule.ok ? "check_circle" : "radio_button_unchecked"}
                                                </span>
                                                {rule.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Xác nhận mật khẩu */}
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[13px] font-semibold" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock_clock</span>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low border rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none ${
                                                confirmPassword && newPassword !== confirmPassword
                                                    ? "border-error focus:ring-error/15 focus:border-error"
                                                    : "border-outline-variant"
                                            }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">{showConfirm ? "visibility_off" : "visibility"}</span>
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <p className={`text-[12px] flex items-center gap-1 ${newPassword === confirmPassword ? "text-primary" : "text-error"}`}>
                                            <span className="material-symbols-outlined text-[14px]">
                                                {newPassword === confirmPassword ? "check_circle" : "cancel"}
                                            </span>
                                            {newPassword === confirmPassword ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-on-primary py-3.5 rounded-xl text-[16px] font-semibold hover:bg-primary-container active:scale-[0.99] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Đang lưu...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[20px]">save</span> Đặt lại mật khẩu</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(STEPS.EMAIL); setError("") }}
                                    className="w-full text-on-surface-variant text-[14px] hover:text-primary transition-colors flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    Đổi email
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── BƯỚC 3: Thành công ── */}
                    {step === STEPS.SUCCESS && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-stack-md">
                                <span className="material-symbols-outlined text-on-primary-container text-[36px]">check_circle</span>
                            </div>
                            <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Đặt lại thành công!</h1>
                            <p className="text-on-surface-variant text-[15px] mb-stack-lg">
                                Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 w-full bg-primary text-on-primary px-8 py-3.5 rounded-xl text-[16px] font-semibold hover:bg-primary-container transition-all shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

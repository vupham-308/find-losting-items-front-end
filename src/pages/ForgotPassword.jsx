import { useState } from "react"

const STEPS = {
    PHONE: "phone",
    OTP: "otp",
    NEW_PASSWORD: "new_password",
    SUCCESS: "success",
}

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

export default function ForgotPassword() {
    const [step, setStep] = useState(STEPS.PHONE)
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)

    // --- OTP input logic ---
    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return
        const next = [...otp]
        next[index] = value
        setOtp(next)
        // Auto focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus()
        }
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

    // --- Countdown resend ---
    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) { clearInterval(timer); return 0 }
                return c - 1
            })
        }, 1000)
    }

    // --- Steps ---
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setError("")
        if (!phone.trim() || !/^[0-9]{9,10}$/.test(phone)) {
            setError("Số điện thoại không hợp lệ")
            return
        }
        setLoading(true)
        try {
            // TODO: await fetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ phone }) })
            await new Promise(r => setTimeout(r, 1000)) // simulate
            setStep(STEPS.OTP)
            startCountdown()
        } catch {
            setError("Gửi OTP thất bại, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setError("")
        if (otp.join("").length < 6) {
            setError("Vui lòng nhập đủ 6 số OTP")
            return
        }
        setLoading(true)
        try {
            // TODO: await fetch("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp: otp.join("") }) })
            await new Promise(r => setTimeout(r, 1000))
            setStep(STEPS.NEW_PASSWORD)
        } catch {
            setError("Mã OTP không đúng, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError("")
        if (newPassword.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return }
        if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp"); return }
        setLoading(true)
        try {
            // TODO: await fetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ phone, otp: otp.join(""), newPassword }) })
            await new Promise(r => setTimeout(r, 1000))
            setStep(STEPS.SUCCESS)
        } catch {
            setError("Đặt lại mật khẩu thất bại, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }



    // Step indicator
    const steps = [STEPS.PHONE, STEPS.OTP, STEPS.NEW_PASSWORD]
    const currentStepIndex = steps.indexOf(step)

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-gutter-mobile">

            {/* Logo */}
            <header className="mb-stack-lg">
                <div className="flex flex-col items-center gap-stack-sm">
                    <a href="/public" className="text-primary text-[20px] font-bold tracking-tight">Sài Gòn Tìm Đồ</a>
                    <div className="h-1 w-12 bg-primary-container rounded-full" />
                </div>
            </header>

            <main className="w-full max-w-md">
                <div
                    className="bg-surface-container-lowest rounded-lg p-stack-lg md:p-10"
                    style={{ boxShadow: "0 4px 12px rgba(0,91,191,0.05), 0 2px 8px rgba(0,0,0,0.05)" }}
                >
                    {/* Step indicator — ẩn khi success */}
                    {step !== STEPS.SUCCESS && (
                        <div className="flex items-center justify-center gap-2 mb-stack-lg">
                            {steps.map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                                        i < currentStepIndex
                                            ? "bg-primary text-on-primary"
                                            : i === currentStepIndex
                                                ? "bg-primary-container text-on-primary-container"
                                                : "bg-surface-container text-on-surface-variant"
                                    }`}>
                                        {i < currentStepIndex
                                            ? <span className="material-symbols-outlined text-[16px]">check</span>
                                            : i + 1
                                        }
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 rounded-full transition-all ${
                                            i < currentStepIndex ? "bg-primary" : "bg-outline-variant"
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 mb-stack-md bg-error-container text-on-error-container rounded-lg text-[14px]">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* ── STEP 1: Nhập SĐT ── */}
                    {step === STEPS.PHONE && (
                        <>
                            <div className="text-center mb-stack-lg">
                                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-stack-md">
                                    <span className="material-symbols-outlined text-on-primary-container text-[32px]">lock_reset</span>
                                </div>
                                <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Quên mật khẩu</h1>
                                <p className="text-on-surface-variant text-[16px]">
                                    Nhập số điện thoại để nhận mã OTP đặt lại mật khẩu
                                </p>
                            </div>
                            <form onSubmit={handleSendOtp} className="space-y-stack-md">
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
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Số điện thoại của bạn"
                                            className="w-full pl-24 pr-4 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg text-[20px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang gửi...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">send</span> Gửi mã OTP</>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 2: Nhập OTP ── */}
                    {step === STEPS.OTP && (
                        <>
                            <div className="text-center mb-stack-lg">
                                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-stack-md">
                                    <span className="material-symbols-outlined text-on-primary-container text-[32px]">sms</span>
                                </div>
                                <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Nhập mã OTP</h1>
                                <p className="text-on-surface-variant text-[16px]">
                                    Mã 6 số đã được gửi đến{" "}
                                    <span className="font-bold text-on-surface">+84 {phone}</span>
                                </p>
                            </div>
                            <form onSubmit={handleVerifyOtp} className="space-y-stack-md">
                                {/* OTP boxes */}
                                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
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
                                            className={`w-12 h-14 text-center text-[24px] font-bold border-2 rounded-lg outline-none transition-all ${
                                                digit
                                                    ? "border-primary bg-primary-container text-on-primary-container"
                                                    : "border-outline-variant bg-surface text-on-surface focus:border-primary"
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Resend */}
                                <div className="text-center">
                                    {countdown > 0 ? (
                                        <p className="text-on-surface-variant text-[14px]">
                                            Gửi lại sau{" "}
                                            <span className="font-bold text-primary">{countdown}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { startCountdown(); setOtp(["","","","","",""]) }}
                                            className="text-primary text-[14px] font-bold hover:underline"
                                        >
                                            Gửi lại mã OTP
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join("").length < 6}
                                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg text-[20px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang xác thực...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">verified</span> Xác nhận OTP</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(STEPS.PHONE); setError("") }}
                                    className="w-full py-3 text-[14px] text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    Đổi số điện thoại
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 3: Mật khẩu mới ── */}
                    {step === STEPS.NEW_PASSWORD && (
                        <>
                            <div className="text-center mb-stack-lg">
                                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-stack-md">
                                    <span className="material-symbols-outlined text-on-primary-container text-[32px]">key</span>
                                </div>
                                <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Mật khẩu mới</h1>
                                <p className="text-on-surface-variant text-[16px]">
                                    Tạo mật khẩu mới cho tài khoản của bạn
                                </p>
                            </div>
                            <form onSubmit={handleResetPassword} className="space-y-stack-md">
                                {/* New password */}
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[12px] font-bold tracking-widest">MẬT KHẨU MỚI</label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">lock</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự"
                                            className="w-full pl-12 pr-12 py-4 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-on-surface-variant hover:text-on-surface">
                                            <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-stack-sm">
                                    <label className="text-on-surface text-[12px] font-bold tracking-widest">XÁC NHẬN MẬT KHẨU</label>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant">lock_clock</span>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu"
                                            className={`w-full pl-12 pr-12 py-4 bg-surface border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface text-[16px] outline-none ${
                                                confirmPassword && newPassword !== confirmPassword
                                                    ? "border-error"
                                                    : "border-outline-variant"
                                            }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 text-on-surface-variant hover:text-on-surface">
                                            <span className="material-symbols-outlined">{showConfirm ? "visibility_off" : "visibility"}</span>
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
                                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg text-[20px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang lưu...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">save</span> Lưu mật khẩu mới</>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── STEP 4: Thành công ── */}
                    {step === STEPS.SUCCESS && (
                        <div className="text-center py-stack-md">
                            <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-stack-md">
                                <span className="material-symbols-outlined text-on-primary-container text-[40px]">check_circle</span>
                            </div>
                            <h1 className="text-on-surface text-[26px] font-bold tracking-tight mb-2">Thành công!</h1>
                            <p className="text-on-surface-variant text-[16px] mb-stack-lg">
                                Mật khẩu của bạn đã được đặt lại. Hãy đăng nhập lại.
                            </p>

                            href="/login"
                            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg text-[16px] font-semibold hover:opacity-90 transition-all shadow-md"
                            <a>
                            <span className="material-symbols-outlined">login</span>
                            Đăng nhập ngay
                        </a>
                        </div>
                        )}

                    {/* Login link — ẩn khi success */}
                    {step !== STEPS.SUCCESS && (
                        <div className="mt-stack-lg text-center">
                            <p className="text-on-surface-variant text-[14px]">
                                Nhớ mật khẩu rồi?{" "}
                                <a href="/login" className="text-primary font-bold hover:underline">Đăng nhập</a>
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.js"
import * as authService from "../../services/authService.js"

export default function ProfilePage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Setup password form state
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        const fetchProfile = async () => {
            try {
                const res = await authService.getMe()
                setProfile(res?.data ?? null)
            } catch (err) {
                setError(err.message || "Không thể tải thông tin cá nhân")
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [user, navigate])

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    const passwordChecks = [
        { label: "Ít nhất 8 ký tự", valid: newPassword.length >= 8 },
        { label: "Chữ thường (a-z)", valid: /[a-z]/.test(newPassword) },
        { label: "Chữ hoa (A-Z)", valid: /[A-Z]/.test(newPassword) },
        { label: "Chữ số (0-9)", valid: /\d/.test(newPassword) },
        { label: "Ký tự đặc biệt (@$!%*?&)", valid: /[@$!%*?&]/.test(newPassword) },
    ]
    const isPasswordValid = newPassword.length >= 8 && passwordRegex.test(newPassword)
    const isConfirmMatch = confirmPassword === newPassword && confirmPassword.length > 0

    const handleSetupPassword = async (e) => {
        e.preventDefault()
        setPasswordError("")
        setPasswordSuccess("")

        if (!isPasswordValid) {
            setPasswordError("Mật khẩu không đáp ứng yêu cầu")
            return
        }
        if (!isConfirmMatch) {
            setPasswordError("Mật khẩu xác nhận không khớp")
            return
        }

        setPasswordLoading(true)
        try {
            await authService.setupPassword({ newPassword, confirmPassword })
            setPasswordSuccess("Thiết lập mật khẩu thành công! Bạn có thể đăng nhập bằng email và mật khẩu.")
            setProfile((prev) => ({ ...prev, hasPassword: true }))
            setNewPassword("")
            setConfirmPassword("")
            setShowPasswordForm(false)
        } catch (err) {
            setPasswordError(err.message || "Thiết lập mật khẩu thất bại")
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
                        progress_activity
                    </span>
                    <p className="text-on-surface-variant text-[15px]">Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="bg-error-container text-on-error-container rounded-2xl p-6 max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-[40px] mb-2">error</span>
                    <p className="text-[15px] font-medium">{error}</p>
                </div>
            </div>
        )
    }

    if (!profile) return null

    const isAdmin = profile.type === "ADMIN"

    const infoItems = [
        {
            icon: "mail",
            label: "Email",
            value: profile.mail,
        },
        {
            icon: "phone",
            label: "Số điện thoại",
            value: profile.phone || "Chưa cập nhật",
            muted: !profile.phone,
        },
        {
            icon: "calendar_month",
            label: "Ngày tham gia",
            value: profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  })
                : "Không rõ",
        },
        {
            icon: "link",
            label: "Liên kết mạng xã hội",
            value: profile.socialLink || "Chưa cập nhật",
            muted: !profile.socialLink,
            isLink: !!profile.socialLink,
        },
    ]

    const accountStatus = [
        {
            icon: profile.googleAccount ? "check_circle" : "cancel",
            label: "Tài khoản Google",
            hint: profile.googleAccount ? "Đã liên kết" : "Chưa liên kết",
            active: profile.googleAccount,
        },
        {
            icon: profile.hasPassword ? "check_circle" : "cancel",
            label: "Mật khẩu",
            hint: profile.hasPassword ? "Đã thiết lập" : "Chưa thiết lập",
            active: profile.hasPassword,
        },
    ]

    return (
        <div className="bg-surface min-h-[calc(100vh-4rem)]">
            <div className="max-w-5xl mx-auto px-gutter-mobile sm:px-gutter-desktop py-6 sm:py-10">
                {/* Breadcrumb / page title */}
                <div className="flex items-center gap-2 mb-5 text-on-surface-variant">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container-high transition-colors"
                        aria-label="Quay lại"
                    >
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </button>
                    <h1 className="text-[20px] sm:text-[22px] font-bold text-on-surface">Hồ sơ cá nhân</h1>
                </div>

                {/* Hero header card */}
                <div className="bg-surface-container-lowest rounded-3xl shadow-lg overflow-hidden">
                    <div
                        className="h-28 sm:h-36 relative"
                        style={{
                            background:
                                "linear-gradient(135deg, #005bbf 0%, #1a73e8 45%, #4a9af5 100%)",
                        }}
                    >
                        <div className="absolute top-5 right-10 w-28 h-28 rounded-full bg-white/10" />
                        <div className="absolute bottom-4 right-28 w-16 h-16 rounded-full bg-white/8" />
                        <div className="absolute top-8 left-14 w-12 h-12 rounded-full bg-white/8" />
                    </div>

                    <div className="relative z-10 px-6 sm:px-8 pb-6">
                        {/* Avatar — absolutely positioned so it overlaps the banner without pushing the name into it */}
                        <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-surface-container-lowest border-4 border-surface-container-lowest shadow-xl flex items-center justify-center">
                                {profile.socialLink ? (
                                    <img
                                        src={profile.socialLink}
                                        alt={profile.name}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = "none"
                                            e.target.nextSibling.style.display = "flex"
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`w-full h-full rounded-full flex items-center justify-center text-on-primary ${
                                        profile.socialLink ? "hidden" : ""
                                    }`}
                                    style={{
                                        background: "linear-gradient(135deg, #005bbf, #1a73e8)",
                                    }}
                                >
                                    <span className="text-[44px] sm:text-[52px] font-bold">
                                        {profile.name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                </div>
                            </div>

                            {/* Name + meta — padded to clear the avatar (below it on mobile, beside it on desktop) */}
                            <div className="pt-16 text-center sm:text-left sm:pt-4 sm:pl-40 min-w-0">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                    <h2 className="text-[24px] sm:text-[28px] font-bold text-on-surface tracking-tight truncate">
                                        {profile.name}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold ${
                                            isAdmin
                                                ? "bg-tertiary text-on-tertiary"
                                                : "bg-primary text-on-primary"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[15px]">
                                            shield_person
                                        </span>
                                        {isAdmin ? "Quản trị viên" : "Người dùng"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1 mt-1.5 text-on-surface-variant text-[14px]">
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        <span className="truncate">{profile.mail}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">badge</span>
                                        ID #{profile.id}
                                    </span>
                                </div>
                            </div>
                    </div>
                </div>

                {/* Two-column dashboard */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr] items-start">
                    {/* Left column — account status */}
                    <div className="bg-surface-container-lowest rounded-2xl shadow-md p-5 sm:p-6 lg:sticky lg:top-24">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined text-primary text-[22px]">
                                security
                            </span>
                            <h3 className="text-[16px] font-bold text-on-surface">
                                Trạng thái tài khoản
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {accountStatus.map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${
                                        item.active
                                            ? "border-primary/20 bg-primary-fixed/30"
                                            : "border-outline-variant bg-surface-container-low"
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-[24px] ${
                                            item.active ? "text-primary" : "text-outline"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <div className="min-w-0">
                                        <p
                                            className={`text-[14px] font-semibold ${
                                                item.active
                                                    ? "text-on-primary-fixed"
                                                    : "text-on-surface"
                                            }`}
                                        >
                                            {item.label}
                                        </p>
                                        <p className="text-[12px] text-on-surface-variant">
                                            {item.hint}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column — details + security */}
                    <div className="space-y-6">
                        {/* Personal info */}
                        <div className="bg-surface-container-lowest rounded-2xl shadow-md p-5 sm:p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-primary text-[22px]">
                                    person
                                </span>
                                <h3 className="text-[16px] font-bold text-on-surface">
                                    Thông tin cá nhân
                                </h3>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {infoItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-start gap-3.5 px-4 py-3.5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-on-primary-fixed text-[20px]">
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">
                                                {item.label}
                                            </p>
                                            {item.isLink ? (
                                                <a
                                                    href={item.value}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary text-[15px] font-medium hover:underline truncate block mt-0.5"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p
                                                    className={`text-[15px] font-medium truncate mt-0.5 ${
                                                        item.muted
                                                            ? "text-outline italic"
                                                            : "text-on-surface"
                                                    }`}
                                                >
                                                    {item.value}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Setup password section — only for Google accounts without a password */}
                        {profile.googleAccount && !profile.hasPassword && (
                            <div className="bg-surface-container-lowest rounded-2xl shadow-md p-5 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-secondary text-[22px]">
                                            key
                                        </span>
                                        <h3 className="text-[16px] font-bold text-on-surface">
                                            Thiết lập mật khẩu
                                        </h3>
                                    </div>
                                    {!showPasswordForm && (
                                        <button
                                            onClick={() => {
                                                setShowPasswordForm(true)
                                                setPasswordError("")
                                                setPasswordSuccess("")
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-on-secondary rounded-full text-[13px] font-semibold hover:opacity-90 transition-all shadow-md shadow-secondary/20"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            Tạo mật khẩu
                                        </button>
                                    )}
                                </div>

                                {/* Info banner */}
                                {!showPasswordForm && !passwordSuccess && (
                                    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-secondary-fixed/30 border border-secondary/15">
                                        <span className="material-symbols-outlined text-on-secondary-fixed text-[20px] mt-0.5 shrink-0">
                                            info
                                        </span>
                                        <p className="text-[14px] text-on-secondary-fixed leading-relaxed">
                                            Tài khoản của bạn đang sử dụng đăng nhập Google. Bạn có thể thiết lập mật khẩu để đăng nhập bằng email và mật khẩu.
                                        </p>
                                    </div>
                                )}

                                {/* Success message */}
                                {passwordSuccess && (
                                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary-fixed/30 border border-primary/15">
                                        <span className="material-symbols-outlined text-primary text-[20px]">
                                            check_circle
                                        </span>
                                        <p className="text-[14px] text-on-primary-fixed font-medium">
                                            {passwordSuccess}
                                        </p>
                                    </div>
                                )}

                                {/* Password setup form */}
                                {showPasswordForm && (
                                    <form onSubmit={handleSetupPassword} className="space-y-4 mt-2">
                                        {/* Error */}
                                        {passwordError && (
                                            <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-[14px]">
                                                <span className="material-symbols-outlined text-[18px]">error</span>
                                                {passwordError}
                                            </div>
                                        )}

                                        {/* New password */}
                                        <div className="space-y-1.5">
                                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="newPassword">
                                                Mật khẩu mới
                                            </label>
                                            <div className="relative flex items-center">
                                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock</span>
                                                <input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Nhập mật khẩu mới"
                                                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all text-on-surface text-[15px] outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {showNewPassword ? "visibility_off" : "visibility"}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Password strength checklist */}
                                            {newPassword.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 px-1">
                                                    {passwordChecks.map((check) => (
                                                        <div key={check.label} className="flex items-center gap-2">
                                                            <span
                                                                className={`material-symbols-outlined text-[16px] ${
                                                                    check.valid ? "text-primary" : "text-outline"
                                                                }`}
                                                            >
                                                                {check.valid ? "check_circle" : "radio_button_unchecked"}
                                                            </span>
                                                            <span
                                                                className={`text-[12px] ${
                                                                    check.valid ? "text-on-surface font-medium" : "text-outline"
                                                                }`}
                                                            >
                                                                {check.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm password */}
                                        <div className="space-y-1.5">
                                            <label className="text-on-surface text-[13px] font-semibold" htmlFor="confirmPassword">
                                                Xác nhận mật khẩu
                                            </label>
                                            <div className="relative flex items-center">
                                                <span className="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock_reset</span>
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Nhập lại mật khẩu"
                                                    className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low border rounded-xl focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/15 transition-all text-on-surface text-[15px] outline-none ${
                                                        confirmPassword.length > 0
                                                            ? isConfirmMatch
                                                                ? "border-primary focus:border-primary"
                                                                : "border-error focus:border-error"
                                                            : "border-outline-variant focus:border-primary"
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {showConfirmPassword ? "visibility_off" : "visibility"}
                                                    </span>
                                                </button>
                                            </div>
                                            {confirmPassword.length > 0 && !isConfirmMatch && (
                                                <p className="text-error text-[12px] mt-1 px-1">Mật khẩu xác nhận không khớp</p>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={passwordLoading || !isPasswordValid || !isConfirmMatch}
                                                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-[14px] font-semibold hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                            >
                                                {passwordLoading ? (
                                                    <>
                                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                                        Xác nhận
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordForm(false)
                                                    setNewPassword("")
                                                    setConfirmPassword("")
                                                    setPasswordError("")
                                                }}
                                                className="px-5 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl text-[14px] font-medium transition-colors"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

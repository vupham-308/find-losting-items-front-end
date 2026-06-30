import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.js"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GSI_SRC = "https://accounts.google.com/gsi/client"

// Tải thư viện Google Identity Services một lần
function loadGsi() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve()
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
        if (existing) {
            existing.addEventListener("load", resolve)
            existing.addEventListener("error", reject)
            return
        }
        const s = document.createElement("script")
        s.src = GSI_SRC
        s.async = true
        s.defer = true
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
    })
}

/**
 * Nút "Đăng nhập bằng Google" dùng chung cho cả trang Login và Register.
 * Lấy idToken từ Google rồi gửi lên backend qua googleLogin().
 */
export default function GoogleLoginButton({ onError }) {
    const navigate = useNavigate()
    const { googleLogin } = useAuth()
    const containerRef = useRef(null)

    useEffect(() => {
        let cancelled = false

        if (!CLIENT_ID) {
            onError?.("Chưa cấu hình VITE_GOOGLE_CLIENT_ID")
            return
        }

        loadGsi()
            .then(() => {
                if (cancelled || !window.google || !containerRef.current) return

                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: async (response) => {
                        try {
                            const user = await googleLogin({ idToken: response.credential })
                            // Phân quyền: Admin → /admin, User → /
                            if (user?.userType === "ADMIN") {
                                navigate("/admin")
                            } else {
                                navigate("/")
                            }
                        } catch (e) {
                            onError?.(e.message || "Đăng nhập Google thất bại")
                        }
                    },
                })

                // Render nút chính thức của Google, rộng theo container (tối đa 400px)
                const width = Math.min(containerRef.current.offsetWidth || 360, 400)
                window.google.accounts.id.renderButton(containerRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "pill",
                    logo_alignment: "center",
                    width,
                })
            })
            .catch(() => onError?.("Không tải được Google Sign-In"))

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <div ref={containerRef} className="flex justify-center" />
}

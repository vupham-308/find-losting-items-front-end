import { useEffect, useState, useCallback, useRef } from "react"
import {
    Activity, RefreshCw, Server, Database, ScanEye, Bot,
    CheckCircle2, XCircle, HelpCircle, AlertTriangle,
} from "lucide-react"
import { getSystemHealth } from "../../services/adminService.js"

// Các thành phần được theo dõi, theo đúng thứ tự hiển thị.
// `key` khớp với field trong response `data`.
const COMPONENTS = [
    { key: "backend", label: "Backend API", icon: Server, desc: "Máy chủ ứng dụng chính" },
    { key: "database", label: "Cơ sở dữ liệu", icon: Database, desc: "Lưu trữ người dùng & bài đăng" },
    { key: "clip", label: "CLIP", icon: ScanEye, desc: "Dịch vụ tìm kiếm bằng hình ảnh" },
    { key: "ollama", label: "Ollama", icon: Bot, desc: "Dịch vụ mô hình ngôn ngữ" },
]

const CHECKED_AT_KEY = "checkedAt"
const AUTO_REFRESH_MS = 30000

// Backend trả về chuỗi tự do ⇒ chuẩn hoá về 3 mức để tô màu.
function classifyStatus(raw) {
    if (raw == null || raw === "") return "unknown"
    const value = String(raw).trim().toUpperCase()

    if (["UP", "OK", "HEALTHY", "CONNECTED", "RUNNING", "ALIVE", "TRUE", "200"].includes(value)) {
        return "up"
    }
    if (["DOWN", "ERROR", "FAILED", "UNAVAILABLE", "DISCONNECTED", "OFFLINE", "FALSE"].includes(value)) {
        return "down"
    }
    // Các trạng thái trung gian hay gặp: DEGRADED, SLOW, PARTIAL...
    if (["DEGRADED", "SLOW", "PARTIAL", "WARNING", "WARN"].includes(value)) {
        return "degraded"
    }
    return "unknown"
}

const STATUS_META = {
    up: { label: "Hoạt động", icon: CheckCircle2, cls: "up" },
    down: { label: "Ngừng hoạt động", icon: XCircle, cls: "down" },
    degraded: { label: "Suy giảm", icon: AlertTriangle, cls: "degraded" },
    unknown: { label: "Không xác định", icon: HelpCircle, cls: "unknown" },
}

function formatDateTime(value) {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
}

export default function SystemPage() {
    const [health, setHealth] = useState(null)
    const [errors, setErrors] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [fetchError, setFetchError] = useState(null)
    const [lastFetchedAt, setLastFetchedAt] = useState(null)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Tránh setState sau khi component đã unmount (request health có thể chậm).
    const mountedRef = useRef(true)
    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    // `initial` = lần nạp khi vừa vào trang: state `loading` đã là true sẵn nên
    // không cần setState đồng bộ (tránh render thừa ngay trong effect).
    const load = useCallback(async ({ silent = false, initial = false } = {}) => {
        if (!initial) {
            if (silent) setRefreshing(true)
            else setLoading(true)
            setFetchError(null)
        }

        try {
            const res = await getSystemHealth()
            if (!mountedRef.current) return
            setHealth(res?.data ?? null)
            setErrors(res?.errors ?? null)
            setLastFetchedAt(new Date())
        } catch (err) {
            if (!mountedRef.current) return
            // Không gọi được endpoint health cũng là một tín hiệu: backend đang chết.
            setFetchError(err.message || "Không thể kết nối tới máy chủ")
            setHealth(null)
            setErrors(null)
            setLastFetchedAt(new Date())
        } finally {
            if (mountedRef.current) {
                setLoading(false)
                setRefreshing(false)
            }
        }
    }, [])

    // Nạp lần đầu. Đây là việc đồng bộ với hệ thống bên ngoài (gọi API) — đúng mục đích
    // của effect; mọi setState đều nằm sau `await` nên không gây cascading render.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load({ initial: true })
    }, [load])

    // Tự động làm mới
    useEffect(() => {
        if (!autoRefresh) return
        const id = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS)
        return () => clearInterval(id)
    }, [autoRefresh, load])

    // Tổng hợp trạng thái chung
    const statuses = COMPONENTS.map((c) =>
        fetchError ? "down" : classifyStatus(health?.[c.key])
    )
    const downCount = statuses.filter((s) => s === "down").length
    const degradedCount = statuses.filter((s) => s === "degraded" || s === "unknown").length

    let overall = "up"
    if (fetchError || downCount > 0) overall = "down"
    else if (degradedCount > 0) overall = "degraded"

    const overallText = {
        up: "Tất cả dịch vụ đang hoạt động bình thường",
        degraded: `${degradedCount} dịch vụ cần chú ý`,
        down: fetchError
            ? "Không kết nối được tới máy chủ"
            : `${downCount} dịch vụ đang ngừng hoạt động`,
    }[overall]

    const OverallIcon = STATUS_META[overall].icon
    const errorEntries = errors && typeof errors === "object" ? Object.entries(errors) : []

    return (
        <>
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Hệ thống</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Tình trạng hệ thống</span>
                    </div>
                </div>
                <div className="topbar-actions">
                    <label className="health-auto-toggle" title="Tự động kiểm tra mỗi 30 giây">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Tự động làm mới
                    </label>
                    <button
                        className="filter-btn primary"
                        onClick={() => load({ silent: true })}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw
                            size={14}
                            className={refreshing ? "health-spin" : undefined}
                        />
                        {refreshing ? "Đang kiểm tra..." : "Kiểm tra lại"}
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="admin-card">
                        <div className="admin-loading">
                            <div className="admin-loading-spinner" />
                            <span>Đang kiểm tra tình trạng hệ thống...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ---------- Banner tổng quan ---------- */}
                        <div className={`health-banner ${overall}`}>
                            <div className="health-banner-icon">
                                <OverallIcon size={26} />
                            </div>
                            <div className="health-banner-text">
                                <h2>{overallText}</h2>
                                <p>
                                    Kiểm tra lúc {formatDateTime(health?.[CHECKED_AT_KEY] || lastFetchedAt)}
                                    {autoRefresh && " · Tự động làm mới mỗi 30 giây"}
                                </p>
                            </div>
                            <div className="health-banner-count">
                                <span className="health-banner-count-value">
                                    {statuses.filter((s) => s === "up").length}/{COMPONENTS.length}
                                </span>
                                <span className="health-banner-count-label">dịch vụ hoạt động</span>
                            </div>
                        </div>

                        {fetchError && (
                            <div className="admin-error">
                                ⚠️ {fetchError}
                            </div>
                        )}

                        {/* ---------- Lưới thành phần ---------- */}
                        <div className="health-grid">
                            {COMPONENTS.map((comp, i) => {
                                const status = statuses[i]
                                const meta = STATUS_META[status]
                                const StatusIcon = meta.icon
                                const CompIcon = comp.icon
                                const rawValue = health?.[comp.key]

                                return (
                                    <div key={comp.key} className={`health-card ${meta.cls}`}>
                                        <div className="health-card-top">
                                            <div className="health-card-icon">
                                                <CompIcon size={20} />
                                            </div>
                                            <span className={`health-pill ${meta.cls}`}>
                                                <StatusIcon size={12} />
                                                {meta.label}
                                            </span>
                                        </div>

                                        <h3 className="health-card-title">{comp.label}</h3>
                                        <p className="health-card-desc">{comp.desc}</p>

                                        <div className="health-card-raw">
                                            <span className="health-card-raw-label">Trạng thái</span>
                                            <code>{rawValue ? String(rawValue) : "Không có dữ liệu"}</code>
                                        </div>

                                        {errors?.[comp.key] && (
                                            <div className="health-card-error">
                                                <AlertTriangle size={13} />
                                                <span>{errors[comp.key]}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* ---------- Chi tiết lỗi khác ---------- */}
                        {errorEntries.length > 0 && (
                            <div className="admin-card" style={{ marginTop: 24 }}>
                                <div className="admin-card-header">
                                    <div className="admin-card-title">
                                        <AlertTriangle size={16} color="var(--admin-danger)" />
                                        Chi tiết lỗi
                                        <span className="badge">{errorEntries.length}</span>
                                    </div>
                                </div>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Thành phần</th>
                                                <th>Thông báo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {errorEntries.map(([key, message]) => (
                                                <tr key={key}>
                                                    <td style={{ fontWeight: 600, color: "var(--admin-text)" }}>
                                                        {COMPONENTS.find((c) => c.key === key)?.label || key}
                                                    </td>
                                                    <td style={{ whiteSpace: "normal", color: "var(--admin-danger)" }}>
                                                        {String(message)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ---------- Thông tin lần kiểm tra ---------- */}
                        <div className="admin-card" style={{ marginTop: 24 }}>
                            <div className="admin-card-header">
                                <div className="admin-card-title">
                                    <Activity size={16} color="var(--admin-brand)" />
                                    Thông tin kiểm tra
                                </div>
                            </div>
                            <div className="admin-modal-body">
                                <div className="user-detail-grid">
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Máy chủ báo cáo lúc</div>
                                        <div className="user-detail-value">
                                            {formatDateTime(health?.[CHECKED_AT_KEY])}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Trang tải dữ liệu lúc</div>
                                        <div className="user-detail-value">
                                            {formatDateTime(lastFetchedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

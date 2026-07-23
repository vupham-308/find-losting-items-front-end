import { useEffect, useState, useCallback } from "react"
import {
    RefreshCw, Eye, Trash2, ChevronLeft, ChevronRight, X, FileText, AlertTriangle,
    Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, CheckCircle2,
    RotateCw, ImageOff, MapPin, User,
} from "lucide-react"
import useAdminStore from "../../stores/adminStore.js"
import {
    POST_TYPES,
    POST_STATUSES,
    POST_SORT_FIELDS,
    getPostTypeLabel,
    getPostStatusLabel,
    getCategoryLabel,
    getPostById,
    updatePostStatus,
    deletePost,
} from "../../services/adminService.js"

// Map trạng thái → class màu của badge.
const STATUS_CLASS = {
    ACTIVE: "active",
    RESOLVED: "resolved",
    DELETED: "deleted",
}

function StatusBadge({ status }) {
    return (
        <span className={`badge-status ${STATUS_CLASS[status] || "deleted"}`}>
            {getPostStatusLabel(status)}
        </span>
    )
}

// Mũi tên chỉ hướng sắp xếp trên tiêu đề cột.
function SortIcon({ field, sortBy, sortDir }) {
    if (sortBy !== field) return <ArrowUpDown size={12} className="sort-icon" />
    return sortDir === "ASC" ? (
        <ArrowUp size={12} className="sort-icon active" />
    ) : (
        <ArrowDown size={12} className="sort-icon active" />
    )
}

// Ảnh bài đăng có thể hỏng ⇒ hiện khung thay thế.
function PostThumb({ src, alt }) {
    const [failedSrc, setFailedSrc] = useState(null)

    if (!src || failedSrc === src) {
        return (
            <div className="post-thumb broken">
                <ImageOff size={16} />
            </div>
        )
    }
    return (
        <div className="post-thumb">
            <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
        </div>
    )
}

function formatDateTime(value) {
    if (!value) return "—"
    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function PostManagementPage() {
    const {
        posts,
        postsLoading,
        postsError,
        postsPagination,
        postsType,
        postsStatus,
        postsSortBy,
        postsSortDir,
        setPostsType,
        setPostsStatus,
        setPostsSort,
        fetchPosts,
    } = useAdminStore()

    // Xem chi tiết
    const [detailPost, setDetailPost] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState(null)

    // Đổi trạng thái: { post, nextStatus }
    const [statusTarget, setStatusTarget] = useState(null)
    const [statusSaving, setStatusSaving] = useState(false)
    const [statusError, setStatusError] = useState(null)

    // Xoá bài đăng
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    useEffect(() => {
        fetchPosts({ page: 0 })
    }, [])

    const { pageNumber, pageSize, totalElements, totalPages } = postsPagination
    const startItem = pageNumber * pageSize + 1
    const endItem = Math.min((pageNumber + 1) * pageSize, totalElements)

    const goToPage = useCallback((p) => fetchPosts({ page: p }), [fetchPosts])

    // Đổi bộ lọc / sắp xếp → luôn quay về trang đầu.
    const handleTypeChange = (type) => {
        setPostsType(type)
        fetchPosts({ page: 0, type })
    }

    const handleStatusChange = (status) => {
        setPostsStatus(status)
        fetchPosts({ page: 0, status })
    }

    const handleSortByChange = (sortBy) => {
        setPostsSort(sortBy, postsSortDir)
        fetchPosts({ page: 0, sortBy })
    }

    const toggleSortDir = () => {
        const sortDir = postsSortDir === "ASC" ? "DESC" : "ASC"
        setPostsSort(postsSortBy, sortDir)
        fetchPosts({ page: 0, sortDir })
    }

    // Bấm tiêu đề cột: cùng cột thì đảo chiều, khác cột thì giảm dần trước.
    const handleSortColumn = (field) => {
        const sortDir = postsSortBy === field && postsSortDir === "DESC" ? "ASC" : "DESC"
        setPostsSort(field, sortDir)
        fetchPosts({ page: 0, sortBy: field, sortDir })
    }

    const hasFilters =
        postsType || postsStatus || postsSortBy !== "createdAt" || postsSortDir !== "DESC"

    const handleResetFilters = () => {
        setPostsType("")
        setPostsStatus("")
        setPostsSort("createdAt", "DESC")
        fetchPosts({ page: 0, type: "", status: "", sortBy: "createdAt", sortDir: "DESC" })
    }

    // Xem chi tiết bài đăng
    const handleViewDetail = async (id) => {
        setDetailPost(null)
        setDetailError(null)
        setDetailLoading(true)
        try {
            const res = await getPostById(id)
            setDetailPost(res?.data ?? null)
        } catch (err) {
            setDetailError(err.message || "Không thể tải chi tiết bài đăng")
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setDetailPost(null)
        setDetailLoading(false)
        setDetailError(null)
    }

    const closeStatusModal = () => {
        if (statusSaving) return
        setStatusTarget(null)
        setStatusError(null)
    }

    const handleConfirmStatus = async () => {
        if (!statusTarget) return
        setStatusSaving(true)
        setStatusError(null)
        try {
            await updatePostStatus(statusTarget.post.id, statusTarget.nextStatus)
            setStatusTarget(null)
            await fetchPosts({ page: pageNumber })
        } catch (err) {
            setStatusError(err.message || "Không thể đổi trạng thái bài đăng")
        } finally {
            setStatusSaving(false)
        }
    }

    const closeDeleteModal = () => {
        if (deleting) return
        setDeleteTarget(null)
        setDeleteError(null)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deletePost(deleteTarget.id)
            setDeleteTarget(null)
            // Xoá phần tử cuối của trang (không phải trang đầu) → lùi 1 trang
            const nextPage =
                posts.length === 1 && pageNumber > 0 ? pageNumber - 1 : pageNumber
            await fetchPosts({ page: nextPage })
        } catch (err) {
            setDeleteError(err.message || "Không thể xoá bài đăng")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Quản lý bài đăng</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Bài đăng</span>
                    </div>
                </div>
                <div className="topbar-actions">
                    {/* Lọc theo loại */}
                    <div className="stock-filter-select">
                        <Filter size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Lọc theo loại bài đăng"
                            value={postsType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                        >
                            <option value="">Tất cả loại</option>
                            {POST_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="stock-filter-select-caret" />
                    </div>

                    {/* Lọc theo trạng thái */}
                    <div className="stock-filter-select">
                        <Filter size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Lọc theo trạng thái"
                            value={postsStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            {POST_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="stock-filter-select-caret" />
                    </div>

                    {/* Sắp xếp */}
                    <div className="stock-filter-select">
                        <ArrowUpDown size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Sắp xếp theo"
                            value={postsSortBy}
                            onChange={(e) => handleSortByChange(e.target.value)}
                        >
                            {POST_SORT_FIELDS.map((f) => (
                                <option key={f.value} value={f.value}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="stock-filter-select-caret" />
                    </div>

                    <button
                        className="filter-btn"
                        onClick={toggleSortDir}
                        title={
                            postsSortDir === "ASC"
                                ? "Đang tăng dần — bấm để giảm dần"
                                : "Đang giảm dần — bấm để tăng dần"
                        }
                    >
                        {postsSortDir === "ASC" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {postsSortDir === "ASC" ? "Tăng dần" : "Giảm dần"}
                    </button>

                    {hasFilters && (
                        <button
                            className="filter-btn"
                            onClick={handleResetFilters}
                            title="Xoá bộ lọc"
                        >
                            <RotateCcw size={14} /> Đặt lại
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-content">
                {postsError && <div className="admin-error">⚠️ {postsError}</div>}

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-card-title">
                            Danh sách bài đăng
                            <span className="badge">{totalElements} bài</span>
                        </div>
                        <div className="admin-card-actions">
                            <button
                                className="filter-btn"
                                onClick={() => fetchPosts({ page: pageNumber })}
                                title="Tải lại"
                            >
                                <RefreshCw size={14} /> Tải lại
                            </button>
                        </div>
                    </div>

                    {postsLoading ? (
                        <div className="admin-loading">
                            <div className="admin-loading-spinner" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">📄</div>
                            <div>Không tìm thấy bài đăng nào</div>
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("id")}
                                            >
                                                ID{" "}
                                                <SortIcon
                                                    field="id"
                                                    sortBy={postsSortBy}
                                                    sortDir={postsSortDir}
                                                />
                                            </th>
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("title")}
                                            >
                                                Bài đăng{" "}
                                                <SortIcon
                                                    field="title"
                                                    sortBy={postsSortBy}
                                                    sortDir={postsSortDir}
                                                />
                                            </th>
                                            <th>Loại</th>
                                            <th>Danh mục</th>
                                            <th>Trạng thái</th>
                                            <th>Người đăng</th>
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("createdAt")}
                                            >
                                                Ngày tạo{" "}
                                                <SortIcon
                                                    field="createdAt"
                                                    sortBy={postsSortBy}
                                                    sortDir={postsSortDir}
                                                />
                                            </th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((p) => (
                                            <tr key={p.id}>
                                                <td style={{ color: "#727785", fontWeight: 500 }}>
                                                    #{p.id}
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <PostThumb
                                                            src={p.image_url}
                                                            alt={p.title}
                                                        />
                                                        <div className="user-cell-info">
                                                            <span className="user-cell-name">
                                                                {p.title || "(Không có tiêu đề)"}
                                                            </span>
                                                            <span className="user-cell-email">
                                                                {p.location?.district ||
                                                                    p.location?.city ||
                                                                    "Không rõ khu vực"}
                                                                {p.is_stock_image
                                                                    ? " · ảnh mặc định"
                                                                    : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge-type ${
                                                            p.type === "LOST" ? "admin" : "user"
                                                        }`}
                                                    >
                                                        {getPostTypeLabel(p.type)}
                                                    </span>
                                                </td>
                                                <td>{getCategoryLabel(p.category)}</td>
                                                <td>
                                                    <StatusBadge status={p.status} />
                                                </td>
                                                <td style={{ color: "#727785" }}>
                                                    {p.owner_id ? `#${p.owner_id}` : "—"}
                                                </td>
                                                <td>
                                                    {p.created_at
                                                        ? new Date(p.created_at).toLocaleDateString(
                                                              "vi-VN"
                                                          )
                                                        : "—"}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="table-action-btn"
                                                            title="Xem chi tiết"
                                                            onClick={() => handleViewDetail(p.id)}
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        {p.status === "ACTIVE" ? (
                                                            <button
                                                                className="table-action-btn"
                                                                title="Đánh dấu đã giải quyết"
                                                                onClick={() => {
                                                                    setStatusError(null)
                                                                    setStatusTarget({
                                                                        post: p,
                                                                        nextStatus: "RESOLVED",
                                                                    })
                                                                }}
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="table-action-btn"
                                                                title="Khôi phục về đang hiển thị"
                                                                onClick={() => {
                                                                    setStatusError(null)
                                                                    setStatusTarget({
                                                                        post: p,
                                                                        nextStatus: "ACTIVE",
                                                                    })
                                                                }}
                                                            >
                                                                <RotateCw size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="table-action-btn danger"
                                                            title="Xoá bài đăng"
                                                            onClick={() => {
                                                                setDeleteError(null)
                                                                setDeleteTarget(p)
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="admin-pagination">
                                    <div className="pagination-info">
                                        Hiển thị <strong>{startItem}–{endItem}</strong> trong{" "}
                                        <strong>{totalElements}</strong> kết quả
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="page-btn"
                                            disabled={pageNumber === 0}
                                            onClick={() => goToPage(pageNumber - 1)}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i)
                                            .filter(
                                                (i) =>
                                                    i === 0 ||
                                                    i === totalPages - 1 ||
                                                    Math.abs(i - pageNumber) <= 1
                                            )
                                            .reduce((acc, i, idx, arr) => {
                                                if (idx > 0 && i - arr[idx - 1] > 1) {
                                                    acc.push("ellipsis-" + i)
                                                }
                                                acc.push(i)
                                                return acc
                                            }, [])
                                            .map((item) =>
                                                typeof item === "string" ? (
                                                    <span
                                                        key={item}
                                                        style={{
                                                            color: "#727785",
                                                            padding: "0 4px",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        ···
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={item}
                                                        className={`page-btn${
                                                            item === pageNumber ? " active" : ""
                                                        }`}
                                                        onClick={() => goToPage(item)}
                                                    >
                                                        {item + 1}
                                                    </button>
                                                )
                                            )}
                                        <button
                                            className="page-btn"
                                            disabled={pageNumber >= totalPages - 1}
                                            onClick={() => goToPage(pageNumber + 1)}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ===== Modal chi tiết bài đăng ===== */}
            {(detailLoading || detailPost || detailError) && (
                <div className="admin-modal-overlay" onClick={closeDetail}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                <FileText size={18} color="#005bbf" />
                                Chi tiết bài đăng
                            </h2>
                            <button className="admin-modal-close" onClick={closeDetail}>
                                <X size={16} />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="admin-modal-loading">
                                <div className="admin-loading-spinner" />
                                <span>Đang tải...</span>
                            </div>
                        ) : detailError ? (
                            <div className="admin-modal-body">
                                <div className="admin-error" style={{ marginBottom: 0 }}>
                                    ⚠️ {detailError}
                                </div>
                            </div>
                        ) : detailPost ? (
                            <div className="admin-modal-body">
                                {detailPost.image_url && (
                                    <div className="post-detail-image">
                                        <img
                                            src={detailPost.image_url}
                                            alt={detailPost.title}
                                        />
                                    </div>
                                )}

                                <h3 className="post-detail-title">{detailPost.title}</h3>
                                <div className="post-detail-badges">
                                    <span
                                        className={`badge-type ${
                                            detailPost.type === "LOST" ? "admin" : "user"
                                        }`}
                                    >
                                        {getPostTypeLabel(detailPost.type)}
                                    </span>
                                    <StatusBadge status={detailPost.status} />
                                    {detailPost.is_stock_image && (
                                        <span className="badge-type user">Ảnh mặc định</span>
                                    )}
                                </div>

                                {detailPost.description && (
                                    <p className="post-detail-desc">{detailPost.description}</p>
                                )}

                                <div className="user-detail-grid">
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">ID bài đăng</div>
                                        <div className="user-detail-value">
                                            #{detailPost.post_id}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Danh mục</div>
                                        <div className="user-detail-value">
                                            {getCategoryLabel(detailPost.category)}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Thời điểm xảy ra</div>
                                        <div className="user-detail-value">
                                            {formatDateTime(detailPost.event_time)}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Ngày tạo</div>
                                        <div className="user-detail-value">
                                            {formatDateTime(detailPost.created_at)}
                                        </div>
                                    </div>
                                    <div className="user-detail-item full-width">
                                        <div className="user-detail-label">Người đăng</div>
                                        <div className="user-detail-value user-detail-value-inline">
                                            <User size={15} color="#727785" />
                                            <span style={{ fontWeight: 600, color: "#191c21" }}>
                                                {detailPost.owner?.full_name || detailPost.owner?.fullName || detailPost.owner?.name || detailPost.name || detailPost.user?.full_name || detailPost.user?.name || detailPost.userName || "Người dùng"}
                                            </span>
                                            {(detailPost.owner?.email || detailPost.owner?.mail || detailPost.email || detailPost.phone || detailPost.owner?.phone) && (
                                                <span style={{ color: "#727785", fontSize: "13px", fontWeight: 400 }}>
                                                    ({[detailPost.owner?.email || detailPost.owner?.mail || detailPost.email, detailPost.owner?.phone || detailPost.phone].filter(Boolean).join(" · ")})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {detailPost.location && (
                                        <div className="user-detail-item full-width">
                                            <div className="user-detail-label">Địa điểm</div>
                                            <div className="user-detail-value user-detail-value-inline">
                                                <MapPin size={14} color="#727785" />
                                                {[
                                                    detailPost.location.address,
                                                    detailPost.location.district,
                                                    detailPost.location.city,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") || "Không rõ"}
                                            </div>
                                        </div>
                                    )}
                                    {detailPost.tags?.length > 0 && (
                                        <div className="user-detail-item full-width">
                                            <div className="user-detail-label">Thẻ</div>
                                            <div className="post-detail-badges">
                                                {detailPost.tags.map((t) => (
                                                    <span className="badge-type user" key={t}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ===== Modal xác nhận đổi trạng thái ===== */}
            {statusTarget && (
                <div className="admin-modal-overlay" onClick={closeStatusModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                {statusTarget.nextStatus === "RESOLVED" ? (
                                    <CheckCircle2 size={18} color="#0d7c3e" />
                                ) : (
                                    <RotateCw size={18} color="#005bbf" />
                                )}
                                Đổi trạng thái bài đăng
                            </h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeStatusModal}
                                disabled={statusSaving}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 14,
                                    marginBottom: 20,
                                }}
                            >
                                <StatusBadge status={statusTarget.post.status} />
                                <ChevronRight size={18} color="#727785" />
                                <StatusBadge status={statusTarget.nextStatus} />
                            </div>

                            <p style={{ margin: "0 0 12px", color: "#444", lineHeight: 1.6 }}>
                                Đổi trạng thái bài{" "}
                                <strong>{statusTarget.post.title || `#${statusTarget.post.id}`}</strong>{" "}
                                sang <strong>{getPostStatusLabel(statusTarget.nextStatus)}</strong>?
                            </p>

                            {statusError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {statusError}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                <button
                                    className="filter-btn"
                                    onClick={closeStatusModal}
                                    disabled={statusSaving}
                                >
                                    Huỷ
                                </button>
                                <button
                                    className="filter-btn primary"
                                    onClick={handleConfirmStatus}
                                    disabled={statusSaving}
                                >
                                    {statusSaving ? "Đang cập nhật..." : "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Modal xác nhận xoá ===== */}
            {deleteTarget && (
                <div className="admin-modal-overlay" onClick={closeDeleteModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                <AlertTriangle size={18} color="#ba1a1a" />
                                Xoá bài đăng
                            </h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <p style={{ margin: "0 0 12px", color: "#444", lineHeight: 1.6 }}>
                                Bạn có chắc muốn xoá bài đăng{" "}
                                <strong>{deleteTarget.title || `#${deleteTarget.id}`}</strong>? Hành
                                động này không thể hoàn tác.
                            </p>

                            {deleteError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {deleteError}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                <button
                                    className="filter-btn"
                                    onClick={closeDeleteModal}
                                    disabled={deleting}
                                >
                                    Huỷ
                                </button>
                                <button
                                    className="filter-btn danger"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    <Trash2 size={14} />
                                    {deleting ? "Đang xoá..." : "Xoá"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

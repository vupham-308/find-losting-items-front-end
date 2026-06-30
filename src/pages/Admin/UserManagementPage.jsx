import { useEffect, useState, useCallback } from "react"
import { Search, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, User, AlertTriangle } from "lucide-react"
import useAdminStore from "../../stores/adminStore.js"
import { getUserById, updateUser, deleteUser } from "../../services/adminService.js"

// Palette cho avatar
const AVATAR_COLORS = [
    "#005bbf", "#1a73e8", "#0d7c3e", "#795900", "#9e4300",
    "#ba1a1a", "#004493", "#5c4300",
]

function getAvatarColor(id) {
    return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]
}

export default function UserManagementPage() {
    const {
        users,
        usersLoading,
        usersError,
        usersPagination,
        usersSearch,
        setUsersSearch,
        fetchUsers,
    } = useAdminStore()

    const [searchInput, setSearchInput] = useState(usersSearch)

    // Modal state
    const [detailUser, setDetailUser] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState(null)

    // Sửa thông tin người dùng
    const [editTarget, setEditTarget] = useState(null)
    const [editForm, setEditForm] = useState({ name: "", phone: "" })
    const [editSaving, setEditSaving] = useState(false)
    const [editError, setEditError] = useState(null)

    // Xoá người dùng
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    // Fetch lần đầu
    useEffect(() => {
        fetchUsers({ page: 0 })
    }, [])

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchInput !== usersSearch) {
                setUsersSearch(searchInput)
                fetchUsers({ page: 0, search: searchInput })
            }
        }, 400)
        return () => clearTimeout(t)
    }, [searchInput])

    const goToPage = useCallback(
        (p) => fetchUsers({ page: p }),
        [fetchUsers]
    )

    // Gọi API xem chi tiết
    const handleViewDetail = async (userId) => {
        setDetailUser(null)
        setDetailError(null)
        setDetailLoading(true)
        try {
            const res = await getUserById(userId)
            setDetailUser(res?.data ?? null)
        } catch (err) {
            setDetailError(err.message || "Không thể tải thông tin người dùng")
        } finally {
            setDetailLoading(false)
        }
    }

    const closeDetail = () => {
        setDetailUser(null)
        setDetailLoading(false)
        setDetailError(null)
    }

    // Mở modal sửa thông tin
    const openEdit = (u) => {
        setEditError(null)
        setEditForm({ name: u.name || "", phone: u.phone || "" })
        setEditTarget(u)
    }

    const closeEdit = () => {
        if (editSaving) return
        setEditTarget(null)
        setEditError(null)
    }

    // Lưu thay đổi
    const handleSaveEdit = async () => {
        if (!editTarget) return
        if (!editForm.name.trim()) {
            setEditError("Tên không được để trống")
            return
        }
        setEditSaving(true)
        setEditError(null)
        try {
            await updateUser(editTarget.id, {
                name: editForm.name.trim(),
                phone: editForm.phone.trim(),
            })
            setEditTarget(null)
            await fetchUsers({ page: pageNumber })
        } catch (err) {
            setEditError(err.message || "Không thể cập nhật người dùng")
        } finally {
            setEditSaving(false)
        }
    }

    // Xác nhận & thực hiện xoá người dùng
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteUser(deleteTarget.id)
            setDeleteTarget(null)
            // Nếu vừa xoá phần tử cuối cùng của trang (và không phải trang đầu) → lùi 1 trang
            const nextPage =
                users.length === 1 && pageNumber > 0 ? pageNumber - 1 : pageNumber
            await fetchUsers({ page: nextPage })
        } catch (err) {
            setDeleteError(err.message || "Không thể xoá người dùng")
        } finally {
            setDeleting(false)
        }
    }

    const closeDeleteModal = () => {
        if (deleting) return
        setDeleteTarget(null)
        setDeleteError(null)
    }

    const { pageNumber, pageSize, totalElements, totalPages } = usersPagination
    const startItem = pageNumber * pageSize + 1
    const endItem = Math.min((pageNumber + 1) * pageSize, totalElements)

    return (
        <>
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Quản lý người dùng</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Người dùng</span>
                    </div>
                </div>
                <div className="topbar-actions">
                    <div className="topbar-search">
                        <Search size={16} className="topbar-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-content">
                {/* Error */}
                {usersError && (
                    <div className="admin-error">
                        ⚠️ {usersError}
                    </div>
                )}

                {/* Card */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-card-title">
                            Danh sách người dùng
                            <span className="badge">{totalElements} người</span>
                        </div>
                        <div className="admin-card-actions">
                            <button
                                className="filter-btn"
                                onClick={() => fetchUsers({ page: 0 })}
                                title="Tải lại"
                            >
                                <RefreshCw size={14} /> Tải lại
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {usersLoading ? (
                        <div className="admin-loading">
                            <div className="admin-loading-spinner" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">👤</div>
                            <div>Không tìm thấy người dùng nào</div>
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Người dùng</th>
                                            <th>Số điện thoại</th>
                                            <th>Loại</th>
                                            <th>Google</th>
                                            <th>Mật khẩu</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td style={{ color: "#727785", fontWeight: 500 }}>
                                                    #{u.id}
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <div
                                                            className="user-cell-avatar"
                                                            style={{
                                                                background: getAvatarColor(u.id),
                                                            }}
                                                        >
                                                            {(u.name || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="user-cell-info">
                                                            <span className="user-cell-name">
                                                                {u.name}
                                                            </span>
                                                            <span className="user-cell-email">
                                                                {u.mail}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{u.phone || "—"}</td>
                                                <td>
                                                    <span
                                                        className={`badge-type ${
                                                            u.type === "ADMIN" ? "admin" : "user"
                                                        }`}
                                                    >
                                                        {u.type === "ADMIN" ? "Admin" : "Người dùng"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge-bool ${
                                                            u.googleAccount ? "yes" : "no"
                                                        }`}
                                                    >
                                                        {u.googleAccount ? "✓" : "✗"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge-bool ${
                                                            u.hasPassword ? "yes" : "no"
                                                        }`}
                                                    >
                                                        {u.hasPassword ? "✓" : "✗"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u.createdAt
                                                        ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                                                        : "—"}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="table-action-btn"
                                                            title="Xem chi tiết"
                                                            onClick={() => handleViewDetail(u.id)}
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            className="table-action-btn"
                                                            title="Sửa thông tin"
                                                            onClick={() => openEdit(u)}
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            className="table-action-btn danger"
                                                            title="Xoá người dùng"
                                                            onClick={() => {
                                                                setDeleteError(null)
                                                                setDeleteTarget(u)
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

            {/* ===== Modal chi tiết người dùng ===== */}
            {(detailLoading || detailUser || detailError) && (
                <div className="admin-modal-overlay" onClick={closeDetail}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                <User size={18} color="#005bbf" />
                                Chi tiết người dùng
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
                        ) : detailUser ? (
                            <div className="admin-modal-body">
                                {/* Profile header */}
                                <div className="user-detail-profile">
                                    <div
                                        className="user-detail-avatar"
                                        style={{ background: getAvatarColor(detailUser.id) }}
                                    >
                                        {(detailUser.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-detail-profile-info">
                                        <h3>{detailUser.name}</h3>
                                        <p>{detailUser.mail}</p>
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="user-detail-grid">
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">ID</div>
                                        <div className="user-detail-value">#{detailUser.id}</div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Loại tài khoản</div>
                                        <div className="user-detail-value">
                                            <span
                                                className={`badge-type ${
                                                    detailUser.type === "ADMIN" ? "admin" : "user"
                                                }`}
                                            >
                                                {detailUser.type === "ADMIN" ? "Admin" : "Người dùng"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Số điện thoại</div>
                                        <div className="user-detail-value">
                                            {detailUser.phone || "Chưa cập nhật"}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Ngày tạo</div>
                                        <div className="user-detail-value">
                                            {detailUser.createdAt
                                                ? new Date(detailUser.createdAt).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Tài khoản Google</div>
                                        <div className="user-detail-value">
                                            <span className={`badge-bool ${detailUser.googleAccount ? "yes" : "no"}`}>
                                                {detailUser.googleAccount ? "✓" : "✗"}
                                            </span>
                                            {" "}
                                            {detailUser.googleAccount ? "Đã liên kết" : "Chưa liên kết"}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Mật khẩu</div>
                                        <div className="user-detail-value">
                                            <span className={`badge-bool ${detailUser.hasPassword ? "yes" : "no"}`}>
                                                {detailUser.hasPassword ? "✓" : "✗"}
                                            </span>
                                            {" "}
                                            {detailUser.hasPassword ? "Đã thiết lập" : "Chưa thiết lập"}
                                        </div>
                                    </div>
                                    {detailUser.socialLink && (
                                        <div className="user-detail-item full-width">
                                            <div className="user-detail-label">Liên kết mạng xã hội</div>
                                            <div className="user-detail-value">
                                                <a
                                                    href={detailUser.socialLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {detailUser.socialLink}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ===== Modal sửa thông tin người dùng ===== */}
            {editTarget && (
                <div className="admin-modal-overlay" onClick={closeEdit}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                <Pencil size={18} color="#005bbf" />
                                Sửa thông tin người dùng
                            </h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeEdit}
                                disabled={editSaving}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="user-detail-item" style={{ marginBottom: 16 }}>
                                <div className="user-detail-label">Email</div>
                                <div className="user-detail-value">{editTarget.mail}</div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="edit-name">
                                    Họ tên
                                </label>
                                <input
                                    id="edit-name"
                                    className="admin-form-input"
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    placeholder="Nhập họ tên"
                                    disabled={editSaving}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="edit-phone">
                                    Số điện thoại
                                </label>
                                <input
                                    id="edit-phone"
                                    className="admin-form-input"
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, phone: e.target.value }))
                                    }
                                    placeholder="Nhập số điện thoại"
                                    disabled={editSaving}
                                />
                            </div>

                            {editError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {editError}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 8,
                                }}
                            >
                                <button
                                    className="filter-btn"
                                    onClick={closeEdit}
                                    disabled={editSaving}
                                >
                                    Huỷ
                                </button>
                                <button
                                    className="filter-btn primary"
                                    onClick={handleSaveEdit}
                                    disabled={editSaving}
                                >
                                    {editSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Modal xác nhận xoá người dùng ===== */}
            {deleteTarget && (
                <div className="admin-modal-overlay" onClick={closeDeleteModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                <AlertTriangle size={18} color="#ba1a1a" />
                                Xoá người dùng
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
                            <p style={{ margin: "0 0 12px", color: "#444" }}>
                                Bạn có chắc chắn muốn xoá người dùng{" "}
                                <strong>{deleteTarget.name}</strong>
                                {deleteTarget.mail ? ` (${deleteTarget.mail})` : ""}? Hành
                                động này không thể hoàn tác.
                            </p>

                            {deleteError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {deleteError}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 8,
                                }}
                            >
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

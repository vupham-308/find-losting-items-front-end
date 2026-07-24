import { useEffect, useState, useCallback } from "react"
import { Search, RefreshCw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, User, AlertTriangle, ShieldCheck, ShieldOff, Check, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"
import useAdminStore from "../../stores/adminStore.js"
import { useAuth } from "../../hooks/useAuth.js"
import { getUserById, updateUser, deleteUser, changeUserRole, USER_ROLES, USER_SORT_FIELDS } from "../../services/adminService.js"

// Palette cho avatar
const AVATAR_COLORS = [
    "#005bbf", "#1a73e8", "#0d7c3e", "#795900", "#9e4300",
    "#ba1a1a", "#004493", "#5c4300",
]

function getAvatarColor(id) {
    return AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length]
}

// Huy hiệu có/không dùng chung cho cột Google và Mật khẩu.
function BoolBadge({ value, title }) {
    return (
        <span className={`badge-bool ${value ? "yes" : "no"}`} title={title}>
            {value ? <Check size={13} strokeWidth={3.5} /> : <X size={13} strokeWidth={3.5} />}
        </span>
    )
}

// Mũi tên chỉ hướng sắp xếp trên tiêu đề cột.
function SortIcon({ field, sortBy, sortDir }) {
    if (sortBy !== field) return <ArrowUpDown size={12} className="sort-icon" />
    return sortDir === "asc" ? (
        <ArrowUp size={12} className="sort-icon active" />
    ) : (
        <ArrowDown size={12} className="sort-icon active" />
    )
}

export default function UserManagementPage() {
    const {
        users,
        usersLoading,
        usersError,
        usersPagination,
        usersSearch,
        usersRole,
        usersSortBy,
        usersSortDir,
        setUsersSearch,
        setUsersRole,
        setUsersSort,
        fetchUsers,
    } = useAdminStore()

    const { user: currentUser } = useAuth()
    // Backend chặn admin tự đổi vai trò của chính mình ⇒ khoá nút ở phía client luôn.
    const currentUserId = currentUser ? String(currentUser.userId ?? currentUser.id) : null

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

    // Đổi vai trò người dùng
    const [roleTarget, setRoleTarget] = useState(null)
    const [roleSaving, setRoleSaving] = useState(false)
    const [roleError, setRoleError] = useState(null)

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

    // Đổi bộ lọc / sắp xếp → luôn quay về trang đầu, tránh rơi vào trang trống.
    const handleRoleChange = (role) => {
        setUsersRole(role)
        fetchUsers({ page: 0, role })
    }

    const handleSortByChange = (sortBy) => {
        setUsersSort(sortBy, usersSortDir)
        fetchUsers({ page: 0, sortBy })
    }

    const toggleSortDir = () => {
        const sortDir = usersSortDir === "asc" ? "desc" : "asc"
        setUsersSort(usersSortBy, sortDir)
        fetchUsers({ page: 0, sortDir })
    }

    // Bấm vào tiêu đề cột: cùng cột thì đảo chiều, khác cột thì sắp xếp tăng dần.
    const handleSortColumn = (field) => {
        const sortDir = usersSortBy === field && usersSortDir === "asc" ? "desc" : "asc"
        setUsersSort(field, sortDir)
        fetchUsers({ page: 0, sortBy: field, sortDir })
    }

    const hasFilters = usersRole || usersSortBy !== "id" || usersSortDir !== "asc" || usersSearch

    const handleResetFilters = () => {
        setSearchInput("")
        setUsersSearch("")
        setUsersRole("")
        setUsersSort("id", "asc")
        fetchUsers({ page: 0, search: "", role: "", sortBy: "id", sortDir: "asc" })
    }

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

    // Mở modal xác nhận đổi vai trò
    const openRoleChange = (u) => {
        setRoleError(null)
        setRoleTarget(u)
    }

    const closeRoleModal = () => {
        if (roleSaving) return
        setRoleTarget(null)
        setRoleError(null)
    }

    // Xác nhận & thực hiện đổi vai trò
    const handleConfirmRoleChange = async () => {
        if (!roleTarget) return
        const newRole = roleTarget.type === "ADMIN" ? "USER" : "ADMIN"
        setRoleSaving(true)
        setRoleError(null)
        try {
            await changeUserRole(roleTarget.id, newRole)
            setRoleTarget(null)
            await fetchUsers({ page: pageNumber })
        } catch (err) {
            setRoleError(err.message || "Không thể đổi vai trò người dùng")
        } finally {
            setRoleSaving(false)
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

                    {/* Lọc theo vai trò */}
                    <div className="stock-filter-select">
                        <Filter size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Lọc theo vai trò"
                            value={usersRole}
                            onChange={(e) => handleRoleChange(e.target.value)}
                        >
                            <option value="">Tất cả vai trò</option>
                            {USER_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="stock-filter-select-caret" />
                    </div>

                    {/* Sắp xếp: trường + chiều */}
                    <div className="stock-filter-select">
                        <ArrowUpDown size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Sắp xếp theo"
                            value={usersSortBy}
                            onChange={(e) => handleSortByChange(e.target.value)}
                        >
                            {USER_SORT_FIELDS.map((f) => (
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
                            usersSortDir === "asc"
                                ? "Đang tăng dần — bấm để giảm dần"
                                : "Đang giảm dần — bấm để tăng dần"
                        }
                    >
                        {usersSortDir === "asc" ? (
                            <ArrowUp size={14} />
                        ) : (
                            <ArrowDown size={14} />
                        )}
                        {usersSortDir === "asc" ? "Tăng dần" : "Giảm dần"}
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

            <div className="admin-content list-page">
                {/* Error */}
                {usersError && (
                    <div className="admin-error">
                        ⚠️ {usersError}
                    </div>
                )}

                {/* Card */}
                <div className="admin-card full-bleed">
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
                                            {/* Các cột backend cho phép sắp xếp → bấm tiêu đề để đổi */}
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("id")}
                                            >
                                                ID <SortIcon field="id" sortBy={usersSortBy} sortDir={usersSortDir} />
                                            </th>
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("name")}
                                            >
                                                Người dùng <SortIcon field="name" sortBy={usersSortBy} sortDir={usersSortDir} />
                                            </th>
                                            <th>Số điện thoại</th>
                                            <th>Loại</th>
                                            <th>Google</th>
                                            <th>Mật khẩu</th>
                                            <th
                                                className="th-sortable"
                                                onClick={() => handleSortColumn("createdAt")}
                                            >
                                                Ngày tạo <SortIcon field="createdAt" sortBy={usersSortBy} sortDir={usersSortDir} />
                                            </th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td style={{ color: "var(--admin-text-muted)", fontWeight: 500 }}>
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
                                                    <BoolBadge
                                                        value={u.googleAccount}
                                                        title={u.googleAccount ? "Đã liên kết Google" : "Chưa liên kết Google"}
                                                    />
                                                </td>
                                                <td>
                                                    <BoolBadge
                                                        value={u.hasPassword}
                                                        title={u.hasPassword ? "Đã thiết lập mật khẩu" : "Chưa thiết lập mật khẩu"}
                                                    />
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
                                                            className={`table-action-btn${
                                                                u.type === "ADMIN" ? " warning" : ""
                                                            }`}
                                                            title={
                                                                String(u.id) === currentUserId
                                                                    ? "Không thể tự đổi vai trò của chính mình"
                                                                    : u.type === "ADMIN"
                                                                    ? "Hạ quyền xuống Người dùng"
                                                                    : "Nâng quyền lên Admin"
                                                            }
                                                            disabled={String(u.id) === currentUserId}
                                                            onClick={() => openRoleChange(u)}
                                                        >
                                                            {u.type === "ADMIN" ? (
                                                                <ShieldOff size={14} />
                                                            ) : (
                                                                <ShieldCheck size={14} />
                                                            )}
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
                                                            color: "var(--admin-text-muted)",
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
                                <User size={18} color="var(--admin-brand)" />
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
                                        <div className="user-detail-value user-detail-value-inline">
                                            <BoolBadge value={detailUser.googleAccount} />
                                            {detailUser.googleAccount ? "Đã liên kết" : "Chưa liên kết"}
                                        </div>
                                    </div>
                                    <div className="user-detail-item">
                                        <div className="user-detail-label">Mật khẩu</div>
                                        <div className="user-detail-value user-detail-value-inline">
                                            <BoolBadge value={detailUser.hasPassword} />
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
                                <Pencil size={18} color="var(--admin-brand)" />
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

            {/* ===== Modal xác nhận đổi vai trò ===== */}
            {roleTarget && (
                <div className="admin-modal-overlay" onClick={closeRoleModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                {roleTarget.type === "ADMIN" ? (
                                    <ShieldOff size={18} color="var(--admin-warning)" />
                                ) : (
                                    <ShieldCheck size={18} color="var(--admin-brand)" />
                                )}
                                {roleTarget.type === "ADMIN" ? "Hạ quyền quản trị" : "Nâng quyền quản trị"}
                            </h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeRoleModal}
                                disabled={roleSaving}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            {/* Trước → sau */}
                            <div className="user-detail-profile">
                                <div
                                    className="user-detail-avatar"
                                    style={{ background: getAvatarColor(roleTarget.id) }}
                                >
                                    {(roleTarget.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="user-detail-profile-info">
                                    <h3>{roleTarget.name}</h3>
                                    <p>{roleTarget.mail}</p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 14,
                                    marginBottom: 20,
                                }}
                            >
                                <span className={`badge-type ${roleTarget.type === "ADMIN" ? "admin" : "user"}`}>
                                    {roleTarget.type === "ADMIN" ? "Admin" : "Người dùng"}
                                </span>
                                <ChevronRight size={18} color="var(--admin-text-muted)" />
                                <span className={`badge-type ${roleTarget.type === "ADMIN" ? "user" : "admin"}`}>
                                    {roleTarget.type === "ADMIN" ? "Người dùng" : "Admin"}
                                </span>
                            </div>

                            <p style={{ margin: "0 0 12px", color: "#444", fontSize: 14, lineHeight: 1.6 }}>
                                {roleTarget.type === "ADMIN" ? (
                                    <>
                                        Bạn có chắc muốn <strong>thu hồi quyền quản trị</strong> của{" "}
                                        <strong>{roleTarget.name}</strong>? Người này sẽ mất toàn bộ quyền
                                        truy cập trang quản trị.
                                    </>
                                ) : (
                                    <>
                                        Bạn có chắc muốn <strong>cấp quyền quản trị</strong> cho{" "}
                                        <strong>{roleTarget.name}</strong>? Người này sẽ có toàn quyền quản lý
                                        người dùng và bài đăng.
                                    </>
                                )}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 8,
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: "rgba(158, 67, 0, 0.06)",
                                    border: "1px solid rgba(158, 67, 0, 0.15)",
                                    color: "var(--admin-warning)",
                                    fontSize: 12.5,
                                    lineHeight: 1.6,
                                    marginBottom: 16,
                                }}
                            >
                                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                                <span>
                                    Toàn bộ phiên đăng nhập của người dùng này sẽ bị thu hồi ngay lập tức —
                                    họ cần đăng nhập lại.
                                </span>
                            </div>

                            {roleError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {roleError}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                <button
                                    className="filter-btn"
                                    onClick={closeRoleModal}
                                    disabled={roleSaving}
                                >
                                    Huỷ
                                </button>
                                <button
                                    className="filter-btn primary"
                                    onClick={handleConfirmRoleChange}
                                    disabled={roleSaving}
                                >
                                    {roleSaving
                                        ? "Đang cập nhật..."
                                        : roleTarget.type === "ADMIN"
                                        ? "Hạ quyền"
                                        : "Nâng quyền"}
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
                                <AlertTriangle size={18} color="var(--admin-danger)" />
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

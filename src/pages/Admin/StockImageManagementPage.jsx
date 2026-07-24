import { useEffect, useState } from "react"
import {
    RefreshCw, Plus, Pencil, Trash2, X, ImageIcon, AlertTriangle, ImageOff,
    Filter, ChevronDown,
} from "lucide-react"
import useAdminStore from "../../stores/adminStore.js"
import {
    STOCK_IMAGE_CATEGORIES,
    getCategoryLabel,
    createStockImage,
    updateStockImage,
    deleteStockImage,
} from "../../services/adminService.js"

const EMPTY_FORM = { category: STOCK_IMAGE_CATEGORIES[0].value, label: "", imageUrl: "" }

// Ảnh có thể là URL hỏng ⇒ hiện khung thay thế thay vì icon vỡ của trình duyệt.
function StockImagePreview({ src, alt }) {
    // Lưu chính URL bị lỗi (thay vì cờ boolean) để khi admin sửa URL thì
    // ảnh mới tự động được thử tải lại, không cần effect reset.
    const [failedSrc, setFailedSrc] = useState(null)

    if (!src || failedSrc === src) {
        return (
            <div className="stock-image-thumb broken">
                <ImageOff size={26} />
                <span>Không tải được ảnh</span>
            </div>
        )
    }

    return (
        <div className="stock-image-thumb">
            <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
        </div>
    )
}

export default function StockImageManagementPage() {
    const {
        stockImages,
        stockImagesLoading,
        stockImagesError,
        stockImagesCategory,
        setStockImagesCategory,
        fetchStockImages,
    } = useAdminStore()

    // Modal thêm / sửa dùng chung 1 form; editTarget === null nghĩa là đang thêm mới.
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState(null)

    // Xoá ảnh
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    useEffect(() => {
        fetchStockImages({})
    }, [])

    const handleFilter = (category) => {
        setStockImagesCategory(category)
        fetchStockImages({ category })
    }

    const openCreate = () => {
        setEditTarget(null)
        setForm({
            ...EMPTY_FORM,
            // Đang lọc theo danh mục nào thì mặc định thêm vào danh mục đó.
            category: stockImagesCategory || EMPTY_FORM.category,
        })
        setFormError(null)
        setFormOpen(true)
    }

    const openEdit = (img) => {
        setEditTarget(img)
        setForm({
            category: img.category || EMPTY_FORM.category,
            label: img.label || "",
            imageUrl: img.image_url || "",
        })
        setFormError(null)
        setFormOpen(true)
    }

    const closeForm = () => {
        if (saving) return
        setFormOpen(false)
        setEditTarget(null)
        setFormError(null)
    }

    const handleSave = async () => {
        const payload = {
            category: form.category,
            label: form.label.trim(),
            imageUrl: form.imageUrl.trim(),
        }
        if (!payload.imageUrl) {
            setFormError("Đường dẫn ảnh không được để trống")
            return
        }
        if (!/^https?:\/\//i.test(payload.imageUrl)) {
            setFormError("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://")
            return
        }

        setSaving(true)
        setFormError(null)
        try {
            if (editTarget) await updateStockImage(editTarget.id, payload)
            else await createStockImage(payload)
            setFormOpen(false)
            setEditTarget(null)
            await fetchStockImages({})
        } catch (err) {
            setFormError(err.message || "Không thể lưu ảnh mặc định")
        } finally {
            setSaving(false)
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
            await deleteStockImage(deleteTarget.id)
            setDeleteTarget(null)
            await fetchStockImages({})
        } catch (err) {
            setDeleteError(err.message || "Không thể xoá ảnh mặc định")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Quản lý ảnh mặc định</h1>
                    <div className="topbar-breadcrumb">
                        Trang chủ / <span>Ảnh mặc định</span>
                    </div>
                </div>
                <div className="topbar-actions">
                    {/* Lọc theo danh mục */}
                    <div className="stock-filter-select">
                        <Filter size={15} className="stock-filter-select-icon" />
                        <select
                            aria-label="Lọc theo danh mục"
                            value={stockImagesCategory}
                            onChange={(e) => handleFilter(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {STOCK_IMAGE_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="stock-filter-select-caret" />
                    </div>
                    <button className="filter-btn primary" onClick={openCreate}>
                        <Plus size={14} /> Thêm ảnh
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {stockImagesError && (
                    <div className="admin-error">⚠️ {stockImagesError}</div>
                )}

                <div className="admin-card full-bleed">
                    <div className="admin-card-header">
                        <div className="admin-card-title">
                            {stockImagesCategory
                                ? getCategoryLabel(stockImagesCategory)
                                : "Tất cả ảnh mặc định"}
                            <span className="badge">{stockImages.length} ảnh</span>
                        </div>
                        <div className="admin-card-actions">
                            <button
                                className="filter-btn"
                                onClick={() => fetchStockImages({})}
                                title="Tải lại"
                            >
                                <RefreshCw size={14} /> Tải lại
                            </button>
                        </div>
                    </div>

                    {stockImagesLoading ? (
                        <div className="admin-loading">
                            <div className="admin-loading-spinner" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : stockImages.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty-icon">🖼️</div>
                            <div>
                                {stockImagesCategory
                                    ? "Danh mục này chưa có ảnh mặc định nào"
                                    : "Chưa có ảnh mặc định nào"}
                            </div>
                        </div>
                    ) : (
                        <div className="stock-image-grid">
                            {stockImages.map((img) => (
                                <div className="stock-image-card" key={img.id}>
                                    <StockImagePreview
                                        src={img.image_url}
                                        alt={img.label || img.category}
                                    />
                                    <div className="stock-image-body">
                                        <div className="stock-image-label">
                                            {img.label || "(Chưa đặt nhãn)"}
                                        </div>
                                        <span className="badge-type user">
                                            {getCategoryLabel(img.category)}
                                        </span>
                                        <a
                                            className="stock-image-url"
                                            href={img.image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={img.image_url}
                                        >
                                            {img.image_url}
                                        </a>
                                    </div>
                                    <div className="stock-image-footer">
                                        <span className="stock-image-id">#{img.id}</span>
                                        <div className="table-actions">
                                            <button
                                                className="table-action-btn"
                                                title="Sửa ảnh"
                                                onClick={() => openEdit(img)}
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="table-action-btn danger"
                                                title="Xoá ảnh"
                                                onClick={() => {
                                                    setDeleteError(null)
                                                    setDeleteTarget(img)
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== Modal thêm / sửa ảnh ===== */}
            {formOpen && (
                <div className="admin-modal-overlay" onClick={closeForm}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                {editTarget ? (
                                    <Pencil size={18} color="var(--admin-brand)" />
                                ) : (
                                    <ImageIcon size={18} color="var(--admin-brand)" />
                                )}
                                {editTarget ? "Sửa ảnh mặc định" : "Thêm ảnh mặc định"}
                            </h2>
                            <button
                                className="admin-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="stock-category">
                                    Danh mục
                                </label>
                                <select
                                    id="stock-category"
                                    className="admin-form-input"
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, category: e.target.value }))
                                    }
                                    disabled={saving}
                                >
                                    {STOCK_IMAGE_CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="stock-label">
                                    Nhãn hiển thị
                                </label>
                                <input
                                    id="stock-label"
                                    className="admin-form-input"
                                    type="text"
                                    value={form.label}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, label: e.target.value }))
                                    }
                                    placeholder="VD: Ví da màu nâu"
                                    disabled={saving}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label" htmlFor="stock-url">
                                    Đường dẫn ảnh <span style={{ color: "var(--admin-danger)" }}>*</span>
                                </label>
                                <input
                                    id="stock-url"
                                    className="admin-form-input"
                                    type="url"
                                    value={form.imageUrl}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                                    }
                                    placeholder="https://..."
                                    disabled={saving}
                                />
                            </div>

                            {/* Xem trước để admin biết ngay URL có dùng được không */}
                            <div className="admin-form-group">
                                <div className="admin-form-label">Xem trước</div>
                                <div className="stock-image-preview-box">
                                    <StockImagePreview src={form.imageUrl.trim()} alt="Xem trước" />
                                </div>
                            </div>

                            {formError && (
                                <div className="admin-error" style={{ marginBottom: 12 }}>
                                    ⚠️ {formError}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                <button className="filter-btn" onClick={closeForm} disabled={saving}>
                                    Huỷ
                                </button>
                                <button
                                    className="filter-btn primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : editTarget
                                        ? "Lưu thay đổi"
                                        : "Thêm ảnh"}
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
                                <AlertTriangle size={18} color="var(--admin-danger)" />
                                Xoá ảnh mặc định
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
                            <div className="stock-image-preview-box" style={{ marginBottom: 16 }}>
                                <StockImagePreview
                                    src={deleteTarget.image_url}
                                    alt={deleteTarget.label || ""}
                                />
                            </div>

                            <p style={{ margin: "0 0 12px", color: "#444", lineHeight: 1.6 }}>
                                Bạn có chắc muốn xoá ảnh{" "}
                                <strong>{deleteTarget.label || `#${deleteTarget.id}`}</strong> khỏi
                                danh mục <strong>{getCategoryLabel(deleteTarget.category)}</strong>?
                                Người dùng sẽ không còn chọn được ảnh này khi đăng bài.
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import * as postService from "../../services/postService.js";

export default function PostDetailModal({ postId, onClose, onActionComplete }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!postId) return;
        
        async function fetchDetail() {
            setLoading(true);
            setError("");
            try {
                const response = await postService.getPostDetail(postId);
                // Check if response is wrapped in response.data or directly returned
                const postData = response?.data || response;
                if (postData) {
                    setPost(postData);
                } else {
                    setError("Không tìm thấy thông tin chi tiết bài viết");
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết bài viết:", err);
                setError(err.message || "Không thể tải chi tiết bài viết");
            } finally {
                setLoading(false);
            }
        }

        fetchDetail();
    }, [postId]);

    if (!postId) return null;

    const currentUserId = user ? (user.userId || user.id) : null;
    const isOwner = post && currentUserId && (String(post.owner?.user_id) === String(currentUserId));

    const handleUpdateStatus = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đánh dấu bài viết này là ĐÃ GIẢI QUYẾT / ĐÃ TRẢ LẠI ĐỒ không?")) {
            return;
        }
        setActionLoading(true);
        try {
            await postService.updatePostStatus(post.post_id || post.id, "RESOLVED");
            alert("Cập nhật trạng thái thành công!");
            if (onActionComplete) {
                onActionComplete();
            } else {
                window.location.reload();
            }
            onClose();
        } catch (err) {
            alert(err.message || "Cập nhật trạng thái thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn XÓA bài đăng này không? Hành động này không thể hoàn tác.")) {
            return;
        }
        setActionLoading(true);
        try {
            await postService.deletePost(post.post_id || post.id);
            alert("Xóa bài đăng thành công!");
            if (onActionComplete) {
                onActionComplete();
            } else {
                window.location.reload();
            }
            onClose();
        } catch (err) {
            alert(err.message || "Xóa bài đăng thất bại");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 text-left relative flex flex-col z-10 animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer text-on-surface z-20"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
                        <p className="text-on-surface-variant font-medium text-[14px]">Đang tải chi tiết bài viết...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 px-6 text-center">
                        <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
                        <p className="text-on-surface font-semibold text-[16px]">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-full text-[14px] font-semibold hover:opacity-90"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row min-h-[400px]">
                        {/* Left Column: Image */}
                        <div className="w-full md:w-[45%] bg-surface-container-low relative min-h-[250px] md:min-h-full flex items-center justify-center">
                            {post.image_url || post.blurred_image_url ? (
                                <img
                                    src={post.image_url || post.blurred_image_url}
                                    alt={post.title}
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-outline">
                                    <span className="material-symbols-outlined text-[48px]">image</span>
                                    <span className="text-[12px] font-medium">Không có hình ảnh</span>
                                </div>
                            )}

                        </div>

                        {/* Right Column: Information */}
                        <div className="w-full md:w-[55%] p-6 flex flex-col justify-between">
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                                        post.type === "LOST"
                                            ? "bg-error-container text-on-error-container border border-error/20"
                                            : "bg-primary-container text-on-primary-container border border-primary/20"
                                    }`}>
                                        {post.type}
                                    </span>
                                    
                                    {post.status && (
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                                            post.status === "ACTIVE"
                                                ? "bg-success/10 text-success border border-success/30"
                                                : post.status === "RESOLVED"
                                                ? "bg-outline/10 text-outline border border-outline/30"
                                                : "bg-error/10 text-error border border-error/30"
                                        }`}>
                                            {post.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : post.status === "RESOLVED" ? "ĐÃ GIẢI QUYẾT" : "ĐÃ XÓA"}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-[22px] font-bold text-on-surface leading-snug mb-3 pr-8">
                                    {post.title}
                                </h2>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-on-surface-variant text-[13px] border-b border-outline-variant/50 pb-3 mb-4">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        <span>{post.location?.district || post.district || "Chưa xác định"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                        <span>
                                            {post.created_at ? new Date(post.created_at).toLocaleString("vi-VN", {
                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                            }) : "Chưa rõ thời gian"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Description */}
                                    <div>
                                        <h4 className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">Mô tả vật phẩm</h4>
                                        <p className="text-on-surface text-[14px] leading-relaxed whitespace-pre-line bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/20">
                                            {post.description || "Không có mô tả chi tiết."}
                                        </p>
                                    </div>

                                    {/* Address Detail */}
                                    {post.location?.address && (
                                        <div>
                                            <h4 className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">Địa điểm chi tiết</h4>
                                            <p className="text-on-surface-variant text-[13px]">
                                                {post.location.address}
                                            </p>
                                        </div>
                                    )}

                                    {/* Owner Contact */}
                                    <div className="border-t border-outline-variant/30 pt-3">
                                        <h4 className="text-[12px] font-bold text-primary uppercase tracking-wider mb-2">Thông tin liên hệ</h4>
                                        {post.owner ? (
                                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2 text-[13px]">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                                                    <span className="font-semibold text-on-surface">{post.owner.full_name || post.owner.name || "N/A"}</span>
                                                </div>
                                                {post.owner.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                                                        <a href={`tel:${post.owner.phone}`} className="text-primary hover:underline font-medium">{post.owner.phone}</a>
                                                    </div>
                                                )}
                                                {post.owner.email && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                                                        <span className="text-on-surface-variant">{post.owner.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 flex items-center gap-2 text-[13px] text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[16px] text-outline">lock</span>
                                                <span>Thông tin liên hệ được bảo mật.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isOwner ? (
                                <div className="mt-6 pt-4 border-t border-outline-variant/50 flex flex-wrap gap-2">
                                    {post.type === "FOUND" && post.status === "ACTIVE" && (
                                        <button
                                            onClick={handleUpdateStatus}
                                            disabled={actionLoading}
                                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-success text-white hover:bg-success/90 disabled:opacity-50 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                                        >
                                            {actionLoading ? (
                                                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            )}
                                            Đã trả lại đồ
                                        </button>
                                    )}
                                    
                                    {post.status !== "DELETED" && (
                                        <button
                                            onClick={handleDeletePost}
                                            disabled={actionLoading}
                                            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-error text-on-error hover:opacity-90 disabled:opacity-50 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                                        >
                                            {actionLoading ? (
                                                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            )}
                                            Xóa bài đăng
                                        </button>
                                    )}
                                </div>
                            ) : (
                                post.type === "FOUND" && (
                                    <div className="mt-6 pt-4 border-t border-outline-variant/50 space-y-2">
                                        <p className="text-[12px] text-on-surface-variant text-center font-medium">
                                            {post.owner?.phone || post.owner?.email
                                                ? "Kiểm tra xem có đúng phải đồ bạn mất không"
                                                : "Xác minh để xem thông tin liên hệ người đăng"
                                            }
                                        </p>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                navigate(`/posts/${post.post_id || post.id}`);
                                            }}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary hover:opacity-90 rounded-xl text-[14px] font-bold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                            Kiểm tra ngay
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

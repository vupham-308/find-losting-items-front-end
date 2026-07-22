import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useChatStore } from "../../stores/chatStore.js";
import * as postService from "../../services/postService.js";

export default function PostDetailModal({ postId, onClose, onActionComplete }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { openChat } = useChatStore();
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

            <div className="bg-surface-container-lowest rounded-2xl max-w-5xl w-full max-h-[110vh] overflow-y-auto shadow-2xl border border-outline-variant/30 text-left relative flex flex-col z-10 animate-in fade-in zoom-in duration-200">
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
                    <div className="flex flex-col md:flex-row min-h-[480px]">
                        {/* Left Column: Image */}
                        <div className="w-full md:w-[45%] bg-surface-container-low relative min-h-[400px] md:min-h-full flex items-center justify-center">
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
                        <div className="w-full md:w-[55%] p-5 flex flex-col justify-between gap-4">
                            <div className="space-y-4">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${
                                        post.type === "LOST"
                                            ? "bg-error-container text-on-error-container border border-error/20"
                                            : "bg-primary-container text-on-primary-container border border-primary/20"
                                    }`}>
                                        {post.type}
                                    </span>
                                    
                                    {post.status && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider ${
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

                                <h2 className="text-[19px] font-bold text-on-surface leading-snug pr-8">
                                    {post.title}
                                </h2>

                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-on-surface-variant text-[12px] border-b border-outline-variant/30 pb-2">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        <span>{post.location?.district || post.district || "Chưa xác định"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        <span>
                                            {post.created_at ? (() => {
                                                const d = new Date(post.created_at);
                                                d.setHours(d.getHours() + 7);
                                                return d.toLocaleString("vi-VN", {
                                                    year: 'numeric', month: '2-digit', day: '2-digit'
                                                });
                                            })() : "Chưa rõ"}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Info Card */}
                                {(post.event_time || post.eventTime || post.location?.address) && (
                                    <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl space-y-2 text-[12px] text-left">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Thông tin chi tiết</p>
                                        <div className="space-y-1.5">
                                            {/* Event Time */}
                                            {(post.event_time || post.eventTime) && (
                                                <div className="flex items-start gap-1.5">
                                                    <span className="material-symbols-outlined text-[15px] text-primary mt-0.5">history</span>
                                                    <div>
                                                        <span className="text-[10px] text-on-surface-variant block">Thời gian {post.type === 'LOST' ? 'mất' : 'nhặt được'}</span>
                                                        <span className="font-semibold text-on-surface">
                                                            {(() => {
                                                                const raw = post.event_time || post.eventTime;
                                                                try {
                                                                    const d = new Date(raw);
                                                                    d.setHours(d.getHours() + 7);
                                                                    return d.toLocaleString("vi-VN", {
                                                                        day: "2-digit",
                                                                        month: "2-digit",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    });
                                                                } catch {
                                                                    return "Chưa rõ";
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Detailed Location */}
                                            {post.location?.address && (
                                                <div className="flex items-start gap-1.5">
                                                    <span className="material-symbols-outlined text-[15px] text-primary mt-0.5">location_on</span>
                                                    <div>
                                                        <span className="text-[10px] text-on-surface-variant block">Địa điểm chi tiết</span>
                                                        <span className="font-semibold text-on-surface leading-snug">
                                                            {post.location.address}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Mô tả vật phẩm</h4>
                                    <p className="text-on-surface text-[13px] leading-relaxed whitespace-pre-line bg-surface-container-low/50 px-3 py-2 rounded-xl border border-outline-variant/20 line-clamp-3">
                                        {post.description || "Không có mô tả chi tiết."}
                                    </p>
                                </div>

                                {/* Owner Contact */}
                                <div>
                                    <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5">Người đăng tin</h4>
                                    {post.owner && (
                                        <div className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 space-y-1.5 text-[12px]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[15px] text-primary">person</span>
                                                <span className="font-semibold text-on-surface">{post.owner.full_name || post.owner.name || "N/A"}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons — no separator */}
                            {isOwner ? (
                                <div className="flex flex-wrap gap-2 pt-1">
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
                                <div className="space-y-3">
                                    {post.type === "FOUND" && (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[11px] text-on-surface-variant text-center font-medium">
                                                Vui lòng xác minh để liên hệ với người nhặt đồ.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    navigate(`/posts/${post.post_id || post.id}`);
                                                }}
                                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary hover:opacity-90 rounded-xl text-[13px] font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                                                Kiểm tra ngay
                                            </button>
                                        </div>
                                    )}

                                    {post.type === "LOST" && (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[11px] text-on-surface-variant text-center font-medium">
                                                Nhắn tin trực tiếp để trao đổi với người báo mất đồ.
                                            </p>
                                            <button
                                                onClick={async () => {
                                                    if (!user) {
                                                        onClose();
                                                        navigate(`/login?redirect=/posts/${post.post_id || post.id}`);
                                                        return;
                                                    }
                                                    
                                                    const uid1 = String(user.userId || user.id);
                                                    const uid2 = String(post.owner?.user_id);
                                                    if (uid1 === uid2) return;

                                                    const sortedIds = [uid1, uid2].sort();
                                                    const roomId = `${post.post_id || post.id}_${sortedIds[0]}_${sortedIds[1]}`;

                                                    // Khởi tạo phòng chat ở nền: setDoc chỉ resolve khi server xác nhận,
                                                    // nên không await ở đây — nếu không khung chat sẽ không bao giờ mở
                                                    // khi Firestore chưa kết nối được.
                                                    (async () => {
                                                        try {
                                                            const { doc, setDoc } = await import("firebase/firestore");
                                                            const { db } = await import("../../firebase");
                                                            await setDoc(doc(db, "chats", roomId), {
                                                                id: roomId,
                                                                postId: Number(post.post_id || post.id),
                                                                postTitle: post.title || "Bài viết",
                                                                postImageUrl: post.image_url || post.blurred_image_url || "",
                                                                user1Id: uid1,
                                                                user1Name: user.full_name || user.name || "Người dùng",
                                                                user2Id: uid2,
                                                                user2Name: post.owner?.full_name || post.owner?.name || "Người đăng tin",
                                                                users: [uid1, uid2]
                                                            }, { merge: true });
                                                        } catch (err) {
                                                            console.error("Lỗi khi khởi tạo phòng chat:", err);
                                                        }
                                                    })();

                                                    onClose();
                                                    openChat({
                                                        roomId,
                                                        postId: post.post_id || post.id,
                                                        postTitle: post.title,
                                                        postImageUrl: post.image_url || post.blurred_image_url || "",
                                                        recipientId: post.owner?.user_id,
                                                        recipientName: post.owner?.full_name || post.owner?.name || "Người đăng tin",
                                                        shareTrigger: Date.now(),
                                                        pendingPostShare: {
                                                            postId: post.post_id || post.id,
                                                            title: post.title,
                                                            type: post.type,
                                                            imageUrl: post.image_url || post.blurred_image_url || "",
                                                            address: post.location?.address || "Không rõ địa điểm"
                                                        }
                                                    });
                                                }}
                                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary hover:opacity-90 rounded-xl text-[13px] font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                                Nhắn tin ngay
                                            </button>
                                        </div>
                                    )}

                                    {/* Safety tips */}
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-left space-y-1 mt-1">
                                        <h4 className="font-bold text-amber-800 text-[13px] flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px] text-amber-700">security</span>
                                            Nguyên tắc an toàn
                                        </h4>
                                        <p className="text-[11.5px] text-amber-950/80 leading-relaxed">
                                            Hãy hẹn gặp trực tiếp tại nơi công cộng đông người. Tuyệt đối <strong>không chuyển khoản bất kỳ khoản phí nào</strong> trước khi nhận được đồ vật thực tế.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


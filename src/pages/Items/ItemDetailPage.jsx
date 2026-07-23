import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getPostDetail, getPostVerifications, claimPost } from "../../services/postService.js";
import { useChatStore } from "../../stores/chatStore.js";

export default function ItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Verification questions from API
    const [questionsList, setQuestionsList] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);

    // Verification form state
    const [answers, setAnswers] = useState({});
    const [isVerified, setIsVerified] = useState(false);
    const [claimResult, setClaimResult] = useState(null);   // null | { approved, score, threshold, details }
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const { openChat } = useChatStore();

    // Fetch post detail
    useEffect(() => {
        if (!id) return;
        async function fetchDetail() {
            setLoading(true);
            setError("");
            try {
                const response = await getPostDetail(id);
                const postData = response?.data || response;
                if (postData) {
                    setPost(postData);
                } else {
                    setError("Không tìm thấy thông tin chi tiết bài viết");
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết:", err);
                setError(err.message || "Không thể tải chi tiết bài viết");
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id]);

    // Fetch verification questions (only for FOUND posts when not owner)
    useEffect(() => {
        if (!post || !id) return;
        const currentUserId = user ? (user.userId || user.id) : null;
        const isOwner = currentUserId && String(post.owner?.user_id) === String(currentUserId);
        if (post.type !== "FOUND" || isOwner) return;

        async function fetchQuestions() {
            setQuestionsLoading(true);
            try {
                const response = await getPostVerifications(id);
                const data = response?.data || response;
                const qs = data?.questions || [];
                if (qs.length > 0) {
                    setQuestionsList(qs);
                }
            } catch (err) {
                console.warn("Không lấy được câu hỏi xác minh:", err);
            } finally {
                setQuestionsLoading(false);
            }
        }
        fetchQuestions();
    }, [post, id, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined animate-spin text-[48px] text-primary">progress_activity</span>
                <p className="text-on-surface-variant font-medium">Đang tải thông tin chi tiết bài viết...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
                <span className="material-symbols-outlined text-[64px] text-error">error</span>
                <h2 className="text-2xl font-bold text-on-surface">{error || "Bài viết không tồn tại"}</h2>
                <button
                    onClick={() => navigate("/")}
                    className="mt-2 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 cursor-pointer"
                >
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    const currentUserId = user ? (user.userId || user.id) : null;
    const isOwner = currentUserId && String(post.owner?.user_id) === String(currentUserId);
    const hasContactInfo = post.owner?.phone || post.owner?.email;

    const handleAnswerChange = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: value }));
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setVerificationError("");
        setClaimResult(null);

        const unanswered = questionsList.some((_, idx) => !answers[idx]?.trim());
        if (unanswered) {
            setVerificationError("Vui lòng trả lời đầy đủ tất cả các câu hỏi xác minh.");
            return;
        }

        // Build answers payload: [{ question_id, answer }]
        const answersPayload = questionsList.map((q, idx) => ({
            question_id: q.id,
            answer: answers[idx]?.trim() || ""
        }));

        setVerificationLoading(true);
        try {
            const response = await claimPost(id, answersPayload);
            const data = response?.data || response;
            setClaimResult(data);
            if (data?.approved) {
                setIsVerified(true);
            }
        } catch (err) {
            const errData = err?.response?.data;
            const msg = errData?.message || err.message || "";

            // Backend trả về HTTP error khi bị rejected — chuyển thành rejected UI thay vì toast lỗi
            const isRejection = msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("score below");
            if (isRejection) {
                setClaimResult({
                    approved: false,
                    score: errData?.score ?? 0,
                    threshold: errData?.threshold ?? 0.6,
                    message: msg
                });
            } else {
                setVerificationError(msg || "Xác minh thất bại. Vui lòng thử lại.");
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-background">
            <main className="max-w-6xl mx-auto px-4 py-6 w-full">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-5 inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-[14px] font-semibold cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Quay lại
                </button>

                <div className="grid lg:grid-cols-10 gap-6">

                    {/* ── LEFT: image + info (smaller) ── */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Image — compact */}
                        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm">
                            <div className="relative aspect-[4/3] bg-surface-container-low flex items-center justify-center">
                                {((claimResult?.details?.image_url) || post.image_url || post.blurred_image_url) ? (
                                    <img
                                        src={(claimResult?.details?.image_url) || post.image_url || post.blurred_image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-outline py-10">
                                        <span className="material-symbols-outlined text-[48px]">image</span>
                                        <span className="text-sm font-medium">Không có hình ảnh</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Post info card */}
                        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 text-left">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                                    post.type === "LOST"
                                        ? "bg-error-container text-on-error-container border border-error/20"
                                        : "bg-primary-container text-on-primary-container border border-primary/20"
                                }`}>{post.type}</span>

                                {post.status && post.status !== "ACTIVE" && (
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                                        post.status === "RESOLVED"
                                            ? "bg-outline/10 text-outline border border-outline/30"
                                            : "bg-error/10 text-error border border-error/30"
                                    }`}>
                                        {post.status === "RESOLVED" ? "ĐÃ GIẢI QUYẾT" : "ĐÃ XÓA"}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-xl font-extrabold text-on-surface leading-snug">{post.title}</h1>

                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-on-surface-variant text-[13px] border-y border-outline-variant/20 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                                    <span className="font-medium">{post.location?.district || "Chưa xác định"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                                    <span className="font-medium">
                                        {post.created_at ? (() => {
                                            const d = new Date(post.created_at);
                                            d.setHours(d.getHours() + 7);
                                            return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
                                        })() : "Chưa rõ"}
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Info Card */}
                            {(post.event_time || post.eventTime || post.location?.address) && (
                                <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl space-y-3 mt-4 text-left">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Thông tin chi tiết</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                                        {/* Event Time */}
                                        {(post.event_time || post.eventTime) && (
                                            <div className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">history</span>
                                                <div>
                                                    <span className="text-[11px] text-on-surface-variant block">Thời gian {post.type === 'LOST' ? 'mất' : 'nhặt được'}</span>
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
                                            <div className="flex items-start gap-2 md:col-span-2">
                                                <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">location_on</span>
                                                <div>
                                                    <span className="text-[11px] text-on-surface-variant block">Địa điểm chi tiết</span>
                                                    <span className="font-semibold text-on-surface leading-snug">
                                                        {post.location.address}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {post.description && (
                                <div className="mt-4">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5">Mô tả</p>
                                    <p className="text-on-surface text-[14px] leading-relaxed whitespace-pre-line">
                                        {post.description}
                                    </p>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="pt-2 border-t border-outline-variant/20">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Người đăng</p>
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2 text-[13px]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                                        <span className="font-bold text-on-surface">{post.owner?.full_name || "Người đăng tin"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Verification form (wider) ── */}
                    <div className="lg:col-span-6 space-y-5 text-left">

                        {/* ── Approved result banner ── */}
                        {claimResult?.approved && (
                            <div className="bg-success/10 border border-success/30 rounded-2xl overflow-hidden text-left">
                                <div className="px-5 py-4 flex items-center gap-3 border-b border-success/20">
                                    <span className="material-symbols-outlined text-[28px] text-success">check_circle</span>
                                    <p className="font-bold text-success text-[16px]">Xác minh thành công!</p>
                                </div>
                                {/* Revealed contact info */}
                                {claimResult.details && (
                                    <div className="px-5 py-5 space-y-4 text-[14px]">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-success uppercase tracking-wider">Người đăng bài</p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                                                <span className="font-bold text-on-surface">{claimResult.details.owner?.full_name || "Người đăng tin"}</span>
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                                            Bạn đã trả lời đúng câu hỏi xác minh! Bạn có thể nhắn tin trực tiếp để trao đổi nhận lại món đồ này.
                                        </p>
                                        {/* Chat Button */}
                                        <div className="pt-3 border-t border-success/20">
                                            <button
                                                onClick={async () => {
                                                    const uid1 = String(user.userId || user.id);
                                                    const uid2 = String(claimResult.details.owner.user_id);
                                                    if (uid1 === uid2) return;

                                                    const sortedIds = [uid1, uid2].sort();
                                                    const roomId = `user_${sortedIds[0]}_${sortedIds[1]}`;

                                                    // Không await: setDoc chỉ resolve khi server xác nhận,
                                                    // sẽ treo vô hạn nếu Firestore chưa kết nối được.
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
                                                                user2Name: claimResult.details.owner.full_name || claimResult.details.owner.name || "Người đăng tin",
                                                                users: [uid1, uid2]
                                                            }, { merge: true });
                                                        } catch (err) {
                                                            console.error("Lỗi khi khởi tạo phòng chat:", err);
                                                        }
                                                    })();

                                                    openChat({
                                                        roomId,
                                                        postId: post.post_id || post.id,
                                                        postTitle: post.title,
                                                        postImageUrl: post.image_url || post.blurred_image_url || "",
                                                        recipientId: claimResult.details.owner.user_id,
                                                        recipientName: claimResult.details.owner.full_name || claimResult.details.owner.name || "Người đăng tin",
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
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary hover:opacity-90 rounded-xl text-[13px] font-bold shadow-md cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                                Nhắn tin trao đổi ngay
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Contact block for LOST posts (Immediate chat) ── */}
                        {!isOwner && post.type === "LOST" && (
                            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden p-6 text-center space-y-4">
                                <span className="material-symbols-outlined text-[48px] text-primary">chat</span>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-[16px] text-on-surface">Liên hệ trao đổi về tin báo mất</h3>
                                    <p className="text-[13px] text-on-surface-variant">
                                        Nhấn nút bên dưới để gửi yêu cầu nhắn tin trao đổi với <strong className="text-primary">{post.owner?.full_name || "người đăng tin"}</strong>.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                navigate(`/login?redirect=/posts/${post.post_id || post.id}`);
                                                return;
                                            }

                                            const currentUid = user.userId || user.id || user.user_id;
                                            const ownerUid = post?.owner?.user_id || post?.owner?.id || post?.owner_id;
                                            if (!currentUid || !ownerUid) return;

                                            const uid1 = String(currentUid);
                                            const uid2 = String(ownerUid);
                                            if (uid1 === uid2) return;

                                            const sortedIds = [uid1, uid2].sort();
                                            const roomId = `user_${sortedIds[0]}_${sortedIds[1]}`;

                                            // Background Firestore room creation
                                            (async () => {
                                                try {
                                                    const { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } = await import("firebase/firestore");
                                                    const { db } = await import("../../firebase");
                                                    const roomRef = doc(db, "chats", roomId);
                                                    const roomSnap = await getDoc(roomRef);

                                                    const postTypeUpper = (post.type || post.postType || "LOST").toUpperCase();
                                                    const isLostPost = postTypeUpper === "LOST";

                                                    let initialStatus = isLostPost ? "PENDING" : "ACCEPTED";

                                                    if (isLostPost) {
                                                        if (roomSnap.exists()) {
                                                            const data = roomSnap.data();
                                                            initialStatus = data.status === "ACCEPTED" ? "ACCEPTED" : (data.status || "PENDING");
                                                        } else {
                                                            const q = query(
                                                                collection(db, "chats"),
                                                                where("users", "array-contains", uid1)
                                                            );
                                                            const snapshot = await getDocs(q);
                                                            snapshot.forEach((docSnap) => {
                                                                const data = docSnap.data();
                                                                if (Array.isArray(data.users) && data.users.some(u => String(u) === String(uid2))) {
                                                                    if (data.status === "ACCEPTED") {
                                                                        initialStatus = "ACCEPTED";
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }

                                                    await setDoc(roomRef, {
                                                        id: roomId,
                                                        postId: Number(post.post_id || post.id),
                                                        postTitle: post.title || "Bài viết",
                                                        postImageUrl: post.image_url || post.blurred_image_url || "",
                                                        user1Id: uid1,
                                                        user1Name: user.full_name || user.name || "Người dùng",
                                                        user2Id: uid2,
                                                        user2Name: post.owner?.full_name || post.owner?.name || "Người đăng tin",
                                                        users: [uid1, uid2],
                                                        postType: "LOST",
                                                        status: initialStatus,
                                                        requestedBy: uid1,
                                                        requestedTo: uid2,
                                                        updatedAt: serverTimestamp()
                                                    }, { merge: true });
                                                } catch (err) {
                                                    console.error("Lỗi khi khởi tạo phòng chat:", err);
                                                }
                                            })();

                                            openChat({
                                                roomId,
                                                postId: post.post_id || post.id,
                                                postTitle: post.title,
                                                postImageUrl: post.image_url || post.blurred_image_url || "",
                                                recipientId: ownerUid,
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
                                        className="w-full px-6 py-3 bg-primary text-on-primary hover:opacity-90 rounded-xl text-[14px] font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chat</span>
                                        Yêu cầu gửi tin nhắn
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* ── Rejected result banner ── */}
                        {claimResult && !claimResult.approved && (
                            <div className="bg-error/10 border border-error/30 rounded-2xl px-5 py-4 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[28px] text-error">cancel</span>
                                        <p className="font-bold text-error text-[15px]">Xác minh không thành công</p>
                                    </div>
                                <button
                                    onClick={() => { setClaimResult(null); setAnswers({}); setVerificationError(""); }}
                                    className="text-[13px] text-primary font-semibold hover:underline cursor-pointer"
                                >
                                    Thử lại câu trả lời →
                                </button>
                            </div>
                        )}

                        {/* ── Verification questions form ── */}
                        {!isOwner && post.type === "FOUND" && post.status === "ACTIVE" && !claimResult && (
                            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-outline-variant/20 bg-primary/5">
                                    <h2 className="text-[17px] font-bold text-on-surface flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px] text-primary">quiz</span>
                                        Trả lời câu hỏi xác minh
                                    </h2>
                                    <p className="text-[13px] text-on-surface-variant mt-0.5">
                                        Người nhặt đã đặt câu hỏi để xác nhận bạn là chủ nhân thật sự của đồ vật.
                                    </p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {verificationError && (
                                        <div className="p-3 bg-error-container text-on-error-container rounded-xl text-[13px] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">error</span>
                                            <span>{verificationError}</span>
                                        </div>
                                    )}

                                    {questionsLoading ? (
                                        <div className="flex items-center justify-center gap-2 py-8 text-on-surface-variant">
                                            <span className="material-symbols-outlined animate-spin text-[24px] text-primary">progress_activity</span>
                                            <span className="text-[14px]">Đang tải câu hỏi...</span>
                                        </div>
                                    ) : questionsList.length === 0 ? (
                                        <div className="text-center py-8 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[40px] mb-2 block text-outline">help_outline</span>
                                            <p className="text-[14px]">Bài viết này chưa có câu hỏi xác minh.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleVerifySubmit} className="space-y-6">
                                            {questionsList.map((q, idx) => (
                                                <div key={q.id || idx} className="space-y-2.5">
                                                    <label className="flex items-start gap-2 text-[14px] font-semibold text-on-surface">
                                                        <span className="mt-0.5 w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        {q.question}
                                                    </label>
                                                    <textarea
                                                        value={answers[idx] || ""}
                                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                        rows={4}
                                                        required
                                                        placeholder="Nhập câu trả lời của bạn..."
                                                        className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] leading-relaxed outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                type="submit"
                                                disabled={verificationLoading}
                                                className="w-full py-4 bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 rounded-xl text-[15px] font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {verificationLoading ? (
                                                    <>
                                                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                                        Đang xác minh...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[20px]">verified</span>
                                                        Gửi câu trả lời xác minh
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* If owner */}
                        {isOwner && (
                            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 text-center space-y-3">
                                <span className="material-symbols-outlined text-[40px] text-primary">admin_panel_settings</span>
                                <p className="font-bold text-on-surface text-[15px]">Đây là bài viết của bạn</p>
                                <p className="text-[13px] text-on-surface-variant">Bạn có thể quản lý bài viết này từ trang hồ sơ cá nhân.</p>
                            </section>
                        )}

                        {/* Safety Tips */}
                        <section className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
                            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-[14px] flex items-center gap-1.5 mb-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-700 dark:text-amber-400">security</span>
                                Nguyên tắc an toàn
                            </h4>
                            <p className="text-[13px] text-amber-900/80 dark:text-amber-100/85 leading-relaxed">
                                Hãy hẹn gặp trực tiếp tại nơi công cộng đông người. Tuyệt đối <strong>không chuyển khoản bất kỳ khoản phí nào</strong> trước khi nhận được đồ vật thực tế.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

        </div>
        </>
    );
}
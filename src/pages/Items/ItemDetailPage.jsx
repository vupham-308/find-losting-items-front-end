import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getPostDetail, getPostVerifications, claimPost } from "../../services/postService.js";

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
                            <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center">
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

                            <h1 className="text-xl font-extrabold text-on-surface leading-snug">{post.title}</h1>

                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-on-surface-variant text-[13px] border-y border-outline-variant/20 py-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                                    <span className="font-medium">{post.location?.district || "Chưa xác định"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                                    <span className="font-medium">
                                        {post.created_at
                                            ? new Date(post.created_at).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })
                                            : "Chưa rõ"}
                                    </span>
                                </div>
                            </div>

                            {post.description && (
                                <div>
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5">Mô tả</p>
                                    <p className="text-on-surface text-[14px] leading-relaxed whitespace-pre-line">
                                        {post.description}
                                    </p>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="pt-2 border-t border-outline-variant/20">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Người đăng</p>

                                {post.hide_post_type === "WHEN_MATCH" && !isOwner && !isVerified && (
                                    <div className="flex items-start gap-2 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                                        <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5 flex-shrink-0">info</span>
                                        <p className="text-[12px] text-amber-800 leading-snug">
                                            Thông tin người nhặt sẽ được hiển thị sau khi bạn xác minh thành công
                                        </p>
                                    </div>
                                )}
                                {(isOwner || isVerified || hasContactInfo) ? (
                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2 text-[13px]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                                            <span className="font-bold text-on-surface">{post.owner?.full_name || "Người đăng tin"}</span>
                                        </div>
                                        {post.owner?.phone && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                                                <a href={`tel:${post.owner.phone}`} className="text-primary hover:underline font-semibold">{post.owner.phone}</a>
                                            </div>
                                        )}
                                        {post.owner?.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                                                <span className="text-on-surface-variant">{post.owner.email}</span>
                                            </div>
                                        )}
                                        {isVerified && (
                                            <p className="text-success text-[11px] font-semibold flex items-center gap-1 pt-1">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Đã xác minh — thông tin được mở khóa
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 flex items-center gap-2 text-[13px] text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                                        <span>Trả lời câu hỏi để mở khóa thông tin liên hệ.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Verification form (wider) ── */}
                    <div className="lg:col-span-6 space-y-5 text-left">

                        {/* ── Approved result banner ── */}
                        {claimResult?.approved && (
                            <div className="bg-success/10 border border-success/30 rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 flex items-center gap-3 border-b border-success/20">
                                    <span className="material-symbols-outlined text-[28px] text-success">check_circle</span>
                                    <p className="font-bold text-success text-[16px]">Xác minh thành công!</p>
                                </div>
                                {/* Revealed contact info */}
                                {claimResult.details && (
                                    <div className="px-5 py-4 space-y-2 text-[14px]">
                                        <p className="text-[12px] font-bold text-success uppercase tracking-wider mb-3">Thông tin liên hệ người nhặt được đồ</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                                            <span className="font-bold text-on-surface">{claimResult.details.owner?.full_name || "Người đăng tin"}</span>
                                        </div>
                                        {claimResult.details.owner?.phone && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                                                <a href={`tel:${claimResult.details.owner.phone}`} className="text-primary font-bold hover:underline text-[15px]">
                                                    {claimResult.details.owner.phone}
                                                </a>
                                            </div>
                                        )}
                                        {claimResult.details.owner?.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[20px] text-primary">mail</span>
                                                <span className="text-on-surface-variant">{claimResult.details.owner.email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
                            <h4 className="font-bold text-amber-800 text-[14px] flex items-center gap-1.5 mb-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-700">security</span>
                                Nguyên tắc an toàn
                            </h4>
                            <p className="text-[13px] text-amber-900/80 leading-relaxed">
                                Hãy hẹn gặp trực tiếp tại nơi công cộng đông người. Tuyệt đối <strong>không chuyển khoản bất kỳ khoản phí nào</strong> trước khi nhận được đồ vật thực tế.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
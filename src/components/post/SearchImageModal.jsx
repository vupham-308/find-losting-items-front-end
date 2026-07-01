import { useState, useRef } from "react";
import { searchImage } from "../../services/postService.js";
import { ImagePlus, Search, AlertCircle, CheckCircle, X } from "lucide-react";
import PostDetailModal from "./PostDetailModal.jsx";

function ItemCard({ item, onClick }) {
    const type = item.type || "LOST";
    const imgUrl = item.image_url || item.imageUrl || item.image || "https://placehold.co/600x400?text=No+Image";
    const districtName = item.location?.district || item.district || "Không rõ khu vực";

    const hasMatchScore = item.match_score !== undefined && item.match_score !== null;
    const scoreVal = hasMatchScore ? item.match_score * 100 : 0;
    const matchPercent = scoreVal % 1 === 0 ? scoreVal.toFixed(0) : scoreVal.toFixed(1);

    const formatEventTime = (isoString) => {
        if (!isoString) return "Không rõ thời gian";
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return "Không rõ thời gian";
        }
    };

    return (
        <div onClick={onClick} className="cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/30 group flex flex-col justify-between h-full text-left">
            <div>
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    <img
                        src={imgUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {hasMatchScore && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-white shadow-md">
                            Khớp: {matchPercent}%
                        </span>
                    )}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                        type === "LOST"
                            ? "bg-error-container text-on-error-container border border-error/20"
                            : "bg-primary-container text-on-primary-container border border-primary/20"
                    }`}>
                        {type}
                    </span>
                </div>
                <div className="p-3">
                    <h3 className="text-[16px] font-semibold mb-1 line-clamp-1 text-on-surface">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant mb-0.5">
                        <span className="material-symbols-outlined text-[15px]">location_on</span>
                        <span>{districtName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        <span>{formatEventTime(item.created_at || item.createdAt || item.eventTime)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SearchImageModal({ onClose }) {
    const [selectedPostId, setSelectedPostId] = useState(null);
    const resultsRef = useRef(null);
    const [description, setDescription] = useState("");
    const [targetType, setTargetType] = useState("LOST");
    const [imageFile, setImageFile] = useState(null);
    
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setImageFile(files[0]);
            setErrorMessage("");
        }
    };

    const removeImage = () => {
        setImageFile(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!imageFile) {
            setErrorMessage("Vui lòng tải lên hình ảnh vật phẩm để tìm kiếm.");
            return;
        }

        setIsSearching(true);
        setErrorMessage("");
        setHasSearched(false);

        try {
            const formData = new FormData();
            formData.append("description", description);
            formData.append("target_type", targetType);
            formData.append("image", imageFile);

            const response = await searchImage(formData);
            
            const apiData = response?.data;
            let rawResults = [];

            if (apiData && Array.isArray(apiData.results)) {
                rawResults = apiData.results;
            } else if (Array.isArray(apiData)) {
                rawResults = apiData;
            } else if (apiData && Array.isArray(apiData.content)) {
                rawResults = apiData.content;
            } else if (apiData && Array.isArray(apiData.posts)) {
                rawResults = apiData.posts;
            } else if (response && Array.isArray(response.results)) {
                rawResults = response.results;
            } else if (Array.isArray(response)) {
                rawResults = response;
            } else if (response && Array.isArray(response.content)) {
                rawResults = response.content;
            } else if (response && Array.isArray(response.posts)) {
                rawResults = response.posts;
            }

            const normalized = rawResults
                .filter(item => item.match_score !== 0 && item.match_score !== "0")
                .map(item => ({
                    ...item,
                    id: item.post_id || item.id,
                    image_url: item.blurred_image_url || item.original_image_url || item.image_url || item.imageUrl,
                    created_at: item.created_at || item.event_time
                }));

            setResults(normalized);
            setHasSearched(true);
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm đa phương thức:", err);
            setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình tìm kiếm AI. Vui lòng thử lại.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 text-left relative flex flex-col z-10 animate-in fade-in zoom-in duration-200 p-6 md:p-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer text-on-surface z-20"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-6 px-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 text-primary">Tìm kiếm bằng hình ảnh</h1>
                    <p className="text-on-surface-variant text-[13px] md:text-[14px]">
                        Tải ảnh vật phẩm và mô tả để AI tự động tìm tin đăng trùng khớp nhất.
                    </p>
                </div>

                {/* Error Message Box */}
                {errorMessage && (
                    <div className="mb-5 p-3.5 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-2 text-left">
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form and Upload layout */}
                <div className="bg-surface-container-low/40 rounded-xl p-5 border border-outline-variant/20">
                    
                    {/* Toggle Selector */}
                    <div className="flex p-1 bg-surface-container rounded-xl mb-5">
                        <button
                            type="button"
                            onClick={() => setTargetType("LOST")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                                targetType === "LOST"
                                    ? "bg-primary text-on-primary shadow-sm"
                                    : "text-on-surface-variant hover:bg-surface-container-high"
                            }`}
                        >
                            <AlertCircle size={16} />
                            Tôi nhặt được đồ
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetType("FOUND")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                                targetType === "FOUND"
                                    ? "bg-primary text-on-primary shadow-sm"
                                    : "text-on-surface-variant hover:bg-surface-container-high"
                            }`}
                        >
                            <CheckCircle size={16} />
                            Tôi bị mất đồ
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Image Upload Area */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                                Hình ảnh vật phẩm cần đối soát <span className="text-red-500">*</span>
                            </label>
                            <label className="border-2 border-dashed border-outline-variant/60 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
                                <ImagePlus size={36} className="text-primary mb-1.5 group-hover:scale-115 transition-transform" />
                                <p className="text-sm font-bold text-on-surface">Nhấn để tải ảnh lên</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Image Preview Grid */}
                            {imageFile && (
                                <div className="flex gap-2 mt-3">
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded-lg border border-outline-variant"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-0 right-0 bg-error text-on-error rounded-full w-5 h-5 flex items-center justify-center -translate-y-1/2 translate-x-1/2 hover:opacity-90 transition-all font-bold text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                                Mô tả chi tiết vật phẩm (Không bắt buộc)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Mô tả đặc điểm nổi bật (màu sắc, nhãn hiệu...) để đối soát tốt hơn..."
                                rows="3"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <Search size={16} />
                            {isSearching ? "Đang phân tích hình ảnh & tìm kiếm..." : "Bắt đầu đối soát AI"}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {hasSearched && (
                    <div ref={resultsRef} className="space-y-4 mt-6">
                        <div className="border-t border-outline-variant/20 pt-4 text-left">
                            <h2 className="text-[17px] font-bold text-on-surface">Kết quả AI đối soát trùng khớp</h2>
                            <p className="text-[12px] text-on-surface-variant">Sắp xếp theo độ tin cậy trùng khớp giảm dần</p>
                        </div>

                        {results.length === 0 ? (
                            <div className="text-center py-10 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/60">
                                <span className="material-symbols-outlined text-[36px] text-outline mb-1.5 block">folder_open</span>
                                <h3 className="text-[15px] font-bold mb-0.5 text-on-surface">Không tìm thấy bài viết trùng khớp</h3>
                                <p className="text-on-surface-variant text-[12px]">AI không phát hiện bất kỳ bài viết nào khớp với mô tả và hình ảnh này.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {results.map((item) => (
                                    <ItemCard key={item.id} item={item} onClick={() => setSelectedPostId(item.id)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedPostId && (
                    <PostDetailModal
                        postId={selectedPostId}
                        onClose={() => setSelectedPostId(null)}
                    />
                )}
            </div>
        </div>
    );
}

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { searchImage } from "../../services/postService.js";
import { ImagePlus, ArrowLeft, Search, AlertCircle, CheckCircle } from "lucide-react";
import PostDetailModal from "../../components/post/PostDetailModal.jsx";

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
        <div onClick={onClick} className="cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden card-shadow transition-all group flex flex-col justify-between h-full text-left">
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
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[12px] font-bold tracking-widest ${type === "LOST" ? "lost-badge" : "found-badge"}`}>
                            {type}
                        </span>
                    </div>
                    <div className="p-4">
                        <h3 className="text-[20px] font-semibold mb-2 line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-[14px] text-outline mb-1">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            <span>{districtName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-outline">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            <span>{formatEventTime(item.created_at || item.createdAt || item.eventTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default function SearchImage() {
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

            // Normalize search results keys and filter out 0% match scores
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
        <main className="max-w-[800px] mx-auto px-4 md:px-0 py-8 min-h-screen relative">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4 justify-center relative">
                <Link
                    to="/"
                    className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant transition-all active:scale-95 flex items-center justify-center border border-outline-variant/30 absolute left-0"
                    title="Quay lại trang chủ"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="text-center px-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">Tìm kiếm hình ảnh</h1>
                    <p className="text-on-surface-variant text-base md:text-lg">
                        Tìm kiếm tin đăng trùng khớp bằng AI đa phương thức.
                    </p>
                </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-bold flex items-center gap-2 text-left">
                    <AlertCircle size={18} className="text-red-600" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Form Card (matching CreatePost layout) */}
            <div className="form-card bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm">
                
                {/* Toggle Selector (matching CreatePost lost/found buttons) */}
                <div className="flex p-1 bg-surface-container rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setTargetType("LOST")}
                        className={`toggle-btn flex-1 py-3 rounded-lg font-headline-md text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                            targetType === "LOST"
                                ? "active bg-primary text-white"
                                : "text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        <AlertCircle size={20} />
                        Tôi nhặt được đồ
                    </button>
                    <button
                        type="button"
                        onClick={() => setTargetType("FOUND")}
                        className={`toggle-btn flex-1 py-3 rounded-lg font-headline-md text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                            targetType === "FOUND"
                                ? "active bg-primary text-white"
                                : "text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                    >
                        <CheckCircle size={20} />
                        Tôi cần tìm đồ bị mất
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Image Upload Area */}
                    <div className="space-y-1 text-left">
                        <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                            Hình ảnh vật phẩm cần đối soát <span className="text-red-500">*</span>
                        </label>
                        <label className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer group">
                            <ImagePlus size={48} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-body-lg font-semibold">Nhấn để tải ảnh lên</p>
                            <p className="font-body-sm text-on-surface-variant">
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {/* Image Preview Grid (matching CreatePost style) */}
                        {imageFile && (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                                <div className="relative">
                                    <img
                                        src={URL.createObjectURL(imageFile)}
                                        alt="Preview"
                                        className="w-full h-20 object-cover rounded-lg border border-outline-variant"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -translate-y-1/2 translate-x-1/2 hover:bg-red-600 transition-all"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1 text-left">
                        <label className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                            Mô tả chi tiết vật phẩm
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface font-body-lg transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="Mô tả đặc điểm nổi bật để mô hình AI đối soát tốt hơn..."
                            rows="4"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all text-[15px] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Search size={18} />
                        {isSearching ? "Đang phân tích hình ảnh & tìm kiếm..." : "Bắt đầu tìm kiếm AI"}
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {hasSearched && (
                <div ref={resultsRef} className="space-y-6 mt-12">
                    <div className="border-t border-outline-variant/30 pt-8 text-left">
                        <h2 className="text-2xl font-bold text-on-surface">Kết quả AI</h2>
                        <p className="text-sm text-on-surface-variant">Đây là các kết quả phù hợp nhất với hình ảnh và mô tả của bạn</p>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant">
                            <span className="material-symbols-outlined text-[48px] text-outline mb-2">folder_open</span>
                            <h3 className="text-[18px] font-bold mb-1">Không tìm thấy bài viết trùng khớp</h3>
                            <p className="text-on-surface-variant text-xs">AI không phát hiện bất kỳ bài viết nào khớp với mô tả và hình ảnh này.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-stack-md">
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
        </main>
    );
}

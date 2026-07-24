import { useState } from "react";
import { searchImage } from "../../services/postService.js";
import { usePostStore } from "../../stores/postStore.js";
import { ImagePlus, Search, AlertCircle, X } from "lucide-react";

export default function SearchImageModal({ onClose }) {
    const [description, setDescription] = useState("");
    const [targetType, setTargetType] = useState("FOUND");
    const [imageFile, setImageFile] = useState(null);
    
    const [isSearching, setIsSearching] = useState(false);
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
                .filter(item => {
                    if (item.match_score === undefined || item.match_score === null) return false;
                    const scoreNum = Number(item.match_score);
                    if (isNaN(scoreNum)) return false;
                    const scorePercent = scoreNum <= 1 ? scoreNum * 100 : scoreNum;
                    return scorePercent >= 50;
                })
                .map(item => ({
                    ...item,
                    id: item.post_id || item.id,
                    image_url: item.blurred_image_url || item.original_image_url || item.image_url || item.imageUrl,
                    created_at: item.created_at || item.event_time
                }));

            // Save search results into Zustand store and close popup
            usePostStore.setState({
                postsList: normalized,
                isSearchResult: true,
                isImageSearchResult: true,
                totalPages: 1,
                currentPage: 0,
                activeType: targetType // Auto-switch to matched tab (FOUND/LOST)
            });
            
            onClose();
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

            <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/30 text-left relative flex flex-col z-10 animate-in fade-in zoom-in duration-200 p-6 md:p-8">
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
                            {isSearching ? "Đang tìm kiếm..." : "Tìm kiếm"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { usePost } from "../../hooks/usePost";
import { getStockImages } from "../../services/postService";
import PostDetailModal from "../../components/post/PostDetailModal.jsx";
import SearchImageModal from "../../components/post/SearchImageModal.jsx";

const HCMC_DISTRICTS = [
  "Tất cả khu vực",
  "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12",
  "Quận Bình Thạnh", "Quận Bình Tân", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú",
  "Thành phố Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ", "Huyện Củ Chi", "Huyện Hóc Môn", "Huyện Nhà Bè"
];

const formatEventTime = (isoString) => {
    if (!isoString) return "Không rõ thời gian";
    try {
        const date = new Date(isoString);
        date.setHours(date.getHours() + 7);
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

function ItemCard({ item, onClick }) {
    const type = item.type || "LOST";
    const imgUrl = item.image_url || item.imageUrl || item.image || (item.images && item.images.length > 0 ? item.images[0] : null) || "https://placehold.co/600x400?text=No+Image";
    const districtName = item.location?.district || item.district || "Không rõ khu vực";

    const hasMatchScore = item.match_score !== undefined && item.match_score !== null;
    const scoreVal = hasMatchScore ? item.match_score * 100 : 0;
    const matchPercent = scoreVal % 1 === 0 ? scoreVal.toFixed(0) : scoreVal.toFixed(1);

    return (
        <div onClick={onClick} className="cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden card-shadow transition-all group flex flex-col justify-between h-full">
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
                    <div className="p-stack-md">
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

export default function HomePage() {
    const navigate = useNavigate();
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [isSearchImageOpen, setIsSearchImageOpen] = useState(false);
    const sidebarDatePickerRef = useRef(null);
    const mobileDatePickerRef = useRef(null);
    const postsSectionRef = useRef(null);
    const {
        postsList,
        currentPage,
        totalPages,
        activeType,
        activeDistrict,
        filterDate,
        filterTime,
        filterCategory,
        filterTag,
        isLoading,
        searchQuery,
        isSearchResult,
        isImageSearchResult,
        setActiveType,
        setActiveDistrict,
        setCurrentPage,
        setSearchQuery,
        setFilterDate,
        setFilterTime,
        setFilterCategory,
        setFilterTag,
        fetchPosts,
        executeSearch,
        clearSearch,
        resetFilters
    } = usePost();

    const [categoriesList, setCategoriesList] = useState([
        { value: "ALL", label: "Tất cả danh mục" },
        { value: "DOCS_CARDS", label: "CCCD / CMND / Giấy tờ" },
        { value: "WALLET", label: "Ví / Bóp tiền" },
        { value: "ELECTRONICS", label: "Thiết bị điện tử" },
        { value: "KEYS", label: "Chìa khóa" },
        { value: "APPAREL_ACC", label: "Quần áo & Phụ kiện" },
        { value: "BOOKS_STATIONERY", label: "Sách vở & Văn phòng phẩm" },
        { value: "PETS", label: "Thú cưng" }
    ]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getStockImages();
                const list = res?.data || res || [];
                if (Array.isArray(list) && list.length > 0) {
                    const uniqueCategories = [];
                    const seen = new Set();
                    list.forEach(item => {
                        if (item.category && !seen.has(item.category)) {
                            seen.add(item.category);
                            uniqueCategories.push({
                                value: item.category,
                                label: item.label || item.category
                            });
                        }
                    });
                    if (uniqueCategories.length > 0) {
                        setCategoriesList([
                            { value: "ALL", label: "Tất cả danh mục" },
                            ...uniqueCategories
                        ]);
                    }
                }
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        })();
    }, []);

    const handleDateMaskChange = (e) => {
        let value = e.target.value;
        const isDelete = value.length < (filterDate || "").length;
        if (isDelete) {
            setFilterDate(value);
            return;
        }
        
        value = value.replace(/[^\d]/g, ""); // Keep only digits
        
        let formatted = "";
        if (value.length > 0) {
            formatted += value.substring(0, 2);
        }
        if (value.length > 2) {
            formatted += "/" + value.substring(2, 4);
        }
        if (value.length > 4) {
            formatted += "/" + value.substring(4, 8);
        }
        setFilterDate(formatted);
    };

    useEffect(() => {
        if (isImageSearchResult) {
            return; // Maintain image search results static state
        }
        if (isSearchResult) {
            executeSearch();
        } else {
            fetchPosts();
        }
    }, [currentPage, activeType, isSearchResult, isImageSearchResult]);

    useEffect(() => {
        if (isImageSearchResult) {
            setTimeout(() => {
                postsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [isImageSearchResult]);

    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getTodayFormatted = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getCurrentTimeString = () => {
        const today = new Date();
        const hh = String(today.getHours()).padStart(2, '0');
        const mm = String(today.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    useEffect(() => {
        if (!filterDate) return;
        const [d, m, y] = filterDate.split("/");
        if (!d || !m || !y || y.length < 4) return;

        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const selectedDate = new Date(Number(y), Number(m) - 1, Number(d));

        if (selectedDate > todayDateOnly) {
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            setFilterDate(`${dd}/${mm}/${yyyy}`);
            
            if (filterTime) {
                const [hours, minutes] = filterTime.split(":");
                const selectedDateTime = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hours), Number(minutes));
                if (selectedDateTime > today) {
                    const hh = String(today.getHours()).padStart(2, '0');
                    const min = String(today.getMinutes()).padStart(2, '0');
                    setFilterTime(`${hh}:${min}`);
                }
            }
        } else if (selectedDate.getTime() === todayDateOnly.getTime() && filterTime) {
            const [hours, minutes] = filterTime.split(":");
            const selectedDateTime = new Date(Number(y), Number(m) - 1, Number(d), Number(hours), Number(minutes));
            if (selectedDateTime > today) {
                const hh = String(today.getHours()).padStart(2, '0');
                const min = String(today.getMinutes()).padStart(2, '0');
                setFilterTime(`${hh}:${min}`);
            }
        }
    }, [filterDate, filterTime]);

    const handleSearchSubmit = () => {
        executeSearch();
    };

    const handleClearSearch = () => {
        clearSearch();
    };

    const handleLostReport = () => {
        navigate('/create-post?mode=lost');
    };

    const handleFoundReport = () => {
        navigate('/create-post?mode=found');
    };
    return (
        <main className="max-w-[1200px] mx-auto px-gutter-desktop pb-16">
            {/* Hero */}
            <section className="relative py-stack-lg my-stack-md rounded-xl overflow-hidden min-h-[400px] flex items-center bg-gradient-to-br from-primary-container to-on-primary-fixed-variant">
                <div className="relative z-10 px-gutter-desktop max-w-2xl text-on-primary-container">
                    <h1 className="text-[32px] font-bold leading-tight tracking-tight mb-stack-sm">
                        Tìm lại đồ thất lạc tại Sài Gòn chưa bao giờ dễ dàng hơn.
                    </h1>
                    <p className="text-[16px] mb-stack-md opacity-90">
                        Kết nối cộng đồng, sẻ chia thông tin, tìm lại vật phẩm quý giá của bạn trong lòng thành phố năng động.
                    </p>
                    <div className="flex flex-wrap gap-stack-md">
                        <button
                            onClick={handleLostReport}
                            className="px-8 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">report_gmailerrorred</span>
                            Đăng bài ngay
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSearchImageOpen(true)}
                            className="px-8 py-3 bg-surface-container-lowest text-primary font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined">search_check</span>
                            Tìm kiếm với hình ảnh
                        </button>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:block opacity-30">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHA7xSVEmJRliRZSXwxvkSWWXqvDInORnYKKwK_sbq6gJ89ljb8qNjV4mUoMdOxlG2VK-S2pGgh9_DNLulD8K9b36_xQg61NiL72JVZ66HLElp3ywfL7BsLMYMpPnAeBre9lFxaDHr2I1yY1c5n97CrekkaQIwY3Z4Wy9n7hJ77mIcthlKk241j6_ygYsexqAKnb02CxDs-7zJ67FsNMTx-XHO2ziiXJIFNP2Yr7DwZq6X2AXm-6ymeDEbPROnk0Zi5CkqiJG3CBE"
                        alt="Ho Chi Minh City Skyline"
                        className="w-full h-full object-cover rounded-l-3xl"
                    />
                </div>
            </section>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-stack-lg items-start">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 gap-stack-md sticky top-24 shrink-0 text-left">
                    <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
                            <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
                            <h2 className="text-[16px] font-bold text-on-surface">Bộ lọc tìm kiếm</h2>
                        </div>

                        {/* District Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                                Khu vực
                            </label>
                            <select
                                value={activeDistrict}
                                onChange={(e) => setActiveDistrict(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12.5px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                            >
                                {HCMC_DISTRICTS.map((dist) => (
                                    <option key={dist} value={dist}>
                                        {dist}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px] text-primary">category</span>
                                Danh mục
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12.5px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                            >
                                {categoriesList.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tag Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px] text-primary">tag</span>
                                Thẻ từ khóa (Tag)
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Nhập tag (ví dụ: ví, cccd...)"
                                    value={filterTag}
                                    onChange={(e) => setFilterTag(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12.5px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                                />
                                {filterTag && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterTag('')}
                                        className="absolute right-2.5 text-outline hover:text-on-surface cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Date Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                                Ngày {activeType === 'LOST' ? 'mất' : 'nhặt được'}
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="dd/mm/yyyy"
                                    value={filterDate}
                                    onChange={handleDateMaskChange}
                                    className="w-full pl-3 pr-10 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12.5px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => sidebarDatePickerRef.current?.showPicker()}
                                    className="absolute right-3 text-outline hover:text-primary cursor-pointer flex items-center"
                                >
                                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                </button>
                                <input
                                    type="date"
                                    ref={sidebarDatePickerRef}
                                    max={getTodayDateString()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            const [y, m, d] = val.split("-");
                                            setFilterDate(`${d}/${m}/${y}`);
                                        }
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: 0,
                                        height: 0,
                                        opacity: 0,
                                        pointerEvents: "none"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Time Field */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                                Giờ (tùy chọn)
                            </label>
                            <input
                                type="time"
                                value={filterTime}
                                onChange={(e) => setFilterTime(e.target.value)}
                                disabled={!filterDate}
                                max={filterDate === getTodayFormatted() ? getCurrentTimeString() : undefined}
                                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12.5px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold disabled:opacity-50 cursor-pointer"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/20">
                            <button
                                onClick={() => fetchPosts()}
                                className="w-full py-2 bg-primary text-on-primary font-bold text-[11px] rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-[15px]">search</span>
                                Áp dụng
                            </button>
                            <button
                                onClick={resetFilters}
                                className="w-full py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <section ref={postsSectionRef} className="flex-grow w-full">
                    {/* Header with Toggle Filter & Search */}
                    <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 mb-stack-md pb-4 border-b border-outline-variant/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-grow">
                            <h2 className="text-[28px] md:text-[32px] font-bold text-on-surface text-left">Tin đăng mới nhất</h2>
                            
                            {/* Search bar inside Tin đăng mới nhất */}
                            <div className="relative max-w-md w-full flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearchSubmit();
                                        }}
                                        placeholder="Tìm kiếm tin đăng bằng AI..."
                                        className="w-full pl-10 pr-10 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer flex items-center"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsSearchImageOpen(true)}
                                    title="Tìm kiếm bằng hình ảnh (AI)"
                                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 border border-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                </button>
                            </div>
                        </div>
                        {/* Type Filter Tabs */}
                        <div className="flex p-1 bg-surface-container rounded-xl border border-outline-variant/30 self-start xl:self-auto">
                            <button
                                onClick={() => setActiveType('LOST')}
                                className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all cursor-pointer ${
                                    activeType === 'LOST'
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                Đồ bị mất
                            </button>
                            <button
                                onClick={() => setActiveType('FOUND')}
                                className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all cursor-pointer ${
                                    activeType === 'FOUND'
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                Đồ tìm thấy
                            </button>
                        </div>
                    </div>

                    {/* Filter Card (Mobile only) */}
                    <div className="lg:hidden bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 md:p-6 mb-6 shadow-sm text-left">
                        <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            Bộ lọc tìm kiếm
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            {/* District Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                                    Khu vực
                                </label>
                                <select
                                    value={activeDistrict}
                                    onChange={(e) => setActiveDistrict(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                                >
                                    {HCMC_DISTRICTS.map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px] text-primary">category</span>
                                    Danh mục
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                                >
                                    {categoriesList.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tag Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px] text-primary">tag</span>
                                    Thẻ từ khóa (Tag)
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Nhập tag (ví dụ: ví, cccd...)"
                                        value={filterTag}
                                        onChange={(e) => setFilterTag(e.target.value)}
                                        className="w-full pl-3.5 pr-8 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                                    />
                                    {filterTag && (
                                        <button
                                            type="button"
                                            onClick={() => setFilterTag('')}
                                            className="absolute right-3 text-outline hover:text-on-surface cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Date Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                                    Ngày {activeType === 'LOST' ? 'mất' : 'nhặt được'}
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="dd/mm/yyyy"
                                        value={filterDate}
                                        onChange={handleDateMaskChange}
                                        className="w-full pl-3.5 pr-10 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => mobileDatePickerRef.current?.showPicker()}
                                        className="absolute right-3 text-outline hover:text-primary cursor-pointer flex items-center"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                    </button>
                                    <input
                                        type="date"
                                        ref={mobileDatePickerRef}
                                        max={getTodayDateString()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) {
                                                const [y, m, d] = val.split("-");
                                                setFilterDate(`${d}/${m}/${y}`);
                                            }
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: 0,
                                            height: 0,
                                            opacity: 0,
                                            pointerEvents: "none"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Time Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                                    Giờ (tùy chọn)
                                </label>
                                <input
                                    type="time"
                                    value={filterTime}
                                    onChange={(e) => setFilterTime(e.target.value)}
                                    disabled={!filterDate}
                                    max={filterDate === getTodayFormatted() ? getCurrentTimeString() : undefined}
                                    placeholder="HH:mm"
                                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold disabled:opacity-50 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-outline-variant/20">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                                Xóa bộ lọc
                            </button>
                            <button
                                onClick={() => fetchPosts()}
                                className="px-6 py-2.5 bg-primary text-on-primary font-bold text-[11px] rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-[15px]">search</span>
                                Áp dụng
                            </button>
                        </div>
                    </div>

                    {/* Search Info Label (Moved below header & filters) */}
                    {isSearchResult && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-[13px] font-bold text-primary text-left">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                <span>Đây là kết quả phù hợp nhất với tìm kiếm của bạn</span>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="px-3.5 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-[14px]">refresh</span>
                                Quay lại danh sách
                            </button>
                        </div>
                    )}

                    {/* Posts Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-on-surface-variant font-bold text-sm">Đang tải danh sách bài đăng...</p>
                        </div>
                    ) : postsList.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant">
                            <span className="material-symbols-outlined text-[48px] text-outline mb-2">folder_open</span>
                            <h3 className="text-[18px] font-bold mb-1">Không có bài viết nào</h3>
                            <p className="text-on-surface-variant text-xs mb-4">Hiện chưa có tin đăng nào phù hợp với bộ lọc của bạn.</p>
                            <button
                                onClick={activeType === 'LOST' ? handleLostReport : handleFoundReport}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:brightness-110"
                            >
                                Đăng tin đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-stack-md">
                            {postsList.map(item => <ItemCard key={item.id} item={item} onClick={() => setSelectedPostId(item.id)} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-stack-lg">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-container cursor-pointer"
                            >
                                Trang trước
                            </button>
                            <span className="text-xs font-bold text-on-surface-variant px-2">
                                Trang {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-container cursor-pointer"
                            >
                                Trang sau
                            </button>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-stack-lg p-stack-lg bg-surface-container-high rounded-2xl text-center border-2 border-dashed border-outline-variant">
                        <h3 className="text-[20px] font-semibold mb-stack-sm">
                            {activeType === 'LOST'
                                ? "Bạn nhặt được đồ vật đánh rơi?"
                                : "Bạn không thấy đồ vật của mình?"}
                        </h3>
                        <button
                            onClick={activeType === 'LOST' ? handleFoundReport : handleLostReport}
                            className="px-10 py-4 bg-primary text-on-primary rounded-full font-bold transition-all text-[12px] tracking-widest shadow-lg hover:scale-105 transition-transform items-center gap-2 cursor-pointer"
                        >
                            {activeType === 'LOST'
                                ? "Đăng bài nhặt đồ ngay!"
                                : "Đăng bài tìm đồ ngay!"}
                        </button>
                    </div>
                </section>
            </div>
            {selectedPostId && (
                <PostDetailModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                    onActionComplete={isSearchResult ? executeSearch : fetchPosts}
                />
            )}
            {isSearchImageOpen && (
                <SearchImageModal
                    onClose={() => setIsSearchImageOpen(false)}
                />
            )}
        </main>
    );
}
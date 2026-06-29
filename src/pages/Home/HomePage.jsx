import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { api } from "../services/api";

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

function ItemCard({ item }) {
    const type = item.type || "LOST";
    const imgUrl = item.image_url || item.imageUrl || item.image || (item.images && item.images.length > 0 ? item.images[0] : null) || "https://placehold.co/600x400?text=No+Image";
    const districtName = item.location?.district || item.district || "Không rõ khu vực";

    const hasMatchScore = item.match_score !== undefined && item.match_score !== null;
    const scoreVal = hasMatchScore ? item.match_score * 100 : 0;
    const matchPercent = scoreVal % 1 === 0 ? scoreVal.toFixed(0) : scoreVal.toFixed(1);

    return (
        <Link to={`/posts/${item.id}`}>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow transition-all group flex flex-col justify-between h-full">
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
        </Link>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [postsList, setPostsList] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [activeType, setActiveType] = useState('LOST');
    const [activeDistrict, setActiveDistrict] = useState('Tất cả khu vực');
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchResult, setIsSearchResult] = useState(false);

    useEffect(() => {
        // Reset page to 0 when filters change
        setPage(0);
    }, [activeType, activeDistrict]);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            let url = `/api/v1/posts/all?page=${page}&size=18&sortBy=createdAt&sortDir=DESC&type=${activeType}&status=ACTIVE`;
            if (activeDistrict && activeDistrict !== 'Tất cả khu vực') {
                url += `&district=${encodeURIComponent(activeDistrict)}`;
            }
            const response = await api.get(url, { auth: true });
            const apiData = response?.data;
            
            let contentList = [];
            if (apiData && Array.isArray(apiData.content)) {
                contentList = apiData.content;
            } else if (Array.isArray(apiData)) {
                contentList = apiData;
            } else if (response && Array.isArray(response.content)) {
                contentList = response.content;
            } else if (Array.isArray(response)) {
                contentList = response;
            }

            setPostsList(contentList);
            setTotalPages(apiData?.totalPages || 1);
        } catch (err) {
            console.error("Lỗi khi tải bài đăng với bộ lọc, thử tải không có quận huyện:", err);
            try {
                let url = `/api/v1/posts/all?page=${page}&size=18&sortBy=createdAt&sortDir=DESC&type=${activeType}&status=ACTIVE`;
                const response = await api.get(url, { auth: true });
                const apiData = response?.data;
                
                let contentList = [];
                if (apiData && Array.isArray(apiData.content)) {
                    contentList = apiData.content;
                } else if (Array.isArray(apiData)) {
                    contentList = apiData;
                } else if (response && Array.isArray(response.content)) {
                    contentList = response.content;
                } else if (Array.isArray(response)) {
                    contentList = response;
                }
                
                if (activeDistrict && activeDistrict !== 'Tất cả khu vực') {
                    contentList = contentList.filter(item => {
                        const dName = item.location?.district || item.district;
                        return dName === activeDistrict;
                    });
                }
                setPostsList(contentList);
                setTotalPages(apiData?.totalPages || 1);
            } catch (fallbackErr) {
                console.error("Lỗi hoàn toàn khi tải danh sách bài đăng:", fallbackErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const executeSearch = async () => {
        if (!searchQuery.trim()) {
            setIsSearchResult(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post('/api/v1/posts/search/text', {
                text: searchQuery,
                query: searchQuery,
                top_k: 20,
                target_type: activeType
            }, { auth: true });

            const apiData = response?.data;
            let results = [];
            
            if (apiData && Array.isArray(apiData.results)) {
                results = apiData.results;
            } else if (Array.isArray(apiData)) {
                results = apiData;
            } else if (apiData && Array.isArray(apiData.content)) {
                results = apiData.content;
            } else if (apiData && Array.isArray(apiData.posts)) {
                results = apiData.posts;
            } else if (response && Array.isArray(response.results)) {
                results = response.results;
            } else if (Array.isArray(response)) {
                results = response;
            } else if (response && Array.isArray(response.content)) {
                results = response.content;
            } else if (response && Array.isArray(response.posts)) {
                results = response.posts;
            }

            // Normalize search results keys (mapping post_id -> id and blurred_image_url -> image_url)
            // Filter out items with 0% match score (match_score === 0)
            const normalizedResults = results
                .filter(item => item.match_score !== 0 && item.match_score !== "0")
                .map(item => ({
                    ...item,
                    id: item.post_id || item.id,
                    image_url: item.blurred_image_url || item.original_image_url || item.image_url || item.imageUrl,
                    created_at: item.created_at || item.event_time
                }));

            setPostsList(normalizedResults);
            setTotalPages(1);
        } catch (err) {
            console.error("Lỗi khi tìm kiếm semantic:", err);
            setPostsList([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isSearchResult) {
            executeSearch();
        } else {
            fetchPosts();
        }
    }, [page, activeType, activeDistrict, isSearchResult]);

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) {
            setIsSearchResult(false);
            return;
        }
        if (isSearchResult) {
            executeSearch();
        } else {
            setIsSearchResult(true);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearchResult(false);
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
                        <Link to="/search-image" className="inline-block">
                            <button
                                type="button"
                                className="px-8 py-3 bg-surface-container-lowest text-primary font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">search_check</span>
                                Tìm kiếm với hình ảnh
                            </button>
                        </Link>
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
                    <div className="p-stack-md bg-surface-container-low rounded-xl">
                        <div className="mb-stack-md">
                            <h2 className="text-[20px] font-semibold text-primary">Khu vực</h2>
                            <p className="text-[14px] text-on-surface-variant">Lọc theo quận huyện</p>
                        </div>
                        <nav className="flex flex-col gap-1 max-h-[450px] overflow-y-auto pr-1">
                            {HCMC_DISTRICTS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setActiveDistrict(d)}
                                    className={`flex items-center gap-stack-sm rounded-lg px-4 py-2 text-[12px] font-bold tracking-widest transition-colors w-full text-left cursor-pointer ${
                                        activeDistrict === d
                                            ? "bg-secondary-container text-on-secondary-container"
                                            : "text-on-surface-variant hover:bg-surface-container-highest"
                                    }`}
                                >
                                    <span className="material-symbols-outlined">
                                        {d === "Tất cả khu vực" ? "map" : "location_on"}
                                    </span>
                                    {d}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <section className="flex-grow w-full">
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
                                <Link
                                    to="/search-image"
                                    title="Tìm kiếm bằng hình ảnh (AI)"
                                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 border border-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                </Link>
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

                    {/* Search Info Label (Moved below header & filters) */}
                    {isSearchResult && (
                        <div className="flex items-center gap-2 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-[13px] font-bold text-primary text-left">
                            <span className="material-symbols-outlined text-[18px]">info</span>
                            <span>Đây là kết quả phù hợp nhất với tìm kiếm của bạn</span>
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
                            {postsList.map(item => <ItemCard key={item.id} item={item} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-stack-lg">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold disabled:opacity-50 disabled:pointer-events-none hover:bg-surface-container cursor-pointer"
                            >
                                Trang trước
                            </button>
                            <span className="text-xs font-bold text-on-surface-variant px-2">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(prev => prev + 1)}
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
        </main>
    );
}
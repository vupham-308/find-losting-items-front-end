import { create } from "zustand";
import * as postService from "../services/postService.js";

export const usePostStore = create((set, get) => ({
    postsList: [],
    currentPage: 0,
    totalPages: 1,
    activeType: "LOST",
    activeDistrict: "Tất cả khu vực",
    isLoading: false,
    searchQuery: "",
    isSearchResult: false,
    isImageSearchResult: false,
    errorMessage: "",

    filterDate: "",
    filterTime: "",
    filterCategory: "ALL",
    filterTag: "",

    setActiveType: (type) => set({ activeType: type, currentPage: 0, isImageSearchResult: false }),
    setActiveDistrict: (district) => set({ activeDistrict: district, currentPage: 0 }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsSearchResult: (isSearchResult) => set({ isSearchResult }),
    setFilterDate: (date) => set({ filterDate: date, currentPage: 0 }),
    setFilterTime: (time) => set({ filterTime: time, currentPage: 0 }),
    setFilterCategory: (category) => set({ filterCategory: category, currentPage: 0 }),
    setFilterTag: (tag) => set({ filterTag: tag, currentPage: 0 }),

    fetchPosts: async () => {
        const { currentPage, activeType, activeDistrict, filterDate, filterTime, filterCategory, filterTag } = get();
        set({ isLoading: true, errorMessage: "" });
        try {
            const hasFilter = (activeDistrict && activeDistrict !== "Tất cả khu vực") ||
                (filterDate && filterDate.trim() !== "") ||
                (filterTime && filterTime.trim() !== "") ||
                (filterCategory && filterCategory !== "ALL" && filterCategory !== "Tất cả danh mục") ||
                (filterTag && filterTag.trim() !== "");

            let response;
            if (hasFilter) {
                const filterParams = {
                    page: currentPage,
                    size: 18
                };

                if (activeType) {
                    filterParams.type = activeType;
                }

                if (activeDistrict && activeDistrict !== "Tất cả khu vực") {
                    filterParams.district = activeDistrict;
                }

                if (filterCategory && filterCategory !== "ALL" && filterCategory !== "Tất cả danh mục") {
                    filterParams.category = filterCategory;
                }

                if (filterTag && filterTag.trim() !== "") {
                    filterParams.tag = filterTag.trim();
                }

                if (filterDate && filterDate.length === 10) {
                    const parts = filterDate.split("/");
                    if (parts.length === 3) {
                        filterParams.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }

                if (filterTime && filterTime.trim() !== "") {
                    filterParams.time = filterTime.includes(":") ? `${filterTime}:00`.slice(0, 8) : filterTime;
                }

                response = await postService.filterPosts(filterParams);
            } else {
                const defaultParams = {
                    page: currentPage,
                    size: 18,
                    sortBy: "createdAt",
                    sortDir: "DESC",
                    type: activeType,
                    status: "ACTIVE"
                };
                response = await postService.getAllPosts(defaultParams);
            }

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

            set({
                postsList: contentList,
                totalPages: apiData?.totalPages || 1,
                isSearchResult: false
            });
        } catch (err) {
            console.error("Lỗi khi tải bài đăng với bộ lọc:", err);
            set({ postsList: [], totalPages: 1, errorMessage: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    resetFilters: () => {
        set({
            activeDistrict: "Tất cả khu vực",
            filterDate: "",
            filterTime: "",
            filterCategory: "ALL",
            filterTag: "",
            currentPage: 0,
            isImageSearchResult: false
        });
        get().fetchPosts();
    },

    executeSearch: async () => {
        const { searchQuery, activeType } = get();
        if (!searchQuery.trim()) {
            set({ isSearchResult: false, isImageSearchResult: false });
            get().fetchPosts();
            return;
        }

        set({ isLoading: true, errorMessage: "" });
        try {
            const response = await postService.searchText({
                text: searchQuery,
                query: searchQuery,
                top_k: 20,
                target_type: activeType
            });

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

            const normalizedResults = results
                .filter(item => item.match_score !== 0 && item.match_score !== "0")
                .map(item => ({
                    ...item,
                    id: item.post_id || item.id,
                    image_url: item.blurred_image_url || item.original_image_url || item.image_url || item.imageUrl,
                    created_at: item.created_at || item.event_time
                }));

            set({
                postsList: normalizedResults,
                totalPages: 1,
                isSearchResult: true,
                isImageSearchResult: false
            });
        } catch (err) {
            console.error("Lỗi khi tìm kiếm semantic:", err);
            set({ postsList: [], totalPages: 1, isSearchResult: true, isImageSearchResult: false, errorMessage: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    clearSearch: () => {
        set({ searchQuery: "", isSearchResult: false, isImageSearchResult: false, currentPage: 0 });
        get().fetchPosts();
    }
}));

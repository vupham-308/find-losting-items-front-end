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

    setActiveType: (type) => set({ activeType: type, currentPage: 0, isImageSearchResult: false }),
    setActiveDistrict: (district) => set({ activeDistrict: district, currentPage: 0 }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsSearchResult: (isSearchResult) => set({ isSearchResult }),
    setFilterDate: (date) => set({ filterDate: date, currentPage: 0 }),
    setFilterTime: (time) => set({ filterTime: time, currentPage: 0 }),

    fetchPosts: async () => {
        const { currentPage, activeType, activeDistrict, filterDate, filterTime } = get();
        set({ isLoading: true, errorMessage: "" });
        try {
            const params = {
                page: currentPage,
                size: 18,
                sortBy: "createdAt",
                sortDir: "DESC",
                type: activeType,
                status: "ACTIVE"
            };

            const hasFilter = (activeDistrict && activeDistrict !== "Tất cả khu vực") || filterDate || filterTime;

            let response;
            if (hasFilter) {
                if (activeDistrict && activeDistrict !== "Tất cả khu vực") {
                    params.district = activeDistrict;
                }
                let apiDate = undefined;
                if (filterDate && filterDate.length === 10) {
                    const parts = filterDate.split("/");
                    if (parts.length === 3) {
                        apiDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }

                if (apiDate) {
                    if (filterTime) {
                        const [hours, minutes] = filterTime.split(":");
                        const [year, month, day] = apiDate.split("-").map(Number);
                        const d = new Date(year, month - 1, day, Number(hours), Number(minutes));
                        d.setHours(d.getHours() - 7);
                        
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const hh = String(d.getHours()).padStart(2, '0');
                        const min = String(d.getMinutes()).padStart(2, '0');
                        
                        params.date = `${yyyy}-${mm}-${dd}`;
                        params.time = `${hh}:${min}:00`;
                    } else {
                        params.date = apiDate;
                    }
                }
                response = await postService.filterPosts(params);
            } else {
                response = await postService.getAllPosts(params);
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

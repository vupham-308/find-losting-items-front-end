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
    errorMessage: "",

    setActiveType: (type) => set({ activeType: type, currentPage: 0 }),
    setActiveDistrict: (district) => set({ activeDistrict: district, currentPage: 0 }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsSearchResult: (isSearchResult) => set({ isSearchResult }),

    fetchPosts: async () => {
        const { currentPage, activeType, activeDistrict } = get();
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
            if (activeDistrict && activeDistrict !== "Tất cả khu vực") {
                params.district = activeDistrict;
            }

            const response = await postService.getAllPosts(params);
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
            console.error("Lỗi khi tải bài đăng với bộ lọc, thử tải không có quận huyện:", err);
            try {
                // Fallback: load without district query and filter on client-side
                const params = {
                    page: currentPage,
                    size: 18,
                    sortBy: "createdAt",
                    sortDir: "DESC",
                    type: activeType,
                    status: "ACTIVE"
                };
                const response = await postService.getAllPosts(params);
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

                if (activeDistrict && activeDistrict !== "Tất cả khu vực") {
                    contentList = contentList.filter(item => {
                        const dName = item.location?.district || item.district;
                        return dName === activeDistrict;
                    });
                }

                set({
                    postsList: contentList,
                    totalPages: apiData?.totalPages || 1,
                    isSearchResult: false
                });
            } catch (fallbackErr) {
                console.error("Lỗi hoàn toàn khi tải danh sách bài đăng:", fallbackErr);
                set({ postsList: [], totalPages: 1, errorMessage: fallbackErr.message });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    executeSearch: async () => {
        const { searchQuery, activeType } = get();
        if (!searchQuery.trim()) {
            set({ isSearchResult: false });
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
                isSearchResult: true
            });
        } catch (err) {
            console.error("Lỗi khi tìm kiếm semantic:", err);
            set({ postsList: [], totalPages: 1, isSearchResult: true, errorMessage: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    clearSearch: () => {
        set({ searchQuery: "", isSearchResult: false, currentPage: 0 });
        get().fetchPosts();
    }
}));

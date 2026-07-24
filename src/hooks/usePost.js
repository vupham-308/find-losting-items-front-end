import { usePostStore } from "../stores/postStore.js";

export function usePost() {
    const postsList = usePostStore((s) => s.postsList);
    const currentPage = usePostStore((s) => s.currentPage);
    const totalPages = usePostStore((s) => s.totalPages);
    const activeType = usePostStore((s) => s.activeType);
    const filterDate = usePostStore((s) => s.filterDate);
    const filterTime = usePostStore((s) => s.filterTime);
    const filterCategory = usePostStore((s) => s.filterCategory);
    const filterTag = usePostStore((s) => s.filterTag);
    const activeDistrict = usePostStore((s) => s.activeDistrict);
    const isLoading = usePostStore((s) => s.isLoading);
    const searchQuery = usePostStore((s) => s.searchQuery);
    const isSearchResult = usePostStore((s) => s.isSearchResult);
    const isImageSearchResult = usePostStore((s) => s.isImageSearchResult);
    const errorMessage = usePostStore((s) => s.errorMessage);

    const setActiveType = usePostStore((s) => s.setActiveType);
    const setActiveDistrict = usePostStore((s) => s.setActiveDistrict);
    const setCurrentPage = usePostStore((s) => s.setCurrentPage);
    const setSearchQuery = usePostStore((s) => s.setSearchQuery);
    const setIsSearchResult = usePostStore((s) => s.setIsSearchResult);
    const setFilterDate = usePostStore((s) => s.setFilterDate);
    const setFilterTime = usePostStore((s) => s.setFilterTime);
    const setFilterCategory = usePostStore((s) => s.setFilterCategory);
    const setFilterTag = usePostStore((s) => s.setFilterTag);
    const fetchPosts = usePostStore((s) => s.fetchPosts);
    const executeSearch = usePostStore((s) => s.executeSearch);
    const clearSearch = usePostStore((s) => s.clearSearch);
    const resetFilters = usePostStore((s) => s.resetFilters);

    return {
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
        errorMessage,
        setActiveType,
        setActiveDistrict,
        setCurrentPage,
        setSearchQuery,
        setIsSearchResult,
        setFilterDate,
        setFilterTime,
        setFilterCategory,
        setFilterTag,
        fetchPosts,
        executeSearch,
        clearSearch,
        resetFilters
    };
}

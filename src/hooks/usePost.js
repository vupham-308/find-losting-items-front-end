import { usePostStore } from "../stores/postStore.js";

export function usePost() {
    const postsList = usePostStore((s) => s.postsList);
    const currentPage = usePostStore((s) => s.currentPage);
    const totalPages = usePostStore((s) => s.totalPages);
    const activeType = usePostStore((s) => s.activeType);
    const activeDistrict = usePostStore((s) => s.activeDistrict);
    const isLoading = usePostStore((s) => s.isLoading);
    const searchQuery = usePostStore((s) => s.searchQuery);
    const isSearchResult = usePostStore((s) => s.isSearchResult);
    const errorMessage = usePostStore((s) => s.errorMessage);

    const setActiveType = usePostStore((s) => s.setActiveType);
    const setActiveDistrict = usePostStore((s) => s.setActiveDistrict);
    const setCurrentPage = usePostStore((s) => s.setCurrentPage);
    const setSearchQuery = usePostStore((s) => s.setSearchQuery);
    const setIsSearchResult = usePostStore((s) => s.setIsSearchResult);
    const fetchPosts = usePostStore((s) => s.fetchPosts);
    const executeSearch = usePostStore((s) => s.executeSearch);
    const clearSearch = usePostStore((s) => s.clearSearch);

    return {
        postsList,
        currentPage,
        totalPages,
        activeType,
        activeDistrict,
        isLoading,
        searchQuery,
        isSearchResult,
        errorMessage,
        setActiveType,
        setActiveDistrict,
        setCurrentPage,
        setSearchQuery,
        setIsSearchResult,
        fetchPosts,
        executeSearch,
        clearSearch
    };
}

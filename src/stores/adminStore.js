// Zustand store cho Admin dashboard
import { create } from "zustand"
import { getUsers, getStockImages, getPosts } from "../services/adminService.js"

const useAdminStore = create((set, get) => ({
    // ----- Users -----
    users: [],
    usersLoading: false,
    usersError: null,
    usersPagination: {
        pageNumber: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0,
        last: true,
    },
    usersSearch: "",
    usersRole: "", // "" = tất cả vai trò
    usersSortBy: "id",
    usersSortDir: "asc",

    setUsersSearch: (search) => set({ usersSearch: search }),
    setUsersRole: (role) => set({ usersRole: role }),
    setUsersSort: (sortBy, sortDir) => set({ usersSortBy: sortBy, usersSortDir: sortDir }),

    fetchUsers: async ({ page, size, search, role, sortBy, sortDir } = {}) => {
        set({ usersLoading: true, usersError: null })
        try {
            const p = page ?? get().usersPagination.pageNumber
            const s = size ?? get().usersPagination.pageSize
            const k = search ?? get().usersSearch
            const r = role ?? get().usersRole
            const sb = sortBy ?? get().usersSortBy
            const sd = sortDir ?? get().usersSortDir

            const res = await getUsers({
                page: p,
                size: s,
                search: k,
                role: r,
                sortBy: sb,
                sortDir: sd,
            })
            const d = res?.data

            set({
                users: d?.content ?? [],
                usersPagination: {
                    pageNumber: d?.pageNumber ?? 0,
                    pageSize: d?.pageSize ?? s,
                    totalElements: d?.totalElements ?? 0,
                    totalPages: d?.totalPages ?? 0,
                    last: d?.last ?? true,
                },
                usersLoading: false,
            })
        } catch (err) {
            console.error("fetchUsers error details:", err);
            set({ usersLoading: false, usersError: err.message || "Có lỗi xảy ra" })
        }
    },

    // ----- Bài đăng -----
    posts: [],
    postsLoading: false,
    postsError: null,
    postsPagination: {
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    },
    postsType: "", // "" = tất cả loại
    postsStatus: "", // "" = tất cả trạng thái
    postsSortBy: "createdAt",
    postsSortDir: "DESC",

    setPostsType: (type) => set({ postsType: type }),
    setPostsStatus: (status) => set({ postsStatus: status }),
    setPostsSort: (sortBy, sortDir) => set({ postsSortBy: sortBy, postsSortDir: sortDir }),

    fetchPosts: async ({ page, size, type, status, sortBy, sortDir } = {}) => {
        set({ postsLoading: true, postsError: null })
        try {
            const p = page ?? get().postsPagination.pageNumber
            const s = size ?? get().postsPagination.pageSize
            const t = type ?? get().postsType
            const st = status ?? get().postsStatus
            const sb = sortBy ?? get().postsSortBy
            const sd = sortDir ?? get().postsSortDir

            const res = await getPosts({
                page: p,
                size: s,
                type: t,
                status: st,
                sortBy: sb,
                sortDir: sd,
            })
            const d = res?.data

            set({
                posts: d?.content ?? [],
                postsPagination: {
                    pageNumber: d?.pageNumber ?? 0,
                    pageSize: d?.pageSize ?? s,
                    totalElements: d?.totalElements ?? 0,
                    totalPages: d?.totalPages ?? 0,
                    last: d?.last ?? true,
                },
                postsLoading: false,
            })
        } catch (err) {
            set({ postsLoading: false, postsError: err.message || "Có lỗi xảy ra" })
        }
    },

    // ----- Ảnh mặc định (stock image) -----
    stockImages: [],
    stockImagesLoading: false,
    stockImagesError: null,
    stockImagesCategory: "", // "" = tất cả danh mục

    setStockImagesCategory: (category) => set({ stockImagesCategory: category }),

    fetchStockImages: async ({ category } = {}) => {
        set({ stockImagesLoading: true, stockImagesError: null })
        try {
            const c = category ?? get().stockImagesCategory
            const res = await getStockImages({ category: c })
            // Endpoint trả về mảng trực tiếp trong `data` (không phân trang).
            set({
                stockImages: Array.isArray(res?.data) ? res.data : [],
                stockImagesLoading: false,
            })
        } catch (err) {
            set({
                stockImagesLoading: false,
                stockImagesError: err.message || "Có lỗi xảy ra",
            })
        }
    },

    // ----- Sidebar -----
    sidebarCollapsed: false,
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))

export default useAdminStore

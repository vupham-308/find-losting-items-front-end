// Zustand store cho Admin dashboard
import { create } from "zustand"
import { getUsers } from "../services/adminService.js"

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

    setUsersSearch: (search) => set({ usersSearch: search }),

    fetchUsers: async ({ page, size, search } = {}) => {
        set({ usersLoading: true, usersError: null })
        try {
            const p = page ?? get().usersPagination.pageNumber
            const s = size ?? get().usersPagination.pageSize
            const k = search ?? get().usersSearch

            const res = await getUsers({ page: p, size: s, search: k })
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

    // ----- Sidebar -----
    sidebarCollapsed: false,
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))

export default useAdminStore

import { create } from "zustand"

const STORAGE_KEY = "theme"

// Lấy chế độ khởi tạo: ưu tiên lựa chọn đã lưu, không có thì theo cài đặt hệ điều hành.
// Giữ khớp với đoạn script chống nháy màn hình trong index.html.
function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark")
}

export const useThemeStore = create((set, get) => ({
    theme: getInitialTheme(),

    setTheme: (theme) => {
        localStorage.setItem(STORAGE_KEY, theme)
        applyTheme(theme)
        set({ theme })
    },

    toggleTheme: () => {
        get().setTheme(get().theme === "dark" ? "light" : "dark")
    }
}))

// Đồng bộ ngay khi module được nạp, phòng khi script trong index.html không chạy.
applyTheme(useThemeStore.getState().theme)

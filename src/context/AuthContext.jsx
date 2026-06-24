import { createContext, useContext, useState } from "react"
import * as authApi from "../services/api.js"

const AuthContext = createContext(null)

function getUserFromStorage() {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
        try {
            return JSON.parse(user)
        } catch {
            return null
        }
    }
    return null
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getUserFromStorage)

    // Bọc các hàm API auth: gọi API xong cập nhật state để toàn app re-render ngay
    const login = async (credentials) => {
        const u = await authApi.login(credentials)
        setUser(u)
        return u
    }

    const register = async (data) => {
        const u = await authApi.register(data)
        setUser(u)
        return u
    }

    const googleLogin = async (payload) => {
        const u = await authApi.googleLogin(payload)
        setUser(u)
        return u
    }

    const logout = async () => {
        await authApi.logout()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}

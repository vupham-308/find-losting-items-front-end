// Tập trung toàn bộ đường dẫn API ở một nơi để dễ quản lý.

export const AUTH_ENDPOINTS = {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    google: "/api/v1/auth/google",
    logout: "/api/v1/auth/logout",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    refreshToken: "/api/v1/auth/refresh",
    me: "/api/v1/auth/me",
    setupPassword: "/api/v1/auth/password/setup",
}

export const POST_ENDPOINTS = {
    createLost: "/api/v1/posts",
    createFound: "/api/v1/posts/found",
    suggestQuestions: "/api/v1/posts/suggest-questions",
    generateDescription: "/api/v1/posts/generate-description",
    all: "/api/v1/posts/all",
    searchText: "/api/v1/posts/search/text",
    searchImage: "/api/v1/posts/search",
    detail: "/api/v1/posts",
    myPosts: "/api/v1/posts/my-posts",
}

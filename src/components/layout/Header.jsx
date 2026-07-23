import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.js"
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase.js"
import { useChatStore } from "../../stores/chatStore.js"
import { useThemeStore } from "../../stores/themeStore.js"
import { Search } from "lucide-react"
import ChatModal from "../chat/ChatModal.jsx"
import { getRoomTime, getRoomStatusKey, ROOM_STATUS_TABS, DEFAULT_ROOM_STATUS_TAB } from "../chat/chatUtils.js"

// Messenger-style time formatting helper
const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ""
    // Handle both firestore timestamp object and plain seconds/milliseconds
    const date = timestamp.toDate ? timestamp.toDate() : new Date((timestamp.seconds || timestamp._seconds || 0) * 1000)
    const diffMs = new Date() - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "vừa xong"
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
}

export default function Header() {
    const { user, logout } = useAuth()
    const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false)
    const [isFullChatOpen, setIsFullChatOpen] = useState(false)
    const [chatRooms, setChatRooms] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusTab, setStatusTab] = useState(DEFAULT_ROOM_STATUS_TAB)
    const { openChat } = useChatStore()
    const { theme, toggleTheme } = useThemeStore()
    const currentUserId = user ? String(user.userId || user.id) : ""

    const handleLogout = async () => {
        await logout()
    }

    // Listen to user's chat rooms in real-time
    useEffect(() => {
        if (!currentUserId) return

        const q = query(
            collection(db, "chats"),
            where("users", "array-contains", currentUserId)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms = []
            snapshot.forEach((doc) => {
                rooms.push({ id: doc.id, ...doc.data() })
            })
            // Sort in-memory descending by newest activity time
            rooms.sort((a, b) => getRoomTime(b) - getRoomTime(a))
            setChatRooms(rooms)
        }, (err) => {
            console.error("Lỗi khi tải danh sách tin nhắn header:", err)
        })

        return () => unsubscribe()
    }, [currentUserId])

    // Calculate total unread messages count
    const unreadCount = chatRooms.reduce((acc, room) => acc + (room[`unread_${currentUserId}`] || 0), 0)

    // Filter chat rooms based on search query
    const searchedRooms = chatRooms.filter((room) => {
        const recipientName = room.user1Id === currentUserId ? room.user2Name : room.user1Name
        const postTitle = room.postTitle || ""
        const lastMessage = room.lastMessage || ""
        const q = searchQuery.toLowerCase().trim()
        return (
            recipientName.toLowerCase().includes(q) ||
            postTitle.toLowerCase().includes(q) ||
            lastMessage.toLowerCase().includes(q)
        )
    })

    // Số hội thoại theo từng trạng thái (tính trên kết quả tìm kiếm hiện tại)
    const statusCounts = searchedRooms.reduce((acc, room) => {
        const key = getRoomStatusKey(room, currentUserId)
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {})

    const filteredRooms = searchedRooms.filter((room) => getRoomStatusKey(room, currentUserId) === statusTab)

    return (
        <header className="sticky top-0 w-full z-50 flex justify-between items-center px-gutter-desktop py-stack-sm bg-surface-container-lowest shadow-sm">
            {/* Logo */}
            <Link to={"/"}>
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" className="h-8 w-8 object-contain" alt="logo" />
                    <span className="text-[20px] font-bold text-primary">Sài Gòn Tìm Đồ</span>
                </div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-stack-sm">

                {/* Chuyển chế độ sáng / tối */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 bg-surface-container-low hover:bg-surface-container-high rounded-full transition-all flex items-center justify-center text-on-surface cursor-pointer"
                    title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                    aria-label={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {theme === "dark" ? "light_mode" : "dark_mode"}
                    </span>
                </button>

                {/* Auth: chưa login */}
                {!user && (
                    <div className="flex items-center gap-2">
                        <a
                            href="/login"
                            className="px-4 py-2 text-[14px] font-semibold bg-primary text-on-primary rounded-full hover:opacity-90 transition-all"                        >
                            Đăng nhập
                        </a>
                    </div>
                )}

                {/* Auth: đã login — Account dropdown */}
                {user && (
                    <div className="flex items-center gap-3">
                        {/* Chat Mailbox Dropdown Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsChatDropdownOpen(!isChatDropdownOpen)}
                                className="w-10 h-10 bg-surface-container-low hover:bg-surface-container-high rounded-full transition-all flex items-center justify-center text-on-surface cursor-pointer relative"
                                title="Hộp thư tin nhắn"
                            >
                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-surface-container-lowest">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Popover (Messenger style) */}
                            {isChatDropdownOpen && (
                                <>
                                    {/* Invisible overlay to close dropdown on click outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsChatDropdownOpen(false)}
                                    />

                                    <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl shadow-[0_12px_42px_rgba(0,0,0,0.16)] border-2 border-primary z-50 overflow-hidden flex flex-col max-h-[480px] text-left p-4 space-y-3">
                                        {/* Dropdown Title */}
                                        <div className="flex justify-between items-center shrink-0">
                                            <h2 className="text-[24px] font-black text-on-surface tracking-tight">Tin nhắn</h2>
                                        </div>

                                        {/* Search Input bar */}
                                        <div className="relative shrink-0">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Tìm kiếm tin nhắn..."
                                                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-[14px] text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Tabs lọc theo trạng thái */}
                                        <div className="shrink-0 flex border-b border-outline-variant/40">
                                            {ROOM_STATUS_TABS.map((tab) => {
                                                const count = statusCounts[tab.key] || 0
                                                const isActive = statusTab === tab.key

                                                return (
                                                    <button
                                                        key={tab.key || "all"}
                                                        type="button"
                                                        title={tab.title}
                                                        onClick={() => setStatusTab(tab.key)}
                                                        className={`flex-1 min-w-0 -mb-px pb-1.5 border-b-2 text-[11.5px] font-bold whitespace-nowrap transition-colors cursor-pointer ${isActive
                                                                ? "border-primary text-primary"
                                                                : "border-transparent text-on-surface-variant hover:text-on-surface"
                                                            }`}
                                                    >
                                                        {tab.label}
                                                        {count > 0 && (
                                                            <span className={`ml-1 font-semibold ${isActive ? "text-primary/70" : "text-on-surface-variant/70"}`}>
                                                                {count}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Chat List container */}
                                        <div className="flex-1 overflow-y-auto space-y-1 py-1">
                                            {filteredRooms.length === 0 ? (
                                                <div className="py-12 text-center text-on-surface-variant text-xs">
                                                    {searchQuery.trim() ? "Không tìm thấy tin nhắn" : "Không có cuộc trò chuyện ở mục này"}
                                                </div>
                                            ) : (
                                                filteredRooms.map((room) => {
                                                    const recipientName = room.user1Id === currentUserId ? room.user2Name : room.user1Name
                                                    const isUnread = (room[`unread_${currentUserId}`] || 0) > 0
                                                    const isMyRequest = String(room.requestedBy) === String(currentUserId)

                                                    return (
                                                        <div
                                                            key={room.id}
                                                            onClick={async () => {
                                                                // Clear unread count for current user
                                                                try {
                                                                    await setDoc(doc(db, "chats", room.id), {
                                                                        [`unread_${currentUserId}`]: 0
                                                                    }, { merge: true })
                                                                } catch {
                                                                    // Im lặng bỏ qua nếu quyền Firestore chưa cho phép
                                                                }
                                                                openChat({
                                                                    roomId: room.id,
                                                                    postId: room.postId,
                                                                    postTitle: room.postTitle,
                                                                    postImageUrl: room.postImageUrl,
                                                                    recipientId: room.user1Id === currentUserId ? room.user2Id : room.user1Id,
                                                                    recipientName: recipientName
                                                                })
                                                                setIsChatDropdownOpen(false)
                                                            }}
                                                            className="p-2.5 flex items-center gap-3 hover:bg-surface-container-low active:bg-surface-container rounded-xl cursor-pointer transition-colors"
                                                        >
                                                            {/* User Avatar circle with silhouette style */}
                                                            <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined text-[28px]">person</span>
                                                            </div>

                                                            {/* Text info block */}
                                                            <div className="min-w-0 flex-1 text-left">
                                                                <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
                                                                    {room.postType === "LOST" && room.status === "PENDING" && !room.lastMessage && (
                                                                        isMyRequest ? (
                                                                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider shrink-0 border border-amber-500/20">
                                                                                Đã gửi yêu cầu
                                                                            </span>
                                                                        ) : (
                                                                            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
                                                                                Cần duyệt
                                                                            </span>
                                                                        )
                                                                    )}
                                                                    {room.postType === "LOST" && room.status === "REJECTED" && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-error/10 text-error text-[9px] font-bold uppercase tracking-wider shrink-0 border border-error/20">
                                                                            Từ chối
                                                                        </span>
                                                                    )}
                                                                    <h4 className={`text-[14.5px] text-on-surface truncate min-w-0 ${isUnread ? "font-black" : "font-bold"}`}>{recipientName}</h4>
                                                                </div>
                                                                <p className="text-[11px] text-primary truncate mb-0.5 font-medium">
                                                                    Bài viết: {room.postTitle}
                                                                </p>
                                                                {room.lastMessage ? (
                                                                    <p className={`text-[12.5px] truncate ${isUnread ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}`}>
                                                                        {room.lastSenderId === currentUserId ? "Bạn: " : ""}{room.lastMessage}
                                                                        <span className="mx-1 text-[10px] text-on-surface-variant/70">•</span>
                                                                        <span className="text-[11.5px] text-on-surface-variant/70 font-normal">
                                                                            {formatLastMessageTime(room.lastMessageAt)}
                                                                        </span>
                                                                    </p>
                                                                ) : (
                                                                    room.status === "PENDING" && (
                                                                        <p className={`text-[12px] truncate ${isMyRequest ? "text-on-surface-variant/80 italic" : "text-emerald-600 dark:text-emerald-400 font-semibold"}`}>
                                                                            {isMyRequest ? "Đang chờ đối phương chấp nhận..." : "Yêu cầu nhắn tin mới • Nhấn để duyệt"}
                                                                        </p>
                                                                    )
                                                                )}
                                                            </div>
                                                            {isUnread && (
                                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        {/* Dropdown footer */}
                                        <div className="pt-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsChatDropdownOpen(false)
                                                    setIsFullChatOpen(true)
                                                }}
                                                className="w-full py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-bold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                                            >
                                                Xem tất cả tin nhắn
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full transition-all">
                                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <span className="text-[12px] font-bold tracking-widest text-on-surface">
                                    {user.name}
                                </span>
                                <span className="material-symbols-outlined text-outline">arrow_drop_down</span>
                            </button>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] overflow-hidden">
                                <div className="p-3 border-b border-outline-variant bg-surface-container-low">
                                    <p className="text-[12px] font-bold tracking-widest text-on-surface">{user.name}</p>
                                    <p className="text-[10px] text-on-surface-variant">{user.mail}</p>
                                </div>
                                <div className="py-1">
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-[14px] text-on-surface transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                                        Hồ sơ cá nhân
                                    </Link>
                                </div>
                                <div className="py-1 border-t border-outline-variant">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-[14px] text-error transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">logout</span>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {isFullChatOpen && (
                <ChatModal
                    currentUser={user}
                    onClose={() => setIsFullChatOpen(false)}
                />
            )}
        </header>
    )
}
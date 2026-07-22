import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth.js"
import { collection, query, where, onSnapshot, doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase.js"
import { useChatStore } from "../../stores/chatStore.js"
import { Search } from "lucide-react"
import ChatModal from "../chat/ChatModal.jsx"
import { getRoomTime } from "../chat/chatUtils.js"

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
    const { openChat } = useChatStore()
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
    const filteredRooms = chatRooms.filter((room) => {
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
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white">
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
                                    
                                    <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-[0_12px_42px_rgba(0,0,0,0.16)] border-2 border-primary z-50 overflow-hidden flex flex-col max-h-[480px] text-left p-4 space-y-3">
                                        {/* Dropdown Title */}
                                        <div className="flex justify-between items-center shrink-0">
                                            <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Tin nhắn</h2>
                                        </div>

                                        {/* Search Input bar */}
                                        <div className="relative shrink-0">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Tìm kiếm tin nhắn..." 
                                                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-[14px] text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        {/* Chat List container */}
                                        <div className="flex-1 overflow-y-auto space-y-1 py-1">
                                            {filteredRooms.length === 0 ? (
                                                <div className="py-12 text-center text-slate-400 text-xs">
                                                    Không tìm thấy tin nhắn
                                                </div>
                                            ) : (
                                                filteredRooms.map((room) => {
                                                    const recipientName = room.user1Id === currentUserId ? room.user2Name : room.user1Name
                                                    const isUnread = (room[`unread_${currentUserId}`] || 0) > 0
                                                    
                                                    return (
                                                        <div
                                                            key={room.id}
                                                            onClick={async () => {
                                                                // Clear unread count for current user
                                                                try {
                                                                    await setDoc(doc(db, "chats", room.id), {
                                                                        [`unread_${currentUserId}`]: 0
                                                                    }, { merge: true })
                                                                } catch (err) {
                                                                    console.error("Lỗi khi xóa unread:", err)
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
                                                            className="p-2.5 flex items-center gap-3 hover:bg-slate-100 active:bg-slate-200/80 rounded-xl cursor-pointer transition-colors"
                                                        >
                                                            {/* User Avatar circle with silhouette style */}
                                                            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined text-[28px]">person</span>
                                                            </div>
                                                            
                                                             {/* Text info block */}
                                                             <div className="min-w-0 flex-1 text-left">
                                                                 <div className="flex items-center gap-1.5 flex-wrap">
                                                                     <h4 className={`text-[14.5px] text-slate-900 truncate ${isUnread ? "font-black" : "font-bold"}`}>{recipientName}</h4>
                                                                     {room.postType === "LOST" && room.status === "PENDING" && !room.lastMessage && (
                                                                         <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider shrink-0 border border-amber-500/20">
                                                                             Chờ duyệt
                                                                         </span>
                                                                     )}
                                                                     {room.postType === "LOST" && room.status === "REJECTED" && (
                                                                         <span className="px-1.5 py-0.5 rounded bg-error/10 text-error text-[9px] font-bold uppercase tracking-wider shrink-0 border border-error/20">
                                                                             Từ chối
                                                                         </span>
                                                                     )}
                                                                 </div>
                                                                 <p className="text-[11px] text-primary truncate mb-0.5 font-medium">
                                                                     Bài viết: {room.postTitle}
                                                                 </p>
                                                                {room.lastMessage && (
                                                                    <p className={`text-[12.5px] truncate ${isUnread ? "text-slate-900 font-bold" : "text-slate-500 font-medium"}`}>
                                                                        {room.lastSenderId === currentUserId ? "Bạn: " : ""}{room.lastMessage}
                                                                        <span className="mx-1 text-[10px] text-slate-400">•</span>
                                                                        <span className="text-[11.5px] text-slate-400 font-normal">
                                                                            {formatLastMessageTime(room.lastMessageAt)}
                                                                        </span>
                                                                    </p>
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
                                        <div className="pt-2 border-t border-slate-150 text-center shrink-0">
                                            <a href="#" onClick={(e) => { 
                                                e.preventDefault(); 
                                                setIsChatDropdownOpen(false); 
                                                setIsFullChatOpen(true);
                                            }} className="text-blue-600 hover:underline text-[13.5px] font-bold block py-1">
                                                Xem tất cả tin nhắn
                                            </a>
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
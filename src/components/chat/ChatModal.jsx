import { useState, useEffect, useRef } from "react";
import { collection, doc, query, where, onSnapshot, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { X, Send, MessagesSquare, ChevronLeft, Search, AlertCircle } from "lucide-react";
import {
    decorateMessages,
    formatMessageTime,
    formatRelativeTime,
    getInitials,
    getAvatarGradient,
    getRoomTime,
    getRoomStatusKey,
    ROOM_STATUS_TABS,
    DEFAULT_ROOM_STATUS_TAB,
} from "./chatUtils.js";

export default function ChatModal({ onClose, defaultPostId, defaultRecipientId, defaultPostTitle, defaultPostImage, defaultRecipientName, currentUser }) {
    const currentUserId = currentUser ? String(currentUser.userId || currentUser.id) : "";
    const currentUserName = currentUser ? (currentUser.full_name || currentUser.name || "Người dùng") : "Người dùng";

    // roomId của hội thoại được mở sẵn (nếu modal được gọi kèm bài viết + người nhận).
    // Suy ra ngay khi render để không phải setState trong effect.
    // Công thức: postId_minUserId_maxUserId
    const defaultRoomId = (() => {
        if (!currentUserId || !defaultRecipientId) return null;
        const uid1 = String(currentUserId);
        const uid2 = String(defaultRecipientId);
        if (uid1 === uid2) return null; // Không thể tự nhắn cho chính mình
        const sortedIds = [uid1, uid2].sort();
        return `user_${sortedIds[0]}_${sortedIds[1]}`;
    })();

    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(defaultRoomId);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusTab, setStatusTab] = useState(DEFAULT_ROOM_STATUS_TAB);
    const [chatError, setChatError] = useState("");
    // "list" or "chat" (for mobile responsive)
    const [viewMode, setViewMode] = useState(defaultRoomId ? "chat" : "list");
    const messagesEndRef = useRef(null);

    // 1. Load active chat rooms list
    useEffect(() => {
        if (!currentUserId) return;

        const q = query(
            collection(db, "chats"),
            where("users", "array-contains", currentUserId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms = [];
            snapshot.forEach((doc) => {
                rooms.push({ id: doc.id, ...doc.data() });
            });
            // Sort in-memory descending by newest activity time
            rooms.sort((a, b) => getRoomTime(b) - getRoomTime(a));
            setChatRooms(rooms);
            setChatError("");
        }, (err) => {
            console.error("Lỗi khi tải phòng chat:", err);
            setChatError(
                err.code === "permission-denied"
                    ? "Không có quyền truy cập Firestore. Kiểm tra lại Security Rules của collection \"chats\"."
                    : `Không kết nối được Firestore (${err.code || "unknown"}).`
            );
        });

        return () => unsubscribe();
    }, [currentUserId]);

    // 2. Tạo document phòng chat mặc định trên Firestore.
    // Không await/không setState ở đây — hội thoại đã được mở sẵn qua defaultRoomId,
    // nên lỗi mạng cũng không chặn được giao diện.
    useEffect(() => {
        if (!defaultRoomId) return;

        setDoc(doc(db, "chats", defaultRoomId), {
            id: defaultRoomId,
            postId: Number(defaultPostId),
            postTitle: defaultPostTitle || "Bài viết",
            postImageUrl: defaultPostImage || "",
            user1Id: String(currentUserId),
            user1Name: currentUserName,
            user2Id: String(defaultRecipientId),
            user2Name: defaultRecipientName || "Người đăng tin",
            users: [String(currentUserId), String(defaultRecipientId)]
        }, { merge: true }).catch((err) => {
            console.error("Lỗi khi khởi tạo phòng chat:", err);
        });
    }, [defaultRoomId, defaultPostId, defaultPostTitle, defaultPostImage,
        currentUserId, currentUserName, defaultRecipientId, defaultRecipientName]);

    // 3. Load messages for selected room
    useEffect(() => {
        if (!selectedRoomId) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, "chats", selectedRoomId, "messages"),
            // No orderBy yet to prevent index requirements, we can sort in memory
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            // Sort messages by createdAt
            msgs.sort((a, b) => {
                const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
                return timeA - timeB;
            });
            setMessages(msgs);

            // Auto scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }, (err) => {
            console.error("Lỗi khi tải tin nhắn:", err);
        });

        return () => unsubscribe();
    }, [selectedRoomId]);

    // Clear unread count for current user when selecting a room or new messages arrive
    useEffect(() => {
        if (!selectedRoomId || !currentUserId) return;

        const roomRef = doc(db, "chats", selectedRoomId);
        setDoc(roomRef, {
            [`unread_${currentUserId}`]: 0
        }, { merge: true }).catch(err => {
            console.error("Lỗi khi xóa unread ở full chat:", err);
        });
    }, [selectedRoomId, currentUserId, messages.length]);

    // Find details of currently selected room
    const currentRoom = chatRooms.find(r => r.id === selectedRoomId);

    // Determine recipient name
    const getRecipientName = (room) => {
        if (!room) return "Người dùng";
        return String(room.user1Id) === String(currentUserId) ? room.user2Name : room.user1Name;
    };

    // 4. Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoomId || !currentRoom) return;

        const textToSend = newMessage.trim();
        setNewMessage("");

        const recipientId = String(currentRoom.user1Id) === String(currentUserId) ? currentRoom.user2Id : currentRoom.user1Id;

        try {
            // Add message
            await addDoc(collection(db, "chats", selectedRoomId, "messages"), {
                senderId: currentUserId,
                senderName: currentUserName,
                text: textToSend,
                createdAt: serverTimestamp()
            });

            // Update room lastMessage metadata and increment recipient's unread count
            const { increment } = await import("firebase/firestore");
            await setDoc(doc(db, "chats", selectedRoomId), {
                lastMessage: textToSend,
                lastMessageAt: serverTimestamp(),
                lastSenderId: currentUserId,
                [`unread_${recipientId}`]: increment(1)
            }, { merge: true });
        } catch (err) {
            console.error("Lỗi khi gửi tin nhắn:", err);
            setNewMessage(textToSend);
        }
    };

    const keyword = searchQuery.trim().toLowerCase();
    const searchedRooms = keyword
        ? chatRooms.filter((room) =>
              `${getRecipientName(room)} ${room.postTitle || ""} ${room.lastMessage || ""}`
                  .toLowerCase()
                  .includes(keyword)
          )
        : chatRooms;

    // Số hội thoại theo từng trạng thái (tính trên kết quả tìm kiếm hiện tại).
    const statusCounts = searchedRooms.reduce((acc, room) => {
        const key = getRoomStatusKey(room, currentUserId);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const filteredRooms = searchedRooms.filter((room) => getRoomStatusKey(room, currentUserId) === statusTab);

    const totalUnread = chatRooms.reduce(
        (sum, room) => sum + (room[`unread_${currentUserId}`] || 0),
        0
    );

    const decorated = decorateMessages(messages);
    const recipientName = getRecipientName(currentRoom);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl h-[82vh] border border-outline-variant/40 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
                style={{ boxShadow: "0 24px 70px rgba(0, 32, 74, 0.28)" }}
            >
                {/* ---------- Header ---------- */}
                <div
                    className="px-5 py-4 flex justify-between items-center shrink-0 text-on-primary"
                    style={{ backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }}
                >
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                            <MessagesSquare size={20} />
                        </div>
                        <div>
                            <h2 className="text-[17px] font-bold tracking-[-0.02em] leading-tight">Hộp thư tin nhắn</h2>
                            <p className="text-[11.5px] text-white/75 leading-tight mt-0.5">
                                {chatRooms.length} cuộc trò chuyện
                                {totalUnread > 0 && ` · ${totalUnread} tin chưa đọc`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center cursor-pointer text-white"
                        title="Đóng"
                    >
                        <X size={18} />
                    </button>
                </div>

                {chatError && (
                    <div className="px-5 py-2.5 bg-error-container text-on-error-container text-[12px] flex items-start gap-2 shrink-0 border-b border-error/20 text-left">
                        <AlertCircle size={15} className="shrink-0 mt-px" />
                        <span>{chatError}</span>
                    </div>
                )}

                {/* ---------- Content Area ---------- */}
                <div className="flex flex-1 overflow-hidden relative">

                    {/* ===== Left: danh sách hội thoại ===== */}
                    <aside
                        className={`w-full md:w-[320px] md:shrink-0 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest ${
                            viewMode === "chat" ? "hidden md:flex" : "flex"
                        }`}
                    >
                        {/* Search */}
                        <div className="p-3 pb-2 shrink-0">
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm cuộc trò chuyện..."
                                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-full border border-transparent text-[13px] text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:outline-none focus:bg-surface-container-lowest focus:border-primary/60 focus:ring-[3px] focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        {/* Tabs lọc theo trạng thái */}
                        <div className="px-3 shrink-0 flex border-b border-outline-variant/20">
                            {ROOM_STATUS_TABS.map((tab) => {
                                const count = statusCounts[tab.key] || 0;
                                const isActive = statusTab === tab.key;

                                return (
                                    <button
                                        key={tab.key || "all"}
                                        type="button"
                                        title={tab.title}
                                        onClick={() => setStatusTab(tab.key)}
                                        className={`flex-1 min-w-0 -mb-px pb-1.5 border-b-2 text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                            isActive
                                                ? "border-primary text-primary"
                                                : "border-transparent text-on-surface-variant hover:text-on-surface"
                                        }`}
                                    >
                                        {tab.label}
                                        {count > 0 && (
                                            <span className={`ml-1 ${isActive ? "text-primary/70" : "text-on-surface-variant/60"}`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {filteredRooms.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 gap-2">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-outline">
                                        <span className="material-symbols-outlined text-[28px]">inbox</span>
                                    </div>
                                    <p className="text-[13px] font-semibold text-on-surface text-center">
                                        {keyword
                                            ? "Không tìm thấy kết quả"
                                            : chatRooms.length === 0
                                                ? "Chưa có cuộc trò chuyện"
                                                : "Không có cuộc trò chuyện ở mục này"}
                                    </p>
                                    {!keyword && chatRooms.length === 0 && (
                                        <p className="text-[11.5px] text-on-surface-variant text-center leading-relaxed max-w-[220px]">
                                            Nhắn tin từ một bài đăng để bắt đầu trao đổi.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {filteredRooms.map((room) => {
                                        const isActive = room.id === selectedRoomId;
                                        const name = getRecipientName(room);
                                        const isUnread = (room[`unread_${currentUserId}`] || 0) > 0;
                                        const isMyRequest = String(room.requestedBy) === String(currentUserId);

                                        return (
                                            <button
                                                key={room.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRoomId(room.id);
                                                    setViewMode("chat");
                                                }}
                                                className={`w-full p-2.5 flex gap-3 rounded-xl cursor-pointer transition-colors text-left items-center ${
                                                    isActive
                                                        ? "bg-primary/8"
                                                        : "hover:bg-surface-container-low active:bg-surface-container"
                                                }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <div
                                                        className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[13px] text-white"
                                                        style={{ backgroundImage: getAvatarGradient(name) }}
                                                    >
                                                        {getInitials(name)}
                                                    </div>
                                                    {isUnread && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                            {room.postType === "LOST" && room.status === "PENDING" && !room.lastMessage && (
                                                                isMyRequest ? (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider shrink-0 border border-amber-500/20">
                                                                        Đã gửi yêu cầu
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
                                                                        Cần duyệt
                                                                    </span>
                                                                )
                                                            )}
                                                            {room.postType === "LOST" && room.status === "REJECTED" && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-error/10 text-error text-[9px] font-bold uppercase tracking-wider shrink-0 border border-error/20">
                                                                    Từ chối
                                                                </span>
                                                            )}
                                                            <h4 className={`text-[13.5px] truncate text-on-surface ${isUnread ? "font-extrabold" : "font-semibold"}`}>
                                                                {name}
                                                            </h4>
                                                        </div>
                                                        <span className="text-[10px] text-on-surface-variant/70 shrink-0">
                                                            {formatRelativeTime(room.lastMessageAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10.5px] text-primary font-medium truncate">
                                                        Bài viết: {room.postTitle}
                                                    </p>
                                                    <p className={`text-[12px] truncate mt-0.5 ${isUnread ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                                                        {room.lastMessage
                                                            ? `${room.lastSenderId === currentUserId ? "Bạn: " : ""}${room.lastMessage}`
                                                            : (room.status === "PENDING"
                                                                ? (isMyRequest ? "Đang chờ đối phương chấp nhận..." : "Yêu cầu nhắn tin mới • Nhấn để duyệt")
                                                                : "Chưa có tin nhắn")}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ===== Right: khung hội thoại ===== */}
                    <section
                        className={`flex-1 min-w-0 flex flex-col bg-surface-container-low/40 ${
                            viewMode === "list" ? "hidden md:flex" : "flex"
                        }`}
                    >
                        {selectedRoomId && currentRoom ? (
                            <>
                                {/* Conversation Header */}
                                <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center gap-3 shrink-0 text-left">
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className="md:hidden w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
                                        title="Quay lại danh sách"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="relative shrink-0">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] text-white"
                                            style={{ backgroundImage: getAvatarGradient(recipientName) }}
                                        >
                                            {getInitials(recipientName)}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-surface-container-lowest" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-[14px] text-on-surface truncate leading-tight">
                                            {recipientName}
                                        </h3>
                                        <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                                            {currentRoom.postTitle}
                                        </p>
                                    </div>

                                    {currentRoom.postId && (
                                        <a
                                            href={`/posts/${currentRoom.postId}`}
                                            className="shrink-0 px-3 py-1.5 rounded-full border border-primary/30 text-primary text-[11.5px] font-bold hover:bg-primary/8 transition-colors"
                                        >
                                            Xem bài đăng
                                        </a>
                                    )}
                                </div>

                                {/* Messages */}
                                {(() => {
                                    const otherUserId = String(currentRoom.user1Id) === String(currentUserId) ? currentRoom.user2Id : currentRoom.user1Id;
                                    const hasAcceptedChat = chatRooms.some(r => 
                                        r.id !== currentRoom.id && 
                                        Array.isArray(r.users) &&
                                        r.users.some(u => String(u) === String(currentUserId)) && 
                                        r.users.some(u => String(u) === String(otherUserId)) && 
                                        r.status === "ACCEPTED"
                                    );

                                    const isPending = currentRoom && currentRoom.postType === "LOST" && currentRoom.status === "PENDING" && !hasAcceptedChat;
                                    const isRejected = currentRoom && currentRoom.postType === "LOST" && currentRoom.status === "REJECTED";
                                    const isRequester = currentRoom && String(currentRoom.requestedBy) === String(currentUserId);

                                    if (isPending) {
                                        if (isRequester) {
                                            return (
                                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                                    <span className="material-symbols-outlined text-[64px] text-amber-500 animate-pulse">lock_person</span>
                                                    <div className="space-y-1.5 max-w-sm">
                                                        <h3 className="text-[17px] font-bold text-on-surface">Yêu cầu trò chuyện đang chờ duyệt</h3>
                                                        <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
                                                            Vì lý do an toàn và bảo mật, bạn cần đợi <strong className="text-primary">{recipientName}</strong> (người báo mất) chấp nhận yêu cầu kết nối để bắt đầu trò chuyện.
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 bg-surface-container-low/30">
                                                    <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center text-primary">
                                                        <span className="material-symbols-outlined text-[36px]">contact_mail</span>
                                                    </div>
                                                    <div className="space-y-2 max-w-md">
                                                        <h3 className="text-[17px] font-bold text-on-surface">Yêu cầu nhắn tin mới</h3>
                                                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                                                            <strong className="text-on-surface">{recipientName}</strong> muốn nhắn tin trao đổi với bạn về tin báo mất: <br/>
                                                            <span className="text-primary font-bold">"{currentRoom.postTitle}"</span>.
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-3 w-full max-w-xs">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    await setDoc(doc(db, "chats", currentRoom.id), {
                                                                        status: "ACCEPTED"
                                                                    }, { merge: true });

                                                                    // Synchronize all other pending rooms between these 2 users
                                                                    chatRooms.forEach(async (r) => {
                                                                        if (Array.isArray(r.users) && r.users.some(u => String(u) === String(currentUserId)) && r.users.some(u => String(u) === String(otherUserId)) && r.status === "PENDING") {
                                                                            await setDoc(doc(db, "chats", r.id), { status: "ACCEPTED" }, { merge: true });
                                                                        }
                                                                    });
                                                                } catch (err) {
                                                                    console.error("Lỗi khi chấp nhận yêu cầu:", err);
                                                                }
                                                            }}
                                                            className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-[13px] hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                                                        >
                                                            Chấp nhận
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    await setDoc(doc(db, "chats", currentRoom.id), {
                                                                        status: "REJECTED"
                                                                    }, { merge: true });
                                                                } catch (err) {
                                                                    console.error("Lỗi khi từ chối yêu cầu:", err);
                                                                }
                                                            }}
                                                            className="flex-1 py-2.5 bg-error text-on-error font-bold rounded-xl text-[13px] hover:opacity-90 transition-all cursor-pointer shadow-sm"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }

                                    if (isRejected) {
                                        return (
                                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                                <span className="material-symbols-outlined text-[64px] text-error">cancel</span>
                                                <div className="space-y-1.5 max-w-sm">
                                                    <h3 className="text-[17px] font-bold text-on-surface">Yêu cầu trò chuyện bị từ chối</h3>
                                                    <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
                                                        {isRequester
                                                            ? "Người mất đồ đã từ chối yêu cầu trò chuyện của bạn."
                                                            : "Bạn đã từ chối yêu cầu trò chuyện từ người dùng này."
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <>
                                            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
                                                {decorated.length === 0 ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8">
                                                        <div
                                                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[20px] font-bold shadow-lg"
                                                            style={{ backgroundImage: getAvatarGradient(recipientName) }}
                                                        >
                                                            {getInitials(recipientName)}
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[14px] font-bold text-on-surface">{recipientName}</p>
                                                            <p className="text-[12px] text-on-surface-variant leading-relaxed mt-1 max-w-[300px]">
                                                                Hãy gửi lời chào để bắt đầu trao đổi về món đồ này.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    decorated.map((msg) => {
                                                        const isOwn = msg.senderId === currentUserId;

                                                        return (
                                                            <div key={msg.id} className="w-full flex flex-col">
                                                                {msg.showDayLabel && msg.dayLabel && (
                                                                    <div className="flex items-center gap-3 my-4">
                                                                        <span className="h-px flex-1 bg-outline-variant/50" />
                                                                        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                                                                            {msg.dayLabel}
                                                                        </span>
                                                                        <span className="h-px flex-1 bg-outline-variant/50" />
                                                                    </div>
                                                                )}

                                                                <div
                                                                    className={`flex items-end gap-2 ${msg.isLastOfGroup ? "mb-2" : "mb-0.5"} ${
                                                                        isOwn ? "flex-row-reverse" : "flex-row"
                                                                    }`}
                                                                >
                                                                    {!isOwn && (
                                                                        <div className="w-7 shrink-0">
                                                                            {msg.isLastOfGroup && (
                                                                                <div
                                                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                                                    style={{ backgroundImage: getAvatarGradient(recipientName) }}
                                                                                >
                                                                                    {getInitials(recipientName)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {msg.type === "post_share" && msg.postMetadata ? (
                                                                        <PostShareCard meta={msg.postMetadata} isOwn={isOwn} />
                                                                    ) : (
                                                                        <div
                                                                            className={`max-w-[70%] px-3.5 py-2 text-[13px] leading-[1.5] break-words text-left shadow-sm ${
                                                                                isOwn
                                                                                    ? "text-on-primary rounded-2xl " +
                                                                                      (msg.isLastOfGroup ? "rounded-br-md" : "") +
                                                                                      (msg.isFirstOfGroup ? "" : " rounded-tr-md")
                                                                                    : "bg-surface-container-lowest text-on-surface border border-outline-variant/40 rounded-2xl " +
                                                                                      (msg.isLastOfGroup ? "rounded-bl-md" : "") +
                                                                                      (msg.isFirstOfGroup ? "" : " rounded-tl-md")
                                                                            }`}
                                                                            style={
                                                                                isOwn
                                                                                    ? { backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            {msg.text}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {msg.isLastOfGroup && formatMessageTime(msg.createdAt) && (
                                                                    <span
                                                                        className={`text-[10px] text-on-surface-variant/70 -mt-1 mb-2.5 ${
                                                                            isOwn ? "self-end" : "self-start ml-[36px]"
                                                                        }`}
                                                                    >
                                                                        {formatMessageTime(msg.createdAt)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div ref={messagesEndRef} />
                                            </div>

                                            {/* Composer */}
                                            <form
                                                onSubmit={handleSendMessage}
                                                className="px-3 py-3 bg-surface-container-lowest border-t border-outline-variant/30 flex gap-2 items-center shrink-0"
                                            >
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Nhập tin nhắn..."
                                                    className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-surface-container-low border border-transparent text-[13.5px] text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:outline-none focus:bg-surface-container-lowest focus:border-primary/60 focus:ring-[3px] focus:ring-primary/10"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="w-10 h-10 rounded-full text-on-primary disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:brightness-110 enabled:active:scale-90 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
                                                    style={{ backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }}
                                                    title="Gửi tin nhắn"
                                                >
                                                    <Send size={16} className="translate-x-px" />
                                                </button>
                                            </form>
                                        </>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
                                <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center text-primary">
                                    <MessagesSquare size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-[17px] font-bold text-on-surface">Chọn một cuộc trò chuyện</h3>
                                <p className="text-[12.5px] text-on-surface-variant max-w-[300px] text-center leading-relaxed">
                                    Chọn hội thoại ở danh sách bên trái, hoặc nhắn tin trực tiếp từ một bài đăng.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

/* ============ Thành phần phụ ============ */

function PostShareCard({ meta, isOwn }) {
    const isLost = meta.type === "LOST";

    return (
        <div
            onClick={() => { window.location.href = `/posts/${meta.postId}`; }}
            title="Xem chi tiết bài đăng"
            className={`w-[250px] max-w-[70%] rounded-2xl overflow-hidden border text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md shadow-sm shrink-0 bg-surface-container-lowest ${
                isOwn ? "border-primary/35 rounded-br-md" : "border-outline-variant/50 rounded-bl-md"
            }`}
        >
            <div className="flex gap-3 items-center p-3">
                {meta.imageUrl ? (
                    <img
                        src={meta.imageUrl}
                        alt={meta.title}
                        className="w-14 h-14 object-cover rounded-xl bg-surface-container-high shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-outline">
                        <span className="material-symbols-outlined text-[22px]">image</span>
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <span
                        className={`inline-block px-1.5 py-0.5 text-[8.5px] font-bold rounded uppercase tracking-wide ${
                            isLost ? "bg-error-container text-on-error-container" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        }`}
                    >
                        {isLost ? "Mất đồ" : "Nhặt được"}
                    </span>
                    <h5 className="font-bold text-[12.5px] text-on-surface truncate leading-tight mt-1">
                        {meta.title}
                    </h5>
                    <p className="text-[10.5px] text-on-surface-variant truncate flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {meta.address || "Không rõ địa điểm"}
                    </p>
                </div>
            </div>
            <div className="px-3 py-2 bg-primary/5 border-t border-outline-variant/30 text-[10.5px] font-bold text-primary text-center">
                Xem chi tiết bài đăng
            </div>
        </div>
    );
}

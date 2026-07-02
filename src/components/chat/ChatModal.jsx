import { useState, useEffect, useRef } from "react";
import { collection, doc, query, where, onSnapshot, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { X, Send, MessageSquare, ChevronLeft } from "lucide-react";

export default function ChatModal({ onClose, defaultPostId, defaultRecipientId, defaultPostTitle, defaultPostImage, defaultRecipientName, currentUser }) {
    const currentUserId = currentUser ? String(currentUser.userId || currentUser.id) : "";
    const currentUserName = currentUser ? (currentUser.full_name || currentUser.name || "Người dùng") : "Người dùng";

    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" or "chat" (for mobile responsive)
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
            // Sort in-memory to prevent Firestore composite index errors
            rooms.sort((a, b) => {
                const timeA = a.lastMessageAt?.seconds || a.lastMessageAt?.toMillis?.() || 0;
                const timeB = b.lastMessageAt?.seconds || b.lastMessageAt?.toMillis?.() || 0;
                return timeB - timeA;
            });
            setChatRooms(rooms);
        }, (err) => {
            console.error("Lỗi khi tải phòng chat:", err);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    // 2. Initialize default chat room if provided
    useEffect(() => {
        if (!currentUserId || !defaultPostId || !defaultRecipientId) return;

        async function setupDefaultRoom() {
            const uid1 = String(currentUserId);
            const uid2 = String(defaultRecipientId);
            if (uid1 === uid2) return; // Cannot chat with yourself

            // roomId formula: postId_minId_maxId
            const sortedIds = [uid1, uid2].sort();
            const roomId = `${defaultPostId}_${sortedIds[0]}_${sortedIds[1]}`;

            const roomRef = doc(db, "chats", roomId);
            await setDoc(roomRef, {
                id: roomId,
                postId: Number(defaultPostId),
                postTitle: defaultPostTitle || "Bài viết",
                postImageUrl: defaultPostImage || "",
                user1Id: uid1,
                user1Name: currentUserName,
                user2Id: uid2,
                user2Name: defaultRecipientName || "Người đăng tin",
                users: [uid1, uid2]
            }, { merge: true });

            setSelectedRoomId(roomId);
            setViewMode("chat");
        }

        setupDefaultRoom();
    }, [currentUserId, defaultPostId, defaultRecipientId]);

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

    // 4. Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoomId || !currentRoom) return;

        const textToSend = newMessage.trim();
        setNewMessage("");

        const recipientId = currentRoom.user1Id === currentUserId ? currentRoom.user2Id : currentRoom.user1Id;

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
        }
    };

    // Find details of currently selected room
    const currentRoom = chatRooms.find(r => r.id === selectedRoomId);
    
    // Determine recipient name
    const getRecipientName = (room) => {
        if (!room) return "Người dùng";
        return room.user1Id === currentUserId ? room.user2Name : room.user1Name;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="bg-surface-container-lowest rounded-2xl w-full max-w-4xl h-[80vh] shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-5 py-4 bg-surface-container border-b border-outline-variant/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2 text-primary">
                        <MessageSquare size={22} />
                        <h2 className="text-[17px] font-bold">Hộp thư tin nhắn</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer text-on-surface"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex flex-1 overflow-hidden relative">
                    
                    {/* Left: Chat Rooms List */}
                    <div className={`w-full md:w-1/3 border-r border-outline-variant/20 flex flex-col bg-surface-container-lowest overflow-y-auto ${
                        viewMode === "chat" ? "hidden md:flex" : "flex"
                    }`}>
                        {chatRooms.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-outline">
                                <span className="material-symbols-outlined text-[40px] mb-2">inbox</span>
                                <p className="text-sm font-medium text-center">Chưa có cuộc trò chuyện nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-outline-variant/10">
                                {chatRooms.map((room) => {
                                    const isActive = room.id === selectedRoomId;
                                    const recipientName = getRecipientName(room);
                                    const avatarLetter = recipientName.charAt(0).toUpperCase();
                                    const isUnread = (room[`unread_${currentUserId}`] || 0) > 0;

                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => {
                                                setSelectedRoomId(room.id);
                                                setViewMode("chat");
                                            }}
                                            className={`p-4 flex gap-3 hover:bg-surface-container-low/50 cursor-pointer transition-colors text-left items-center ${
                                                isActive ? "bg-primary/5 border-l-4 border-primary" : ""
                                            }`}
                                        >
                                            {/* Avatar placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {avatarLetter}
                                            </div>
                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className={`text-sm truncate text-on-surface ${isUnread ? "font-black" : "font-bold"}`}>{recipientName}</h4>
                                                </div>
                                                <p className="text-[11.5px] text-primary font-medium truncate mb-1">
                                                    Bài đăng: {room.postTitle}
                                                </p>
                                                {room.lastMessage && (
                                                    <p className={`text-[12px] truncate ${isUnread ? "text-on-surface font-bold" : "text-on-surface-variant font-medium"}`}>
                                                        {room.lastSenderId === currentUserId ? "Bạn: " : ""}{room.lastMessage}
                                                    </p>
                                                )}
                                            </div>
                                            {isUnread && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right: Active Chat View */}
                    <div className={`w-full md:w-2/3 flex flex-col bg-surface-container-low/20 ${
                        viewMode === "list" ? "hidden md:flex" : "flex"
                    }`}>
                        {selectedRoomId && currentRoom ? (
                            <>
                                {/* Conversation Header */}
                                <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-3 shrink-0 text-left">
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className="md:hidden p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                        {getRecipientName(currentRoom).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm text-on-surface truncate">
                                            {getRecipientName(currentRoom)}
                                        </h3>
                                        <p className="text-[11px] text-on-surface-variant truncate">
                                            Liên quan: {currentRoom.postTitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages Bubble Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                                    {messages.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-outline">
                                            <span className="material-symbols-outlined text-[36px] mb-1.5">forum</span>
                                            <p className="text-xs">Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isOwn = msg.senderId === currentUserId;
                                            
                                            if (msg.type === "post_share" && msg.postMetadata) {
                                                const meta = msg.postMetadata;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        onClick={() => {
                                                            window.location.href = `/posts/${meta.postId}`;
                                                        }}
                                                        className={`max-w-[75%] p-3 rounded-2xl border text-left cursor-pointer hover:shadow-md transition-all flex gap-3 items-center shrink-0 ${
                                                            isOwn
                                                                ? "bg-blue-50 text-slate-800 border-blue-200 self-end rounded-tr-none"
                                                                : "bg-white text-slate-800 border-slate-200 self-start rounded-tl-none"
                                                        }`}
                                                        title="Click để xem chi tiết bài đăng"
                                                    >
                                                        <img
                                                            src={meta.imageUrl || "/placeholder-image.png"}
                                                            alt={meta.title}
                                                            className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-green-100 text-green-700 uppercase tracking-wide mb-0.5">
                                                                {meta.type || "FOUND"}
                                                            </span>
                                                            <h5 className="font-bold text-[12.5px] text-slate-800 truncate">{meta.title}</h5>
                                                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5">
                                                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                                {meta.address || "Không rõ địa điểm"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed break-words text-left ${
                                                        isOwn
                                                            ? "bg-primary text-on-primary self-end rounded-tr-none"
                                                            : "bg-surface-container-high text-on-surface self-start rounded-tl-none border border-outline-variant/10"
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Send Input Form */}
                                <form onSubmit={handleSendMessage} className="p-3 bg-surface-container border-t border-outline-variant/20 flex gap-2 shrink-0">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2.5 rounded-full border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="w-10 h-10 rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-outline p-6">
                                <span className="material-symbols-outlined text-[64px] mb-3">chat_bubble_outline</span>
                                <h3 className="text-[17px] font-bold text-on-surface mb-1">Hộp thoại tin nhắn</h3>
                                <p className="text-xs text-on-surface-variant max-w-[280px] text-center">
                                    Chọn một cuộc hội thoại từ danh sách bên trái hoặc nhắn tin từ bài đăng đã xác minh.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { X, Minus, Plus, Send, MessageSquare } from "lucide-react";
import { useChatStore } from "../../stores/chatStore.js";

export default function DockedChatBox({ chat, currentUser }) {
    const { roomId, postTitle, recipientId, recipientName, isMinimized } = chat;
    const currentUserId = currentUser ? String(currentUser.userId || currentUser.id) : "";
    const currentUserName = currentUser ? (currentUser.full_name || currentUser.name || "Người dùng") : "Người dùng";

    const { closeChat, toggleMinimize } = useChatStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [pendingPost, setPendingPost] = useState(chat.pendingPostShare || null);
    const messagesEndRef = useRef(null);

    // Sync pendingPostShare from props (e.g. when reopening chat with different post preview)
    useEffect(() => {
        if (chat.pendingPostShare) {
            setPendingPost(chat.pendingPostShare);
        }
    }, [chat.pendingPostShare, chat.shareTrigger]);

    // Load messages from Firestore
    useEffect(() => {
        if (!roomId) return;

        const q = query(collection(db, "chats", roomId, "messages"));

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
            console.error("Lỗi khi tải tin nhắn cho docked chat:", err);
        });

        return () => unsubscribe();
    }, [roomId]);

    // Clear unread count for current user when chat box is active or new message arrives
    useEffect(() => {
        if (!roomId || !currentUserId || isMinimized) return;

        const roomRef = doc(db, "chats", roomId);
        setDoc(roomRef, {
            [`unread_${currentUserId}`]: 0
        }, { merge: true }).catch(err => {
            console.error("Lỗi khi xóa unread ở docked chat:", err);
        });
    }, [roomId, currentUserId, isMinimized, messages.length]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !roomId) return;

        const textToSend = newMessage.trim();
        setNewMessage("");

        try {
            // Add message
            await addDoc(collection(db, "chats", roomId, "messages"), {
                senderId: currentUserId,
                senderName: currentUserName,
                text: textToSend,
                createdAt: serverTimestamp()
            });

            // Update room lastMessage metadata and increment recipient's unread count
            const { increment } = await import("firebase/firestore");
            await setDoc(doc(db, "chats", roomId), {
                lastMessage: textToSend,
                lastMessageAt: serverTimestamp(),
                lastSenderId: currentUserId,
                [`unread_${recipientId}`]: increment(1)
            }, { merge: true });
        } catch (err) {
            console.error("Lỗi khi gửi tin nhắn:", err);
        }
    };

    const handleSendPostShare = async () => {
        if (!pendingPost || !roomId) return;
        
        try {
            await addDoc(collection(db, "chats", roomId, "messages"), {
                senderId: currentUserId,
                senderName: currentUserName,
                text: `[Đã chia sẻ bài viết] ${pendingPost.title}`,
                type: "post_share",
                postMetadata: {
                    postId: Number(pendingPost.postId),
                    title: pendingPost.title,
                    type: pendingPost.type || "FOUND",
                    imageUrl: pendingPost.imageUrl || "",
                    address: pendingPost.address || ""
                },
                createdAt: serverTimestamp()
            });

            const { increment } = await import("firebase/firestore");
            await setDoc(doc(db, "chats", roomId), {
                lastMessage: `[Đã chia sẻ bài viết] ${pendingPost.title}`,
                lastMessageAt: serverTimestamp(),
                lastSenderId: currentUserId,
                [`unread_${recipientId}`]: increment(1)
            }, { merge: true });

            setPendingPost(null);
        } catch (err) {
            console.error("Lỗi khi gửi chia sẻ bài viết:", err);
        }
    };

    return (
        <div className={`w-72 md:w-80 bg-white shadow-2xl rounded-t-2xl border border-slate-300 flex flex-col overflow-hidden transition-all duration-200 z-[999] ${
            isMinimized ? "h-12" : "h-[390px]"
        }`}>
            {/* Header */}
            <div 
                onClick={() => toggleMinimize(roomId)}
                className="px-3.5 py-3 bg-primary text-on-primary flex justify-between items-center cursor-pointer shrink-0"
            >
                <div className="flex items-center gap-2 min-w-0 text-left">
                    <MessageSquare size={16} className="shrink-0" />
                    <div className="min-w-0">
                        <h4 className="font-bold text-[13px] truncate">{recipientName}</h4>
                        {!isMinimized && (
                            <p className="text-[10px] opacity-80 truncate">Đang xem: {postTitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => toggleMinimize(roomId)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                        title={isMinimized ? "Phóng to" : "Thu nhỏ"}
                    >
                        {isMinimized ? <Plus size={14} /> : <Minus size={14} />}
                    </button>
                    <button
                        onClick={() => closeChat(roomId)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                        title="Đóng chat"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content (only when not minimized) */}
            {!isMinimized && (
                <>
                    {/* Message list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-surface-container-low/20 flex flex-col">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-outline p-4">
                                <p className="text-[11px] text-center">Gửi tin nhắn đầu tiên để bắt đầu trao đổi!</p>
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
                                            className={`max-w-[85%] p-2.5 rounded-2xl border text-left cursor-pointer hover:shadow-md transition-all flex gap-2.5 items-center shrink-0 ${
                                                isOwn
                                                    ? "bg-blue-50 text-slate-800 border-blue-250 self-end rounded-tr-none"
                                                    : "bg-white text-slate-800 border-slate-200 self-start rounded-tl-none"
                                            }`}
                                            title="Click để xem chi tiết bài đăng"
                                        >
                                            <img
                                                src={meta.imageUrl || "/placeholder-image.png"}
                                                alt={meta.title}
                                                className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold rounded bg-green-100 text-green-700 uppercase tracking-wide mb-0.5">
                                                    {meta.type || "FOUND"}
                                                </span>
                                                <h5 className="font-bold text-[11.5px] text-slate-800 truncate">{meta.title}</h5>
                                                <p className="text-[9.5px] text-slate-500 truncate flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[10px]">location_on</span>
                                                    {meta.address || "Không rõ địa điểm"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={msg.id}
                                        className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-[12px] leading-relaxed break-words text-left ${
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

                    {/* Pending Post Share Draft Preview */}
                    {pendingPost && (
                        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0 relative animate-in slide-in-from-bottom duration-150">
                            {/* Dismiss button */}
                            <button
                                type="button"
                                onClick={() => setPendingPost(null)}
                                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer"
                                title="Bỏ qua"
                            >
                                <X size={12} />
                            </button>

                            <div className="flex gap-2.5 items-center pr-5 text-left">
                                <img
                                    src={pendingPost.imageUrl || "/placeholder-image.png"}
                                    alt={pendingPost.title}
                                    className="w-10 h-10 object-cover rounded bg-slate-200 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold rounded bg-green-100 text-green-700 uppercase tracking-wide mb-0.5">
                                        {pendingPost.type || "FOUND"}
                                    </span>
                                    <h5 className="font-bold text-[11.5px] text-slate-800 truncate">{pendingPost.title}</h5>
                                    <p className="text-[9.5px] text-slate-500 truncate">{pendingPost.address}</p>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleSendPostShare}
                                className="w-full py-1.5 px-3 bg-primary text-on-primary font-bold text-[11px] rounded-lg hover:opacity-90 transition-all text-center cursor-pointer"
                            >
                                Gửi bài viết
                            </button>
                        </div>
                    )}

                    {/* Send Input Form */}
                    <form onSubmit={handleSendMessage} className="p-2 bg-surface-container border-t border-outline-variant/20 flex gap-1.5 shrink-0">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-3 py-1.5 rounded-full border border-outline-variant bg-surface text-[12px] focus:outline-none focus:border-primary outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-8 h-8 rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                        >
                            <Send size={12} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { X, Minus, Send, AlertCircle, MessageSquareText } from "lucide-react";
import { useChatStore } from "../../stores/chatStore.js";
import {
    decorateMessages,
    formatMessageTime,
    getInitials,
    getAvatarGradient,
} from "./chatUtils.js";

export default function DockedChatBox({ chat, currentUser }) {
    const { roomId, postTitle, recipientId, recipientName, isMinimized } = chat;
    const currentUserId = currentUser ? String(currentUser.userId || currentUser.id) : "";
    const currentUserName = currentUser ? (currentUser.full_name || currentUser.name || "Người dùng") : "Người dùng";

    const { closeChat, toggleMinimize } = useChatStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [pendingPost, setPendingPost] = useState(chat.pendingPostShare || null);
    const [chatError, setChatError] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const avatarLabel = getInitials(recipientName);
    const avatarStyle = { backgroundImage: getAvatarGradient(recipientName) };

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
            setChatError("");

            // Auto scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }, (err) => {
            console.error("Lỗi khi tải tin nhắn cho docked chat:", err);
            setChatError(
                err.code === "permission-denied"
                    ? "Không có quyền truy cập Firestore. Kiểm tra lại Security Rules của collection \"chats\"."
                    : `Không kết nối được Firestore (${err.code || "unknown"}).`
            );
        });

        return () => unsubscribe();
    }, [roomId]);

    // Focus input when the box is expanded
    useEffect(() => {
        if (!isMinimized) {
            inputRef.current?.focus();
        }
    }, [isMinimized]);

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
        if (!newMessage.trim() || !roomId || sending) return;

        const textToSend = newMessage.trim();
        setNewMessage("");
        setSending(true);

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
            setChatError("Gửi tin nhắn thất bại. Vui lòng thử lại.");
            setNewMessage(textToSend);
        } finally {
            setSending(false);
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
            setChatError("Không gửi được bài viết. Vui lòng thử lại.");
        }
    };

    const decorated = decorateMessages(messages);

    return (
        <div
            className={`w-[340px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-t-2xl border border-outline-variant/50 border-b-0 flex flex-col overflow-hidden transition-[height] duration-300 ease-out ${
                isMinimized ? "h-14" : "h-[470px]"
            }`}
            style={{ boxShadow: "0 -4px 32px rgba(0, 32, 74, 0.16), 0 2px 8px rgba(0, 32, 74, 0.08)" }}
        >
            {/* ---------- Header ---------- */}
            <div
                onClick={() => toggleMinimize(roomId)}
                className="px-3 h-14 flex justify-between items-center cursor-pointer shrink-0 text-on-primary select-none"
                style={{ backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }}
            >
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                    {/* Avatar with presence ring */}
                    <div className="relative shrink-0">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-white/30"
                            style={avatarStyle}
                        >
                            {avatarLabel}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d63cc]" />
                    </div>

                    <div className="min-w-0">
                        <h4 className="font-bold text-[13.5px] truncate leading-tight tracking-[-0.01em]">
                            {recipientName}
                        </h4>
                        {!isMinimized && postTitle && (
                            <p className="text-[10.5px] text-white/75 truncate leading-tight mt-0.5">
                                {postTitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => toggleMinimize(roomId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 active:bg-white/30 transition-colors text-white cursor-pointer"
                        title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                    >
                        {isMinimized
                            ? <MessageSquareText size={15} />
                            : <Minus size={16} />}
                    </button>
                    <button
                        onClick={() => closeChat(roomId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 active:bg-white/30 transition-colors text-white cursor-pointer"
                        title="Đóng"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ---------- Body (chỉ khi mở rộng) ---------- */}
            {!isMinimized && (
                <>
                    {chatError && (
                        <div className="px-3 py-2 bg-error-container text-on-error-container text-[10.5px] leading-snug text-left border-b border-error/20 shrink-0 flex items-start gap-1.5">
                            <AlertCircle size={13} className="shrink-0 mt-px" />
                            <span>{chatError}</span>
                        </div>
                    )}

                    {/* Message list */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col bg-surface-container-low/40">
                        {decorated.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-6">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                                    style={avatarStyle}
                                >
                                    <span className="text-[17px] font-bold">{avatarLabel}</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-[12.5px] font-bold text-on-surface">{recipientName}</p>
                                    <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                                        Hãy gửi lời chào để bắt đầu trao đổi về món đồ này.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            decorated.map((msg) => {
                                const isOwn = msg.senderId === currentUserId;

                                return (
                                    <div key={msg.id} className="w-full flex flex-col">
                                        {/* Day separator */}
                                        {msg.showDayLabel && msg.dayLabel && (
                                            <div className="flex items-center gap-2 my-3 px-1">
                                                <span className="h-px flex-1 bg-outline-variant/50" />
                                                <span className="text-[9.5px] font-semibold text-on-surface-variant uppercase tracking-wider">
                                                    {msg.dayLabel}
                                                </span>
                                                <span className="h-px flex-1 bg-outline-variant/50" />
                                            </div>
                                        )}

                                        <div
                                            className={`flex items-end gap-1.5 ${msg.isLastOfGroup ? "mb-2" : "mb-0.5"} ${
                                                isOwn ? "flex-row-reverse" : "flex-row"
                                            }`}
                                        >
                                            {/* Avatar gutter — chỉ hiện ở bong bóng cuối cụm của đối phương */}
                                            {!isOwn && (
                                                <div className="w-6 shrink-0">
                                                    {msg.isLastOfGroup && (
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                                            style={avatarStyle}
                                                        >
                                                            {avatarLabel}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {msg.type === "post_share" && msg.postMetadata ? (
                                                <PostShareCard meta={msg.postMetadata} isOwn={isOwn} />
                                            ) : (
                                                <div
                                                    title={formatMessageTime(msg.createdAt)}
                                                    className={`group max-w-[78%] px-3 py-[7px] text-[12.5px] leading-[1.45] break-words text-left shadow-sm ${
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

                                        {/* Timestamp — chỉ dưới bong bóng cuối cụm */}
                                        {msg.isLastOfGroup && formatMessageTime(msg.createdAt) && (
                                            <span
                                                className={`text-[9.5px] text-on-surface-variant/70 -mt-1.5 mb-2 px-1 ${
                                                    isOwn ? "self-end" : "self-start ml-[30px]"
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

                    {/* ---------- Bản nháp chia sẻ bài viết ---------- */}
                    {pendingPost && (
                        <div className="mx-2.5 mb-1.5 rounded-xl bg-surface-container-low border border-outline-variant/50 shrink-0 relative overflow-hidden">
                            <div className="px-2.5 pt-2 pb-1 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                                    Đính kèm bài viết
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPendingPost(null)}
                                    className="w-5 h-5 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                                    title="Bỏ đính kèm"
                                >
                                    <X size={11} />
                                </button>
                            </div>

                            <div className="px-2.5 pb-2 flex gap-2.5 items-center text-left">
                                <PostThumb src={pendingPost.imageUrl} alt={pendingPost.title} size="w-11 h-11" />
                                <div className="min-w-0 flex-1">
                                    <TypeBadge type={pendingPost.type} />
                                    <h5 className="font-bold text-[11.5px] text-on-surface truncate leading-tight mt-0.5">
                                        {pendingPost.title}
                                    </h5>
                                    <p className="text-[9.5px] text-on-surface-variant truncate">{pendingPost.address}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSendPostShare}
                                    className="shrink-0 px-3 py-1.5 text-on-primary font-bold text-[10.5px] rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
                                    style={{ backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }}
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- Ô soạn tin ---------- */}
                    <form
                        onSubmit={handleSendMessage}
                        className="px-2.5 py-2.5 bg-surface-container-lowest border-t border-outline-variant/40 flex gap-2 items-center shrink-0"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 min-w-0 px-3.5 py-2 rounded-full bg-surface-container-low border border-transparent text-[12.5px] text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:outline-none focus:bg-surface-container-lowest focus:border-primary/60 focus:ring-[3px] focus:ring-primary/10"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="w-9 h-9 rounded-full text-on-primary disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:brightness-110 enabled:active:scale-90 transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
                            style={{ backgroundImage: "linear-gradient(135deg, #005bbf, #1a73e8)" }}
                            title="Gửi tin nhắn"
                        >
                            <Send size={14} className="translate-x-px" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

/* ============ Thành phần phụ ============ */

function TypeBadge({ type }) {
    const isLost = type === "LOST";
    return (
        <span
            className={`inline-block px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wide ${
                isLost
                    ? "bg-error-container text-on-error-container"
                    : "bg-emerald-100 text-emerald-700"
            }`}
        >
            {isLost ? "Mất đồ" : "Nhặt được"}
        </span>
    );
}

function PostThumb({ src, alt, size = "w-12 h-12" }) {
    if (!src) {
        return (
            <div className={`${size} rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-outline`}>
                <span className="material-symbols-outlined text-[18px]">image</span>
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            className={`${size} object-cover rounded-lg bg-surface-container-high shrink-0`}
        />
    );
}

function PostShareCard({ meta, isOwn }) {
    return (
        <div
            onClick={() => { window.location.href = `/posts/${meta.postId}`; }}
            title="Xem chi tiết bài đăng"
            className={`max-w-[82%] w-[210px] rounded-2xl overflow-hidden border text-left cursor-pointer transition-all hover:-translate-y-0.5 shrink-0 bg-surface-container-lowest shadow-sm hover:shadow-md ${
                isOwn
                    ? "border-primary/35 rounded-br-md"
                    : "border-outline-variant/50 rounded-bl-md"
            }`}
        >
            <div className="flex gap-2.5 items-center p-2.5">
                <PostThumb src={meta.imageUrl} alt={meta.title} />
                <div className="min-w-0 flex-1">
                    <TypeBadge type={meta.type} />
                    <h5 className="font-bold text-[11.5px] text-on-surface truncate leading-tight mt-0.5">
                        {meta.title}
                    </h5>
                    <p className="text-[9.5px] text-on-surface-variant truncate flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">location_on</span>
                        {meta.address || "Không rõ địa điểm"}
                    </p>
                </div>
            </div>
            <div className="px-2.5 py-1.5 bg-primary/5 border-t border-outline-variant/30 text-[9.5px] font-bold text-primary text-center">
                Xem chi tiết bài đăng
            </div>
        </div>
    );
}

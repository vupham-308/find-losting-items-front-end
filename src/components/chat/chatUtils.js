// Tiện ích dùng chung cho các thành phần chat (DockedChatBox, ChatModal).

// Chuyển Firestore Timestamp / Date / số / chuỗi về mili-giây. Trả 0 nếu không xác định.
export function toMillis(ts) {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") return ts.seconds * 1000;
    if (ts instanceof Date) return ts.getTime();
    if (typeof ts === "number") return ts;
    if (typeof ts === "string") return new Date(ts).getTime() || 0;
    return 0;
}

// Lấy mốc thời gian mới nhất của phòng chat (gồm lastMessageAt, updatedAt, createdAt) để sắp xếp.
export function getRoomTime(room) {
    if (!room) return 0;
    return toMillis(room.lastMessageAt) || toMillis(room.updatedAt) || toMillis(room.createdAt) || 0;
}

// Giờ hiển thị cạnh bong bóng tin nhắn, vd "14:05".
export function formatMessageTime(ts) {
    const ms = toMillis(ts);
    if (!ms) return "";
    return new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

// Nhãn ngăn cách theo ngày ở giữa luồng tin nhắn.
export function formatDayLabel(ts) {
    const ms = toMillis(ts);
    if (!ms) return "";

    const date = new Date(ms);
    const today = new Date();
    const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayDiff = Math.round((startOf(today) - startOf(date)) / 86400000);

    if (dayDiff === 0) return "Hôm nay";
    if (dayDiff === 1) return "Hôm qua";
    if (dayDiff < 7) return date.toLocaleDateString("vi-VN", { weekday: "long" });
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Thời gian tương đối cho danh sách hội thoại, vd "5 phút", "3 ngày".
export function formatRelativeTime(ts) {
    const ms = toMillis(ts);
    if (!ms) return "";

    const diff = Date.now() - ms;
    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày`;
    return new Date(ms).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// Chữ cái đại diện trong avatar.
export function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    // Tiếng Việt xếp họ trước tên ⇒ lấy chữ cái của tên riêng đứng cuối.
    return (parts[parts.length - 1].charAt(0) + parts[0].charAt(0)).toUpperCase();
}

// Bảng màu avatar — chọn ổn định theo tên để mỗi người luôn có một màu cố định.
const AVATAR_GRADIENTS = [
    "linear-gradient(135deg, #005bbf, #1a73e8)",
    "linear-gradient(135deg, #7b1fa2, #ab47bc)",
    "linear-gradient(135deg, #00695c, #26a69a)",
    "linear-gradient(135deg, #c55500, #ff8f3f)",
    "linear-gradient(135deg, #0d7c3e, #43a047)",
    "linear-gradient(135deg, #4527a0, #7e57c2)",
    "linear-gradient(135deg, #ad1457, #ec407a)",
];

export function getAvatarGradient(name) {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

// Gom tin nhắn liên tiếp của cùng một người (cách nhau < 5 phút) thành một cụm,
// để chỉ bong bóng cuối cụm có "đuôi" và hiển thị avatar — giống Messenger/iMessage.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function decorateMessages(messages) {
    return messages.map((msg, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const ms = toMillis(msg.createdAt);

        const sameAsPrev =
            prev &&
            prev.senderId === msg.senderId &&
            ms - toMillis(prev.createdAt) < GROUP_WINDOW_MS;
        const sameAsNext =
            next &&
            next.senderId === msg.senderId &&
            toMillis(next.createdAt) - ms < GROUP_WINDOW_MS;

        // Chèn nhãn ngày khi sang ngày mới (hoặc ở tin nhắn đầu tiên).
        const prevMs = toMillis(prev?.createdAt);
        const showDayLabel =
            !prev ||
            (ms > 0 && prevMs > 0 && new Date(ms).toDateString() !== new Date(prevMs).toDateString());

        return {
            ...msg,
            isFirstOfGroup: !sameAsPrev,
            isLastOfGroup: !sameAsNext,
            showDayLabel,
            dayLabel: showDayLabel ? formatDayLabel(msg.createdAt) : "",
        };
    });
}

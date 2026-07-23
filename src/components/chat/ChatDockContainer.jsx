import React from "react";
import { useChatStore } from "../../stores/chatStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import DockedChatBox from "./DockedChatBox.jsx";

class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Lỗi giao diện khung chat:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-3 bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30 text-[11px] rounded-xl border shadow-lg max-w-xs pointer-events-auto">
                    ⚠️ Lỗi hiển thị chat: {this.state.error?.message || "Lỗi không xác định"}
                </div>
            );
        }
        return this.props.children;
    }
}

export default function ChatDockContainer() {
    const { activeChats } = useChatStore();
    const { user } = useAuth();

    if (!user || activeChats.length === 0) return null;

    return (
        <div className="fixed bottom-0 right-2 md:right-6 z-[999] flex flex-row-reverse items-end gap-2.5 pointer-events-none max-w-[calc(100vw-1rem)]">
            {activeChats.map((chat) => (
                <div
                    key={chat.roomId}
                    className="pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300"
                >
                    <ChatErrorBoundary>
                        <DockedChatBox chat={chat} currentUser={user} />
                    </ChatErrorBoundary>
                </div>
            ))}
        </div>
    );
}

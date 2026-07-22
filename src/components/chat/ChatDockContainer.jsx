import { useChatStore } from "../../stores/chatStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import DockedChatBox from "./DockedChatBox.jsx";

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

                    <DockedChatBox chat={chat} currentUser={user} />
                </div>
            ))}
        </div>
    );
}

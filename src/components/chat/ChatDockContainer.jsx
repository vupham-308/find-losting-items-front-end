import { useChatStore } from "../../stores/chatStore.js";
import { useAuth } from "../../hooks/useAuth.js";
import DockedChatBox from "./DockedChatBox.jsx";

export default function ChatDockContainer() {
    const { activeChats } = useChatStore();
    const { user } = useAuth();

    if (!user || activeChats.length === 0) return null;

    return (
        <div className="fixed bottom-0 right-4 md:right-8 z-[999] flex flex-row-reverse items-end gap-3 pointer-events-none">
            {activeChats.map((chat) => (
                <div key={chat.roomId} className="pointer-events-auto">
                    <DockedChatBox chat={chat} currentUser={user} />
                </div>
            ))}
        </div>
    );
}

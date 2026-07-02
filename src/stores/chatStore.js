import { create } from "zustand";

export const useChatStore = create((set) => ({
    // List of active docked chat boxes: { roomId, postId, postTitle, postImageUrl, recipientId, recipientName, isMinimized }
    activeChats: [],

    openChat: (chat) => set((state) => {
        const exists = state.activeChats.find((c) => c.roomId === chat.roomId);
        if (exists) {
            // Maximize it if it exists and update pendingPostShare and shareTrigger
            return {
                activeChats: state.activeChats.map((c) =>
                    c.roomId === chat.roomId ? { 
                        ...c, 
                        isMinimized: false, 
                        pendingPostShare: chat.pendingPostShare,
                        shareTrigger: chat.shareTrigger
                    } : c
                )
            };
        }
        // Limit to max 3 active chat boxes at a time
        const newChats = [...state.activeChats, { ...chat, isMinimized: false }];
        if (newChats.length > 3) {
            newChats.shift(); // Remove the oldest one
        }
        return { activeChats: newChats };
    }),

    closeChat: (roomId) => set((state) => ({
        activeChats: state.activeChats.filter((c) => c.roomId !== roomId)
    })),

    toggleMinimize: (roomId) => set((state) => ({
        activeChats: state.activeChats.map((c) =>
            c.roomId === roomId ? { ...c, isMinimized: !c.isMinimized } : c
        )
    }))
}));

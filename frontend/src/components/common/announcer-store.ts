import { create } from "zustand";

type Announcement = {
    id: string;
    message: string;
    timestamp: number;
};

type AnnouncerStore = {
    announcements: Announcement[];
    announce: (message: string) => void;
    dismiss: (id: string) => void;
};

let nextId = 0;

export const useAnnouncerStore = create<AnnouncerStore>((set) => ({
    announcements: [],

    announce: (message) => {
        if (!message.trim()) return;
        const id = String(++nextId);
        set((state) => ({
            announcements: [
                ...state.announcements,
                { id, message, timestamp: Date.now() },
            ],
        }));
        setTimeout(() => {
            set((state) => ({
                announcements: state.announcements.filter((a) => a.id !== id),
            }));
        }, 1200);
    },

    dismiss: (id) =>
        set((state) => ({
            announcements: state.announcements.filter((a) => a.id !== id),
        })),
}));

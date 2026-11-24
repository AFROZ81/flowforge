import { create } from "zustand";

/**
 * Command palette state.
 *
 * A single global store keeps the open/close flag and the search query in one
 * place so the palette component and the global keyboard shortcut can agree on
 * whether the overlay is showing, without prop-drilling through AppLayout.
 */

type CommandPaletteState = {
    isOpen: boolean;
    query: string;
    open: () => void;
    close: () => void;
    toggle: () => void;
    setQuery: (query: string) => void;
};

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
    isOpen: false,
    query: "",

    open: () => set({ isOpen: true, query: "" }),

    close: () => set({ isOpen: false, query: "" }),

    toggle: () =>
        set((state) => ({ isOpen: !state.isOpen, query: "" })),

    setQuery: (query) => set({ query }),
}));

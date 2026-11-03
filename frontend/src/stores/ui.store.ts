import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * The key AppLayout used while it still owned this preference itself. Reading
 * it once on start means an upgrade does not snap every rail back open.
 */
const LEGACY_SIDEBAR_KEY = "flowforge.sidebar.collapsed";

type UiState = {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
};

/**
 * Interface choices that have no server-side store yet.
 *
 * These belong here rather than inside the component that happens to render
 * them, because Settings has to read and write the same values — a control that
 * only appears to work in one place is worse than no control at all.
 */
export const useUiStore = create<UiState>()(
    persist(
        (set, get) => ({
            sidebarCollapsed: readLegacySidebarPreference(),

            setSidebarCollapsed: (sidebarCollapsed) => {
                set({ sidebarCollapsed });
            },

            toggleSidebar: () => {
                set({ sidebarCollapsed: !get().sidebarCollapsed });
            },
        }),
        {
            name: "flowforge-ui",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
            }),
        }
    )
);

function readLegacySidebarPreference(): boolean {
    try {
        const legacy = localStorage.getItem(LEGACY_SIDEBAR_KEY);

        if (legacy === null) {
            return false;
        }

        localStorage.removeItem(LEGACY_SIDEBAR_KEY);

        return legacy === "true";
    } catch {
        /* Private mode or storage disabled — the default rail is fine. */
        return false;
    }
}

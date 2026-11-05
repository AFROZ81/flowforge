import { useState, type ReactNode } from "react";
import { useLocation } from "react-router";

import Sidebar from "@/components/layout/Sidebar";
import SidebarToggle from "@/components/layout/SidebarToggle";
import TopBar from "@/components/layout/Topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui.store";

type Props = {
    children: ReactNode;
};

/**
 * The single application shell.
 *
 * Desktop (lg+): persistent left rail + top bar + one scroll container.
 * Tablet/mobile: the rail becomes a slide-out drawer and the page keeps
 * the full viewport width. Previously the rail was always mounted, which
 * meant it consumed a third of a phone screen and three pages bypassed
 * this layout entirely.
 */
export default function AppLayout({ children }: Props) {
    const location = useLocation();

    /*
     * Rail width is shared state rather than local state because Settings offers
     * the same control; two owners of one preference is how a setting ends up
     * looking applied while nothing actually changes.
     */
    const collapsed = useUiStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUiStore((state) => state.toggleSidebar);

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    /*
     * Navigating away must never leave the drawer hanging open.
     * Adjusting during render (rather than in an effect) means the closed
     * state commits in the same pass as the new route — no flash of the
     * old page behind an animating panel.
     */
    const [lastPathname, setLastPathname] = useState(location.pathname);

    if (lastPathname !== location.pathname) {
        setLastPathname(location.pathname);
        setMobileNavOpen(false);
    }

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-background">

            {/* =====================================================
                SKIP LINK

                Keyboard users tab the whole rail to reach the page;
                this gives them a way past it.
            ===================================================== */}

            <a
                href="#main-content"
                className="
                    sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]
                    focus:h-9 focus:rounded-lg focus:bg-primary focus:px-3.5 focus:text-sm
                    focus:font-medium focus:text-primary-foreground focus:shadow-md
                "
            >
                Skip to main content
            </a>

            {/* =====================================================
                DESKTOP RAIL
            ===================================================== */}

            <div
                id="app-sidebar"
                className="
                    relative hidden h-full shrink-0 lg:block
                    transition-[width] duration-(--transition-normal)
                    ease-(--ease-standard)
                "
                style={{
                    width: collapsed
                        ? "var(--sidebar-width-collapsed)"
                        : "var(--sidebar-width-expanded)",
                }}
            >
                <Sidebar collapsed={collapsed} />

                {/*
                 * Mounted inside the rail so it rides the width transition:
                 * anchored to the edge that is actually moving, rather than
                 * being re-measured against a fixed offset.
                 */}
                <SidebarToggle
                    collapsed={collapsed}
                    onToggle={toggleSidebar}
                    controls="app-sidebar"
                />
            </div>


            {/* =====================================================
                MOBILE / TABLET DRAWER
            ===================================================== */}

            <Sheet
                open={mobileNavOpen}
                onOpenChange={setMobileNavOpen}
            >
                <SheetContent
                    side="left"
                    showCloseButton={false}
                    className="w-[min(18rem,84vw)] p-0"
                >
                    <SheetTitle className="sr-only">
                        Site navigation
                    </SheetTitle>

                    <Sidebar
                        variant="drawer"
                        collapsed={false}
                        onNavigate={() => setMobileNavOpen(false)}
                    />
                </SheetContent>
            </Sheet>


            {/* =====================================================
                MAIN APPLICATION AREA
            ===================================================== */}

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* Top bar stays pinned while page content scrolls */}
                <TopBar onMenuClick={() => setMobileNavOpen(true)} />


                {/*
                 * The only scroll container. `overflow-x-hidden` is the
                 * backstop that guarantees a wide table or board can never
                 * push the whole page sideways.
                 *
                 * `relative` is load-bearing, not decoration. An absolutely
                 * positioned descendant resolves its containing block against
                 * the nearest *positioned* ancestor, and with none in this
                 * subtree that ancestor is the initial containing block - which
                 * puts it outside this scroller's clip and into the document's
                 * own coordinates. A 1px `sr-only` live region in a card did
                 * exactly that and stretched the document by 874px, so the page
                 * scrolled well past the app into bare background. Making the
                 * scroll container positioned gives every absolute descendant
                 * somewhere to belong, and the overflow here can clip it.
                 */}
                <main
                    id="main-content"
                    className="
                        relative min-h-0 min-w-0 flex-1
                        overflow-x-hidden overflow-y-auto
                        px-4 py-5 sm:px-6 lg:px-8 lg:py-6
                    "
                >
                    {children}
                </main>

            </div>

        </div>
    );
}

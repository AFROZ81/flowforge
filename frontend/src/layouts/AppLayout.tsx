import {
    useState,
    type ReactNode,
} from "react";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/Topbar";


type Props = {
    children: ReactNode;
};


export default function AppLayout({
    children,
}: Props) {

    const [
        sidebarCollapsed,
        setSidebarCollapsed,
    ] = useState(false);


    const handleSidebarToggle = () => {
        setSidebarCollapsed(
            (current) => !current
        );
    };


    return (
        <div className="
            flex
            h-screen
            w-full
            overflow-hidden
            bg-slate-50
        ">

            {/* =====================================================
                SIDEBAR

                Sidebar stays fixed inside the application viewport.
                The page itself does NOT scroll.
            ===================================================== */}

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
            />


            {/* =====================================================
                MAIN APPLICATION AREA
            ===================================================== */}

            <div className="
                flex
                min-w-0
                flex-1
                flex-col
                overflow-hidden
            ">

                {/* =================================================
                    TOP BAR

                    TopBar stays visible while page content scrolls.
                ================================================= */}

                <header className="
                    z-40
                    shrink-0
                ">

                    <TopBar />

                </header>


                {/* =================================================
                    SCROLLABLE PAGE CONTENT

                    IMPORTANT:
                    This is now the ONLY scroll container.
                ================================================= */}

                <main className="
                    min-h-0
                    min-w-0
                    flex-1
                    overflow-y-auto
                    overflow-x-hidden
                    px-6
                    py-6
                ">

                    {children}

                </main>

            </div>

        </div>
    );
}
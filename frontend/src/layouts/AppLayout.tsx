import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

type Props = {
    children: ReactNode;
};

export default function AppLayout({
    children,
}: Props) {
    return (
        <div className="flex min-h-screen bg-slate-50">

            <Sidebar />

            <div className="flex flex-1 flex-col">

                <Topbar />

                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}
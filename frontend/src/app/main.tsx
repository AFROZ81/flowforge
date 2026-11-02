import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import App from "./App";
import { Providers } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Providers>
            {/* One provider for the whole tree — the collapsed rail,
                the top bar and every icon button share its timing. */}
            <TooltipProvider>
                <App />
            </TooltipProvider>
        </Providers>
    </StrictMode>
);

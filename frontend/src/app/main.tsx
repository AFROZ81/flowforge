import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import App from "./App";
import { TooltipProvider } from "@/components/ui/tooltip";
import { registerPwa } from "@/lib/pwa";

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <TooltipProvider>
            <App />
        </TooltipProvider>
    </StrictMode>
);

/* Register the PWA service worker after the app mounts. */
registerPwa();

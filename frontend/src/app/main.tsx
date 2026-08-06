import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import App from "./App";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Providers>
            <App />
            <Toaster richColors />
        </Providers>
    </StrictMode>
    
);
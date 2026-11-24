import {
    useEffect,
    useState,
} from "react";

import {
    WifiOff,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

/**
 * A small banner shown at the top of the app when the browser is offline.
 * Dismissed automatically when the connection returns.
 */

export function OfflineIndicator() {
    const [offline, setOffline] =
        useState<boolean>(!navigator.onLine);
    const [dismissed, setDismissed] =
        useState<boolean>(false);

    useEffect(() => {
        const onOnline = () => {
            setOffline(false);
            setDismissed(false);
        };

        const onOffline = () => {
            setOffline(true);
            setDismissed(false);
        };

        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    if (!offline || dismissed) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-between gap-2 rounded-none border-b border-danger bg-danger/10 px-4 py-2 text-danger-foreground">
            <div className="flex items-center gap-2">
                <WifiOff className="size-4 shrink-0" />
                <span className="text-sm font-medium">
                    You're offline
                </span>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
            >
                Dismiss
            </Button>
        </div>
    );
}

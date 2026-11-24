import {
    useCallback,
    useState,
} from "react";

import {
    Download,
    X,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";
import {
    usePwaInstallable,
} from "@/lib/pwa";
import {
    cn,
} from "@/lib/utils";

/**
 * A small install prompt shown once per session when the PWA is installable.
 * Dismissing it hides it until the next session.
 */

export function PwaInstallPrompt() {
    const { installable, install } = usePwaInstallable();
    const [dismissed, setDismissed] =
        useState<boolean>(false);

    if (!installable || dismissed || typeof window === "undefined") {
        return null;
    }

    const isIOS =
        /iPad|iPhone|iPod/.test(
            navigator.userAgent
        );

    const handleInstall = useCallback(async () => {
        await install();
    }, [install]);

    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 z-[70] flex w-[320px] flex-col gap-3 rounded-2xl border border-border bg-card shadow-xl p-4",
                isIOS && "pt-6"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-foreground">
                        Install FlowForge
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Add FlowForge to your home screen for offline access and
                        faster launches.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                        setDismissed(true)
                    }
                >
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                </Button>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <Download className="size-4 text-muted-foreground" />
                <Button
                    type="button"
                    onClick={handleInstall}
                    disabled={isIOS}
                >
                    {isIOS
                        ? "Use Share → Add to Home Screen"
                        : "Install"}
                </Button>
            </div>
        </div>
    );
}

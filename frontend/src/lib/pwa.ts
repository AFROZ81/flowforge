import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Workbox,
} from "workbox-window";

/**
 * Registers the PWA service worker and returns true when registration started.
 * Listens for update events and dispatches them on `window`.
 */

export function registerPwa(): boolean {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return false;
    }

    if (!import.meta.env.PROD) {
        void navigator.serviceWorker.getRegistrations()
            .then((registrations) =>
                Promise.all(
                    registrations
                        .filter((registration) =>
                            [
                                registration.active,
                                registration.waiting,
                                registration.installing,
                            ].some(
                                (worker) =>
                                    worker?.scriptURL ===
                                    new URL("/sw.js", window.location.origin).href
                            )
                        )
                        .map((registration) => registration.unregister())
                )
            )
            .catch((error: Error) => {
                console.warn("PWA: failed to remove the development service worker.", error);
            });

        return false;
    }

    const wb = new Workbox("/sw.js");

    wb.addEventListener("installed", (event) => {
        if ((event as { isUpdate: boolean }).isUpdate) {
            window.dispatchEvent(
                new CustomEvent("flowforge:pwa-update-ready", {
                    detail: { workbox: wb },
                })
            );
        }
    });

    wb.addEventListener("controlling", () => {
        window.dispatchEvent(
            new CustomEvent("flowforge:pwa-now-controlling")
        );
    });

    wb.register().catch((error: Error) => {
        console.warn("PWA: service worker registration failed.", error);
    });

    return true;
}

/**
 * Whether the app can be installed (standalone PWA). Returns true when the
 * browser fires `beforeinstallprompt`.
 */

type BeforeInstallPrompt = {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function usePwaInstallable() {
    const [installable, setInstallable] =
        useState<boolean>(false);
    const [deferredEvent, setDeferredEvent] =
        useState<BeforeInstallPrompt | null>(null);

    useEffect(() => {
        const onBeforeInstallPrompt = (
            event: Event
        ) => {
            event.preventDefault();
            setInstallable(true);
            setDeferredEvent(event as unknown as BeforeInstallPrompt);
        };

        window.addEventListener(
            "beforeinstallprompt",
            onBeforeInstallPrompt
        );
        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                onBeforeInstallPrompt
            );
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredEvent) {
            return false;
        }

        deferredEvent.prompt();
        const { outcome } = await deferredEvent.userChoice;
        setDeferredEvent(null);
        setInstallable(false);
        return outcome === "accepted";
    }, [deferredEvent]);

    return { installable, install };
}

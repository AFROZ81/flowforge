import {
    Workbox,
} from "workbox-window";

const SERVICE_WORKER_URL = "/sw-v3.js";

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
                            [SERVICE_WORKER_URL, "/sw.js"].some((scriptUrl) =>
                                [
                                    registration.active,
                                    registration.waiting,
                                    registration.installing,
                                ].some(
                                    (worker) =>
                                        worker?.scriptURL ===
                                        new URL(scriptUrl, window.location.origin).href
                                )
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

    const wb = new Workbox(SERVICE_WORKER_URL);

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

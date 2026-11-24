import { useAnnouncerStore } from "./announcer-store";

/**
 * A single `aria-live="polite"` region mounted once at app root.
 *
 * Whatever text lands here is announced by screen readers, so toasts,
 * realtime presence changes and other dynamic updates are communicated
 * without relying on a visual toast alone. Calls are spaced apart by the
 * store so rapid-fire updates don't spam the screen reader.
 */

export function Announcer() {
    const announcements = useAnnouncerStore((state) => state.announcements);

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only pointer-events-none"
        >
            {announcements.map(({ id, message }) => (
                <div key={id}>{message}</div>
            ))}
        </div>
    );
}

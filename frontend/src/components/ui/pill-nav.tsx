import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

export type PillNavItem<T extends string> = {
    id: T;
    label: string;
    href: string;
};

type PillNavProps<T extends string> = {
    items: readonly PillNavItem<T>[];
    active: T;
    ariaLabel: string;
    /** Warms the destination for an entry the pointer is on. Optional. */
    onPrefetch?: (id: T) => void;
};

/**
 * A centered segmented pill for switching between views of the same page.
 *
 * Items are links rather than buttons, so a view can be deep-linked,
 * middle-clicked or copied from the address bar. The track is
 * `surface-sunken` because that sits below the card colour in every theme;
 * with a muted track the selected pill would read as pressed rather than raised
 * in the dark themes, where the card is darker than the track.
 */
export default function PillNav<T extends string>({
    items,
    active,
    ariaLabel,
    onPrefetch,
}: PillNavProps<T>) {
    const trackRef = useRef<HTMLUListElement>(null);

    /*
     * On a phone the track is wider than the screen and pans, so a deep-linked or
     * programmatically-set view can be the one entry sitting off at the far end.
     * Measured from the boxes rather than offsetLeft, which is relative to
     * whatever the nearest positioned ancestor happens to be.
     *
     * `center` is used when the selection changes. On a resize or a late font
     * load it only nudges an entry that has fallen outside the box, so a position
     * the user scrolled to themselves is never yanked away.
     */
    const revealActive = useCallback((center: boolean) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const current = track.querySelector<HTMLElement>(
            '[aria-current="page"]'
        );

        if (!current) {
            return;
        }

        const max = track.scrollWidth - track.clientWidth;

        if (max <= 0) {
            return;
        }

        const trackBox = track.getBoundingClientRect();
        const currentBox = current.getBoundingClientRect();

        const hidden =
            currentBox.left < trackBox.left - 0.5 ||
            currentBox.right > trackBox.right + 0.5;

        if (!center && !hidden) {
            return;
        }

        const drift =
            currentBox.left +
            currentBox.width / 2 -
            (trackBox.left + trackBox.width / 2);

        /*
         * Clamped, because the last entry cannot be centred: asking for its
         * midpoint and letting the browser settle short of it is what left a
         * sliver of the pill outside the track on a phone.
         */
        const next = Math.max(0, Math.min(max, track.scrollLeft + drift));

        if (Math.abs(next - track.scrollLeft) < 1) {
            return;
        }

        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        track.scrollTo({
            left: next,
            behavior: reduceMotion ? "auto" : "smooth",
        });
    }, []);

    useLayoutEffect(() => {
        revealActive(true);
    }, [active, revealActive]);

    /*
     * Two things change the track's scroll extent after the first layout: the
     * variable font settling, which widens every label, and a viewport resize
     * while this component stays mounted. Both can leave the active entry outside
     * the box after the initial centring has already run.
     */
    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        let alive = true;

        const observer = new ResizeObserver(() => revealActive(false));
        observer.observe(track);

        document.fonts?.ready
            .then(() => {
                if (alive) {
                    revealActive(false);
                }
            })
            .catch(() => {
                /* Font status is unreadable in this browser; the layout pass stands. */
            });

        return () => {
            alive = false;
            observer.disconnect();
        };
    }, [revealActive]);

    return (
        <nav aria-label={ariaLabel} className="min-w-0">
            <ul
                ref={trackRef}
                className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border bg-surface-sunken p-1"
            >
                {items.map((item) => {
                    const selected = item.id === active;

                    return (
                        <li key={item.id} className="shrink-0">
                            <Link
                                to={{ search: item.href }}
                                aria-current={selected ? "page" : undefined}
                                onPointerEnter={
                                    onPrefetch
                                        ? () => onPrefetch(item.id)
                                        : undefined
                                }
                                onFocus={
                                    onPrefetch
                                        ? () => onPrefetch(item.id)
                                        : undefined
                                }
                                className={cn(
                                    "flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium",
                                    "outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                    selected
                                        ? "bg-card text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

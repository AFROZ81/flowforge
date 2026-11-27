import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
 * A centered segmented control for switching between views of the same page.
 *
 * Items are links rather than buttons, so a view can be deep-linked,
 * middle-clicked or copied from the address bar. The track stays quieter than
 * the selected card in every theme, and the mobile scrollbar is hidden so the
 * control reads as navigation rather than a clipped form field.
 */
export default function PillNav<T extends string>({
    items,
    active,
    ariaLabel,
    onPrefetch,
}: PillNavProps<T>) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [scrollEdges, setScrollEdges] = useState({
        start: false,
        end: false,
    });

    const updateScrollEdges = useCallback(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const max = track.scrollWidth - track.clientWidth;
        const start = track.scrollLeft > 1;
        const end = max - track.scrollLeft > 1;

        setScrollEdges((current) =>
            current.start === start && current.end === end
                ? current
                : { start, end }
        );
    }, []);

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

        const observer = new ResizeObserver(() => {
            revealActive(false);
            updateScrollEdges();
        });
        observer.observe(track);
        track.addEventListener("scroll", updateScrollEdges, { passive: true });
        updateScrollEdges();

        document.fonts?.ready
            .then(() => {
                if (alive) {
                    revealActive(false);
                    updateScrollEdges();
                }
            })
            .catch(() => {
                /* Font status is unreadable in this browser; the layout pass stands. */
            });

        return () => {
            alive = false;
            observer.disconnect();
            track.removeEventListener("scroll", updateScrollEdges);
        };
    }, [revealActive, updateScrollEdges]);

    return (
        <nav aria-label={ariaLabel} className="relative w-full min-w-0">
            <ul
                ref={trackRef}
                className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-border/70 bg-surface-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                    "flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-medium sm:px-4 sm:text-sm",
                                    "outline-none transition-[color,background-color,box-shadow] focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                    selected
                                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
                                        : "text-muted-foreground hover:bg-surface-muted/70 hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {scrollEdges.start ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 left-1 z-10 w-7 rounded-l-xl bg-linear-to-r from-surface-muted/90 to-transparent"
                />
            ) : null}

            {scrollEdges.end ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 right-1 z-10 w-7 rounded-r-xl bg-linear-to-l from-surface-muted/90 to-transparent"
                />
            ) : null}
        </nav>
    );
}

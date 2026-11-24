/**
 * Shared framer-motion variants for FlowForge.
 *
 * Every variant respects `prefers-reduced-motion`: when the user has asked
 * for reduced motion, the component renders at its final state with no
 * animation. Use these instead of inline `{ opacity: 0, y: 16 }` objects so
 * every entrance, exit and flip across the app shares the same timing and
 * easing.
 */

import {
    type Transition,
} from "framer-motion";

/* The one easing used everywhere: the app's standard ease. */
export const EASE = [0.32, 0.72, 0, 1] as const;

export const DURATION = {
    fast: 0.13,
    normal: 0.2,
    slow: 0.28,
} as const;

/**
 * Base transition object shared by every variant.
 */
export function baseTransition(duration?: number): Transition {
    return {
        duration: duration ?? DURATION.normal,
        ease: EASE,
    };
}

/**
 * Fade in from opacity 0, optionally with a small translate.
 */
export function fadeIn({
    delay = 0,
    duration = DURATION.normal,
    y = 0,
    x = 0,
}: {
    delay?: number;
    duration?: number;
    y?: number;
    x?: number;
} = {}) {
    return {
        initial: { opacity: 0, y, x },
        animate: { opacity: 1, y: 0, x: 0 },
        transition: { duration, delay, ease: EASE },
    };
}

/**
 * Slide up from below (good for sheets, dialogs, toasts).
 */
export function slideUp({
    delay = 0,
    duration = DURATION.normal,
    distance = 12,
}: {
    delay?: number;
    duration?: number;
    distance?: number;
} = {}) {
    return {
        initial: { opacity: 0, y: distance },
        animate: { opacity: 1, y: 0 },
        transition: { duration, delay, ease: EASE },
    };
}

/**
 * Flip between two faces (used by the sign-in card).
 */
export function flipFace({
    duration = DURATION.slow,
}: {
    duration?: number;
} = {}) {
    return {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0 },
        transition: { duration, ease: EASE },
    };
}

/**
 * Stagger children: each successive item starts a little later. Pass the
 * child's index as `delay` (e.g. `delay={index * 0.06}`).
 */
export function stagger(delay: number) {
    return {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: DURATION.normal, ease: EASE },
    };
}

/**
 * Shared motion props for a single entering element. Reduces to a static
 * render when the user prefers reduced motion.
 */
export function enter(delay = 0) {
    return {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, ...baseTransition() },
    };
}

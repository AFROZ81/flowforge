/**
 * Shared constants for the landing page.
 *
 * Kept out of the component files so the horizontal rhythm and the motion curve
 * are stated once. This module exports no component, which also keeps it clear
 * of the fast-refresh rule that a file may not mix the two.
 */

/**
 * One measure for every band of the page, taken from the sign-in layout so the
 * two public surfaces share the same column and the jump between them is only
 * vertical.
 */
export const CONTAINER = "mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10";

/** The app's standard easing, the same curve the auth page animates on. */
export const EASE = [0.32, 0.72, 0, 1] as const;

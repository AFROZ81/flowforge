/*
 * Shared class strings for the two faces of the auth card.
 *
 * Lives apart from AuthFields.tsx because a module that exports both a
 * component and a plain value breaks React Fast Refresh for everything in it.
 *
 * The `dark:` values are repeated deliberately: the shared `Input` ships with
 * its own `dark:bg-input/30` and `dark:disabled:bg-input/80`, which would tint
 * a field differently depending on the app's light/dark setting — and this
 * card is a fixed scene. Naming the same utilities lets tailwind-merge drop
 * the component's versions instead of layering a second wash over them.
 *
 * 16px on small screens is also deliberate: below that iOS Safari zooms the
 * whole viewport when a field takes focus.
 */

export const AUTH_FIELD_CLASS = [
    "h-12 rounded-xl bg-auth-field text-[16px] md:text-[15px]",
    "dark:bg-auth-field dark:disabled:bg-auth-hover",
].join(" ");

export const LEADING_ICON_CLASS =
    "pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground";

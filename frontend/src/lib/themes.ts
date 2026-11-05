/* =========================================================
   THEME REGISTRY
   The one place that knows which themes exist. Nothing else
   enumerates theme ids: the token layer in styles/theme.css
   supplies the colours, next-themes supplies the attribute,
   and the picker renders this list.
   ========================================================= */

export type ThemeId = "light" | "parchment" | "dark" | "onyx";

/** What prefers-color-scheme is able to express. */
export type ThemeFamily = "light" | "dark";

/** What the user can actually choose: a theme, or defer to the OS. */
export type ThemePreference = ThemeId | "system";

export interface ThemeDescriptor {
    id: ThemeId;
    label: string;
    /** What the theme is *for*, not what it looks like. */
    blurb: string;
    family: ThemeFamily;
}

/**
 * `light` is the default: its values are declared once, on a selector list of
 * `:root, [data-theme="light"]`. The attribute half exists so a theme swatch
 * can paint the light palette while the app wears another theme — with only
 * `:root`, `[data-theme="light"]` would match nothing and the light chip would
 * silently inherit the running theme. The drift guard below still skips it, so
 * adding a fifth theme without a block is the one case it can catch.
 */
export const DEFAULT_THEME_ID: ThemeId = "light";

export const THEMES: readonly ThemeDescriptor[] = [
    {
        id: "light",
        label: "Light",
        blurb: "Cool neutral canvas, white paper, petrol-teal action.",
        family: "light",
    },
    {
        id: "parchment",
        label: "Parchment",
        blurb: "Warm paper and brown ink. Easier over a long reading session.",
        family: "light",
    },
    {
        id: "dark",
        label: "Dark",
        blurb: "Navy surfaces with a blue action. Restful in low light.",
        family: "dark",
    },
    {
        id: "onyx",
        label: "Onyx",
        blurb: "Near-black with harder edges. The ink ramp does not fade.",
        family: "dark",
    },
] as const;

export const THEME_IDS: readonly ThemeId[] = THEMES.map((theme) => theme.id);

export function isThemeId(value: unknown): value is ThemeId {
    return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/**
 * Which family a resolved theme belongs to.
 *
 * Exists so that components can ask "is this a dark scheme?" without
 * switching on individual theme ids — the one thing the registry is for.
 */
export function familyOf(value: string | null | undefined): ThemeFamily | undefined {
    return THEMES.find((theme) => theme.id === value)?.family;
}

/**
 * Read a stored preference without losing anybody's choice on deploy.
 *
 * The app previously shipped only light/dark, and next-themes may also have
 * stored the literal string "system". Anything unrecognised falls back to
 * following the OS rather than forcing a look on someone who asked for one.
 */
export function parseStoredTheme(raw: string | null | undefined): ThemePreference {
    if (raw === "system") return "system";
    if (isThemeId(raw)) return raw;
    return "system";
}

/* =========================================================
   DRIFT GUARD (dev only)
   The theme list now lives in two places that cannot import
   each other: this registry and the token layer in CSS. Add an
   id here and forget the block there, and the theme silently
   renders as the default. Say so loudly, in dev.
   ========================================================= */

export function assertThemeCoverage(): void {
    if (!import.meta.env.DEV || typeof document === "undefined") return;

    const declared = new Set<string>();

    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;

        try {
            rules = sheet.cssRules;
        } catch {
            // Cross-origin stylesheet — nothing readable to check.
            return;
        }

        for (const rule of Array.from(rules)) {
            const selector = (rule as CSSStyleRule).selectorText ?? "";
            const match = selector.match(/\[data-theme=(?:"|')?([a-z-]+)(?:"|')?\]/);
            if (match) declared.add(match[1]);
        }
    }

    if (declared.size === 0) return;

    for (const theme of THEMES) {
        if (theme.id === DEFAULT_THEME_ID) continue;

        if (!declared.has(theme.id)) {
            console.warn(
                `[themes] "${theme.id}" is in the registry but has no ` +
                    `[data-theme="…"] block in styles/theme.css — it will look ` +
                    `identical to the default theme.`
            );
        }
    }
}

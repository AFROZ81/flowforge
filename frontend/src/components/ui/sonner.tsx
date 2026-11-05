import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
    CheckIcon,
    InfoIcon,
    Loader2Icon,
    TriangleAlertIcon,
    XIcon,
} from "lucide-react";

import { familyOf } from "@/lib/themes";

/**
 * Where the stack sits.
 *
 * Top-centre, hung below the sticky topbar: the topbar's own actions live at
 * the right edge, so a toast that arrives there competes with the bell and the
 * avatar for the same corner, and one that arrives bottom-right sits over the
 * board's scroll area. Measured against the shell rather than the viewport, so
 * moving the topbar moves the toast with it.
 */
const POSITION: ToasterProps["position"] = "top-center";

const OFFSET: ToasterProps["offset"] = {
    top: "calc(var(--topbar-height) + 0.75rem)",
};

const MOBILE_OFFSET: ToasterProps["mobileOffset"] = {
    top: "calc(var(--topbar-height) + 0.5rem)",
    left: "0.75rem",
    right: "0.75rem",
};

/**
 * How long a toast stays, and how long its timer line drains.
 *
 * One constant feeding both: sonner cannot hand a toast's duration to CSS, so
 * passing it twice as a number in two places is how the line ends up lying.
 */
const DURATION = 4500;

/**
 * Glyphs, on purpose.
 *
 * Each one sits inside a solid disc of its own colour, so the marks are the
 * bare semantic shapes — a circle-check inside a circle, which is what sonner
 * draws by default, reads as a ring wearing a ring.
 */
const ICONS: ToasterProps["icons"] = {
    success: <CheckIcon className="size-3.5" strokeWidth={2.6} />,
    error: <XIcon className="size-3.5" strokeWidth={2.6} />,
    warning: <TriangleAlertIcon className="size-3.5" strokeWidth={2.4} />,
    info: <InfoIcon className="size-3.5" strokeWidth={2.4} />,
    loading: <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2.4} />,
    close: <XIcon className="size-3" strokeWidth={2.25} />,
};

const TOASTER_STYLE = {
    /* Sonner writes its own `--width`, `--gap` and `--offset-*` into the
       element's inline style, so a stylesheet rule can never replace them -
       these have to be handed through the `style` prop, which is spread after
       and therefore wins. The numbers themselves live in styles/theme.css. */
    "--width": "var(--toast-width)",
    "--gap": "var(--toast-gap)",
    "--border-radius": "var(--radius-lg)",
    "--toast-duration": `${DURATION}ms`,

    /* Insurance, not the design. Every library rule that reads these is
       overridden in styles/toast.css, so the only live consumer left is
       `[data-cancel]`, which the app does not use. They stay because an
       undefined `--normal-bg` paints a transparent card, and that is exactly
       how the previous setup failed.

       Cast rather than annotated: CSSProperties does not admit custom
       properties, and `satisfies` checks the keys before the cast lets them
       through. */
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)",
} satisfies Record<string, string> as React.CSSProperties;

/**
 * The app's one toaster.
 *
 * Placement and tokens are decided here; every pixel of the card itself lives
 * in styles/toast.css, which overrides sonner's own sheet on specificity
 * because sonner appends its styles at render time and cannot be out-ordered.
 *
 * The `theme` prop is deliberately *not* the app's theme id. Sonner reads it
 * as literally "light" or "dark" and switches its whole palette on that
 * attribute; handing it "parchment" or "onyx" matched none of its rules, which
 * left `--success-bg` unresolved and rendered every rich toast as a
 * transparent smear of text with no card behind it. `familyOf` is the only
 * thing allowed to answer that question.
 */
export function Toaster({ ...props }: ToasterProps) {
    const { theme, resolvedTheme } = useTheme();

    const family = familyOf(resolvedTheme) ?? familyOf(theme);

    return (
        <Sonner
            theme={family ?? "system"}
            position={POSITION}
            offset={OFFSET}
            mobileOffset={MOBILE_OFFSET}
            duration={DURATION}
            closeButton
            icons={ICONS}
            className="ff-toaster"
            style={TOASTER_STYLE}
            {...props}
        />
    );
}

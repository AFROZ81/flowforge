import { cn } from "@/lib/utils";

import { passwordStrength, type StrengthLevel } from "../lib/password-strength";

/*
 * Three segments and one word. Deliberately not a percentage bar: a
 * percentage implies a model of entropy nobody here computes, while these
 * segments mean exactly one thing — how many of the server's rules are met,
 * and whether there is margin on top.
 *
 * The tones are the semantic status tokens, which is safe on this page:
 * `.auth-scene` re-points `--color-danger` at the dusk palette's own alert
 * colour, and `warning`/`success` stay light enough (L 0.55 and up in every
 * theme) to read against the night sky.
 */

const SEGMENTS = 3;

/** Filled-segment colour, indexed by level. */
const FILL: Record<StrengthLevel, string> = {
    0: "bg-danger",
    1: "bg-warning",
    2: "bg-success",
};

/** Label colour, indexed by level. */
const TEXT: Record<StrengthLevel, string> = {
    0: "text-danger",
    1: "text-warning",
    2: "text-success",
};

export default function PasswordStrengthMeter({ value }: { value: string }) {
    const { level, label } = passwordStrength(value);

    // Nothing typed, nothing to say — the row would be a bar of empty track.
    if (level === null) {
        return null;
    }

    /*
     * Weak fills one segment rather than none: an empty row reads as
     * "unscored", and this password has been scored. It is the one thing the
     * user still has to get right.
     */
    const filled = level + 1;

    return (
        <div className="flex items-center gap-2.5" role="status">
            <div className="flex flex-1 gap-1" aria-hidden="true">
                {Array.from({ length: SEGMENTS }, (_, index) => (
                    <span
                        key={index}
                        className={cn(
                            "h-1 flex-1 rounded-full",
                            "transition-colors",
                            "duration-(--transition-fast) ease-(--ease-standard)",
                            index < filled ? FILL[level] : "bg-auth-line",
                        )}
                    />
                ))}
            </div>

            <span
                className={cn(
                    "shrink-0 text-[11px] leading-none font-medium",
                    TEXT[level],
                )}
            >
                {label}
            </span>
        </div>
    );
}

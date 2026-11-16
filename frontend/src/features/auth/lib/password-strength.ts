/*
 * Grades a password against the rules the server actually enforces — nothing
 * more — so the meter can never praise something the API will reject or scold
 * something it accepts.
 *
 * The policy lives in InfrastructureServiceCollection.cs:
 *
 *   RequiredLength          = 8
 *   RequireDigit            = true
 *   RequireUppercase        = true
 *   RequireLowercase        = true
 *   RequireNonAlphanumeric  = false
 *
 * That last line matters. A symbol is explicitly not required, so treating one
 * as a requirement would be UI policy the backend does not share and would
 * tell someone their password is weak when the form accepts it. A symbol
 * therefore counts as margin, not as a gate.
 *
 *   weak    — at least one of the four gates still missing
 *   good    — all four met: this password will be accepted
 *   strong  — all four met, plus real margin: 12+ characters or a symbol
 *
 * Presentation only. Nothing here is wired into validation; the zod schema in
 * ../validation/register.schema.ts stays the sole client-side gate, mirroring
 * the server exactly.
 */

export type StrengthLevel = 0 | 1 | 2;

export type PasswordStrength = {
    /** null while the field is empty — there is nothing to say about it. */
    level: StrengthLevel | null;
    label: string;
};

const GATES = [
    (value: string) => value.length >= 8,
    (value: string) => /[A-Z]/.test(value),
    (value: string) => /[a-z]/.test(value),
    (value: string) => /\d/.test(value),
];

export function passwordStrength(value: string): PasswordStrength {
    if (!value) {
        return { level: null, label: "" };
    }

    const gatesMet = GATES.filter((passes) => passes(value)).length;

    if (gatesMet < GATES.length) {
        return { level: 0, label: "Weak" };
    }

    const hasMargin = value.length >= 12 || /[^A-Za-z0-9]/.test(value);

    return hasMargin
        ? { level: 2, label: "Strong" }
        : { level: 1, label: "Good" };
}

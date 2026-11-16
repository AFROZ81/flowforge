/*
 * The workspace slug is never typed, so it never has to be validated twice or
 * explained in the UI. `POST /api/Organizations` needs one alongside the name,
 * and the signup form is the only place that derives it.
 *
 * The server only insists that name and slug are non-empty and at most 150
 * characters (CreateOrganizationValidator). Everything below is ours.
 */
export function toOrganizationSlug(name: string): string {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 150);

    /*
     * A name made mostly of punctuation — "A!" — collapses to one character.
     * The server would accept it, and it would look broken forever, so the
     * two-character floor is a presentation rule rather than an API one.
     */
    return slug.length >= 2 ? slug : `workspace-${slug}`;
}

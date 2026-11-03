/**
 * Helpers for pages that keep a view choice in the URL.
 *
 * A page that owns `?section=` or `?report=` must rewrite only its own keys:
 * blowing away the rest of the query would silently drop anything another
 * component put there.
 */

/** Applies a patch to the query; a null value removes that key. */
export function paramsWith(
    current: URLSearchParams,
    patch: Record<string, string | null>
): URLSearchParams {
    const next = new URLSearchParams(current);

    for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
            next.delete(key);
        } else {
            next.set(key, value);
        }
    }

    return next;
}

/**
 * The same patch as a link target, so a view can be handed to `<Link>` without
 * losing the parameters this page does not own. Omitting a key at its default
 * keeps the common URL clean.
 */
export function searchWith(
    current: URLSearchParams,
    patch: Record<string, string | null>
): string {
    const query = paramsWith(current, patch).toString();

    return query ? `?${query}` : "";
}

/**
 * Reads a parameter against a known set of ids, falling back to the default and
 * reporting whether the value had to be replaced — that is what lets a page
 * clean a bogus deep link out of the address bar instead of lying about it.
 */
export function parseParam<T extends string>(
    raw: string | null,
    allowed: readonly T[],
    fallback: T
): { value: T; invalid: boolean } {
    if (raw === null) {
        return { value: fallback, invalid: false };
    }

    return allowed.includes(raw as T)
        ? { value: raw as T, invalid: false }
        : { value: fallback, invalid: true };
}

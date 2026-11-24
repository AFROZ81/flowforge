/**
 * Generation deadline helper — kept in its own module so it is unit-testable
 * without importing the worker (which uses `self` and a dynamic transformers.js
 * import). The worker races the (uninterruptible) generator promise against this
 * deadline; on timeout the caller delivers the heuristic fallback immediately and
 * safely discards any late result.
 */

/**
 * Await `work`, but if it does not settle within `ms`, resolve to `undefined` and
 * invoke `onTimeout`. The underlying `work` promise is never cancelled; it is
 * abandoned and its result discarded by the caller. The timer is always cleared
 * so it never leaks or fires after the real work completes. If `work` rejects
 * before the deadline, the returned promise rejects with the same reason.
 */
export function raceWithDeadline<T>(
    work: Promise<T>,
    ms: number,
    onTimeout: () => void
): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
        const timer = setTimeout(() => {
            onTimeout();
            resolve(undefined);
        }, ms);

        work.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (error) => {
                clearTimeout(timer);
                reject(error);
            }
        );
    });
}
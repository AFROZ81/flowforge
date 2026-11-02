import { createContext, useContext } from "react";

/**
 * Contract for the app-wide confirmation dialog.
 *
 * Lives apart from `confirm-dialog.tsx` because a module that exports both a
 * component and a non-component value breaks React Fast Refresh for the file.
 */
export type ConfirmOptions = {
    title: string;
    description?: string;
    /** The verb on the destructive action. Keep it specific: "Delete label". */
    confirmLabel?: string;
    cancelLabel?: string;
    /** `destructive` renders the primary action in the danger tone. */
    tone?: "default" | "destructive";
};

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(
    null
);

/**
 * Replaces `window.confirm`.
 *
 * A browser confirm() dialog can't be styled, is announced poorly by screen
 * readers, and on mobile Safari appears outside the page entirely — so an
 * irreversible action shouldn't depend on it.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: "Delete label?", tone: "destructive" }))) return;
 */
export function useConfirm(): ConfirmFn {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error("useConfirm must be used inside <ConfirmProvider>");
    }

    return context;
}

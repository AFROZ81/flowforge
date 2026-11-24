import {
    type ExternalToast,
    toast as sonnerToast,
} from "sonner";

import { useAnnouncerStore } from "@/components/common/announcer-store";

const announce = useAnnouncerStore.getState().announce;

function announceIfString(message: unknown) {
    if (typeof message === "string") {
        announce(message);
    }
}

/**
 * A `toast` object with the same surface as sonner's, but every call is also
 * announced to screen readers through the shared `aria-live="polite"` region.
 *
 *   import { toast } from "@/lib/toast";
 *   toast.success("Work item moved");
 *
 * Drop-in replacement for `import { toast } from "sonner"`.
 */

export const toast = {
    ...sonnerToast,

    success: (
        message: Parameters<typeof sonnerToast.success>[0],
        data?: ExternalToast
    ) => {
        const result = sonnerToast.success(message, data);
        announceIfString(message);
        return result;
    },

    error: (
        message: Parameters<typeof sonnerToast.error>[0],
        data?: ExternalToast
    ) => {
        const result = sonnerToast.error(message, data);
        announceIfString(message);
        return result;
    },

    warning: (
        message: Parameters<typeof sonnerToast.warning>[0],
        data?: ExternalToast
    ) => {
        const result = sonnerToast.warning(message, data);
        announceIfString(message);
        return result;
    },

    info: (
        message: Parameters<typeof sonnerToast.info>[0],
        data?: ExternalToast
    ) => {
        const result = sonnerToast.info(message, data);
        announceIfString(message);
        return result;
    },

    loading: (
        message: Parameters<typeof sonnerToast.loading>[0],
        data?: ExternalToast
    ) => {
        const result = sonnerToast.loading(message, data);
        announceIfString(message);
        return result;
    },
};

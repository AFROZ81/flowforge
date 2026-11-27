import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ConfirmContext,
  type ConfirmFn,
  type ConfirmOptions,
} from "./confirm";

/**
 * Hosts the single confirmation dialog that `useConfirm` resolves against.
 * Mounted once, in `app/providers.tsx`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [confirmationValue, setConfirmationValue] = useState("");
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    setConfirmationValue("");
    setOptions(next);

    // Settles when the dialog is answered; an unmount never leaves it hanging
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setConfirmationValue("");
    setOptions(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Dialog
        open={options !== null}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{options?.title}</DialogTitle>

            {options?.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>

          {options?.confirmationText && (
            <div className="grid gap-2">
              <label htmlFor="confirm-action-text" className="text-sm font-medium text-foreground">
                Type <span className="font-semibold">{options.confirmationText}</span> to confirm
              </label>
              <Input
                id="confirm-action-text"
                value={confirmationValue}
                onChange={(event) => setConfirmationValue(event.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Cancel"}
            </Button>

            <Button
              variant={
                options?.tone === "destructive" ? "destructive" : "default"
              }
              onClick={() => settle(true)}
              disabled={
                Boolean(options?.confirmationText) &&
                confirmationValue !== options?.confirmationText
              }
            >
              {options?.confirmLabel ?? "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

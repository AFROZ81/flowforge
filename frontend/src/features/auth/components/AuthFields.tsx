import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { FieldAria } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

import { AUTH_FIELD_CLASS, LEADING_ICON_CLASS } from "./auth-field-classes";

/*
 * The three controls the sign-in and register faces share. Both faces sit on
 * the same dark panel, so a field has to look identical on either side of the
 * flip; the class strings behind them are in ./auth-field-classes.
 */

type Registered = ComponentProps<typeof Input>;

type AuthTextFieldProps = {
    /** Accessibility props handed down by `FormField`. */
    aria: FieldAria;
    icon: LucideIcon;
    placeholder: string;
    type?: "text" | "email";
    autoComplete?: string;
    inputMode?: "text" | "email";
    disabled?: boolean;
    /** Whatever `register("field")` returns. */
    registered: Registered;
};

export function AuthTextField({
    aria,
    icon: Icon,
    registered,
    ...input
}: AuthTextFieldProps) {
    return (
        <div className="relative">
            <Icon className={LEADING_ICON_CLASS} aria-hidden="true" />

            <Input
                {...aria}
                {...input}
                // Last, so react-hook-form's name/ref/onChange win.
                {...registered}
                className={cn(AUTH_FIELD_CLASS, "pl-11")}
            />
        </div>
    );
}

type AuthPasswordFieldProps = {
    aria: FieldAria;
    placeholder: string;
    autoComplete: "current-password" | "new-password";
    disabled?: boolean;
    registered: Registered;
};

export function AuthPasswordField({
    aria,
    placeholder,
    autoComplete,
    disabled,
    registered,
}: AuthPasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Lock className={LEADING_ICON_CLASS} aria-hidden="true" />

            <Input
                {...aria}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                placeholder={placeholder}
                disabled={disabled}
                {...registered}
                className={cn(AUTH_FIELD_CLASS, "pr-12 pl-11")}
            />

            {/*
             * The toggle sits inside the field rather than on the label: on a
             * phone the label is far from the thumb.
             */}
            <button
                type="button"
                onClick={() => setVisible((prev) => !prev)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                disabled={disabled}
                className="
                    absolute top-1/2 right-2 flex size-9 -translate-y-1/2
                    items-center justify-center rounded-lg text-muted-foreground
                    transition-colors hover:bg-surface-sunken hover:text-foreground
                    disabled:pointer-events-none disabled:opacity-50
                "
            >
                {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
        </div>
    );
}

type AuthSelectFieldProps = {
    aria: FieldAria;
    icon: LucideIcon;
    disabled?: boolean;
    children: ReactNode;
    registered: ComponentProps<typeof NativeSelect>;
};

export function AuthSelectField({
    aria,
    icon: Icon,
    children,
    disabled,
    registered,
}: AuthSelectFieldProps) {
    return (
        <div className="relative">
            <Icon className={LEADING_ICON_CLASS} aria-hidden="true" />

            <NativeSelect
                {...aria}
                disabled={disabled}
                {...registered}
                className={cn(AUTH_FIELD_CLASS, "pl-11 font-normal")}
            >
                {children}
            </NativeSelect>
        </div>
    );
}

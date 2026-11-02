import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router";

import { Card } from "@/components/ui/card";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Mode = "signin" | "register";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * One card, two faces.
 *
 * The mode lives in the query string rather than local state, so the flip is
 * linkable, survives a reload, and the browser back button does something
 * sensible — all without adding a route for a form that shares a page.
 *
 * Only one face is ever mounted, and the turn is played as half a rotation
 * out and half a rotation in. The obvious alternative — stacking both faces
 * and hiding the back one with `backface-visibility` — needs a `preserve-3d`
 * ancestor to work at all, and without it the rear face simply paints
 * mirrored over the front one. Keeping a single face makes that failure
 * impossible, and it also means the hidden face can never be tabbed into.
 */
export default function AuthCard() {
    const [params, setParams] = useSearchParams();
    const reduceMotion = useReducedMotion();

    const mode: Mode = params.get("mode") === "register" ? "register" : "signin";

    const [prefillEmail, setPrefillEmail] = useState("");

    const cardRef = useRef<HTMLDivElement>(null);

    /*
     * The face being left is unmounted, so focus falls to the document body
     * and a keyboard user is stranded at the top of the page. Put them on the
     * first control of the face that just arrived — but only for flips they
     * asked for, never on first paint.
     */
    const focusIsPending = useRef(false);

    useEffect(() => {
        if (!focusIsPending.current) return;

        focusIsPending.current = false;

        cardRef.current
            ?.querySelector<HTMLElement>("input:not([disabled]), select:not([disabled])")
            ?.focus();
    }, [mode]);

    const goTo = (next: Mode) => {
        if (next === mode) return;

        focusIsPending.current = true;

        setParams(next === "register" ? { mode: "register" } : {}, {
            preventScrollReset: true,
        });
    };

    const handleRegistered = (email: string) => {
        setPrefillEmail(email);
        goTo("signin");
    };

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="w-full max-w-[25rem] sm:max-w-[27rem]"
            style={{ perspective: "1200px" }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={mode}
                    ref={cardRef}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: -90 }}
                    animate={
                        reduceMotion
                            ? { opacity: 1 }
                            : { opacity: 1, rotateY: 0 }
                    }
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.26,
                        ease: EASE,
                    }}
                >
                    <Card className="gap-0 rounded-2xl p-6 shadow-xl backdrop-blur-xl sm:p-8">
                        {mode === "register" ? (
                            <RegisterForm
                                onRegistered={handleRegistered}
                                onSwitchToLogin={() => goTo("signin")}
                            />
                        ) : (
                            <LoginForm
                                defaultEmail={prefillEmail}
                                onSwitchToRegister={() => goTo("register")}
                            />
                        )}
                    </Card>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

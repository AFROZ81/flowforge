import { motion, useReducedMotion } from "framer-motion";

import AuthBackdrop from "../components/AuthBackdrop";
import AuthCard from "../components/AuthCard";
import Logo from "@/components/layout/Logo";

/**
 * Sign-in.
 *
 * One composition at every width: the dusk scene, the brand band across the
 * top, and the panel on the left — exactly where the reference puts it. The
 * scene is scenery, so the responsive story is simple: as the viewport
 * narrows the panel stops sharing space with it and takes the page itself,
 * centered, with the lodge and the tagline dropped rather than squeezed.
 *
 * `.auth-scene` is the token island that re-skins every primitive below it
 * (see styles/theme.css). Nothing here follows the app's light/dark setting,
 * which is the point — the sign-in page is a fixed brand surface.
 */
export default function LoginPage() {
    const reduceMotion = useReducedMotion();

    return (
        <main className="auth-scene relative min-h-dvh w-full bg-auth-night">
            <AuthBackdrop />

            <div className="
                relative z-10 mx-auto flex min-h-dvh w-full max-w-[1240px]
                flex-col px-4 py-6
                sm:px-6 sm:py-8
                lg:px-10 lg:py-10
            ">
                {/* =====================================================
                    BRAND BAND
                ===================================================== */}

                <motion.header
                    initial={reduceMotion ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="flex shrink-0 items-start justify-between gap-6"
                >
                    <Logo size="xl" tagline={null} />

                    {/*
                     * The reference's brand line. Letterspaced and set as
                     * three short lines so it reads as a mark, not copy —
                     * and dropped below `lg`, where the panel needs the width.
                     */}
                    <p className="hidden shrink-0 border-l border-auth-line pl-5 text-[13px] leading-[1.95] font-medium tracking-[0.3em] text-muted-foreground uppercase lg:block">
                        <span className="block">Work</span>
                        <span className="block">Together</span>
                        <span className="block">Go Further</span>
                    </p>
                </motion.header>

                {/* =====================================================
                    PANEL
                ===================================================== */}

                <div className="
                    flex flex-1 items-center justify-center py-8
                    sm:py-10
                    lg:justify-start lg:pr-[6%]
                ">
                    <AuthCard />
                </div>
            </div>
        </main>
    );
}

import loginBg from "@/assets/login-bg.jpg"
import loginBgSm from "@/assets/login-bg-sm.jpg"

/*
 * The dusk photograph behind the sign-in form.
 *
 * This is the brand artwork the composition was built around, so it is used
 * directly rather than reinterpreted in CSS. What is still ours is the layer
 * underneath it and the two scrims on top:
 *
 *   - the gradient shows first, so the panel never sits on a black rectangle
 *     while a 209 kB photograph decodes;
 *   - the scrims hold the text contrast regardless of what the frame is doing
 *     beneath the panel, because `object-cover` crops differently at every
 *     aspect ratio and the crop is not ours to control.
 *
 * Two widths are served: a phone pulls the 67 kB file instead of the full one.
 */

export default function AuthBackdrop() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {/* ---------- Fallback sky ---------- */}
            <div className="absolute inset-0 bg-linear-to-b from-auth-night via-auth-dusk to-auth-haze" />

            {/* ---------- Photograph ---------- */}
            <img
                srcSet={`${loginBgSm} 820w, ${loginBg} 1448w`}
                sizes="100vw"
                src={loginBg}
                alt=""
                // It is the largest element on the page and paints before the
                // form is readable, so it should not queue behind anything.
                fetchPriority="high"
                decoding="async"
                draggable={false}
                className="absolute inset-0 size-full object-cover object-center"
            />

            {/* ---------- Scrims ---------- */}
            /*
             * The panel occupies the left third of the frame, where the forest
             * is already dark; the directional wash only deepens it and leaves
             * the lit lodge at the right untouched.
             */
            <div className="absolute inset-0 bg-linear-to-r from-auth-shade/80 via-auth-shade/25 to-transparent" />

            /*
             * Below `lg` the crop shifts toward the bright centre of the frame
             * and the panel overlaps it, so the whole image gets a wash rather
             * than relying on one edge.
             */
            <div className="absolute inset-0 bg-auth-shade/35 lg:hidden" />
        </div>
    );
}

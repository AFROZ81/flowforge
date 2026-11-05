import CapabilityGrid from "../components/CapabilityGrid";
import DomainTrail from "../components/DomainTrail";
import HeroSection from "../components/HeroSection";
import LandingBackdrop from "../components/LandingBackdrop";
import LandingFooter from "../components/LandingFooter";
import LandingHeader from "../components/LandingHeader";

/**
 * The public landing page, served at `/`.
 *
 * Only visitors without a session see it: `PublicRoute` sends an authenticated
 * one to the dashboard, so this never stands between somebody and their work.
 *
 * It follows the app's theme, which is what the four surface schemes in
 * styles/theme.css are for — every colour here is a semantic token, so the
 * page arrives correct on light, parchment, dark and onyx without a single
 * theme-specific rule.
 *
 * It used to sit on `.auth-scene` to match sign-in, and that was a mistake
 * beyond taste. A token island can only re-point a custom property for
 * elements that *read* it themselves. `body` already resolved
 * `text-foreground` against the app theme before the island existed, so
 * anything that inherited its colour — every heading on this page — picked up
 * the visitor's own ink instead of the scene's: brown ochre on navy for a
 * parchment user. Fixing that needed an explicit colour on every element,
 * which is the same thing as not having the island at all.
 *
 * `text-foreground` is still stated on the root rather than inherited, so the
 * page cannot be undone by that mechanism again.
 *
 * No band on this page is told to grow. The hero used to carry `flex-1` so it
 * would fill the viewport, which is a reasonable instinct and a bad result:
 * the section became taller than its content, `items-center` split the
 * difference above and below it, and a page that opens with a headline ended
 * with a slab of empty canvas before the first section. Height now comes from
 * content plus one gap between bands, so the only slack on the page is under
 * the footer, where it is invisible.
 */
export default function LandingPage() {
    return (
        <div className="relative min-h-dvh w-full bg-background text-foreground">
            <LandingBackdrop />

            <div className="relative z-10 flex min-h-dvh flex-col">
                <LandingHeader />

                <main className="flex flex-col gap-12 pb-12 sm:gap-14 sm:pb-14 lg:gap-16 lg:pb-16">
                    <HeroSection />
                    <CapabilityGrid />
                    <DomainTrail />
                </main>

                <LandingFooter />
            </div>
        </div>
    );
}

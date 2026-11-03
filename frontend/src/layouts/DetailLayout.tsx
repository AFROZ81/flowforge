import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

/**
 * Chrome-free page shell.
 *
 * AppLayout carries the rail and the top bar, which suits the four
 * destinations the sidebar actually lists. A detail page — a project, a
 * board — is not one of them, and wrapping it in that shell gave you a nav
 * with nothing active, a breadcrumb that repeated the page's own title, and
 * a second back control when the page already has one in its body.
 *
 * So this is only the scroll container and the page padding, sized to the
 * viewport the way AppLayout's content column was.
 */
export default function DetailLayout({ children }: Props) {
    return (
        <main
            id="main-content"
            className="
                h-dvh min-h-0 w-full
                overflow-x-hidden overflow-y-auto
                bg-background px-4 py-5
                sm:px-6
                lg:px-8 lg:py-6
            "
        >
            {children}
        </main>
    );
}

import type { Preview } from "@storybook/react-vite";
import React from "react";

import "../src/index.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            test: "todo",
        },

        themes: {
            default: "light",
            list: [
                { name: "Light", class: "light", color: "#f5f7fa" },
                { name: "Parchment", class: "parchment", color: "#f7f5ef" },
                { name: "Dark", class: "dark", color: "#0f172a" },
                { name: "Onyx", class: "onyx", color: "#020205" },
            ],
        },
    },

    decorators: [
        (Story) => (
            <div data-theme="light" className="min-h-screen p-6 bg-background">
                <Story />
            </div>
        ),
    ],
};

export default preview;

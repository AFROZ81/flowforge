import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            options: ["default", "outline", "secondary", "ghost", "destructive", "success", "link"],
            control: { type: "select" },
        },
        size: {
            options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
            control: { type: "select" },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: { children: "Primary action" },
};

export const Outline: Story = {
    args: { variant: "outline", children: "Outline" },
};

export const Ghost: Story = {
    args: { variant: "ghost", children: "Ghost" },
};

export const Destructive: Story = {
    args: { variant: "destructive", children: "Delete" },
};

export const Success: Story = {
    args: { variant: "success", children: "Save" },
};

export const WithIcon: Story = {
    args: {
        children: <span>Save work item</span>,
        className: "flex items-center gap-2",
    },
    render: (args) => (
        <Button variant="default" size="sm" {...args}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {args.children}
        </Button>
    ),
};

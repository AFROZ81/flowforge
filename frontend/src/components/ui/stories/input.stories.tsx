import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input";

const meta: Meta<typeof Input> = {
    title: "UI/Input",
    component: Input,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: "Enter text…",
    },
};

export const WithLabel: Story = {
    render: () => (
        <div className="flex w-[240px] flex-col gap-2">
            <label className="text-[13px] font-medium text-foreground">
                Email address
            </label>
            <Input placeholder="name@example.com" />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        placeholder: "Cannot edit",
        disabled: true,
    },
};

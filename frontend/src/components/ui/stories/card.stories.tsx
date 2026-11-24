import type { Meta, StoryObj } from "@storybook/react-vite";

import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from "../card";

const meta: Meta<typeof Card> = {
    title: "UI/Card",
    component: Card,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    args: {
        children: (
            <>
                <CardHeader>
                    <CardTitle>Work item title</CardTitle>
                    <CardDescription>
                        Description of the work item goes here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Detailed content of the card.</p>
                </CardContent>
                <CardFooter>
                    <span className="text-xs text-muted-foreground">Updated 2h ago</span>
                </CardFooter>
            </>
        ),
    },
};

export const Compact: Story = {
    args: {
        size: "sm",
        children: (
            <>
                <CardHeader>
                    <CardTitle>Compact card</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">Smaller padding variant.</p>
                </CardContent>
            </>
        ),
    },
};

export const WithAction: Story = {
    args: {
        children: (
            <>
                <CardHeader>
                    <CardTitle>Card with action</CardTitle>
                    <CardAction>
                        <span className="text-xs text-muted-foreground">•••</span>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">Action slot renders top-right.</p>
                </CardContent>
            </>
        ),
    },
};

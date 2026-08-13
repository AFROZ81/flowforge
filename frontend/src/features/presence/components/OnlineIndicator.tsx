import { usePresence } from "../hooks/usePresence";

type Props = {
    userId?: string | null;
    showLabel?: boolean;
    size?: "sm" | "md";
};

export default function OnlineIndicator({
    userId,
    showLabel = false,
    size = "sm",
}: Props) {
    const { isOnline } =
        usePresence();

    const online =
        isOnline(userId);

    const dotSize =
        size === "md"
            ? "h-2.5 w-2.5"
            : "h-2 w-2";

    return (
        <span className="inline-flex items-center gap-1.5">
            <span
                className={`inline-block rounded-full ${dotSize} ${
                    online
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                }`}
                title={
                    online
                        ? "Online"
                        : "Offline"
                }
            />

            {showLabel && (
                <span
                    className={
                        online
                            ? "text-emerald-600"
                            : "text-gray-400"
                    }
                >
                    {online
                        ? "Online"
                        : "Offline"}
                </span>
            )}
        </span>
    );
}
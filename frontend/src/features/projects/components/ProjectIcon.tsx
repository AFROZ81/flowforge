type Props = {
    icon: string;
    color: string;
};

export default function ProjectIcon({
    icon,
    color,
}: Props) {
    return (
        <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{
                backgroundColor: `${color}20`,
            }}
        >
            {icon}
        </div>
    );
}
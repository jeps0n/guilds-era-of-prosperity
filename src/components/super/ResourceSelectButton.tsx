import type { Resources } from "../../game/engine/types";
interface ResourceSelectButtonProps {
    resource: keyof Resources;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
}
export default function ResourceSelectButton({
    resource,
    children,
    onClick,
    active = false,
    disabled = false,
}: ResourceSelectButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={(event) => {
                if (!disabled) {
                    event.currentTarget.style.background =
                        "linear-gradient(180deg, #D4AF55, #9F7B2F)";
                    event.currentTarget.style.borderColor =
                        "#FFF0B0";
                    event.currentTarget.style.boxShadow =
                        "0 0 10px rgba(212, 175, 85, 0.35)";
                }
            }}
            onMouseLeave={(event) => {
                if (!disabled) {
                    event.currentTarget.style.background =
                        active
                            ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                            : "linear-gradient(180deg, #6F5424, #3A2A12)";
                    event.currentTarget.style.borderColor =
                        active
                            ? "#FFF0B0"
                            : "#D4AF55";
                    event.currentTarget.style.boxShadow =
                        "none";
                }
            }}
            style={{
                fontSize: "11px",
                height: "42px",
                padding: "0px 8px",
                borderRadius: "10px",
                border: disabled
                    ? "2px solid rgba(212, 175, 85, 0.25)"
                    : active
                        ? "2px solid #FFF0B0"
                        : "2px solid #D4AF55",
                background: disabled
                    ? "#211C14"
                    : active
                        ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                        : "#3A2A12",
                color: disabled
                    ? "#625B4D"
                    : "#FFF8DF",
                cursor: disabled
                    ? "not-allowed"
                    : "pointer",
                opacity: disabled ? 0.7 : 1,
                fontWeight: active
                    ? "bold"
                    : "normal",
                textAlign: "left",
                transition:
                    "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            }}
        >
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "19px",
                        width: "19px",
                        height: "19px",
                        padding: "2px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        flexShrink: 0,
                        backgroundColor: disabled
                            ? "#302C25"
                            : resourceColors[resource],
                        color: disabled
                            ? "#625B4D"
                            : "#000000",
                    }}
                >
                    1
                </span>
                <span
                    style={{
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {children}
                </span>
            </span>
        </button>
    );
}
const resourceColors: Record<
    keyof Resources,
    string
> = {
    brick: "#b45309",
    lumber: "#166534",
    wheat: "#eab308",
    sheep: "#65a30d",
    ore: "#6b7280",
};

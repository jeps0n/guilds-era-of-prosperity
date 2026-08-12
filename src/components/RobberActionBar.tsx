interface RobberActionBarProps {
    playerColor?: string;
    roadBuildingPending?: boolean;
}
function hexToRgba(
    hex: string,
    alpha: number
): string {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) {
        return `rgba(17, 24, 39, ${alpha})`;
    }
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
export default function RobberActionBar({
    playerColor = "#f97316",
    roadBuildingPending = false,
}: RobberActionBarProps) {
    const actionBarBackground = hexToRgba(
        playerColor,
        0.50
    );
    return (
        <div
            style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
                width: "100%",
            }}
        >
            <div
                style={{
                    background: actionBarBackground,
                    border: "1px solid #374151",
                    borderRadius: "14px",
                    padding: "10px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                        "0 8px 24px rgba(0,0,0,0.25)",
                    flexWrap: "nowrap",
                    minHeight: "64px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        minWidth: "760px",
                        minHeight: "64px",
                        padding: "10px 12px",
                        boxSizing: "border-box",
                        borderRadius: "10px",
                        background: "#000000",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                    }}
                >
                    <span
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                        }}
                    >
                        {roadBuildingPending
                            ? "ROAD BUILDING"
                            : "MOVE THE ROBBER"}
                    </span>
                    <span
                        style={{
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {roadBuildingPending
                            ? "Place your free roads "
                            : "Click a different tile to move the robber"}
                    </span>
                </div>
            </div>
        </div>
    );
}
import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  width?: string;
  minHeight?: string;
}

function Panel({
  children,
  width,
  minHeight,
}: PanelProps) {

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "12px",
        width,
        minHeight,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export default Panel;
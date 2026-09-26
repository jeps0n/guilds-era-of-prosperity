import type { ReactNode } from "react";
interface PanelProps {
  children: ReactNode;
  width?: string;
  minHeight?: string;
  background?: string;
  border?: string;
}
function Panel({
  children,
  width,
  minHeight,
  background = "linear-gradient(145deg, rgba(31,35,31,.96), rgba(17,20,18,.98))",
  border = "1px solid rgba(205,170,92,.26)",
}: PanelProps) {
  return (
    <div
      style={{
        background,
        border,
        borderRadius: "12px",
        padding: "12px",
        width,
        minHeight,
        boxSizing: "border-box",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.025), 0 8px 20px rgba(0,0,0,.14)",
      }}
    >
      {children}
    </div>
  );
}
export default Panel;

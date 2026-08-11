import type { ReactNode } from "react";
interface SecondaryMenuProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}
interface SecondaryMenuButtonProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}
export function SecondaryMenu({
  title,
  onClose,
  children,
}: SecondaryMenuProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        width: "280px",
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #374151",
        background: "#111827",
        color: "white",
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <strong>{title}</strong>
        <button
          type="button"
          onClick={onClose}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "#1d4ed8";
            event.currentTarget.style.borderColor = "#60a5fa";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "#1f2937";
            event.currentTarget.style.borderColor = "transparent";
          }}
          style={{
            border: "1px solid transparent",
            background: "#1f2937",
            color: "white",
            cursor: "pointer",
            fontSize: "18px",
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "background 0.15s ease, border-color 0.15s ease",
          }}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}
export function SecondaryMenuButton({
  children,
  onClick,
  active = false,
  disabled = false,
}: SecondaryMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(event) => {
        if (!disabled) {
          event.currentTarget.style.background = "#1d4ed8";
          event.currentTarget.style.borderColor = "#60a5fa";
          event.currentTarget.style.boxShadow =
            "0 0 10px rgba(96, 165, 250, 0.35)";
        }
      }}
      onMouseLeave={(event) => {
        if (!disabled) {
          event.currentTarget.style.background = active
            ? "#1d4ed8"
            : "#1f2937";
          event.currentTarget.style.borderColor = active
            ? "#60a5fa"
            : "#374151";
          event.currentTarget.style.boxShadow = "none";
        }
      }}
      style={{
        width: "100%",
        padding: "10px",
        borderRadius: "10px",
        border: active
          ? "2px solid #60a5fa"
          : "1px solid #374151",
        background: active
          ? "#1d4ed8"
          : disabled
            ? "#1f2937"
            : "#1f2937",
        color: disabled ? "#6b7280" : "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "bold",
        textAlign: "left",
        transition:
          "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
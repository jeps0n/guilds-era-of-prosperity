import type { ReactNode } from "react";

interface GameLayoutProps {
  header?: ReactNode;
  board: ReactNode;
  rightSidebar?: ReactNode;
  bottom?: ReactNode;
}

function GameLayout({
  header,
  board,
  rightSidebar,
  bottom,
}: GameLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f2937",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px",
        boxSizing: "border-box",
      }}
    >
      {header}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px auto 390px",
            columnGap: "20px",
            alignItems: "start",
          }}
        >
          <div />

          <div>
            {board}
          </div>

          <div>
            {rightSidebar}
          </div>
        </div>
      </div>

      {bottom}
    </div>
  );
}

export default GameLayout;
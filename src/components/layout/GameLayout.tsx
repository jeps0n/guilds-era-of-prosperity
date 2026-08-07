import type { ReactNode } from "react";
import Panel from "../ui/Panel";
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
            gridTemplateColumns: rightSidebar
              ? "100px auto 420px"
              : "auto",
            columnGap: rightSidebar
              ? "20px"
              : "0px",
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          {/* Future left sidebar */}
          {rightSidebar && <div />}
          {/* Main content */}
          <div>
            {board}
          </div>
          {/* Right HUD */}
          {rightSidebar && (
            <Panel minHeight="400px">
              {rightSidebar}
            </Panel>
          )}
        </div>
      </div>
      {bottom}
    </div>
  );
}
export default GameLayout;
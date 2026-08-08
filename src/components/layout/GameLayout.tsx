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
        width: "100%",
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
          width: "100%",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1240px",
            display: "grid",
            gridTemplateColumns: rightSidebar
              ? "800px 420px"
              : "800px",
            gap: "20px",
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          <main
            style={{
              width: "800px",
              minWidth: 0,
            }}
          >
            {board}
            {bottom && (
              <div
                style={{
                  width: "800px",
                  marginTop: "0px",
                }}
              >
                {bottom}
              </div>
            )}
          </main>
          {rightSidebar && (
            <aside
              style={{
                width: "420px",
                minWidth: 0,
              }}
            >
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
export default GameLayout;
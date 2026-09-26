import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
interface GameLayoutProps {
  header?: ReactNode;
  centerHeader?: ReactNode;
  board: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  logSidebar?: ReactNode;
  bottom?: ReactNode;
  leftActive?: boolean;
  rightActive?: boolean;
  leftAccent?: string;
  rightAccent?: string;
  preserveFourColumnShell?: boolean;
}
function GameLayout({ header, centerHeader, board, leftSidebar, rightSidebar, logSidebar, bottom, leftActive = false, rightActive = false, leftAccent = "#f97316", rightAccent = "#9333ea", preserveFourColumnShell = false }: GameLayoutProps) {
  const activeAccent = leftActive ? leftAccent : rightActive ? rightAccent : undefined;
  const previousAccentRef = useRef(activeAccent);
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHandoffBreathing, setIsHandoffBreathing] = useState(false);
  useEffect(() => {
    const previousAccent = previousAccentRef.current;
    previousAccentRef.current = activeAccent;
    if (!previousAccent || !activeAccent || previousAccent === activeAccent) return;
    if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current);
    setIsHandoffBreathing(false);
    const frame = requestAnimationFrame(() => {
      setIsHandoffBreathing(true);
      handoffTimerRef.current = setTimeout(() => {
        setIsHandoffBreathing(false);
        handoffTimerRef.current = null;
      }, 420);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (handoffTimerRef.current) {
        clearTimeout(handoffTimerRef.current);
        handoffTimerRef.current = null;
      }
    };
  }, [activeAccent]);
  const layoutClass = preserveFourColumnShell
    ? "game-layout--four-column game-layout--selection-shell"
    : leftSidebar && rightSidebar && logSidebar
    ? "game-layout--four-column"
    : leftSidebar && rightSidebar
      ? "game-layout--three-column"
      : rightSidebar
        ? "game-layout--right-sidebar"
        : "";
  return (
    <div className="game-shell">
      {header && <header className="game-shell__header">{header}</header>}
      <div className={`game-layout ${layoutClass}`}>
        {leftSidebar && <aside className={`game-hud game-hud--left${leftActive ? " is-active" : ""}`} style={{ "--seat-accent": leftAccent } as CSSProperties}>{leftSidebar}</aside>}
        <main className="game-main-column">
          {centerHeader && <section className="game-status-deck">{centerHeader}</section>}
          <section className="game-board-frame">{board}</section>
          {bottom && <section className={`game-command-deck${activeAccent ? " has-active-seat-accent" : ""}${isHandoffBreathing ? " is-seat-handoff" : ""}`} style={activeAccent ? { "--seat-accent": activeAccent } as CSSProperties : undefined}>{bottom}</section>}
        </main>
        {rightSidebar && <aside className={`game-hud game-hud--right${rightActive ? " is-active" : ""}`} style={{ "--seat-accent": rightAccent } as CSSProperties}>{rightSidebar}</aside>}
        {logSidebar && <aside className="game-log-rail">{logSidebar}</aside>}
      </div>
    </div>
  );
}
export default GameLayout;

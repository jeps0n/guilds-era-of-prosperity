interface ProsperityBoardOverlayProps {
  era: string;
  showSecondaryRoll: boolean;
  secondaryRoll?: number;
  secondaryRolls: number[];
  superUnlockRevealing: boolean;
  onRollSecondaryDice?: () => void;
}
export default function ProsperityBoardOverlay({
  era, showSecondaryRoll, secondaryRoll, secondaryRolls, superUnlockRevealing, onRollSecondaryDice,
}: ProsperityBoardOverlayProps) {
  return (
    <>
      <style>{`
        @keyframes secondaryRollSettle {
          0% { transform: translateY(-2px) scale(.985); opacity: .72; }
          70% { transform: translateY(0) scale(1.015); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes prosperityEraArrival {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes superUnlockReveal {
          0% { transform: translateY(8px); opacity: 0; }
          62% { transform: translateY(-1px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .prosperity-era-arrival,
          .prosperity-secondary-result,
          .prosperity-super-unlock { animation: none !important; }
        }
      `}</style>
      {/* PROSPERITY REGAL FRAME */}
      {era === "prosperity" && (
        <div
          className="prosperity-era-arrival"
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            borderRadius: "18px",
            pointerEvents: "none",
            animation: "prosperityEraArrival 320ms ease-out",
            border: "4px solid #9C7A32",
            boxShadow: `
              inset 0 0 0 1px #D4B766,
              inset 0 0 0 3px #6F5424,
              inset 0 0 0 5px #B89545,
              0 0 12px rgba(184, 149, 69, 0.45),
              0 0 14px rgba(184, 149, 69, 0.22),
              0 4px 12px rgba(0, 0, 0, 0.32)
            `,
          }}
        >
          {/* INNER DEPTH LINE */}
          <div
            style={{
              position: "absolute",
              inset: "5px",
              borderRadius: "13px",
              border:
                "1px solid rgba(231, 207, 143, 0.75)",
              boxShadow: `
                inset 0 0 0 1px rgba(91, 68, 27, 0.6),
                inset 0 0 0 1px rgba(212, 183, 102, 0.4)
              `,
            }}
          />
          {/* OUTER HIGHLIGHT */}
          <div
            style={{
              position: "absolute",
              inset: "2px",
              borderRadius: "15px",
              border:
                "2px solid rgba(235, 214, 158, 0.65)",
            }}
          />
        </div>
      )}
      {/* PROSPERITY SECONDARY ROLL OVERLAY */}
      {showSecondaryRoll && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background:
              "rgba(8, 12, 20, 0.55)",
          }}
        >
          <div
            style={{
              minWidth: "240px",
              padding: "24px 30px",
              textAlign: "center",
              userSelect: "none",
              background:
                "linear-gradient(145deg, #3b2a0f, #8a6a25 50%, #3b2a0f)",
              border:
                "2px solid #C9A64A",
              borderRadius: "16px",
              boxShadow: `
          0 0 18px rgba(201, 166, 74, 0.35),
          inset 0 0 12px rgba(255, 215, 120, 0.12)
        `,
              color: "#F5E6B3",
            }}
          >
            {/* TITLE */}
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#D8BD72",
                marginBottom: "8px",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.12)",
                borderRadius: "99px",
                padding: "6px 12px",
                display: "inline-block",
              }}
            >
              Era of Prosperity
            </div>
            {/* SECONDARY ROLL */}
            <div
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Secondary Roll
            </div>
            {/* INSTRUCTION */}
            <div
              style={{
                fontSize: "13px",
                color: "#D8BD72",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              Roll All to Unlock Guild Super Ability
            </div>
            {/* COLLECTED NUMBERS */}
            <div
              style={{
                width: "222px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "12px",
                marginLeft: "auto",
                marginRight: "auto",
                boxSizing: "content-box",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((number) => {
                const collected =
                  secondaryRolls?.includes(number) ?? false;
                return (
                  <div
                    key={number}
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "7px",
                      border: collected
                        ? "2px solid #D4AF55"
                        : "1px solid #5B4A2A",
                      background: collected
                        ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                        : "rgba(20, 20, 20, 0.45)",
                      color: collected
                        ? "#FFF8DF"
                        : "rgba(245, 230, 179, 0.35)",
                      fontSize: "14px",
                      fontWeight: "bold",
                      boxShadow: collected
                        ? "0 0 10px rgba(212, 175, 85, 0.35), inset 0 1px 2px rgba(255,255,255,0.25)"
                        : "inset 0 2px 4px rgba(0,0,0,0.4)",
                      transform: collected
                        ? "translateY(-1px)"
                        : "none",
                      transition:
                        "border-color 200ms ease, background 200ms ease, color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
                    }}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
            {/* RESULT / ROLL SLOT */}
            <div
              style={{
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {secondaryRoll !== undefined ? (
                /* RESULT */
                <div
                  className="prosperity-secondary-result"
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    lineHeight: 1,
                    color: "#F5E6B3",
                    textShadow: `
                0 0 6px rgba(255, 220, 130, 0.45),
                0 0 14px rgba(212, 175, 85, 0.35)
              `,
                    animation:
                      "secondaryRollSettle 220ms cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  {secondaryRoll}
                </div>
              ) : (
                /* ROLL BUTTON */
                <button
                  type="button"
                  onClick={onRollSecondaryDice}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "10px",
                    border:
                      "2px solid #D4AF55",
                    background:
                      "linear-gradient(180deg, #D4AF55, #9F7B2F)",
                    color: "#FFF8DF",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow:
                      "0 0 10px rgba(212, 175, 85, 0.35)",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  🎲 Roll Dice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* SUPER UNLOCKED ANNOUNCEMENT */}
      {superUnlockRevealing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background:
              "rgba(8, 12, 20, 0.55)",
          }}
        >
          <div
            className="prosperity-super-unlock"
            style={{
              width: "360px",
              padding: "34px 36px",
              textAlign: "center",
              userSelect: "none",
              background:
                "linear-gradient(145deg, #241805, #6F5424 35%, #B89545 50%, #6F5424 65%, #241805)",
              border:
                "3px solid #D4AF55",
              borderRadius: "20px",
              boxShadow: `
              0 0 20px rgba(212, 175, 85, 0.55),
              0 0 45px rgba(212, 175, 85, 0.28),
              inset 0 0 18px rgba(255, 220, 130, 0.16),
              inset 0 0 0 1px rgba(255, 239, 190, 0.5)
          `,
              color: "#FFF8DF",
              animation:
                "superUnlockReveal 520ms cubic-bezier(.16,.84,.22,1)",
            }}
          >
            {/* TOP ORNAMENT */}
            <div
              style={{
                fontSize: "20px",
                color: "#F5E6B3",
                letterSpacing: "8px",
                marginBottom: "14px",
              }}
            >
              ✦ ✦ ✦
            </div>
            {/* ERA */}
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#D8BD72",
                marginBottom: "14px",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.12)",
                borderRadius: "99px",
                padding: "6px 12px",
                display: "inline-block",
              }}
            >
              Era of Prosperity
            </div>
            {/* MAIN TITLE */}
            <div
              style={{
                fontSize: "30px",
                fontWeight: "900",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#FFF8DF",
                textShadow: `
                0 0 8px rgba(255, 225, 145, 0.65),
                0 0 18px rgba(212, 175, 85, 0.45)
            `,
                marginBottom: "14px",
              }}
            >
              Super Unlocked
            </div>
            {/* MESSAGE */}
            <div
              style={{
                fontSize: "16px",
                lineHeight: 1.5,
                color: "#FFF4D0",
                padding: "0 4px",
              }}
            >
              Available on your next turn.
            </div>
            {/* BOTTOM ORNAMENT */}
            <div
              style={{
                marginTop: "14px",
                fontSize: "20px",
                color: "#F5E6B3",
                letterSpacing: "8px",
              }}
            >
              ✦ ✦ ✦
            </div>
          </div>
        </div>
      )}
    </>
  );
}

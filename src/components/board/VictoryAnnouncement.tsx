import VictoryCelebrationBackground from "./VictoryCelebrationBackground";
import VictoryModal from "./VictoryModal";
interface VictoryAnnouncementProps {
  winnerName?: string;
  guildName?: string;
  visible?: boolean;
  playerColor?: string;
}
export default function VictoryAnnouncement({ winnerName, guildName, visible = false, playerColor }: VictoryAnnouncementProps) {
  const winnerRevealing = visible;
  return (
    <>
    {winnerRevealing && winnerName && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "18px",
          background:
            "rgba(8, 12, 20, 0.55)",
        }}
      >
        <style>
          {`
          /* ===================================================== */
          /* VICTORY ANIMATIONS                                    */
          /* ===================================================== */
            @keyframes victoryConfetti {
              0% {
                transform:
                  translate(0, -30px)
                  rotateX(0deg)
                  rotateY(0deg)
                  rotateZ(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform:
                  translate(var(--drift-x), 650px)
                  rotateX(var(--spin-x))
                  rotateY(var(--spin-y))
                  rotateZ(var(--rotate));
                opacity: 0;
              }
            }
          /* ===================================================== */
          /* GOLD DUST SPARK                                      */
          /* ===================================================== */
          @keyframes victoryGoldSpark {
            0% {
              transform: translate(0, 0) scale(0);
              opacity: 0;
            }
            15% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            45% {
              transform: translate(
                var(--spark-x),
                var(--spark-y)
              ) scale(1.15);
              opacity: 0.9;
            }
            75% {
              transform: translate(
                calc(var(--spark-x) * 1.15),
                calc(var(--spark-y) * 1.15)
              ) scale(0.7);
              opacity: 0.45;
            }
            100% {
              transform: translate(
                calc(var(--spark-x) * 1.3),
                calc(var(--spark-y) * 1.3)
              ) scale(0);
              opacity: 0;
            }
          }
          /* ===================================================== */
          /* FOUR-POINT GOLD SPARKLE                              */
          /* ===================================================== */
          @keyframes victoryGoldStar {
            0% {
              transform: translate(0, 0) scale(0);
              opacity: 0;
            }
            15% {
              transform: translate(0, 0) scale(0.35);
              opacity: 0;
            }
            35% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            60% {
              transform: translate(
                var(--star-x),
                var(--star-y)
              ) scale(1.15);
              opacity: 0.85;
            }
            100% {
              transform: translate(
                calc(var(--star-x) * 1.2),
                calc(var(--star-y) * 1.2)
              ) scale(0);
              opacity: 0;
            }
          }
          /* ===================================================== */
          /* FIREWORK BURST                                       */
          /* ===================================================== */
          @keyframes victoryBurst {
            0% {
              transform: translate(0, 0) scale(0);
              opacity: 0;
            }
            12% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            55% {
              transform: translate(
                var(--burst-x),
                var(--burst-y)
              ) scale(1);
              opacity: 0.9;
            }
            100% {
              transform: translate(
                calc(var(--burst-x) * 1.35),
                calc(var(--burst-y) * 1.35)
              ) scale(0);
              opacity: 0;
            }
          }
          /* ===================================================== */
          /* CELEBRATION CONTAINER                                 */
          /* ===================================================== */
          .victory-celebration {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
          }
          /* ===================================================== */
          /* CONFETTI                                              */
          /* ===================================================== */
          .victory-confetti {
            position: absolute;
            top: -20px;
            width: var(--size);
            height: var(--height);
            left: var(--x);
            background: var(--color);
            border-radius: 2px;
            box-shadow: 0 0 2px rgba(255, 255, 255, 0.18);
            animation:
              victoryConfetti
              var(--duration)
              var(--delay)
              ease-in-out
              infinite;
          }
          /* ===================================================== */
          /* FIREWORK BURST PARTICLES                              */
          /* ===================================================== */
          .victory-burst {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: var(--burst-color);
            box-shadow: 0 0 4px var(--burst-color);
            animation:
              victoryBurst
              var(--burst-duration)
              var(--burst-delay)
              ease-out
              infinite;
          }
        `}
        </style>
        <VictoryCelebrationBackground />
        <VictoryModal winnerName={winnerName} guildName={guildName} playerColor={playerColor} />
      </div>
    )}
    </>
  );
}

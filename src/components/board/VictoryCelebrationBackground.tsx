export default function VictoryCelebrationBackground() {
  return (
    <>
      {/* ========================================================= */}
      {/* CELEBRATION BACKGROUND                                    */}
      {/* ========================================================= */}
      <div className="victory-celebration">
        {/* ======================================================= */}
        {/* CONFETTI                                                */}
        {/* ======================================================= */}
        {[
          [4, 6, 15, "#D4AF55", "3.2s", "0s"],
          [9, 4, 11, "#FFF4D0", "5.4s", "-2s"],
          [14, 7, 17, "#F1D77A", "2.9s", "-1s"],
          [20, 5, 13, "#FFF8DF", "5.8s", "-3s"],
          [27, 6, 16, "#D4AF55", "4.2s", "-1.8s"],
          [34, 4, 12, "#F5E6B3", "3.6s", "-2.5s"],
          [42, 7, 18, "#D4AF55", "6.1s", "-4s"],
          [49, 5, 13, "#FFF0B0", "3.4s", "-1.2s"],
          [57, 6, 16, "#F1D77A", "4.8s", "-3.4s"],
          [65, 4, 12, "#FFF8DF", "5.2s", "-2.1s"],
          [73, 7, 17, "#D4AF55", "3.0s", "-4.5s"],
          [81, 5, 14, "#F5E6B3", "5.6s", "-1.6s"],
          [89, 6, 16, "#F1D77A", "4.0s", "-3s"],
          [96, 4, 11, "#FFF4D0", "6.2s", "-2.8s"],
          [3, 5, 13, "#F1D77A", "3.7s", "-2.3s"],
          [11, 7, 16, "#D4AF55", "5.0s", "-1.1s"],
          [18, 4, 12, "#FFF8DF", "2.8s", "-4s"],
          [26, 6, 15, "#F5E6B3", "4.5s", "-2.7s"],
          [35, 5, 13, "#D4AF55", "5.7s", "-1.9s"],
          [44, 7, 17, "#F1D77A", "3.3s", "-3.5s"],
          [53, 4, 12, "#FFF4D0", "4.4s", "-1.4s"],
          [61, 6, 15, "#D4AF55", "6.0s", "-2.6s"],
          [70, 5, 14, "#FFF8DF", "3.1s", "-4.2s"],
          [78, 7, 17, "#F5E6B3", "5.3s", "-2s"],
          [87, 4, 12, "#F1D77A", "3.8s", "-3.1s"],
          [95, 6, 16, "#D4AF55", "5.9s", "-1.7s"],
          [7, 5, 14, "#FFF4D0", "4.1s", "-1.4s"],
          [16, 6, 18, "#D4AF55", "5.5s", "-3.2s"],
          [23, 4, 12, "#F1D77A", "3.0s", "-0.8s"],
          [30, 7, 16, "#FFF8DF", "4.9s", "-2.2s"],
          [39, 5, 13, "#D4AF55", "6.1s", "-4.1s"],
          [47, 6, 17, "#F5E6B3", "3.2s", "-1.7s"],
          [55, 4, 11, "#FFF0B0", "4.7s", "-3.7s"],
          [63, 7, 18, "#D4AF55", "5.1s", "-2.9s"],
          [69, 5, 14, "#F1D77A", "2.9s", "-0.6s"],
          [76, 6, 16, "#FFF8DF", "4.3s", "-3.8s"],
          [83, 4, 12, "#F5E6B3", "5.8s", "-2.4s"],
          [90, 7, 17, "#D4AF55", "3.5s", "-1.3s"],
          [98, 5, 13, "#FFF4D0", "6.2s", "-4.4s"],
          [52, 6, 15, "#F1D77A", "5.3s", "-0.9s"],
        ].map(
          ([x, size, height, color, duration, delay], index) => {
            const randomDrift = Math.random() * 220 - 110;
            const randomSpinX = Math.random() * 1440 - 720;
            const randomSpinY = Math.random() * 1440 - 720;
            const randomRotation = Math.random() * 720 - 360;
            return (
              <div
                key={`victory-confetti-${index}`}
                className="victory-confetti"
                style={
                  {
                    "--x": `${x}%`,
                    "--size": `${size}px`,
                    "--height": `${height}px`,
                    "--color": color,
                    "--duration": duration,
                    "--delay": delay,
                    "--drift-x": `${randomDrift}px`,
                    "--spin-x": `${randomSpinX}deg`,
                    "--spin-y": `${randomSpinY}deg`,
                    "--rotate": `${randomRotation}deg`,
                  } as React.CSSProperties
                }
                onAnimationIteration={(e) => {
                  const element = e.currentTarget;
                  element.style.setProperty(
                    "--x",
                    `${Math.random() * 100}%`
                  );
                  element.style.setProperty(
                    "--drift-x",
                    `${Math.random() * 220 - 110}px`
                  );
                  element.style.setProperty(
                    "--spin-x",
                    `${Math.random() * 1440 - 720}deg`
                  );
                  element.style.setProperty(
                    "--spin-y",
                    `${Math.random() * 1440 - 720}deg`
                  );
                  element.style.setProperty(
                    "--rotate",
                    `${Math.random() * 720 - 360}deg`
                  );
                }}
              />
            );
          }
        )}
        {/* ======================================================= */}
        {/* > GOLD DUST / SPARKS                                   */}
        {/* ======================================================= */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {/* ===================================================== */}
          {/* >> GOLD DUST                                          */}
          {/* ===================================================== */}
          {[
            [5, 14, 4, 2.4, 0.1, -18, 24],
            [12, 31, 3, 3.7, 1.4, 24, -18],
            [18, 11, 5, 4.2, 2.1, -28, 20],
            [24, 44, 3, 2.9, 0.7, 20, 28],
            [31, 18, 4, 3.8, 2.8, -22, -25],
            [38, 8, 3, 4.6, 1.2, 30, 18],
            [44, 35, 5, 3.2, 3.1, -26, 30],
            [51, 13, 3, 4.1, 0.4, 18, -22],
            [58, 42, 4, 3.5, 2.3, 28, 20],
            [64, 20, 3, 4.8, 1.7, -24, -28],
            [71, 9, 5, 3.1, 3.6, 26, 24],
            [77, 34, 3, 4.4, 0.9, -30, 18],
            [84, 16, 4, 3.6, 2.6, 22, -24],
            [91, 29, 3, 4.9, 1.5, -20, 30],
            [96, 11, 5, 3.3, 3.9, 28, -18],
            [7, 63, 3, 4.3, 2.2, -26, -20],
            [14, 82, 5, 3.4, 0.6, -26, -20],
            [21, 57, 3, 4.7, 3.4, 30, 24],
            [28, 91, 4, 3.1, 1.1, -18, -30],
            [35, 69, 3, 4.5, 2.7, 25, 22],
            [42, 84, 5, 3.8, 0.3, -28, 18],
            [49, 61, 3, 4.2, 1.9, 20, -26],
            [56, 93, 4, 3.6, 3.2, 28, -20],
            [63, 73, 3, 4.9, 0.8, -24, 28],
            [70, 88, 5, 3.3, 2.5, 18, -24],
            [78, 64, 3, 4.1, 1.6, -30, 20],
            [85, 81, 4, 3.7, 3.7, 24, 26],
            [93, 69, 3, 4.6, 0.5, -20, -28],
            [98, 91, 5, 3.2, 2.9, 30, 18],
            [8, 42, 3, 5.1, 1.3, -26, 20],
            [16, 49, 4, 3.5, 3.5, 24, -28],
            [26, 32, 3, 4.4, 2.0, -20, 26],
            [33, 52, 5, 3.9, 0.2, 28, -18],
            [67, 48, 3, 4.7, 2.8, -30, 22],
            [74, 55, 4, 3.3, 1.0, 20, -24],
            [88, 45, 5, 4.0, 3.3, -24, 28],
          ].map(
            (
              [x, y, size, duration, delay, sparkX, sparkY],
              index
            ) => (
              <div
                key={`gold-spark-${index}`}
                onAnimationIteration={(e) => {
                  const element = e.currentTarget;
                  element.style.left = `${Math.random() * 100}%`;
                  element.style.top = `${Math.random() * 100}%`;
                  element.style.setProperty(
                    "--spark-x",
                    `${Math.random() * 60 - 30}px`
                  );
                  element.style.setProperty(
                    "--spark-y",
                    `${Math.random() * 60 - 30}px`
                  );
                }}
                style={
                  {
                    position: "absolute",
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: "50%",
                    background:
                      index % 5 === 0
                        ? "#FFF8DF"
                        : index % 3 === 0
                          ? "#F1D77A"
                          : "#D4AF55",
                    boxShadow:
                      "0 0 5px #F1D77A, 0 0 12px rgba(212,175,85,0.75)",
                    animation:
                      `victoryGoldSpark ${duration}s ${delay}s ease-out infinite`,
                    "--spark-x": `${sparkX}px`,
                    "--spark-y": `${sparkY}px`,
                  } as React.CSSProperties
                }
              />
            )
          )}
          {/* ===================================================== */}
          {/* >> LARGER FOUR-POINT SPARKLES                        */}
          {/* ===================================================== */}
          {[
            [9, 24, 2.8, 0.2, -24, 18],
            [22, 72, 3.7, 1.6, 20, -26],
            [37, 27, 3.2, 2.4, -18, 24],
            [63, 31, 4.1, 0.8, 28, 20],
            [79, 76, 3.4, 2.9, -25, -20],
            [94, 57, 3.9, 1.3, -20, 26],
          ].map(
            (
              [x, y, duration, delay, starX, starY],
              index
            ) => (
              <div
                key={`gold-star-${index}`}
                onAnimationIteration={(e) => {
                  const element = e.currentTarget;
                  element.style.left = `${Math.random() * 100}%`;
                  element.style.top = `${Math.random() * 100}%`;
                  element.style.setProperty(
                    "--star-x",
                    `${Math.random() * 60 - 30}px`
                  );
                  element.style.setProperty(
                    "--star-y",
                    `${Math.random() * 60 - 30}px`
                  );
                }}
                style={
                  {
                    position: "absolute",
                    left: `${x}%`,
                    top: `${y}%`,
                    width: "18px",
                    height: "18px",
                    "--star-x": `${starX}px`,
                    "--star-y": `${starY}px`,
                    animation:
                      `victoryGoldStar ${duration}s ${delay}s ease-out infinite`,
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "3px",
                    height: "18px",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(to bottom, transparent, #FFF8DF, transparent)",
                    boxShadow: "0 0 8px #F1D77A",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "18px",
                    height: "3px",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(to right, transparent, #FFF8DF, transparent)",
                    boxShadow: "0 0 8px #F1D77A",
                  }}
                />
              </div>
            )
          )}
          {/* ===================================================== */}
          {/* >> FIREWORK BURSTS                                    */}
          {/* ===================================================== */}
          {[
            [8, 22, "#FFF4D0", "1.8s", "0s"],
            [18, 54, "#D4AF55", "3.7s", "1.2s"],
            [29, 17, "#F1D77A", "2.4s", "0.5s"],
            [41, 43, "#FFF8DF", "4.6s", "2.1s"],
            [53, 25, "#D4AF55", "3.1s", "0.8s"],
            [64, 61, "#F1D77A", "5.0s", "1.7s"],
            [75, 19, "#FFF4D0", "2.0s", "0.3s"],
            [84, 47, "#D4AF55", "4.2s", "2.5s"],
            [92, 29, "#F1D77A", "3.4s", "1.0s"],
            [97, 72, "#FFF8DF", "5.4s", "2.8s"],
          ].map(
            ([x, y, color, duration, delay], burstIndex) => (
              <div
                key={`firework-burst-${burstIndex}`}
                onAnimationIteration={(e) => {
                  const element = e.currentTarget;
                  let x = Math.random() * 100;
                  let y = Math.random() * 100;
                  // =========================================================
                  // CENTER NO-BURST ZONE
                  // =========================================================
                  while (
                    x >= 26 &&
                    x <= 74 &&
                    y >= 22 &&
                    y <= 78
                  ) {
                    x = Math.random() * 100;
                    y = Math.random() * 100;
                  }
                  element.style.left = `${x}%`;
                  element.style.top = `${y}%`;
                }}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: "0px",
                  height: "0px",
                }}
              >
                {Array.from({ length: 12 }).map(
                  (_, particleIndex) => {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 35 + Math.random() * 40;
                    return (
                      <div
                        key={`burst-particle-${burstIndex}-${particleIndex}`}
                        className="victory-burst"
                        style={
                          {
                            "--burst-color": color,
                            "--burst-duration": duration,
                            "--burst-delay": delay,
                            "--burst-x": `${Math.cos(angle) * distance
                              }px`,
                            "--burst-y": `${Math.sin(angle) * distance
                              }px`,
                          } as React.CSSProperties
                        }
                      />
                    );
                  }
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

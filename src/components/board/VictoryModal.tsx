interface VictoryModalProps {
  winnerName: string;
  guildName?: string;
  playerColor?: string;
}
export default function VictoryModal({ winnerName, guildName, playerColor }: VictoryModalProps) {
  return (
    <>
      {/* ========================================================= */}
      {/* VICTORY MODAL                                             */}
      {/* ========================================================= */}
      <div
        className="feedback-victory-modal-arrival"
        style={{
          position: "relative",
          zIndex: 50,
          width: "420px",
          padding: "40px",
          textAlign: "center",
          userSelect: "none",
          background:
            "linear-gradient(145deg, #241805, #6F5424 35%, #B89545 50%, #6F5424 65%, #241805)",
          border: "3px solid #D4AF55",
          borderRadius: "20px",
          boxShadow: `
            0 0 20px rgba(212, 175, 85, 0.60),
            0 0 45px rgba(212, 175, 85, 0.30),
            0 0 80px rgba(212, 175, 85, 0.16),
            inset 0 0 18px rgba(255, 220, 130, 0.16),
            inset 0 0 0 1px rgba(255, 239, 190, 0.5)
          `,
          color: "#FFF8DF",
        }}
      >
        {/* ===================================================== */}
        {/* TOP ORNAMENT                                          */}
        {/* ===================================================== */}
        <div
          style={{
            fontSize: "22px",
            color: "#F5E6B3",
            letterSpacing: "10px",
            marginBottom: "22px",
          }}
        >
          ✦ ✦ ✦
        </div>
        {/* ===================================================== */}
        {/* ERA                                                   */}
        {/* ===================================================== */}
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#D8BD72",
            margin: "0px",
            fontWeight: "bold",
            background: "rgba(0, 0, 0, 0.12)",
            borderRadius: "99px",
            padding: "6px 14px",
            display: "inline-block",
          }}
        >
          Era of Prosperity
        </div>
        {/* ===================================================== */}
        {/* MAIN TITLE                                             */}
        {/* ===================================================== */}
        <div
          style={{
            fontSize: "34px",
            fontWeight: "900",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FFF8DF",
            margin: "0px 0px 8px",
          }}
        >
          Victory
        </div>
        {/* ===================================================== */}
        {/* DIVIDER                                            */}
        {/* ===================================================== */}
        <hr
          style={{
            width: "72%",
            height: "1px",
            margin: "12px auto",
            border: "none",
            borderRadius: "999px",
            background:
              "linear-gradient(to right, transparent, #D4AF55 20%, #FFF4D0 50%, #D4AF55 80%, transparent)",
            boxShadow: "0 0 8px rgba(212, 175, 85, 0.45)",
            opacity: 0.8,
          }}
        />
        {/* ===================================================== */}
        {/* GUILD NAME                                            */}
        {/* ===================================================== */}
        {guildName && (
          <div
            style={{
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#D8BD72",
              margin: "12px 0px",
            }}
          >
            {guildName} GUILD
          </div>
        )}
        {/* ===================================================== */}
        {/* WINNER NAME                                           */}
        {/* ===================================================== */}
        <div
          style={{
            fontSize: "42px",
            fontWeight: "900",
            letterSpacing: "2px",
            color: "#FFF4D0",
            margin: "0px",
            background: "rgba(0, 0, 0, 0.22)",
            border: `5px solid ${playerColor}`,
            borderRadius: "999px",
            padding: "13px 37px",
            display: "inline-block",
            opacity: 0.9,
          }}
        >
          {winnerName}
        </div>
        {/* ===================================================== */}
        {/* MESSAGE                                               */}
        {/* ===================================================== */}
        <div
          style={{
            fontSize: "14px",
            color: "#D8BD72",
            letterSpacing: "1px",
            margin: "12px 0px 0px"
          }}
        >
          has won the game!
        </div>
        {/* ===================================================== */}
        {/* BOTTOM ORNAMENT                                       */}
        {/* ===================================================== */}
        <div
          style={{
            marginTop: "22px",
            fontSize: "22px",
            color: "#F5E6B3",
            letterSpacing: "10px",
          }}
        >
          ✦ ✦ ✦
        </div>
      </div>
    </>
  );
}

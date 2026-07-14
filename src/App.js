import { useState, useEffect } from "react";

// ---------- design tokens ----------
const C = {
  petal: "#F7E7EE", // page background
  ivory: "#FFFDFB", // cards
  wine: "#5E1B36", // deep berry ink
  rose: "#D96C8F", // primary accent
  blush: "#F2C4D3", // soft fill
  gold: "#B98A4A", // metallic hairlines
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@400;500;600&display=swap');
@keyframes heartPop { 0%{transform:scale(0.4)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }
@keyframes fadeUp { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const TASKS = [
  { id: 0, title: "Workout №1", sub: "45 minutes · your pick" },
  { id: 1, title: "Workout №2", sub: "45 minutes · outdoors, rain or shine" },
  { id: 2, title: "Stick to the diet", sub: "no cheat meals · zero alcohol" },
  { id: 3, title: "Gallon of water", sub: "tap the drops below · hydrated & unbothered" },
  { id: 4, title: "Read 10 pages", sub: "nonfiction · CEO brain hours" },
  { id: 5, title: "Progress photo", sub: "document the glow-up" },
];

const CUPS = 16; // 16 × 8oz = 1 gallon
const STORAGE_KEY = "seventyfive-hard-girlypop";

// ---------- little pieces ----------
function Heart({ filled, size = 18, color = C.rose, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.9-10-9.3C.4 8.6 1.6 5 5 4.2c2.1-.5 4.1.4 5.2 2 .4.6 1.2.6 1.6 0 1.1-1.6 3.1-2.5 5.2-2 3.4.8 4.6 4.4 3 7.5C19.5 16.1 12 21 12 21z"
        fill={filled ? color : "none"}
        stroke={filled ? color : "#E3B9C8"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Drop({ filled, onClick, index }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Water cup ${index + 1} ${filled ? "done" : "not done"}`}
      style={{
        background: "none", border: "none", padding: 2, cursor: "pointer", lineHeight: 0,
      }}
    >
      <svg width="20" height="24" viewBox="0 0 20 24" aria-hidden="true">
        <path
          d="M10 1C10 1 2.5 11 2.5 16a7.5 7.5 0 0 0 15 0C17.5 11 10 1 10 1z"
          fill={filled ? C.rose : "none"}
          stroke={filled ? C.rose : "#E3B9C8"}
          strokeWidth="1.6"
          style={filled ? { animation: "heartPop .25s ease" } : {}}
        />
      </svg>
    </button>
  );
}

// ---------- main app ----------
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [day, setDay] = useState(1); // current day, 1–75
  const [tasks, setTasks] = useState(Array(6).fill(false));
  const [water, setWater] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) {
          const s = JSON.parse(res.value);
          setDay(s.day ?? 1);
          setTasks(s.tasks ?? Array(6).fill(false));
          setWater(s.water ?? 0);
        }
      } catch (e) { /* first visit — nothing saved yet */ }
      setLoaded(true);
    })();
  }, []);

  // save
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ day, tasks, water }));
      } catch (e) { console.error("save failed", e); }
    })();
  }, [day, tasks, water, loaded]);

  const toggleTask = (i) => {
    if (i === 3) return; // water auto-completes via drops
    setTasks((t) => t.map((v, idx) => (idx === i ? !v : v)));
  };

  const tapDrop = (i) => {
    const next = i < water ? i : i + 1;
    setWater(next);
    setTasks((t) => t.map((v, idx) => (idx === 3 ? next >= CUPS : v)));
  };

  const allDone = tasks.every(Boolean);
  const completedDays = day - 1;
  const finished = day > 75;

  const lockInDay = () => {
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 900);
    setDay((d) => d + 1);
    setTasks(Array(6).fill(false));
    setWater(0);
  };

  const restart = () => {
    setDay(1);
    setTasks(Array(6).fill(false));
    setWater(0);
    setConfirmReset(false);
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: C.petal, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", color: C.wine }}>
        loading your era…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.petal, color: C.wine, fontFamily: "'Jost', sans-serif", padding: "0 0 64px" }}>
      <style>{FONTS}</style>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 20px" }}>
        {/* header */}
        <header style={{ textAlign: "center", paddingTop: 44, animation: "fadeUp .5s ease" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>
            The 75 Hard Challenge
          </div>
          <h1 style={{ fontFamily: "'Italiana', serif", fontWeight: 400, fontSize: 44, margin: "10px 0 2px", letterSpacing: "0.04em" }}>
            {finished ? "Seventy-Five" : `Day ${day}`}
          </h1>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: C.rose }}>
            {finished ? "complete. iconic behavior." : `of seventy-five · ${completedDays} locked in`}
          </div>
          <div style={{ width: 56, height: 1, background: C.gold, margin: "18px auto 0", opacity: 0.6 }} />
        </header>

        {finished ? (
          /* ---------- finale ---------- */
          <div style={{ textAlign: "center", marginTop: 40, animation: "fadeUp .5s ease" }}>
            <div style={{ fontSize: 52 }}>👑</div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.5, margin: "16px 0 28px" }}>
              75 days. Zero excuses.<br />You kept every promise to yourself.
            </p>
            <button onClick={restart} style={btnStyle(true)}>Run it back →</button>
          </div>
        ) : (
          <>
            {/* ---------- today's checklist ---------- */}
            <section style={{ marginTop: 28 }}>
              {TASKS.map((task, i) => {
                const done = tasks[i];
                return (
                  <div
                    key={task.id}
                    style={{
                      background: C.ivory,
                      borderRadius: 16,
                      padding: "14px 16px",
                      marginBottom: 10,
                      boxShadow: "0 1px 4px rgba(94,27,54,0.06)",
                      border: `1px solid ${done ? C.blush : "rgba(94,27,54,0.05)"}`,
                      transition: "border-color .2s",
                    }}
                  >
                    <button
                      onClick={() => toggleTask(i)}
                      aria-pressed={done}
                      style={{
                        display: "flex", alignItems: "center", gap: 14, width: "100%",
                        background: "none", border: "none", padding: 0, cursor: i === 3 ? "default" : "pointer",
                        textAlign: "left", fontFamily: "inherit", color: "inherit",
                      }}
                    >
                      <span style={done ? { animation: "heartPop .3s ease", display: "inline-flex" } : { display: "inline-flex" }}>
                        <Heart filled={done} size={22} />
                      </span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: "block", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em", textDecoration: done ? "line-through" : "none", textDecorationColor: C.rose, opacity: done ? 0.55 : 1 }}>
                          {task.title}
                        </span>
                        <span style={{ display: "block", fontSize: 12.5, color: "#9A6B7E", marginTop: 2 }}>
                          {task.sub}
                        </span>
                      </span>
                    </button>

                    {/* water drops */}
                    {i === 3 && (
                      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10, marginLeft: 34 }}>
                        {Array.from({ length: CUPS }).map((_, d) => (
                          <Drop key={d} index={d} filled={d < water} onClick={() => tapDrop(d)} />
                        ))}
                        <span style={{ fontSize: 11.5, color: "#9A6B7E", alignSelf: "center", marginLeft: 8 }}>
                          {water}/{CUPS} cups
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* lock in button */}
              <button onClick={allDone ? lockInDay : undefined} disabled={!allDone} style={btnStyle(allDone)}>
                {allDone ? `Lock in day ${day} 💅` : `${tasks.filter(Boolean).length} of 6 — keep going`}
              </button>
              {justCompleted && (
                <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: C.rose, marginTop: 10, animation: "fadeUp .3s ease" }}>
                  served. see you tomorrow ✨
                </div>
              )}
            </section>

            {/* ---------- 75-heart grid ---------- */}
            <section style={{ marginTop: 36 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 14, fontWeight: 500 }}>
                The Journey
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, justifyItems: "center", background: C.ivory, borderRadius: 20, padding: "18px 14px", boxShadow: "0 1px 4px rgba(94,27,54,0.06)" }}>
                {Array.from({ length: 75 }).map((_, i) => (
                  <Heart
                    key={i}
                    filled={i < completedDays}
                    size={17}
                    color={i === day - 1 ? C.wine : C.rose}
                    style={i === day - 1 ? { filter: "drop-shadow(0 0 3px rgba(217,108,143,0.7))" } : {}}
                  />
                ))}
              </div>
            </section>

            {/* ---------- restart ---------- */}
            <section style={{ textAlign: "center", marginTop: 30 }}>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} style={{ background: "none", border: "none", color: "#B08699", fontSize: 12.5, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  missed a task? restart from day 1
                </button>
              ) : (
                <div style={{ animation: "fadeUp .3s ease" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, marginBottom: 12 }}>
                    Rules are rules, queen — back to day one?
                  </p>
                  <button onClick={restart} style={{ ...btnStyle(true), width: "auto", padding: "10px 22px", marginRight: 10, display: "inline-block" }}>
                    Yes, restart
                  </button>
                  <button onClick={() => setConfirmReset(false)} style={{ background: "none", border: `1px solid ${C.blush}`, borderRadius: 999, padding: "10px 22px", color: C.wine, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
                    Never mind
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        <footer style={{ textAlign: "center", marginTop: 44, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#B08699" }}>
          hot girls keep promises to themselves
        </footer>
      </div>
    </div>
  );
}

function btnStyle(active) {
  return {
    display: "block",
    width: "100%",
    marginTop: 16,
    padding: "15px 20px",
    borderRadius: 999,
    border: "none",
    background: active ? `linear-gradient(120deg, ${C.rose}, ${C.wine})` : "#EDD5DE",
    color: active ? "#FFF" : "#B08699",
    fontFamily: "'Jost', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.06em",
    cursor: active ? "pointer" : "default",
    boxShadow: active ? "0 6px 18px rgba(94,27,54,0.25)" : "none",
    transition: "all .25s ease",
  };
}


import { useState, useEffect, useRef } from "react";

// ---------- design tokens (unchanged) ----------
const C = {
  petal: "#F7E7EE",
  ivory: "#FFFDFB",
  wine: "#5E1B36",
  rose: "#D96C8F",
  blush: "#F2C4D3",
  gold: "#B98A4A",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@400;500;600&display=swap');
@keyframes heartPop { 0%{transform:scale(0.4)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }
@keyframes fadeUp { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
@keyframes shakeNo { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-7px)} 50%{transform:translateX(7px)} 75%{transform:translateX(-4px)} }
@keyframes pulseSoft { 0%,100%{opacity:1} 50%{opacity:0.45} }
input::placeholder { color: #C79AAC; font-style: italic; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

const TASKS = [
  { id: 0, title: "Workout №1", sub: "45 minutes · your pick" },
  { id: 1, title: "Workout №2", sub: "45 minutes · outdoors, rain or shine" },
  { id: 2, title: "Stick to the diet", sub: "no cheat meals · zero alcohol" },
  { id: 3, title: "Gallon of water", sub: "tap the drops below · hydrated & unbothered" },
  { id: 4, title: "Read 10 pages", sub: "fiction or nonfiction · main character reading hours" },
  { id: 5, title: "Progress photo", sub: "add it in the Vault · for your eyes only" },
];

const CUPS = 16;
const STORAGE_KEY = "seventyfive-hard-girlypop-v3";
const PHOTO_PREFIX = "sfhg-photo-";

// ---------- shared styles ----------
const eyebrow = { fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 14, fontWeight: 500 };
const card = { background: C.ivory, borderRadius: 20, padding: "18px 16px", boxShadow: "0 1px 4px rgba(94,27,54,0.06)" };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: `1px solid ${C.blush}`, padding: "7px 2px", fontFamily: "'Jost', sans-serif", fontSize: 14, color: C.wine, outline: "none" };
const linkBtn = { background: "none", border: "none", color: "#B08699", fontSize: 12.5, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 };
const pmBtn = { width: 52, height: 52, borderRadius: "50%", border: `1px solid ${C.blush}`, background: C.petal, fontFamily: "'Italiana', serif", fontSize: 26, color: C.wine, cursor: "pointer", boxShadow: "0 1px 3px rgba(94,27,54,0.08)" };

function btnStyle(active) {
  return {
    display: "block", width: "100%", marginTop: 16, padding: "15px 20px", borderRadius: 999, border: "none",
    background: active ? `linear-gradient(120deg, ${C.rose}, ${C.wine})` : "#EDD5DE",
    color: active ? "#FFF" : "#B08699",
    fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.06em",
    cursor: active ? "pointer" : "default",
    boxShadow: active ? "0 6px 18px rgba(94,27,54,0.25)" : "none",
    transition: "all .25s ease",
  };
}

// ---------- little pieces ----------
function Heart({ filled, size = 18, color = C.rose, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.9-10-9.3C.4 8.6 1.6 5 5 4.2c2.1-.5 4.1.4 5.2 2 .4.6 1.2.6 1.6 0 1.1-1.6 3.1-2.5 5.2-2 3.4.8 4.6 4.4 3 7.5C19.5 16.1 12 21 12 21z"
        fill={filled ? color : "none"} stroke={filled ? color : "#E3B9C8"} strokeWidth="1.6"
      />
    </svg>
  );
}

function Drop({ filled, onClick, index }) {
  return (
    <button onClick={onClick} aria-label={`Water cup ${index + 1} ${filled ? "done" : "not done"}`}
      style={{ background: "none", border: "none", padding: 2, cursor: "pointer", lineHeight: 0 }}>
      <svg width="20" height="24" viewBox="0 0 20 24" aria-hidden="true">
        <path d="M10 1C10 1 2.5 11 2.5 16a7.5 7.5 0 0 0 15 0C17.5 11 10 1 10 1z"
          fill={filled ? C.rose : "none"} stroke={filled ? C.rose : "#E3B9C8"} strokeWidth="1.6"
          style={filled ? { animation: "heartPop .25s ease" } : {}} />
      </svg>
    </button>
  );
}

function LockIcon({ size = 14, color = C.gold, open = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2.5" />
      {open ? <path d="M8 10V7a4 4 0 0 1 7.5-2" /> : <path d="M8 10V7a4 4 0 0 1 8 0v3" />}
    </svg>
  );
}

// reusable pin pad — onComplete returns false to shake & clear, true to accept
function PinPad({ prompt, subtext, onComplete }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const press = (k) => {
    if (k === "back") { setPin((p) => p.slice(0, -1)); return; }
    const next = (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      const ok = onComplete(next);
      if (ok === false) {
        setShake(true);
        setTimeout(() => { setPin(""); setShake(false); }, 400);
      } else {
        setPin("");
      }
    }
  };
  return (
    <div style={{ ...card, padding: "30px 20px", textAlign: "center", animation: shake ? "shakeNo .35s ease" : "fadeUp .4s ease" }}>
      <LockIcon size={26} color={C.rose} />
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, marginTop: 10 }}>
        {prompt}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, margin: "20px 0 26px" }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: i < pin.length ? C.rose : "transparent", border: `1.6px solid ${shake ? C.wine : C.rose}`, transition: "background .15s" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 68px)", gap: 12, justifyContent: "center" }}>
        {["1","2","3","4","5","6","7","8","9","","0","back"].map((k, i) =>
          k === "" ? <span key={i} /> : (
            <button key={i} onClick={() => press(k)} aria-label={k === "back" ? "Delete digit" : k}
              style={{ width: 68, height: 68, borderRadius: "50%", border: `1px solid ${C.blush}`, background: C.petal, fontFamily: "'Italiana', serif", fontSize: k === "back" ? 20 : 26, color: C.wine, cursor: "pointer", boxShadow: "0 1px 3px rgba(94,27,54,0.08)" }}>
              {k === "back" ? "⌫" : k}
            </button>
          )
        )}
      </div>
      {subtext && <div style={{ fontSize: 11.5, color: "#B08699", marginTop: 22, fontStyle: "italic" }}>{subtext}</div>}
    </div>
  );
}

// downscale an image file so it stays small enough to save & send
function resizeImage(file, max = 700) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- AI: photo → calories (built-in Claude API, no key needed) ----------
async function analyzeFoodPhoto(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            {
              type: "text",
              text: `Identify the foods in this photo and estimate portions and nutrition. Respond with ONLY valid JSON, no markdown fences, no extra text, in exactly this shape:
{"meal":"short name for the meal","items":[{"name":"food item","portion":"estimated portion","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0}],"total":{"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0},"note":"one short friendly sentence"}
If the photo does not contain food, return {"error":"no food detected"}.`,
            },
          ],
        },
      ],
    }),
  });
  const data = await response.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ---------- main app ----------
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today"); // today | book | food | vault
  const [day, setDay] = useState(1);
  const [tasks, setTasks] = useState(Array(6).fill(false));
  const [water, setWater] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState(["", ""]);
  const [book, setBook] = useState({ title: "", genre: "fiction", page: 0 });
  const [photoMeta, setPhotoMeta] = useState([]);
  const [passcode, setPasscode] = useState("1234");
  const [foodLog, setFoodLog] = useState([]); // today's meals
  const [confirmReset, setConfirmReset] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // vault session state
  const [unlocked, setUnlocked] = useState(false);
  const [vaultView, setVaultView] = useState("grid"); // grid | newpin | confirmpin
  const [tempPin, setTempPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);
  const [photos, setPhotos] = useState({});
  const [vaultBusy, setVaultBusy] = useState(false);
  const fileRef = useRef(null);

  // food cam session state
  const [foodBusy, setFoodBusy] = useState(false);
  const [foodError, setFoodError] = useState("");
  const foodFileRef = useRef(null);

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
          setWorkoutLogs(s.workoutLogs ?? ["", ""]);
          setBook(s.book ?? { title: "", genre: "fiction", page: 0 });
          setPhotoMeta(s.photoMeta ?? []);
          setPasscode(s.passcode ?? "1234");
          setFoodLog(s.foodLog ?? []);
        }
      } catch (e) { /* first visit */ }
      setLoaded(true);
    })();
  }, []);

  // save
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ day, tasks, water, workoutLogs, book, photoMeta, passcode, foodLog }));
      } catch (e) { console.error("save failed", e); }
    })();
  }, [day, tasks, water, workoutLogs, book, photoMeta, passcode, foodLog, loaded]);

  // fetch photo images once vault opens
  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      const next = {};
      for (const m of photoMeta) {
        if (photos[m.id]) { next[m.id] = photos[m.id]; continue; }
        try {
          const res = await window.storage.get(PHOTO_PREFIX + m.id);
          if (res?.value) next[m.id] = res.value;
        } catch (e) { /* missing */ }
      }
      setPhotos(next);
    })();
  }, [unlocked, photoMeta]); // eslint-disable-line

  const toggleTask = (i) => {
    if (i === 3) return;
    if (i === 5) { setTab("vault"); return; }
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
    setWorkoutLogs(["", ""]);
    setFoodLog([]);
  };

  const restart = () => {
    setDay(1);
    setTasks(Array(6).fill(false));
    setWater(0);
    setWorkoutLogs(["", ""]);
    setFoodLog([]);
    setConfirmReset(false);
  };

  // vault actions
  const addPhoto = async (file) => {
    if (!file) return;
    setVaultBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      const id = Date.now().toString(36);
      await window.storage.set(PHOTO_PREFIX + id, dataUrl);
      const meta = { id, day: Math.min(day, 75), date: new Date().toLocaleDateString() };
      setPhotoMeta((m) => [meta, ...m]);
      setPhotos((p) => ({ ...p, [id]: dataUrl }));
      setTasks((t) => t.map((v, idx) => (idx === 5 ? true : v)));
    } catch (e) { console.error("photo save failed", e); }
    setVaultBusy(false);
  };

  const deletePhoto = async (id) => {
    setPhotoMeta((m) => m.filter((x) => x.id !== id));
    setPhotos((p) => { const n = { ...p }; delete n[id]; return n; });
    try { await window.storage.delete(PHOTO_PREFIX + id); } catch (e) { /* gone */ }
  };

  // food cam actions
  const scanFood = async (file) => {
    if (!file) return;
    setFoodBusy(true);
    setFoodError("");
    try {
      const dataUrl = await resizeImage(file, 900);
      const result = await analyzeFoodPhoto(dataUrl);
      if (result.error) {
        setFoodError("Couldn't spot any food in that one — try a clearer shot of the plate.");
      } else {
        setFoodLog((f) => [{ id: Date.now().toString(36), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...result }, ...f]);
      }
    } catch (e) {
      setFoodError("Hmm, the scan didn't go through. Give it another try in a sec.");
    }
    setFoodBusy(false);
  };

  const dayCalories = foodLog.reduce((sum, m) => sum + (m.total?.calories || 0), 0);
  const dayMacro = (key) => foodLog.reduce((sum, m) => sum + (m.total?.[key] || 0), 0);

  // compare photos: earliest vs latest
  const oldest = photoMeta.length ? photoMeta[photoMeta.length - 1] : null;
  const newest = photoMeta.length > 1 ? photoMeta[0] : null;

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
        {/* ---------- header ---------- */}
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

        {/* ---------- tabs ---------- */}
        <nav style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 22, flexWrap: "wrap" }}>
          {[
            { id: "today", label: "Today" },
            { id: "book", label: "Book Club" },
            { id: "food", label: "Cal Cam" },
            { id: "vault", label: "Vault", lock: true },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                  fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.05em",
                  border: `1px solid ${active ? "transparent" : C.blush}`,
                  background: active ? `linear-gradient(120deg, ${C.rose}, ${C.wine})` : C.ivory,
                  color: active ? "#FFF" : C.wine,
                  boxShadow: active ? "0 4px 12px rgba(94,27,54,0.22)" : "none",
                  transition: "all .2s ease",
                }}>
                {t.label}
                {t.lock && <LockIcon size={12} color={active ? "#F6D9A8" : C.gold} open={unlocked} />}
              </button>
            );
          })}
        </nav>

        {/* ================= TODAY ================= */}
        {finished && tab === "today" ? (
          <div style={{ textAlign: "center", marginTop: 40, animation: "fadeUp .5s ease" }}>
            <div style={{ fontSize: 52 }}>👑</div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.5, margin: "16px 0 28px" }}>
              75 days. Zero excuses.<br />You kept every promise to yourself.
            </p>
            <button onClick={restart} style={btnStyle(true)}>Run it back →</button>
          </div>
        ) : tab === "today" ? (
          <>
            <section style={{ marginTop: 24 }}>
              {TASKS.map((task, i) => {
                const done = tasks[i];
                return (
                  <div key={task.id}
                    style={{ background: C.ivory, borderRadius: 16, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 4px rgba(94,27,54,0.06)", border: `1px solid ${done ? C.blush : "rgba(94,27,54,0.05)"}`, transition: "border-color .2s" }}>
                    <button onClick={() => toggleTask(i)} aria-pressed={done}
                      style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: "none", border: "none", padding: 0, cursor: i === 3 ? "default" : "pointer", textAlign: "left", fontFamily: "inherit", color: "inherit" }}>
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

                    {(i === 0 || i === 1) && (
                      <div style={{ marginTop: 8, marginLeft: 36 }}>
                        <input
                          value={workoutLogs[i]}
                          onChange={(e) => setWorkoutLogs((w) => w.map((v, idx) => (idx === i ? e.target.value : v)))}
                          placeholder="log it — pilates, power walk, hot girl run…"
                          style={inputStyle}
                        />
                      </div>
                    )}

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

              <button onClick={allDone ? lockInDay : undefined} disabled={!allDone} style={btnStyle(allDone)}>
                {allDone ? `Lock in day ${day} 💅` : `${tasks.filter(Boolean).length} of 6 — keep going`}
              </button>
              {justCompleted && (
                <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: C.rose, marginTop: 10, animation: "fadeUp .3s ease" }}>
                  served. see you tomorrow ✨
                </div>
              )}
            </section>

            <section style={{ marginTop: 36 }}>
              <div style={eyebrow}>The Journey</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, justifyItems: "center", ...card, padding: "18px 14px" }}>
                {Array.from({ length: 75 }).map((_, i) => (
                  <Heart key={i} filled={i < completedDays} size={17}
                    color={i === day - 1 ? C.wine : C.rose}
                    style={i === day - 1 ? { filter: "drop-shadow(0 0 3px rgba(217,108,143,0.7))" } : {}} />
                ))}
              </div>
            </section>

            <section style={{ textAlign: "center", marginTop: 30 }}>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} style={linkBtn}>
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
        ) : tab === "book" ? (
          /* ================= BOOK CLUB ================= */
          <section style={{ marginTop: 28, animation: "fadeUp .4s ease" }}>
            <div style={eyebrow}>Book Club</div>
            <div style={card}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 500, marginBottom: 4 }}>
                Currently reading
              </label>
              <input
                value={book.title}
                onChange={(e) => setBook((b) => ({ ...b, title: e.target.value }))}
                placeholder="the book of the moment…"
                style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                {["fiction", "nonfiction"].map((g) => {
                  const active = book.genre === g;
                  return (
                    <button key={g} onClick={() => setBook((b) => ({ ...b, genre: g }))}
                      style={{ flex: 1, padding: "9px 0", borderRadius: 999, cursor: "pointer", fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 12.5, letterSpacing: "0.08em", border: `1px solid ${active ? "transparent" : C.blush}`, background: active ? `linear-gradient(120deg, ${C.rose}, ${C.wine})` : "transparent", color: active ? "#FFF" : "#9A6B7E", transition: "all .2s ease" }}>
                      {g === "nonfiction" ? "Non-fiction" : "Fiction"}
                    </button>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: 26 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>
                  Current page
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 8 }}>
                  <button onClick={() => setBook((b) => ({ ...b, page: Math.max(0, b.page - 1) }))} aria-label="Page down" style={pmBtn}>−</button>
                  <div style={{ fontFamily: "'Italiana', serif", fontSize: 46, minWidth: 90 }}>{book.page}</div>
                  <button onClick={() => setBook((b) => ({ ...b, page: b.page + 1 }))} aria-label="Page up" style={pmBtn}>+</button>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#B08699", marginTop: 6 }}>
                  ten pages a day keeps the mediocrity away
                </div>
              </div>
            </div>
          </section>
        ) : tab === "food" ? (
          /* ================= CAL CAM ================= */
          <section style={{ marginTop: 28, animation: "fadeUp .4s ease" }}>
            <div style={eyebrow}>Cal Cam</div>

            {/* daily total */}
            <div style={{ ...card, textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>
                Today's total
              </div>
              <div style={{ fontFamily: "'Italiana', serif", fontSize: 46, margin: "4px 0 2px" }}>
                {dayCalories}<span style={{ fontSize: 20, marginLeft: 6, color: C.rose }}>kcal</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#9A6B7E" }}>
                {dayMacro("protein_g")}g protein · {dayMacro("carbs_g")}g carbs · {dayMacro("fat_g")}g fat
              </div>

              <input ref={foodFileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                onChange={(e) => { scanFood(e.target.files?.[0]); e.target.value = ""; }} />
              <button onClick={() => foodFileRef.current?.click()} disabled={foodBusy}
                style={{ ...btnStyle(!foodBusy), ...(foodBusy ? { animation: "pulseSoft 1.2s ease infinite" } : {}) }}>
                {foodBusy ? "reading your plate… 🔮" : "Snap a meal 📸"}
              </button>
              {foodError && (
                <div style={{ fontSize: 12.5, color: C.wine, marginTop: 10, fontStyle: "italic" }}>{foodError}</div>
              )}
              <div style={{ fontSize: 11, color: "#B08699", marginTop: 10, fontStyle: "italic" }}>
                AI estimates only — close enough to keep you honest, not lab-grade
              </div>
            </div>

            {/* meal log */}
            {foodLog.length === 0 ? (
              <div style={{ textAlign: "center", padding: "22px 10px", color: "#B08699" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16 }}>
                  nothing logged yet — snap your next meal
                </div>
              </div>
            ) : (
              foodLog.map((meal) => (
                <div key={meal.id} style={{ ...card, marginBottom: 10, position: "relative" }}>
                  <button onClick={() => setFoodLog((f) => f.filter((x) => x.id !== meal.id))} aria-label={`Delete ${meal.meal}`}
                    style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#C79AAC", fontSize: 16, cursor: "pointer", padding: 2 }}>
                    ×
                  </button>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingRight: 22 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19 }}>
                      {meal.meal}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#B08699" }}>{meal.time}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {(meal.items || []).map((it, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: idx < meal.items.length - 1 ? `1px solid ${C.petal}` : "none" }}>
                        <span>{it.name} <span style={{ color: "#B08699", fontSize: 11.5 }}>· {it.portion}</span></span>
                        <span style={{ fontWeight: 600 }}>{it.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.blush}`, fontSize: 13 }}>
                    <span style={{ color: "#9A6B7E" }}>
                      {meal.total?.protein_g}p · {meal.total?.carbs_g}c · {meal.total?.fat_g}f
                    </span>
                    <span style={{ fontWeight: 600, color: C.rose }}>{meal.total?.calories} kcal</span>
                  </div>
                  {meal.note && (
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#B08699", marginTop: 8 }}>
                      {meal.note}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        ) : (
          /* ================= VAULT ================= */
          <section style={{ marginTop: 28, animation: "fadeUp .4s ease" }}>
            <div style={eyebrow}>The Vault</div>

            {!unlocked ? (
              <PinPad
                prompt="enter your passcode"
                subtext={passcode === "1234" ? "default passcode is 1234 — you can change it inside" : null}
                onComplete={(pin) => {
                  if (pin === passcode) { setUnlocked(true); setVaultView("grid"); return true; }
                  return false;
                }}
              />
            ) : vaultView === "newpin" ? (
              <>
                <PinPad
                  prompt="choose your new passcode"
                  subtext="pick four digits you'll remember"
                  onComplete={(pin) => { setTempPin(pin); setVaultView("confirmpin"); return true; }}
                />
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <button onClick={() => setVaultView("grid")} style={linkBtn}>never mind, keep my current one</button>
                </div>
              </>
            ) : vaultView === "confirmpin" ? (
              <PinPad
                prompt="type it once more to confirm"
                subtext="just making sure, babe"
                onComplete={(pin) => {
                  if (pin === tempPin) {
                    setPasscode(pin);
                    setTempPin("");
                    setVaultView("grid");
                    setPinSaved(true);
                    setTimeout(() => setPinSaved(false), 2500);
                    return true;
                  }
                  return false;
                }}
              />
            ) : (
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: C.rose }}>
                    for your eyes only ✨
                  </div>
                  <button onClick={() => setUnlocked(false)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.blush}`, borderRadius: 999, padding: "6px 14px", color: C.wine, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>
                    <LockIcon size={11} color={C.wine} /> Lock
                  </button>
                </div>

                {pinSaved && (
                  <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: C.rose, marginBottom: 10, animation: "fadeUp .3s ease" }}>
                    new passcode saved 💕
                  </div>
                )}

                <input ref={fileRef} type="file" accept="image/*" capture="user" style={{ display: "none" }}
                  onChange={(e) => { addPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                <button onClick={() => fileRef.current?.click()} disabled={vaultBusy} style={btnStyle(!vaultBusy)}>
                  {vaultBusy ? "saving…" : "Take / upload today's photo 📸"}
                </button>
                <div style={{ fontSize: 11.5, color: "#B08699", textAlign: "center", marginTop: 8, fontStyle: "italic" }}>
                  adding a photo checks off today's task automatically
                </div>

                {/* glow-up check: first vs latest */}
                {oldest && newest && (
                  <div style={{ marginTop: 22 }}>
                    <div style={{ ...eyebrow, marginBottom: 10 }}>The Glow-Up Check</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[oldest, newest].map((m, idx) => (
                        <div key={m.id} style={{ textAlign: "center" }}>
                          <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", background: C.petal, border: `1px solid ${C.blush}` }}>
                            {photos[m.id] ? (
                              <img src={photos[m.id]} alt={`Day ${m.day} progress photo`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "#B08699" }}>loading…</div>
                            )}
                          </div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, marginTop: 6, color: idx === 1 ? C.rose : "#9A6B7E" }}>
                            {idx === 0 ? `Day ${m.day} — where it began` : `Day ${m.day} — the moment`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* full archive */}
                {photoMeta.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "34px 10px 22px", color: "#B08699" }}>
                    <Heart filled={false} size={26} />
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, marginTop: 8 }}>
                      no photos yet — day one starts the archive
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 22 }}>
                    <div style={{ ...eyebrow, marginBottom: 10 }}>The Archive</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {photoMeta.map((m) => (
                        <div key={m.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: C.petal, aspectRatio: "3/4", border: `1px solid ${C.blush}` }}>
                          {photos[m.id] ? (
                            <img src={photos[m.id]} alt={`Progress photo, day ${m.day}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "#B08699" }}>loading…</div>
                          )}
                          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 8px 6px", background: "linear-gradient(transparent, rgba(94,27,54,0.65))", color: "#FFF", fontSize: 10.5, letterSpacing: "0.08em" }}>
                            DAY {m.day} · {m.date}
                          </div>
                          <button onClick={() => deletePhoto(m.id)} aria-label={`Delete day ${m.day} photo`}
                            style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(255,253,251,0.85)", color: C.wine, cursor: "pointer", fontSize: 12, lineHeight: "22px", padding: 0 }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: 18 }}>
                  <button onClick={() => setVaultView("newpin")} style={linkBtn}>change passcode</button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer style={{ textAlign: "center", marginTop: 44, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#B08699" }}>
          hot girls keep promises to themselves
        </footer>
      </div>
    </div>
  );
}

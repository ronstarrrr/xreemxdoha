// -------------------------
// State / storage
// -------------------------
const PICKS_KEY = "doha_picks_v1";
const QUIZ_KEY = "doha_quiz_v1";
const APPROVED_KEY = "doha_approved_v1";

const savedPicks = JSON.parse(localStorage.getItem(PICKS_KEY) || "{}");
const quizState = JSON.parse(localStorage.getItem(QUIZ_KEY) || "{}");

let activeVibe = "All";
let weatherHint = "nice"; // "nice" | "windy"

// -------------------------
// Quiz config
// -------------------------
const QUIZ = [
  { q: "What is my middle name?", a: "tapiwa" },
  { q: "Which day was I born on?", a: "3rd feb" },   // accept variations in checker below
  { q: "What is my favourite movie?", a: "shrek" },
];

function nowMs(){ return Date.now(); }

function normalise(s){
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isAnswerCorrect(stepIdx, input){
  const t = normalise(input);

  // Q2: accept a few natural variants
  if (stepIdx === 1) {
    const ok = ["3rd feb", "3 feb", "3 february", "3rd february", "03 feb", "03 february"];
    return ok.includes(t);
  }
  return t === QUIZ[stepIdx].a;
}

function getQuiz(){
  return {
    step: quizState.step ?? 0,             // 0..3
    wrong: quizState.wrong ?? 0,           // wrong attempts on current step (0..3)
    lockedUntil: quizState.lockedUntil ?? 0 // timestamp ms
  };
}

function setQuiz(next){
  localStorage.setItem(QUIZ_KEY, JSON.stringify(next));
}

function lockFor24h(current){
  const lockedUntil = nowMs() + 24 * 60 * 60 * 1000;
  setQuiz({ ...current, lockedUntil });
}

// unlockGroup mapping:
// after Q1 => unlockGroup 1
// after Q2 => unlockGroup 2
// after Q3 => unlockGroup 3
function unlockedGroupLevel(){
  const { step } = getQuiz(); // step is how many correct answers so far
  return step; // 0..3
}

// -------------------------
// Stickers / delight
// -------------------------
const stickers = document.getElementById("stickers");
const stickerSet = ["💘","🫶","✨","🥹","🍓","🌹","💌","😌"];

function popSticker() {
  const s = document.createElement("div");
  s.className = "sticker";
  s.textContent = stickerSet[Math.floor(Math.random() * stickerSet.length)];
  s.style.left = Math.floor(Math.random() * 100) + "vw";
  s.style.top = Math.floor(70 + Math.random() * 25) + "vh";
  stickers.appendChild(s);
  setTimeout(() => s.remove(), 1300);
}

// -------------------------
// Gate UI
// -------------------------
const gate = document.getElementById("gate");
const qStep = document.getElementById("qStep");
const triesLeft = document.getElementById("triesLeft");
const qText = document.getElementById("qText");
const qInput = document.getElementById("qInput");
const qBtn = document.getElementById("qBtn");
const qFeedback = document.getElementById("qFeedback");
const lockMsg = document.getElementById("lockMsg");

function formatCountdown(ms){
  const total = Math.max(0, ms);
  const h = Math.floor(total / (60*60*1000));
  const m = Math.floor((total % (60*60*1000)) / (60*1000));
  return `${h}h ${m}m`;
}

function renderGate(){
  const st = getQuiz();

  // Already completed quiz? hide gate.
  if (st.step >= QUIZ.length) {
    gate.classList.add("hidden");
    return;
  }

  // Check lockout
  if (st.lockedUntil && nowMs() < st.lockedUntil) {
    const remaining = st.lockedUntil - nowMs();
    lockMsg.classList.remove("hidden");
    lockMsg.textContent = `Locked 🔒 Try again in ${formatCountdown(remaining)}.`;
    document.getElementById("quiz").classList.add("hidden");
    return;
  } else {
    lockMsg.classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
  }

  qStep.textContent = `Question ${st.step + 1} of ${QUIZ.length}`;
  triesLeft.textContent = `${Math.max(0, 3 - st.wrong)} tries left`;
  qText.textContent = QUIZ[st.step].q;
  qFeedback.textContent = "";
  qInput.value = "";
  qInput.focus();
}

qBtn.onclick = () => {
  const st = getQuiz();
  const ans = qInput.value;

  if (st.lockedUntil && nowMs() < st.lockedUntil) {
    renderGate();
    return;
  }

  if (isAnswerCorrect(st.step, ans)) {
    // Correct: advance step, reset wrong
    const nextStep = st.step + 1;
    setQuiz({ step: nextStep, wrong: 0, lockedUntil: 0 });

    // Congrats moment
    popSticker(); popSticker(); popSticker();
    qFeedback.textContent = "✅ Correct! Proud of you 😌";

    // If not finished, show next question after a beat
    setTimeout(() => {
      renderGate();
      render();
    }, 700);

    // If finished, close gate
    if (nextStep >= QUIZ.length) {
      setTimeout(() => {
        gate.classList.add("hidden");
        render();
      }, 1100);
    }

  } else {
    // Wrong: increment wrong
    const wrong = st.wrong + 1;

    if (wrong >= 3) {
      lockFor24h({ ...st, wrong });
      qFeedback.textContent = "❌ Wrong 3 times. Locked for 24 hours 😭";
      setTimeout(renderGate, 700);
    } else {
      setQuiz({ ...st, wrong });
      qFeedback.textContent = "❌ Not quite… try again 😄";
      renderGate();
    }
  }
};

qInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") qBtn.click();
});

// -------------------------
// Picks + filters + rendering
// -------------------------
function isSelected(id) { return savedPicks[id] === true; }

function togglePick(id){
  savedPicks[id] = !isSelected(id);
  localStorage.setItem(PICKS_KEY, JSON.stringify(savedPicks));
  render();
}

function vibeMatches(item){
  return activeVibe === "All" || (item.tags || []).includes(activeVibe);
}

function weatherNudgeNeeded(item){
  return weatherHint === "windy" && item.weatherSensitive === true;
}

function showLockedValentinesCard(card){
  card.classList.add("lockedCard");
  const overlay = document.createElement("div");
  overlay.className = "lockOverlay";
  overlay.textContent = "Valentine’s Day is locked 🔒\nRevealed closer to the time 👀";
  card.appendChild(overlay);
}

function isDayUnlocked(dayBlock){
  if (dayBlock.alwaysHidden) return true; // we render it, but blurred
  const groupLevel = unlockedGroupLevel(); // 0..3
  const req = dayBlock.unlockGroup || 0;   // 1..3
  return groupLevel >= req;
}

function render(){
  // vibe buttons
  document.querySelectorAll(".vibe").forEach(b => {
    b.classList.toggle("on", b.dataset.vibe === activeVibe);
  });
  // weather buttons
  document.querySelectorAll(".wBtn").forEach(b => {
    b.classList.toggle("on", b.dataset.weather === weatherHint);
  });

  const root = document.getElementById("root");
  root.innerHTML = "";

  itinerary.forEach(dayBlock => {
    // Hide whole day until unlocked (except Valentines, which shows blurred)
    const unlocked = isDayUnlocked(dayBlock);

    // If not unlocked and not Valentines: show a minimal locked placeholder
    if (!unlocked && !dayBlock.alwaysHidden) {
      const section = document.createElement("section");
      section.className = "day";
      const h2 = document.createElement("h2");
      h2.textContent = dayBlock.day + " 🔒";
      section.appendChild(h2);

      const card = document.createElement("div");
      card.className = "card";
      const note = document.createElement("div");
      note.className = "note";
      note.textContent = "Unlocked after you pass the quiz 😌";
      card.appendChild(note);
      section.appendChild(card);

      root.appendChild(section);
      return;
    }

    const section = document.createElement("section");
    section.className = "day";
    const h2 = document.createElement("h2");
    h2.textContent = dayBlock.day;
    section.appendChild(h2);

    dayBlock.items.forEach(item => {
      if (!vibeMatches(item)) return;

      const card = document.createElement("div");
      card.className = "card";

      const top = document.createElement("div");
      top.className = "top";

      const title = document.createElement("div");
      title.innerHTML = `<div class="time">${item.time || ""}</div><div class="title">${item.title}</div>`;
      top.appendChild(title);

      const pick = document.createElement("button");
      pick.className = isSelected(item.id) ? "pick pickBtn on" : "pick pickBtn";
      pick.textContent = isSelected(item.id) ? "✅ I'm in" : "➕ Add";
      pick.onclick = () => togglePick(item.id);
      top.appendChild(pick);

      card.appendChild(top);

      if (item.note) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = item.note;
        card.appendChild(note);
      }

      const links = document.createElement("div");
      links.className = "links";
      if (item.instagram) links.appendChild(linkBtn("Instagram", item.instagram));
      if (item.maps) links.appendChild(linkBtn("Maps", item.maps));
      card.appendChild(links);

      const tags = document.createElement("div");
      tags.className = "tags";
      (item.tags || []).forEach(t => {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = t;
        tags.appendChild(pill);
      });
      card.appendChild(tags);

      if (weatherNudgeNeeded(item)) {
        const w = document.createElement("div");
        w.className = "weatherHint";
        w.textContent = "🌬️ If it’s windy, museums & Msheireb hit nicer than beach time.";
        card.appendChild(w);
      }

      if (item.packing?.length) {
        const p = document.createElement("div");
        p.className = "packing";
        p.innerHTML = `<strong>Bring:</strong> ${item.packing.join(", ")}`;
        card.appendChild(p);
      }

      if (item.prompt) {
        const pr = document.createElement("div");
        pr.className = "prompt";
        pr.textContent = "✨ " + item.prompt;
        card.appendChild(pr);
      }

      // Valentines blur/lock
      if (dayBlock.alwaysHidden) {
        showLockedValentinesCard(card);
      }

      section.appendChild(card);
    });

    root.appendChild(section);
  });

  renderPicks();
  renderPackingSummary();
  updateMapsLink();
}

function linkBtn(label, url){
  const a = document.createElement("a");
  a.className = "link";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = label;
  return a;
}

function renderPicks(){
  const picks = getSelectedItems();
  document.getElementById("count").textContent = `${picks.length} selected`;
  document.getElementById("download").disabled = picks.length === 0;
}

function getSelectedItems(){
  const picks = [];
  itinerary.forEach(d => d.items.forEach(i => {
    if (isSelected(i.id)) picks.push({ day: d.day, ...i });
  }));
  return picks;
}

// -------------------------
// Calendar (.ics) export
// -------------------------
function icsEscape(s=""){
  return String(s)
    .replace(/\\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function downloadICS(){
  const picks = getSelectedItems().filter(p => !p.day.includes("Valentine")); // don't export hidden day
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Doha Trip Microsite//EN",
    "CALSCALE:GREGORIAN",
  ];

  picks.forEach((p, idx) => {
    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${Date.now()}-${idx}@doha-trip`);
    ics.push(`DTSTAMP:${now}`);
    ics.push(`SUMMARY:${icsEscape(p.title)}`);

    const desc = `Day: ${p.day}\nTime: ${p.time || ""}\n${p.note || ""}\n${p.maps || ""}\n${p.instagram || ""}`;
    ics.push(`DESCRIPTION:${icsEscape(desc)}`);
    if (p.maps) ics.push(`URL:${icsEscape(p.maps)}`);
    ics.push("END:VEVENT");
  });

  ics.push("END:VCALENDAR");

  const blob = new Blob([ics.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Doha-Itinerary-Selected.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById("download").onclick = downloadICS;
document.getElementById("reset").onclick = () => {
  localStorage.removeItem(PICKS_KEY);
  location.reload();
};

// -------------------------
// Maps link for selected places
// -------------------------
function updateMapsLink(){
  const picks = getSelectedItems().filter(p => p.maps);
  const mapsLink = document.getElementById("mapsLink");

  if (!picks.length) {
    mapsLink.href = "https://www.google.com/maps";
    mapsLink.textContent = "Open Google Maps 🗺️";
    return;
  }

  // Build a Google Maps directions link with waypoints (best effort using place names)
  // We'll use the "q=" query param from the simple maps links we stored.
  const names = picks
    .map(p => {
      const q = (p.maps.split("q=")[1] || "").replace(/\+/g, " ");
      return decodeURIComponent(q);
    })
    .filter(Boolean);

  const origin = names[0];
  const destination = names[names.length - 1];
  const waypoints = names.slice(1, -1).slice(0, 8); // keep it reasonable

  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length) url.searchParams.set("waypoints", waypoints.join("|"));

  mapsLink.href = url.toString();
  mapsLink.textContent = `Open your ${names.length} selected places in Google Maps 🗺️`;
}

// -------------------------
// Packing summary
// -------------------------
function renderPackingSummary(){
  const set = new Set();
  itinerary.forEach(d => d.items.forEach(i => {
    if (isSelected(i.id)) (i.packing || []).forEach(p => set.add(p));
  }));

  const el = document.getElementById("packingList");
  if (!set.size) {
    el.textContent = "Select activities to generate your list…";
  } else {
    el.textContent = [...set].join(" • ");
  }
}

// -------------------------
// Vibe + weather controls
// -------------------------
document.querySelectorAll(".vibe").forEach(btn => {
  btn.onclick = () => {
    activeVibe = btn.dataset.vibe;
    render();
  };
});

document.querySelectorAll(".wBtn").forEach(btn => {
  btn.onclick = () => {
    weatherHint = btn.dataset.weather;
    render();
  };
});

// -------------------------
// Approve plan moment
// -------------------------
const approveBtn = document.getElementById("approveBtn");
const approvedMsg = document.getElementById("approvedMsg");

function setApprovedUI(){
  const approved = localStorage.getItem(APPROVED_KEY) === "yes";
  if (approved) {
    approvedMsg.classList.remove("hidden");
    approveBtn.disabled = true;
  }
}

approveBtn.onclick = () => {
  localStorage.setItem(APPROVED_KEY, "yes");
  approvedMsg.classList.remove("hidden");
  approveBtn.disabled = true;

  // small celebration
  for (let i = 0; i < 12; i++) setTimeout(popSticker, i * 80);
};

// -------------------------
// Init
// -------------------------
renderGate();
render();
setApprovedUI();

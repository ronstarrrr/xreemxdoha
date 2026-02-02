/* =========================================================
   Doha Itinerary Microsite — Script
   Requires: data.js defines `itinerary = [{ day, items:[...] }]`
========================================================= */

const PICKS_KEY = "doha_picks_v4";
const APPROVED_KEY = "doha_approved_v4";
const COLLAPSE_KEY = "doha_collapsed_days_v2";

const savedPicks = JSON.parse(localStorage.getItem(PICKS_KEY) || "{}");
const collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "{}");

let activeVibe = "All";
let weatherHint = "nice"; // nice | windy

function isSelected(id){ return savedPicks[id] === true; }
function togglePick(id){
  savedPicks[id] = !isSelected(id);
  localStorage.setItem(PICKS_KEY, JSON.stringify(savedPicks));
  render();
}

/* =========================================================
   Haptic-style feedback (Web-safe)
========================================================= */
function haptic(ms = 15){
  try{ if (navigator.vibrate) navigator.vibrate(ms); }catch(e){}
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) haptic(12);
});

/* =========================================================
   Emoji shower on scroll
========================================================= */
const emojiLayer = document.getElementById("emojiLayer");
const EMOJIS = ["💘","🫶","💞","🥹","✨","🌹","💌","😍"];
let lastScrollY = window.scrollY;
let lastBurstAt = 0;

function spawnEmojiBurst(intensity = 6){
  const w = window.innerWidth;
  for (let i=0; i<intensity; i++){
    const e = document.createElement("div");
    e.className = "emoji";
    e.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    e.style.left = Math.floor(Math.random() * w) + "px";
    e.style.top = Math.floor(window.innerHeight - 10 + Math.random()*30) + "px";
    e.style.fontSize = (16 + Math.random()*10) + "px";
    emojiLayer.appendChild(e);
    setTimeout(() => e.remove(), 1800);
  }
}
setTimeout(() => spawnEmojiBurst(10), 450);

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const delta = Math.abs(y - lastScrollY);
  lastScrollY = y;

  const now = Date.now();
  if (delta > 10 && now - lastBurstAt > 220) {
    lastBurstAt = now;
    const intensity = Math.min(10, 4 + Math.floor(delta / 40));
    spawnEmojiBurst(intensity);
  }
});

/* =========================================================
   Countdown timer (Landing vs Takeoff)
========================================================= */
const dd = document.getElementById("dd");
const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");
const countdownTitle = document.getElementById("countdownTitle");
const countdownHint = document.getElementById("countdownHint");

const toLandingBtn = document.getElementById("toLandingBtn");
const toTakeoffBtn = document.getElementById("toTakeoffBtn");

const TARGETS = {
  takeoff: new Date("2026-02-06T14:10:00+00:00").getTime(),
  landing: new Date("2026-02-06T23:50:00+03:00").getTime()
};
let targetMode = "landing";

function setCountdownMode(mode){
  targetMode = mode;
  toLandingBtn.classList.toggle("on", mode === "landing");
  toTakeoffBtn.classList.toggle("on", mode === "takeoff");
  countdownTitle.textContent = mode === "landing" ? "Landing in Doha" : "Takeoff to Doha";
}
toLandingBtn.onclick = () => setCountdownMode("landing");
toTakeoffBtn.onclick = () => setCountdownMode("takeoff");

function pad(n){ return String(n).padStart(2, "0"); }
function tickCountdown(){
  const now = Date.now();
  const t = TARGETS[targetMode];
  let diff = Math.max(0, t - now);

  const days = Math.floor(diff / (24*60*60*1000)); diff %= (24*60*60*1000);
  const hours = Math.floor(diff / (60*60*1000)); diff %= (60*60*1000);
  const mins = Math.floor(diff / (60*1000)); diff %= (60*1000);
  const secs = Math.floor(diff / 1000);

  dd.textContent = pad(days);
  hh.textContent = pad(hours);
  mm.textContent = pad(mins);
  ss.textContent = pad(secs);

  countdownHint.textContent =
    targetMode === "landing"
      ? "Reemy lands in Doha (HIA) at 23:50 on Fri 06 Feb ✈️"
      : "Reemy takes off from Birmingham (BHX) at 14:10 on Fri 06 Feb ✈️";
}
setCountdownMode("landing");
setInterval(tickCountdown, 1000);
tickCountdown();

/* =========================================================
   Boarding pass (flip + scanner)
========================================================= */
const inboundTab = document.getElementById("inboundTab");
const outboundTab = document.getElementById("outboundTab");
const bp = document.getElementById("boardingPass");

const FLIGHTS = {
  inbound: {
    label: "Inbound",
    pax: "Ms Reem Haileab",
    flightNo: "QR0034",
    date: "Fri 06 Feb 2026",
    fromCode: "BHX",
    fromCity: "Birmingham",
    depart: "14:10",
    toCode: "DOH",
    toCity: "Doha (HIA)",
    arrive: "23:50",
    cabin: "Economy",
    baggage: "35 KG"
  },
  outbound: {
    label: "Outbound",
    pax: "Ms Reem Haileab",
    flightNo: "QR0033",
    date: "Mon 16 Feb 2026",
    fromCode: "DOH",
    fromCity: "Doha (HIA)",
    depart: "08:20",
    toCode: "BHX",
    toCity: "Birmingham",
    arrive: "12:40",
    cabin: "Economy",
    baggage: "35 KG"
  }
};

function passFaceHTML(f){
  return `
    <div class="bpTop">
      <div>
        <div class="bpBrand">Qatar Airways • Trip Pass</div>
        <div style="font-weight:1000; font-size:16px; margin-top:6px;">${f.label}</div>
      </div>
      <div class="bpMeta">
        <div class="bpChip">${f.flightNo}</div>
        <div class="bpChip">${f.date}</div>
        <div class="bpChip">${f.cabin}</div>
      </div>
    </div>

    <div class="bpMid">
      <div>
        <div class="airport">${f.fromCode}</div>
        <div class="city">${f.fromCity}</div>
      </div>
      <div class="bpArrow">➜</div>
      <div style="text-align:right;">
        <div class="airport">${f.toCode}</div>
        <div class="city">${f.toCity}</div>
      </div>
    </div>

    <div class="bpBottom">
      <div class="kv"><div class="k">Passenger</div><div class="v">${f.pax}</div></div>
      <div class="kv"><div class="k">Departure • Arrival</div><div class="v">${f.depart} → ${f.arrive}</div></div>
      <div class="kv"><div class="k">Baggage</div><div class="v">${f.baggage}</div></div>
    </div>
  `;
}

function mountBoardingPass(){
  bp.innerHTML = `
    <div class="bpInner">
      <div class="bpFace bpFront">${passFaceHTML(FLIGHTS.inbound)}</div>
      <div class="bpFace bpBack">${passFaceHTML(FLIGHTS.outbound)}</div>
    </div>
  `;
}

function setFlight(which){
  inboundTab.classList.toggle("on", which === "inbound");
  outboundTab.classList.toggle("on", which === "outbound");
  bp.classList.toggle("flipped", which === "outbound");

  if (which === "inbound") setCountdownMode("landing");
  if (which === "outbound") setCountdownMode("takeoff");

  spawnEmojiBurst(6);
}
inboundTab.onclick = () => setFlight("inbound");
outboundTab.onclick = () => setFlight("outbound");

mountBoardingPass();
setFlight("inbound");

/* =========================================================
   Sticky shrink further (auto-compact)
========================================================= */
let compactOn = false;

function isMobile(){
  return window.matchMedia("(max-width: 520px)").matches;
}

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  // Delay compact mode on mobile so it doesn't feel like content disappears
  const onAt  = isMobile() ? 520 : 520;
  const offAt = isMobile() ? 420 : 420;

  if (y > onAt && !compactOn) { document.body.classList.add("compact"); compactOn = true; }
  if (y < offAt && compactOn) { document.body.classList.remove("compact"); compactOn = false; }
});

/* =========================================================
   Day chips navigation (swipe-style)
========================================================= */
const dayChips = document.getElementById("dayChips");
const root = document.getElementById("root");
let dayEls = [];

function slug(s){ return s.toLowerCase().replace(/[^\w]+/g, "-"); }

function buildDayChips(){
  dayChips.innerHTML = "";
  itinerary.forEach((d, idx) => {
    const chip = document.createElement("div");
    chip.className = "dayChip";
    chip.dataset.day = d.day;
    chip.textContent = d.day.split("–")[0].trim(); // "FRI 6 FEB"
    chip.onclick = () => {
      haptic(18);
      const el = document.getElementById("day-" + slug(d.day));
      if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
    };
    if (idx === 0) chip.classList.add("on");
    dayChips.appendChild(chip);
  });
}
/* =========================================================
   Swipe Gestures for Day Navigation (Stories-style)
   - Swipe left  -> next day
   - Swipe right -> previous day
   Works on: day chips bar (safe) and doesn’t interfere with scrolling.
========================================================= */
const dayChipsWrap = document.getElementById("dayChipsWrap");
let touchStartX = 0;
let touchStartY = 0;
let touchStartT = 0;

function getDayIndex(dayName){
  return itinerary.findIndex(d => d.day === dayName);
}

function getCurrentDayIndex(){
  // Prefer the actively highlighted chip
  const activeChip = document.querySelector(".dayChip.on");
  if (activeChip) return getDayIndex(activeChip.dataset.day);

  // Fallback to first
  return 0;
}

function scrollToDayIndex(idx){
  const clamped = Math.max(0, Math.min(itinerary.length - 1, idx));
  const dayName = itinerary[clamped].day;

  const el = document.getElementById("day-" + slug(dayName));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

  // bring the active chip into view too
  const chip = [...document.querySelectorAll(".dayChip")].find(c => c.dataset.day === dayName);
  if (chip) chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

  haptic(18);
  spawnEmojiBurst(6);
}

function onSwipe(dir){
  const current = getCurrentDayIndex();
  if (dir === "left") scrollToDayIndex(current + 1);
  if (dir === "right") scrollToDayIndex(current - 1);
}

// Touch start
dayChipsWrap.addEventListener("touchstart", (e) => {
  if (!e.touches || e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartT = Date.now();
}, { passive: true });

// Touch end (detect swipe)
dayChipsWrap.addEventListener("touchend", (e) => {
  const dt = Date.now() - touchStartT;
  if (dt > 650) return; // ignore slow drags

  const endTouch = e.changedTouches && e.changedTouches[0];
  if (!endTouch) return;

  const dx = endTouch.clientX - touchStartX;
  const dy = endTouch.clientY - touchStartY;

  // Only count mostly-horizontal swipes
  if (Math.abs(dx) < 45) return;
  if (Math.abs(dy) > 60) return;

  if (dx < 0) onSwipe("left");
  else onSwipe("right");
}, { passive: true });

// Optional: also allow mouse "swipe" with trackpad drag on desktop
let mouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

dayChipsWrap.addEventListener("mousedown", (e) => {
  mouseDown = true;
  mouseStartX = e.clientX;
  mouseStartY = e.clientY;
});

window.addEventListener("mouseup", (e) => {
  if (!mouseDown) return;
  mouseDown = false;

  const dx = e.clientX - mouseStartX;
  const dy = e.clientY - mouseStartY;

  if (Math.abs(dx) < 80) return;
  if (Math.abs(dy) > 90) return;

  if (dx < 0) onSwipe("left");
  else onSwipe("right");
});
function setActiveChip(dayName){
  document.querySelectorAll(".dayChip").forEach(c => {
    c.classList.toggle("on", c.dataset.day === dayName);
  });
}

/* Highlight chip while scrolling */
let activeDay = null;
const io = new IntersectionObserver((entries) => {
  entries.forEach(ent => {
    if (ent.isIntersecting) {
      const dayName = ent.target.dataset.day;
      activeDay = dayName;
      setActiveChip(dayName);
    }
  });
}, { root: null, threshold: 0.5 });

/* =========================================================
   Filters + Picks + Packing + Maps + ICS
========================================================= */
function vibeMatches(item){
  return activeVibe === "All" || (item.tags || []).includes(activeVibe);
}
function weatherNudgeNeeded(item){
  return weatherHint === "windy" && item.weatherSensitive === true;
}

function getSelectedItems(){
  const picks = [];
  itinerary.forEach(d => d.items.forEach(i => {
    if (savedPicks[i.id] === true) picks.push({ day: d.day, ...i });
  }));
  return picks;
}

function renderPackingSummary(){
  const set = new Set();
  itinerary.forEach(d => d.items.forEach(i => {
    if (savedPicks[i.id] === true) (i.packing || []).forEach(p => set.add(p));
  }));
  const el = document.getElementById("packingList");
  el.textContent = set.size ? [...set].join(" • ") : "Select activities to generate your list…";
}

function updateMapsLink(){
  const picks = getSelectedItems().filter(p => p.maps);
  const mapsLink = document.getElementById("mapsLink");

  if (!picks.length) {
    mapsLink.href = "https://www.google.com/maps";
    mapsLink.textContent = "Open selected places in Google Maps 🗺️";
    return;
  }

  const names = picks
    .map(p => decodeURIComponent((p.maps.split("q=")[1] || "").replace(/\+/g, " ")))
    .filter(Boolean);

  const origin = names[0];
  const destination = names[names.length - 1];
  const waypoints = names.slice(1, -1).slice(0, 8);

  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length) url.searchParams.set("waypoints", waypoints.join("|"));

  mapsLink.href = url.toString();
  mapsLink.textContent = `Open your ${names.length} selected places in Google Maps 🗺️`;
}

function renderPicks(){
  const picks = getSelectedItems();
  document.getElementById("count").textContent = `${picks.length} selected`;
  document.getElementById("download").disabled = picks.length === 0;
}

/* ICS download */
function icsEscape(s=""){
  return String(s).replace(/\\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
}

function downloadICS(){
  const picks = getSelectedItems();
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Doha Trip Microsite//EN","CALSCALE:GREGORIAN"];

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

/* Buttons */
document.getElementById("download").onclick = downloadICS;
document.getElementById("reset").onclick = () => {
  localStorage.removeItem(PICKS_KEY);
  location.reload();
};

/* Filter buttons */
document.querySelectorAll(".vibe").forEach(btn => {
  btn.onclick = () => { activeVibe = btn.dataset.vibe; render(); };
});
document.querySelectorAll(".wBtn").forEach(btn => {
  btn.onclick = () => { weatherHint = btn.dataset.weather; render(); };
});

/* =========================================================
   Collapse days
========================================================= */
function toggleDay(dayName){
  collapsed[dayName] = !collapsed[dayName];
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
  render();
}

/* =========================================================
   Confetti / Heart Burst (canvas)
========================================================= */
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
let confetti = [];
let confettiRunning = false;

function resizeConfetti(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

function launchConfetti(amount = 140){
  confetti = [];
  const W = confettiCanvas.width;
  const H = confettiCanvas.height;

  for (let i=0; i<amount; i++){
    const isHeart = Math.random() < 0.45;
    confetti.push({
      x: W/2 + (Math.random()*120 - 60),
      y: H/2 + (Math.random()*40 - 20),
      vx: (Math.random()*6 - 3),
      vy: (Math.random()*-8 - 2),
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()*0.2 - 0.1),
      size: 10 + Math.random()*10,
      life: 140 + Math.random()*60,
      heart: isHeart,
      hue: isHeart ? 340 + Math.random()*20 : 300 + Math.random()*80
    });
  }

  if (!confettiRunning){
    confettiRunning = true;
    requestAnimationFrame(stepConfetti);
  }
}

function drawHeart(x,y,s,rot){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.scale(s/18, s/18);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-10, -4, -18, 6, 0, 18);
  ctx.bezierCurveTo(18, 6, 10, -4, 0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function stepConfetti(){
  const W = confettiCanvas.width;
  const H = confettiCanvas.height;
  ctx.clearRect(0,0,W,H);

  confetti.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;         // gravity
    p.vx *= 0.99;
    p.rot += p.vr;
    p.life -= 1;

    ctx.fillStyle = `hsla(${p.hue}, 85%, 60%, 0.95)`;

    if (p.heart){
      drawHeart(p.x, p.y, p.size, p.rot);
    } else {
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
  });

  confetti = confetti.filter(p => p.life > 0 && p.y < H + 120);

  if (confetti.length){
    requestAnimationFrame(stepConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0,0,W,H);
  }
}

/* =========================================================
   Approve plan (confetti + hearts)
========================================================= */
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

  spawnEmojiBurst(18);
  launchConfetti(180);
};

/* =========================================================
   IG card helper (no fetch)
========================================================= */
function handleFromUrl(url){
  try{
    const u = new URL(url);
    // instagram.com/{handle}...
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[0] || "instagram";
  }catch(e){
    return "instagram";
  }
}

function makeIGCard(instaUrl, subtitle){
  const handle = handleFromUrl(instaUrl);
  const card = document.createElement("div");
  card.className = "igCard";

  const left = document.createElement("div");
  left.className = "igLeft";

  const avatar = document.createElement("div");
  avatar.className = "igAvatar";
  avatar.textContent = "IG";

  const meta = document.createElement("div");
  meta.className = "igMeta";

  const h = document.createElement("div");
  h.className = "igHandle";
  h.textContent = "@" + handle;

  const sub = document.createElement("div");
  sub.className = "igSub";
  sub.textContent = subtitle || "Tap to preview the vibe on Instagram";

  meta.appendChild(h);
  meta.appendChild(sub);

  left.appendChild(avatar);
  left.appendChild(meta);

  const open = document.createElement("a");
  open.className = "igOpen";
  open.href = instaUrl;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  open.textContent = "Open ↗";

  card.appendChild(left);
  card.appendChild(open);

  return card;
}

/* =========================================================
   Render
========================================================= */
function render(){
  // Toggle button states
  document.querySelectorAll(".vibe").forEach(b => b.classList.toggle("on", b.dataset.vibe === activeVibe));
  document.querySelectorAll(".wBtn").forEach(b => b.classList.toggle("on", b.dataset.weather === weatherHint));

  root.innerHTML = "";
  dayEls.forEach(el => io.unobserve(el));
  dayEls = [];

  itinerary.forEach(dayBlock => {
    const section = document.createElement("section");
    section.className = "day";
    section.id = "day-" + slug(dayBlock.day);
    section.dataset.day = dayBlock.day;

    if (collapsed[dayBlock.day]) section.classList.add("collapsed");

    // Day header
    const header = document.createElement("div");
    header.className = "dayHeader";
    header.onclick = () => toggleDay(dayBlock.day);

    const h2 = document.createElement("h2");
    h2.textContent = dayBlock.day;

    const chev = document.createElement("div");
    chev.className = "chev";
    chev.textContent = "⌄";

    header.appendChild(h2);
    header.appendChild(chev);
    section.appendChild(header);

    // Body
    const body = document.createElement("div");
    body.className = "dayBody";

    dayBlock.items.forEach(item => {
      if (activeVibe !== "All" && !(item.tags || []).includes(activeVibe)) return;

      const card = document.createElement("div");
      card.className = "card";

      const top = document.createElement("div");
      top.className = "top";

      const left = document.createElement("div");
      left.innerHTML = `
        <div class="time">${item.time || ""}</div>
        <div class="title">${item.title}</div>
      `;

      const pick = document.createElement("button");
      pick.className = savedPicks[item.id] ? "pickBtn on" : "pickBtn";
      pick.textContent = savedPicks[item.id] ? "✅ I'm in" : "＋ Add";
      pick.onclick = (e) => { e.stopPropagation(); togglePick(item.id); };

      top.appendChild(left);
      top.appendChild(pick);
      card.appendChild(top);

      if (item.note) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = item.note;
        card.appendChild(note);
      }

      // IG Preview card
      if (item.instagram) {
        card.appendChild(makeIGCard(item.instagram, item.igSubtitle || item.title));
      }

      // Link pills
      const links = document.createElement("div");
      links.className = "links";
      if (item.maps) {
        const a = document.createElement("a");
        a.className = "link";
        a.href = item.maps;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Maps";
        links.appendChild(a);
      }
      if (item.website) {
        const a = document.createElement("a");
        a.className = "link";
        a.href = item.website;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Website";
        links.appendChild(a);
      }
      if (links.childNodes.length) card.appendChild(links);

      // Tags
      const tags = document.createElement("div");
      tags.className = "tags";
      (item.tags || []).forEach(t => {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = t;
        tags.appendChild(pill);
      });
      if (tags.childNodes.length) card.appendChild(tags);

      // Weather hint
      if (weatherHint === "windy" && item.weatherSensitive === true) {
        const w = document.createElement("div");
        w.className = "weatherHint";
        w.textContent = "🌬️ If it’s windy, museums & Msheireb feel nicer than beach time.";
        card.appendChild(w);
      }

      // Packing
      if (item.packing?.length) {
        const p = document.createElement("div");
        p.className = "packing";
        p.innerHTML = `<strong>Bring:</strong> ${item.packing.join(", ")}`;
        card.appendChild(p);
      }

      // Prompt
      if (item.prompt) {
        const pr = document.createElement("div");
        pr.className = "prompt";
        pr.textContent = "✨ " + item.prompt;
        card.appendChild(pr);
      }

      body.appendChild(card);
    });

    section.appendChild(body);
    root.appendChild(section);

    dayEls.push(section);
    io.observe(section);
  });

  renderPicks();
  renderPackingSummary();
  updateMapsLink();
  setApprovedUI();

  // Ensure chips exist
  if (!dayChips.childNodes.length) buildDayChips();
}

/* =========================================================
   Pick counts + packing + maps initial
========================================================= */
function renderPackingSummary(){
  const set = new Set();
  itinerary.forEach(d => d.items.forEach(i => {
    if (savedPicks[i.id] === true) (i.packing || []).forEach(p => set.add(p));
  }));
  const el = document.getElementById("packingList");
  el.textContent = set.size ? [...set].join(" • ") : "Select activities to generate your list…";
}

function updateMapsLink(){
  const picks = [];
  itinerary.forEach(d => d.items.forEach(i => {
    if (savedPicks[i.id] === true && i.maps) picks.push(i);
  }));

  const mapsLink = document.getElementById("mapsLink");
  if (!picks.length) {
    mapsLink.href = "https://www.google.com/maps";
    mapsLink.textContent = "Open selected places in Google Maps 🗺️";
    return;
  }

  const names = picks
    .map(p => decodeURIComponent((p.maps.split("q=")[1] || "").replace(/\+/g, " ")))
    .filter(Boolean);

  const origin = names[0];
  const destination = names[names.length - 1];
  const waypoints = names.slice(1, -1).slice(0, 8);

  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length) url.searchParams.set("waypoints", waypoints.join("|"));
  mapsLink.href = url.toString();
  mapsLink.textContent = `Open your ${names.length} selected places in Google Maps 🗺️`;
}

function renderPicks(){
  const count = Object.values(savedPicks).filter(Boolean).length;
  document.getElementById("count").textContent = `${count} selected`;
  document.getElementById("download").disabled = count === 0;
}

/* =========================================================
   ICS / Reset
========================================================= */
document.getElementById("download").onclick = downloadICS;
document.getElementById("reset").onclick = () => {
  localStorage.removeItem(PICKS_KEY);
  location.reload();
};

function icsEscape(s=""){
  return String(s).replace(/\\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
}
function downloadICS(){
  const picks = [];
  itinerary.forEach(d => d.items.forEach(i => {
    if (savedPicks[i.id] === true) picks.push({ day: d.day, ...i });
  }));

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Doha Trip Microsite//EN","CALSCALE:GREGORIAN"];

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

/* =========================================================
   Filter buttons
========================================================= */
document.querySelectorAll(".vibe").forEach(btn => {
  btn.onclick = () => { activeVibe = btn.dataset.vibe; render(); };
});
document.querySelectorAll(".wBtn").forEach(btn => {
  btn.onclick = () => { weatherHint = btn.dataset.weather; render(); };
});

/* =========================================================
   Init
========================================================= */
buildDayChips();
render();

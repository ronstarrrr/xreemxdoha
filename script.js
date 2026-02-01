/* =========================================================
   Doha Itinerary Microsite — Script
   Requires: data.js defines `itinerary = [{ day, items:[...] }]`
========================================================= */

const PICKS_KEY = "doha_picks_v3";
const APPROVED_KEY = "doha_approved_v3";

const savedPicks = JSON.parse(localStorage.getItem(PICKS_KEY) || "{}");

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
   - Uses vibration where supported
   - Always does micro tap animation via CSS :active
========================================================= */
function haptic(ms = 15){
  try{
    if (navigator.vibrate) navigator.vibrate(ms);
  }catch(e){}
}

/* Add haptic to all button taps */
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

// Feb: UK is GMT. Doha is +03:00
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
      ? "She lands Doha (HIA) at 23:50 on Fri 06 Feb ✈️"
      : "She takes off from Birmingham (BHX) at 14:10 on Fri 06 Feb ✈️";
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

let activeFlight = "inbound";

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
      <div class="bpFace bpFront">
        ${passFaceHTML(FLIGHTS.inbound)}
      </div>
      <div class="bpFace bpBack">
        ${passFaceHTML(FLIGHTS.outbound)}
      </div>
    </div>
  `;
}

function setFlight(which){
  activeFlight = which;
  inboundTab.classList.toggle("on", which === "inbound");
  outboundTab.classList.toggle("on", which === "outbound");
  bp.classList.toggle("flipped", which === "outbound");

  // Nice UX: outbound -> takeoff, inbound -> landing
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

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  // when scrolling down, compact
  if (y > 520 && !compactOn) {
    document.body.classList.add("compact");
    compactOn = true;
  }
  // when scrolling up, expand
  if (y < 420 && compactOn) {
    document.body.classList.remove("compact");
    compactOn = false;
  }
});

/* =========================================================
   Itinerary Rendering + Collapse Days
========================================================= */
function vibeMatches(item){
  return activeVibe === "All" || (item.tags || []).includes(activeVibe);
}

function weatherNudgeNeeded(item){
  return weatherHint === "windy" && item.weatherSensitive === true;
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

function getSelectedItems(){
  const picks = [];
  itinerary.forEach(d => d.items.forEach(i => {
    if (isSelected(i.id)) picks.push({ day: d.day, ...i });
  }));
  return picks;
}

function renderPackingSummary(){
  const set = new Set();
  itinerary.forEach(d => d.items.forEach(i => {
    if (isSelected(i.id)) (i.packing || []).forEach(p => set.add(p));
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

/* Calendar export (skips Valentine's if you mark it hidden later) */
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

/* Vibe + weather controls */
document.querySelectorAll(".vibe").forEach(btn => {
  btn.onclick = () => { activeVibe = btn.dataset.vibe; render(); };
});
document.querySelectorAll(".wBtn").forEach(btn => {
  btn.onclick = () => { weatherHint = btn.dataset.weather; render(); };
});

/* Approve plan */
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
  spawnEmojiBurst(14);
};

/* Collapse state stored per day */
const COLLAPSE_KEY = "doha_collapsed_days_v1";
const collapsed = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "{}");

function toggleDay(dayName){
  collapsed[dayName] = !collapsed[dayName];
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
  render();
}

function render(){
  // toggle UI states
  document.querySelectorAll(".vibe").forEach(b => b.classList.toggle("on", b.dataset.vibe === activeVibe));
  document.querySelectorAll(".wBtn").forEach(b => b.classList.toggle("on", b.dataset.weather === weatherHint));

  const root = document.getElementById("root");
  root.innerHTML = "";

  itinerary.forEach(dayBlock => {
    const section = document.createElement("section");
    section.className = "day";

    if (collapsed[dayBlock.day]) section.classList.add("collapsed");

    // Collapsible day header
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

    // Day body
    const body = document.createElement("div");
    body.className = "dayBody";

    dayBlock.items.forEach(item => {
      if (!vibeMatches(item)) return;

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
      pick.className = isSelected(item.id) ? "pickBtn on" : "pickBtn";
      pick.textContent = isSelected(item.id) ? "✅ I'm in" : "＋ Add";
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

      const links = document.createElement("div");
      links.className = "links";
      if (item.instagram) links.appendChild(linkBtn("Instagram", item.instagram));
      if (item.maps) links.appendChild(linkBtn("Maps", item.maps));
      if (item.website) links.appendChild(linkBtn("Website", item.website));
      if (links.childNodes.length) card.appendChild(links);

      const tags = document.createElement("div");
      tags.className = "tags";
      (item.tags || []).forEach(t => {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = t;
        tags.appendChild(pill);
      });
      if (tags.childNodes.length) card.appendChild(tags);

      if (weatherNudgeNeeded(item)) {
        const w = document.createElement("div");
        w.className = "weatherHint";
        w.textContent = "🌬️ If it’s windy, museums & Msheireb feel nicer than beach time.";
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

      // Optional Valentine lock from your data.js:
      if (dayBlock.alwaysHidden) {
        card.classList.add("lockedCard");
        const overlay = document.createElement("div");
        overlay.className = "lockOverlay";
        overlay.textContent = "Valentine’s Day is under wraps 🔒 Revealed closer to the time 👀";
        card.appendChild(overlay);
      }

      body.appendChild(card);
    });

    section.appendChild(body);
    root.appendChild(section);
  });

  renderPicks();
  renderPackingSummary();
  updateMapsLink();
  setApprovedUI();
}

render();

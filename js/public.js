/* ===== PUBLIC PAGE STATE ===== */
const publicState = {
  currentKos: "putri",
  selectedRoom: null
};

/* ===== SHARED HELPERS ===== */
const STATUS_META = {
  kosong: { label: "Kosong", css: "kosong" },
  terisi: { label: "Terisi", css: "terisi" },
  "akan-kosong": { label: "Akan Kosong", css: "akan-kosong" },
  perbaikan: { label: "Perbaikan", css: "perbaikan" }
};

const FACILITY_DATA = {
  putri: [
    { icon: "wifi", title: "Wifi", desc: "Internet stabil untuk kuliah, kerja, dan hiburan." },
    { icon: "bath", title: "KM Bersama", desc: "Kamar mandi bersama terjaga kebersihannya." },
    { icon: "shower-head", title: "KM Dalam (4 kamar)", desc: "Privasi lebih dengan kamar mandi pribadi." },
    { icon: "cctv", title: "CCTV 24 Jam", desc: "Pemantauan keamanan aktif sepanjang hari." },
    { icon: "book-heart", title: "Mushola", desc: "Ruang ibadah tenang untuk penghuni." },
    { icon: "shield-check", title: "Lingkungan Aman", desc: "Area kos nyaman dengan penjagaan sekitar." }
  ],
  putra: [
    { icon: "wifi", title: "Wifi (include)", desc: "Sudah termasuk paket sewa tahunan." },
    { icon: "bath", title: "KM Bersama", desc: "Fasilitas kamar mandi bersama dengan 3 stall." },
    { icon: "car-front", title: "Garasi Luas", desc: "Muat mobil dan motor penghuni." },
    { icon: "chef-hat", title: "Dapur Bersama", desc: "Area masak bersama yang rapi dan fungsional." },
    { icon: "refrigerator", title: "Kulkas & Kompor", desc: "Peralatan dapur siap pakai setiap hari." },
    { icon: "cctv", title: "CCTV 24 Jam", desc: "Keamanan area kos lebih terkontrol." }
  ]
};

function formatRupiah(value) {
  return `Rp ${value.toLocaleString("id-ID")} /tahun`;
}

function formatShortPrice(value) {
  const juta = value / 1000000;
  return `${juta.toFixed(1).replace(".0", "")}jt/th`;
}

function getRoomById(kosKey, roomId) {
  return window.KOS_DATA[kosKey].rooms.find((room) => room.id === roomId);
}

/* ===== FLOOR PLAN RENDER ===== */
function roomGroup(room, x, y, topRow) {
  const hasBathroom = room.type.toLowerCase().includes("dalam");
  const doorY = topRow ? y + 130 : y;
  const arcPath = topRow
    ? `M ${x + 60} ${doorY - 1} A 22 22 0 0 1 ${x + 82} ${doorY - 22}`
    : `M ${x + 60} ${doorY + 1} A 22 22 0 0 0 ${x + 82} ${doorY + 22}`;

  return `
    <g class="room status-${room.status}" data-room-id="${room.id}" transform="translate(${x}, ${y})">
      <rect class="room-shell" width="120" height="130" />
      <text class="fp-label" x="8" y="16">${room.id}</text>
      <circle class="fp-status-indicator status-${room.status}" cx="101" cy="14" r="6"></circle>
      <rect class="fp-bed" x="12" y="26" width="32" height="48"></rect>
      <rect class="fp-pillow" x="12" y="26" width="32" height="10"></rect>
      <rect class="fp-wardrobe" x="94" y="26" width="16" height="32"></rect>
      <rect class="fp-desk" x="52" y="96" width="28" height="14"></rect>
      ${hasBathroom ? `
        <rect class="fp-bathbox" x="76" y="74" width="36" height="36"></rect>
        <text class="fp-price" x="85" y="90">KM</text>
        <circle class="fp-toilet" cx="88" cy="102" r="5"></circle>
        <rect class="fp-shower" x="99" y="95" width="8" height="12"></rect>
      ` : ""}
      <path class="fp-door-arc" d="${arcPath}"></path>
      <text class="fp-price" x="66" y="122">${formatShortPrice(room.price)}</text>
    </g>
  `;
}

function renderPutriPlan() {
  const rooms = window.KOS_DATA.putri.rooms;
  const topY = 92;
  const bottomY = 288;
  const startX = 42;
  const stepX = 130;

  const roomMarkup = rooms.map((room, index) => {
    const isTop = index < 5;
    const col = index % 5;
    return roomGroup(room, startX + col * stepX, isTop ? topY : bottomY, isTop);
  }).join("");

  return `
    <svg viewBox="0 0 880 540" aria-label="Denah kos putri">
      <rect class="fp-wall-outer" x="24" y="60" width="830" height="430" rx="10"></rect>
      <line class="fp-wall-inner" x1="24" y1="250" x2="694" y2="250"></line>
      <text class="fp-corridor" x="280" y="244">— KORIDOR —</text>
      ${roomMarkup}

      <rect class="fp-utility" x="704" y="100" width="138" height="190" rx="10"></rect>
      <text class="fp-note" x="723" y="124">KM Bersama</text>
      <rect class="fp-bathbox" x="722" y="138" width="44" height="62"></rect>
      <circle class="fp-toilet" cx="742" cy="170" r="8"></circle>
      <rect class="fp-shower" x="750" y="157" width="10" height="20"></rect>
      <rect class="fp-bathbox" x="776" y="138" width="44" height="62"></rect>
      <circle class="fp-toilet" cx="796" cy="170" r="8"></circle>
      <rect class="fp-shower" x="804" y="157" width="10" height="20"></rect>

      <rect class="fp-utility" x="704" y="308" width="138" height="150" rx="10"></rect>
      <text class="fp-note" x="714" y="332">Mushola / Ruang Tamu</text>
      <path class="fp-wall-inner" d="M740 366 l22 0 l8 16 l-38 0 z"></path>
      <circle class="fp-wall-inner" cx="798" cy="382" r="10"></circle>

      <circle class="fp-wall-inner" cx="824" cy="84" r="18"></circle>
      <line class="fp-wall-inner" x1="824" y1="84" x2="824" y2="71"></line>
      <line class="fp-wall-inner" x1="824" y1="84" x2="832" y2="93"></line>
      <polygon points="824,64 821,72 827,72" fill="var(--status-terisi)"></polygon>
      <text class="fp-price" x="819" y="104">N</text>

      <line class="fp-wall-inner" x1="44" y1="500" x2="126" y2="500"></line>
      <line class="fp-wall-inner" x1="44" y1="496" x2="44" y2="504"></line>
      <line class="fp-wall-inner" x1="126" y1="496" x2="126" y2="504"></line>
      <text class="fp-scale" x="44" y="516">1:50 — 3 meter</text>

      <rect class="fp-entry-banner" x="280" y="500" width="300" height="24" rx="8"></rect>
      <text class="fp-entry-text" x="338" y="517">▼ PINTU MASUK ▼</text>
    </svg>
  `;
}

function renderPutraPlan() {
  const rooms = window.KOS_DATA.putra.rooms;
  const topY = 186;
  const bottomY = 390;
  const startX = 42;
  const stepX = 130;

  const roomMarkup = rooms.map((room, index) => {
    const isTop = index < 5;
    const col = index % 5;
    return roomGroup(room, startX + col * stepX, isTop ? topY : bottomY, isTop);
  }).join("");

  return `
    <svg viewBox="0 0 880 660" aria-label="Denah kos putra">
      <rect class="fp-garage" x="24" y="22" width="832" height="128" rx="10"></rect>
      <text class="fp-note" x="44" y="46">GARASI</text>
      <line class="fp-wall-inner" x1="40" y1="58" x2="840" y2="58"></line>
      <line class="fp-wall-inner" x1="120" y1="62" x2="88" y2="140"></line>
      <line class="fp-wall-inner" x1="220" y1="62" x2="188" y2="140"></line>
      <line class="fp-wall-inner" x1="320" y1="62" x2="288" y2="140"></line>
      <line class="fp-wall-inner" x1="420" y1="62" x2="388" y2="140"></line>
      <line class="fp-wall-inner" x1="520" y1="62" x2="488" y2="140"></line>
      <line class="fp-wall-inner" x1="620" y1="62" x2="588" y2="140"></line>
      <line class="fp-wall-inner" x1="720" y1="62" x2="688" y2="140"></line>
      <line class="fp-wall-inner" x1="820" y1="62" x2="788" y2="140"></line>
      <rect class="fp-utility" x="70" y="76" width="88" height="42" rx="12"></rect>
      <rect class="fp-utility" x="192" y="78" width="88" height="42" rx="12"></rect>
      <rect class="fp-utility" x="346" y="86" width="18" height="32" rx="4"></rect>
      <rect class="fp-utility" x="372" y="86" width="18" height="32" rx="4"></rect>
      <rect class="fp-utility" x="398" y="86" width="18" height="32" rx="4"></rect>
      <rect class="fp-utility" x="424" y="86" width="18" height="32" rx="4"></rect>
      <rect class="fp-utility" x="450" y="86" width="18" height="32" rx="4"></rect>

      <rect class="fp-wall-outer" x="24" y="166" width="832" height="360" rx="10"></rect>
      <line class="fp-wall-inner" x1="24" y1="352" x2="694" y2="352"></line>
      <text class="fp-corridor" x="274" y="346">— KORIDOR —</text>
      ${roomMarkup}

      <rect class="fp-kitchen-box" x="704" y="186" width="138" height="170" rx="10"></rect>
      <text class="fp-note" x="744" y="210">DAPUR</text>
      <rect class="fp-wall-inner" x="724" y="220" width="80" height="36"></rect>
      <circle cx="737" cy="238" r="5" fill="var(--status-akan-kosong)"></circle>
      <circle cx="758" cy="238" r="5" fill="var(--status-akan-kosong)"></circle>
      <circle cx="779" cy="238" r="5" fill="var(--text-muted)"></circle>
      <circle cx="799" cy="238" r="5" fill="var(--text-muted)"></circle>
      <rect class="fp-wall-inner" x="724" y="270" width="44" height="70"></rect>
      <line class="fp-wall-inner" x1="760" y1="304" x2="760" y2="324"></line>

      <rect class="fp-utility" x="704" y="372" width="138" height="92" rx="10"></rect>
      <text class="fp-note" x="726" y="394">KM Bersama (3)</text>
      <rect class="fp-bathbox" x="718" y="404" width="34" height="46"></rect>
      <rect class="fp-bathbox" x="756" y="404" width="34" height="46"></rect>
      <rect class="fp-bathbox" x="794" y="404" width="34" height="46"></rect>
      <rect x="704" y="474" width="138" height="42" rx="8" fill="var(--status-terisi-soft)" stroke="var(--line-dark)" stroke-width="1"></rect>
      <text class="fp-note" x="720" y="500">Wifi 100Mbps</text>
      <path class="fp-wall-inner" d="M796 496 q16 -14 32 0 M801 502 q11 -9 22 0 M808 508 q4 -4 8 0"></path>

      <circle class="fp-wall-inner" cx="824" cy="180" r="18"></circle>
      <line class="fp-wall-inner" x1="824" y1="180" x2="824" y2="167"></line>
      <line class="fp-wall-inner" x1="824" y1="180" x2="832" y2="189"></line>
      <polygon points="824,160 821,168 827,168" fill="var(--status-terisi)"></polygon>
      <text class="fp-price" x="819" y="200">N</text>

      <line class="fp-wall-inner" x1="44" y1="620" x2="126" y2="620"></line>
      <line class="fp-wall-inner" x1="44" y1="616" x2="44" y2="624"></line>
      <line class="fp-wall-inner" x1="126" y1="616" x2="126" y2="624"></line>
      <text class="fp-scale" x="44" y="636">1:50 — 3 meter</text>

      <rect class="fp-entry-banner" x="280" y="626" width="300" height="24" rx="8"></rect>
      <text class="fp-entry-text" x="338" y="643">▼ PINTU MASUK ▼</text>
    </svg>
  `;
}

function renderFloorPlan(kosKey) {
  const target = document.getElementById("publicFloorPlan");
  target.innerHTML = kosKey === "putri" ? renderPutriPlan() : renderPutraPlan();
  target.querySelectorAll(".room").forEach((node) => {
    node.addEventListener("click", () => {
      const room = getRoomById(kosKey, node.dataset.roomId);
      openModal(room);
    });
  });
}

/* ===== MODAL ===== */
function statusMessage(room) {
  if (room.status === "kosong") {
    return "Kamar siap huni";
  }
  if (room.status === "akan-kosong") {
    return `Akan kosong dalam ${room.vacantInDays} hari, daftar Waiting List untuk prioritas`;
  }
  if (room.status === "terisi") {
    return `Sedang disewa, estimasi kosong: ${room.occupancyMonthsLeft} bulan lagi`;
  }
  return "Sedang dalam perbaikan, tidak disewakan";
}

function buildModalButtons(room) {
  if (room.status === "kosong") {
    return `
      <button class="btn btn-dark">Lihat Detail</button>
      <a class="btn btn-wa" href="https://wa.me/6281111111111" target="_blank" rel="noreferrer">Tanya WA</a>
    `;
  }
  if (room.status === "akan-kosong") {
    return `
      <button class="btn btn-warning">Waiting List</button>
      <a class="btn btn-wa" href="https://wa.me/6281111111111" target="_blank" rel="noreferrer">Tanya WA</a>
    `;
  }
  if (room.status === "terisi") {
    return `<button class="btn btn-warning">Daftar Waiting List</button>`;
  }
  return "";
}

function openModal(room) {
  const modal = document.getElementById("publicModal");
  const statusEl = document.getElementById("modalStatusBadge");
  const chipsEl = document.getElementById("modalChips");
  const statusBox = document.getElementById("modalStatusMessage");
  const actions = document.getElementById("modalActions");
  publicState.selectedRoom = room;

  document.getElementById("modalRoomTitle").textContent = `Kamar ${room.id}`;
  document.getElementById("modalRoomMeta").textContent = `${room.size} · ${room.type}`;
  document.getElementById("modalRoomPrice").textContent = formatRupiah(room.price);
  statusEl.className = `status-pill ${STATUS_META[room.status].css}`;
  statusEl.textContent = STATUS_META[room.status].label;
  chipsEl.innerHTML = room.features.map((feature) => `<span>${feature}</span>`).join("");
  statusBox.innerHTML = `<div class="status-banner ${room.status}">${statusMessage(room)}</div>`;
  actions.innerHTML = buildModalButtons(room);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  const modal = document.getElementById("publicModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

/* ===== FACILITIES ===== */
function renderFacilities(kosKey) {
  const target = document.getElementById("facilityGrid");
  target.innerHTML = FACILITY_DATA[kosKey].map((item) => `
    <article class="facility-card">
      <i data-lucide="${item.icon}"></i>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </article>
  `).join("");
}

/* ===== COUNTERS & ANIMATION ===== */
function updateAvailableCount() {
  const count = [...window.KOS_DATA.putri.rooms, ...window.KOS_DATA.putra.rooms]
    .filter((room) => room.status === "kosong").length;
  document.getElementById("availableRoomsCount").textContent = count;
}

function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ===== EVENT BINDINGS ===== */
function setupEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("is-active"));
      btn.classList.add("is-active");
      publicState.currentKos = btn.dataset.kos;
      renderFloorPlan(publicState.currentKos);
    });
  });

  document.querySelectorAll(".facility-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".facility-tab").forEach((item) => item.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderFacilities(btn.dataset.kos);
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.getElementById("closeModalBtn").addEventListener("click", closeModal);
  document.getElementById("publicModal").addEventListener("click", (event) => {
    if (event.target.id === "publicModal") closeModal();
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("is-open");
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", () => {
      document.getElementById("navLinks").classList.remove("is-open");
    });
  });
}

/* ===== HERO CAROUSEL ===== */
function initHeroCarousel() {
  const track = document.querySelector(".carousel-track");
  if (!track) return;
  const slides = track.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");
  let current = 0;
  let timer;

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }

  function tick() {
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  function restart() {
    clearInterval(timer);
    tick();
  }

  document.querySelector(".carousel-btn.prev")?.addEventListener("click", () => { goTo(current - 1); restart(); });
  document.querySelector(".carousel-btn.next")?.addEventListener("click", () => { goTo(current + 1); restart(); });
  dots.forEach((d, i) => d.addEventListener("click", () => { goTo(i); restart(); }));

  tick();
}

/* ===== GALLERY PREVIEW ===== */
function initGallery() {
  const state = { putri: 0, putra: 0 };

  function goToPage(panelEl, key, idx) {
    const track = panelEl.querySelector(".gallery-track-wrap");
    const dots = panelEl.querySelectorAll(".gallery-dot");
    const pages = track.children.length;
    state[key] = (idx + pages) % pages;
    track.style.transform = `translateX(-${state[key] * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === state[key]));
  }

  document.querySelectorAll(".gallery-panel").forEach((panel) => {
    const key = panel.id.replace("galeri-", "");
    panel.querySelector(".gallery-prev-btn").addEventListener("click", () => goToPage(panel, key, state[key] - 1));
    panel.querySelector(".gallery-next-btn").addEventListener("click", () => goToPage(panel, key, state[key] + 1));
    panel.querySelectorAll(".gallery-dot").forEach((dot, i) => {
      dot.addEventListener("click", () => goToPage(panel, key, i));
    });
  });

  document.querySelectorAll(".gallery-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gallery-tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll(".gallery-panel").forEach((p) => p.classList.remove("is-active"));
      document.getElementById(`galeri-${btn.dataset.galeri}`).classList.add("is-active");
    });
  });
}

/* ===== INITIALIZE ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderFloorPlan(publicState.currentKos);
  renderFacilities("putri");
  updateAvailableCount();
  observeReveal();
  setupEvents();
  initHeroCarousel();
  initGallery();
  if (window.lucide) window.lucide.createIcons();
});

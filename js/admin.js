/* ===== ADMIN STATE ===== */
const adminState = {
  currentKos: "putri",
  selectedRoom: null,
  filter: "semua",
  searchQuery: ""
};

/* ===== SHARED HELPERS ===== */
const STATUS_META_ADMIN = {
  kosong: { label: "Kosong", css: "kosong" },
  terisi: { label: "Terisi", css: "terisi" },
  "akan-kosong": { label: "Akan Kosong", css: "akan-kosong" },
  perbaikan: { label: "Perbaikan", css: "perbaikan" }
};

function formatMoney(value) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function roomById(kosKey, roomId) {
  return window.KOS_DATA[kosKey].rooms.find((room) => room.id === roomId);
}

function isRoomMatch(room) {
  const matchStatus = adminState.filter === "semua" || room.status === adminState.filter;
  const query = adminState.searchQuery.trim().toLowerCase();
  const target = `${room.id} ${room.occupant?.name || ""}`.toLowerCase();
  const matchSearch = !query || target.includes(query);
  return { matchStatus, matchSearch };
}

/* ===== FLOOR PLAN RENDER ===== */
function adminRoomGroup(room, x, y, topRow) {
  const roomMatch = isRoomMatch(room);
  const hasBathroom = room.type.toLowerCase().includes("dalam");
  const doorY = topRow ? y + 130 : y;
  const arcPath = topRow
    ? `M ${x + 60} ${doorY - 1} A 22 22 0 0 1 ${x + 82} ${doorY - 22}`
    : `M ${x + 60} ${doorY + 1} A 22 22 0 0 0 ${x + 82} ${doorY + 22}`;
  const muted = roomMatch.matchStatus ? "" : "room-muted";
  const highlighted = roomMatch.matchSearch ? "" : "room-muted";
  const focusClass = adminState.searchQuery && roomMatch.matchSearch ? "room-highlight" : "";

  return `
    <g class="room status-${room.status} ${muted} ${highlighted} ${focusClass}" data-room-id="${room.id}" transform="translate(${x}, ${y})">
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
      <text class="fp-price" x="66" y="122">${(room.price / 1000000).toFixed(1).replace(".0", "")}jt/th</text>
    </g>
  `;
}

function adminPutriPlan() {
  const rooms = window.KOS_DATA.putri.rooms;
  const roomMarkup = rooms.map((room, index) => {
    const col = index % 5;
    const top = index < 5;
    return adminRoomGroup(room, 42 + col * 130, top ? 92 : 288, top);
  }).join("");
  return `
    <svg viewBox="0 0 880 540" aria-label="Denah admin putri">
      <rect class="fp-wall-outer" x="24" y="60" width="830" height="430" rx="10"></rect>
      <line class="fp-wall-inner" x1="24" y1="250" x2="694" y2="250"></line>
      <text class="fp-corridor" x="280" y="244">— KORIDOR —</text>
      ${roomMarkup}
      <rect class="fp-utility" x="704" y="100" width="138" height="190" rx="10"></rect>
      <text class="fp-note" x="723" y="124">KM Bersama</text>
      <rect class="fp-utility" x="704" y="308" width="138" height="150" rx="10"></rect>
      <text class="fp-note" x="714" y="332">Mushola / Ruang Tamu</text>
      <rect class="fp-entry-banner" x="280" y="500" width="300" height="24" rx="8"></rect>
      <text class="fp-entry-text" x="338" y="517">▼ PINTU MASUK ▼</text>
    </svg>
  `;
}

function adminPutraPlan() {
  const rooms = window.KOS_DATA.putra.rooms;
  const roomMarkup = rooms.map((room, index) => {
    const col = index % 5;
    const top = index < 5;
    return adminRoomGroup(room, 42 + col * 130, top ? 186 : 390, top);
  }).join("");
  return `
    <svg viewBox="0 0 880 660" aria-label="Denah admin putra">
      <rect class="fp-garage" x="24" y="22" width="832" height="128" rx="10"></rect>
      <text class="fp-note" x="44" y="46">GARASI</text>
      <rect class="fp-wall-outer" x="24" y="166" width="832" height="360" rx="10"></rect>
      <line class="fp-wall-inner" x1="24" y1="352" x2="694" y2="352"></line>
      <text class="fp-corridor" x="274" y="346">— KORIDOR —</text>
      ${roomMarkup}
      <rect class="fp-kitchen-box" x="704" y="186" width="138" height="170" rx="10"></rect>
      <text class="fp-note" x="744" y="210">DAPUR</text>
      <rect class="fp-utility" x="704" y="372" width="138" height="92" rx="10"></rect>
      <text class="fp-note" x="726" y="394">KM Bersama (3)</text>
      <rect x="704" y="474" width="138" height="42" rx="8" fill="var(--status-terisi-soft)" stroke="var(--line-dark)" stroke-width="1"></rect>
      <text class="fp-note" x="720" y="500">Wifi 100Mbps</text>
      <rect class="fp-entry-banner" x="280" y="626" width="300" height="24" rx="8"></rect>
      <text class="fp-entry-text" x="338" y="643">▼ PINTU MASUK ▼</text>
    </svg>
  `;
}

function renderAdminFloorplan() {
  const target = document.getElementById("adminFloorPlan");
  target.innerHTML = adminState.currentKos === "putri" ? adminPutriPlan() : adminPutraPlan();
  target.querySelectorAll(".room").forEach((node) => {
    node.addEventListener("click", () => {
      const room = roomById(adminState.currentKos, node.dataset.roomId);
      openSidePanel(room);
    });
  });
}

/* ===== METRICS & TABLE ===== */
function renderMetrics() {
  const allRooms = [...window.KOS_DATA.putri.rooms, ...window.KOS_DATA.putra.rooms];
  const vacant = allRooms.filter((room) => room.status === "kosong").length;
  const active = allRooms.filter((room) => room.status === "terisi" || room.status === "akan-kosong").length;
  const due = allRooms.filter((room) => room.paymentStatus === "menunggak" || room.paymentStatus === "belum-bayar").length;
  document.getElementById("metricVacant").textContent = vacant;
  document.getElementById("metricActive").textContent = `${active} orang`;
  document.getElementById("metricDue").textContent = `${due} kamar`;
}

function paymentBadge(paymentStatus) {
  if (paymentStatus === "menunggak") return "Menunggak";
  if (paymentStatus === "belum-bayar") return "Belum Bayar";
  return "Lunas";
}

function renderDueTable() {
  const allRooms = [...window.KOS_DATA.putri.rooms, ...window.KOS_DATA.putra.rooms];
  const rows = allRooms
    .filter((room) => room.occupant && room.dueInDays <= 7)
    .sort((a, b) => a.dueInDays - b.dueInDays)
    .map((room) => `
      <tr>
        <td>${room.id}</td>
        <td>${room.occupant.name}</td>
        <td>${room.dueDate}</td>
        <td>${room.dueInDays < 0 ? `${Math.abs(room.dueInDays)} hari lewat` : `${room.dueInDays} hari`}</td>
        <td><span class="status-pill ${room.paymentStatus}">${paymentBadge(room.paymentStatus)}</span></td>
        <td><a class="btn btn-secondary" href="https://wa.me/${room.occupant.phone}" target="_blank" rel="noreferrer">Kirim WA</a></td>
      </tr>
    `)
    .join("");
  document.getElementById("dueTableBody").innerHTML = rows || `
    <tr><td colspan="6">Tidak ada jatuh tempo minggu ini.</td></tr>
  `;
}

/* ===== CLOCK ===== */
function updateClock() {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  document.getElementById("todayDateLabel").textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById("liveClock").textContent = now.toLocaleTimeString("id-ID");
}

/* ===== DRAWER ===== */
function drawerBilling(room) {
  const payment = room.paymentStatus;
  const desc = payment === "lunas"
    ? "Pembayaran sewa sudah lunas."
    : payment === "menunggak"
      ? "Pembayaran melewati tenggat. Segera kirim reminder."
      : "Tagihan belum dibayar. Perlu follow-up.";
  const amount = payment === "lunas" ? room.price : Math.round(room.price / 12);
  return `
    <div class="drawer-section">
      <h4>💳 STATUS TAGIHAN</h4>
      <div class="billing-card ${payment}">
        <div>
          <span class="status-pill ${payment}">${paymentBadge(payment)}</span>
          <p>${desc}</p>
        </div>
        <strong>${formatMoney(amount)}</strong>
      </div>
      ${payment !== "lunas" && room.occupant ? `<a class="btn btn-wa full-width-action" href="https://wa.me/${room.occupant.phone}" target="_blank" rel="noreferrer"><i data-lucide="send"></i>Kirim Reminder via WA</a>` : ""}
    </div>
  `;
}

function openSidePanel(room) {
  adminState.selectedRoom = room;
  document.getElementById("drawerRoomTitle").textContent = `Kamar ${room.id}`;
  const statusBadge = document.getElementById("drawerStatusBadge");
  statusBadge.className = `status-pill ${room.status}`;
  statusBadge.textContent = STATUS_META_ADMIN[room.status].label;

  const repairs = room.repairs.length
    ? room.repairs.map((item) => `<li>${item.date} — ${item.note}</li>`).join("")
    : "<li>Tidak ada histori perbaikan</li>";

  const occupantSection = room.occupant ? `
    <div class="drawer-section">
      <h4>👤 DATA PENGHUNI</h4>
      <div class="drawer-occupant">
        <span class="avatar">${room.occupant.initials}</span>
        <div>
          <strong>${room.occupant.name}</strong><br>
          <span class="badge-verified">Verified</span>
          <p>${room.occupant.job}</p>
        </div>
      </div>
      <a class="btn btn-wa" href="https://wa.me/${room.occupant.phone}" target="_blank" rel="noreferrer">WhatsApp ${room.occupant.phone}</a>
      <div class="mini-grid" style="margin-top:10px;">
        <div class="mini-box"><small>Tanggal Masuk</small><strong>01 Jan 2026</strong></div>
        <div class="mini-box"><small>Jatuh Tempo</small><strong>${room.dueDate}</strong></div>
      </div>
      <div class="mini-box" style="margin-top:8px;"><small>Kontak darurat</small><strong>${room.occupant.emergency}</strong></div>
      <div class="mini-box" style="margin-top:8px;"><small>Foto KTP</small><strong>Placeholder</strong></div>
    </div>
  ` : `
    <div class="drawer-section">
      <h4>👤 DATA PENGHUNI</h4>
      <p>Kamar belum memiliki penghuni aktif.</p>
    </div>
  `;

  const warning = room.status === "akan-kosong"
    ? `<p class="warn">⚠ Akan segera kosong, siapkan publish ulang!</p>`
    : "";

  const quickActions = `
    <div class="drawer-section">
      <h4>⚡ QUICK ACTIONS</h4>
      <div class="quick-actions">
        <button><i data-lucide="calendar-plus"></i>Perpanjang Sewa</button>
        <button><i data-lucide="door-open"></i>Proses Check-out</button>
        <button><i data-lucide="wrench"></i>Catat Perbaikan</button>
        <button><i data-lucide="history"></i>Histori Penghuni</button>
      </div>
      ${room.status === "kosong" ? '<button class="btn btn-wa full-width-action">Daftarkan Penghuni Baru</button>' : ""}
      ${room.status === "perbaikan" ? '<button class="btn btn-primary full-width-action">Tandai Selesai</button>' : ""}
    </div>
  `;

  document.getElementById("drawerBody").innerHTML = `
    <div class="drawer-section">
      <h4>🏠 INFORMASI KAMAR</h4>
      <div class="mini-grid">
        <div class="mini-box"><small>Tipe</small><strong>${room.type}</strong></div>
        <div class="mini-box"><small>Harga Dasar</small><strong>${formatMoney(room.price)}/th</strong></div>
      </div>
      <div class="mini-box" style="margin-top:8px;">
        <small>Histori Perbaikan</small>
        <ul>${repairs}</ul>
      </div>
    </div>
    ${occupantSection}
    <div class="countdown-card">
      <p>SISA MASA SEWA</p>
      <h2>${room.occupancyMonthsLeft || 0} bulan ${room.vacantInDays || 18} hari</h2>
      ${warning}
    </div>
    ${drawerBilling(room)}
    ${quickActions}
  `;

  document.getElementById("drawerBackdrop").classList.add("is-open");
  document.getElementById("roomDrawer").classList.add("is-open");
  document.getElementById("roomDrawer").setAttribute("aria-hidden", "false");
  if (window.lucide) window.lucide.createIcons();
}

function closeSidePanel() {
  document.getElementById("drawerBackdrop").classList.remove("is-open");
  document.getElementById("roomDrawer").classList.remove("is-open");
  document.getElementById("roomDrawer").setAttribute("aria-hidden", "true");
}

/* ===== EVENT BINDINGS ===== */
function setupAdminEvents() {
  document.querySelectorAll(".admin-kos-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-kos-tab").forEach((item) => item.classList.remove("is-active"));
      btn.classList.add("is-active");
      adminState.currentKos = btn.dataset.kos;
      renderAdminFloorplan();
    });
  });

  document.querySelectorAll("#adminFilterChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#adminFilterChips .chip").forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      adminState.filter = chip.dataset.filter;
      renderAdminFloorplan();
    });
  });

  document.getElementById("roomSearchInput").addEventListener("input", (event) => {
    adminState.searchQuery = event.target.value;
    renderAdminFloorplan();
  });

  document.getElementById("closeDrawerBtn").addEventListener("click", closeSidePanel);
  document.getElementById("drawerBackdrop").addEventListener("click", closeSidePanel);

  document.getElementById("adminMenuToggle").addEventListener("click", () => {
    document.getElementById("adminSidebar").classList.toggle("is-open");
  });
}

/* ===== INTERSECTION ANIMATION ===== */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

/* ===== INITIALIZE ===== */
document.addEventListener("DOMContentLoaded", () => {
  renderAdminFloorplan();
  renderMetrics();
  renderDueTable();
  updateClock();
  setInterval(updateClock, 1000);
  setupAdminEvents();
  initReveal();
  if (window.lucide) window.lucide.createIcons();
});

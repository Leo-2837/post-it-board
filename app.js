const COLORS = ["#FFD966", "#FFBC6E", "#A7E9AF", "#B2C9F8", "#F7A9A8"];
const app = document.getElementById("app");

// URL Board-ID
const params = new URLSearchParams(window.location.search);
const boardId = params.get("board");

// ---------- USERNAME ----------
function getUsername() {
  let name = localStorage.getItem("username");
  if (!name) {
    name = prompt("Wie heißt du?");
    if (name) localStorage.setItem("username", name);
  }
  return name;
}

function changeUsername() {
  const name = prompt("Neuer Name:");
  if (name) {
    localStorage.setItem("username", name);
    renderBoard();
  }
}

// ---------- STORAGE ----------
function loadBoard(id) {
  return JSON.parse(localStorage.getItem(`board_${id}`) || "[]");
}

function saveBoard(id, events) {
  localStorage.setItem(`board_${id}`, JSON.stringify(events));
}

// ---------- BOARD ----------
function createBoard() {
  const id = Math.random().toString(36).slice(2, 8);
  location.href = `?board=${id}`;
}

// ---------- MENU ----------
function renderMenu() {
  app.innerHTML = `
    <div class="board">
      <div class="menu">
        <h1>📌 Wochenend‑Wand</h1>

        <button class="primary" onclick="createBoard()">
          ➕ Neues Board erstellen
        </button>

        <hr style="margin:1rem 0">

        <input id="boardInput" placeholder="Board‑ID eingeben">
        <button class="secondary" onclick="openBoard()">
          🔗 Board öffnen
        </button>
      </div>
    </div>
  `;
}

function openBoard() {
  const id = document.getElementById("boardInput").value.trim();
  if (id) location.href = `?board=${id}`;
}

// ---------- BOARD VIEW ----------
function renderBoard() {
  const events = loadBoard(boardId);
  const username = getUsername() || "Anonym";

  app.innerHTML = `
    <div class="board">
      <h1>📌 Board: ${boardId}</h1>

      <p class="small">
        👤 Du bist: <b>${username}</b>
        <button class="action" onclick="changeUsername()">✏️ ändern</button>
      </p>

      <p class="small">
        🔗 Link teilen: <code>${location.href}</code>
      </p>

      <div class="menu">
        <input id="title" placeholder="Event‑Titel">
        <input id="date" type="date">
        <textarea id="desc" placeholder="Kurzbeschreibung / Text"></textarea>
        <button class="primary" onclick="addEvent()">📌 Event hinzufügen</button>
      </div>

      <div class="day">
        <div class="notes">
          ${events.map(renderNote).join("")}
        </div>
      </div>
    </div>
  `;
}

// ---------- NOTE ----------
function renderNote(e) {
  return `
    <div class="note" style="--color:${e.color}">
      <img src="pin.svg" class="pin" alt="Pin">

      <div class="small">${e.date}</div>
      <h3>${e.title}</h3>
      <p class="small">${e.desc || ""}</p>

      <div class="small">
        👥 ${e.people.length ? e.people.join(", ") : "noch offen"}
      </div>

      <div class="small">
        ${e.notes.map(n => `🖊️ <b>${n.name}</b>: ${n.text}`).join("<br>")}
      </div>

      <button class="action" onclick="joinEvent('${e.id}')">➕ Dabei</button>
      <button class="action" onclick="addNote('${e.id}')">📝 Notiz</button>
    </div>
  `;
}

// ---------- ACTIONS ----------
function addEvent() {
  const title = document.getElementById("title").value.trim();
  if (!title) return;

  const date = document.getElementById("date").value || "offen";
  const desc = document.getElementById("desc").value.trim();

  const events = loadBoard(boardId);

  events.push({
    id: Date.now().toString(),
    title,
    date,
    desc,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    people: [],
    notes: []
  });

  saveBoard(boardId, events);
  renderBoard();
}

function joinEvent(id) {
  const username = getUsername();
  if (!username) return;

  const events = loadBoard(boardId);
  const ev = events.find(e => e.id === id);

  if (!ev.people.includes(username)) {
    ev.people.push(username);
    saveBoard(boardId, events);
    renderBoard();
  }
}

function addNote(id) {
  const username = getUsername();
  if (!username) return;

  const text = prompt("Deine Notiz:");
  if (!text) return;

  const events = loadBoard(boardId);
  const ev = events.find(e => e.id === id);

  ev.notes.push({ name: username, text });
  saveBoard(boardId, events);
  renderBoard();
}

// ---------- START ----------
if (!boardId) {
  renderMenu();
} else {
  renderBoard();
}
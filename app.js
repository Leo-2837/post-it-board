const firebaseConfig = {
  apiKey: "AIzaSyC9FeX8VW_yCoqhrd5Og5ohXqusc7kjnJk",
  authDomain: "post-it-board-for-friends.firebaseapp.com",
  projectId: "post-it-board-for-friends",
  storageBucket: "post-it-board-for-friends.firebasestorage.app",
  messagingSenderId: "40564978592",
  appId: "1:40564978592:web:02dbb1e3ccf53b9450eac5"
};

// ---------- BASIS ----------
const app = document.getElementById("app");
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

// ---------- START ----------
if (!boardId) {
  renderMenu();
} else {
  listenToBoard();
}

// ---------- MENU ----------
function renderMenu() {
  app.innerHTML = `
    <div class="board">
      <div class="menu">
        <h1>📌 Wochenend‑Wand</h1>
        <button onclick="createBoard()" class="primary">
          ➕ Neues Board
        </button>
      </div>
    </div>
  `;
}

function createBoard() {
  const id = Math.random().toString(36).slice(2, 8);
  location.href = `?board=${id}`;
}

// ---------- FIRESTORE LIVE ----------
function listenToBoard() {
  db.collection("boards").doc(boardId)
    .onSnapshot(doc => {
      const events = doc.exists ? doc.data().events : [];
      renderBoard(events);
    });
}

// ---------- UI ----------
function renderBoard(events) {
  const user = getUsername() || "Anonym";

  app.innerHTML = `
    <div class="board">
      <h1>📌 Board: ${boardId}</h1>
      <p class="small">👤 ${user}</p>

      <div class="menu">
        <input id="title" placeholder="Event‑Titel">
        <textarea id="desc" placeholder="Beschreibung"></textarea>
        <button onclick="addEvent('${user}')" class="primary">
          📌 Event hinzufügen
        </button>
      </div>

      <div class="notes">
        ${events.map(e => renderEvent(e, user)).join("")}
      </div>
    </div>
  `;
}

function renderEvent(e, user) {
  return `
    <div class="note" style="--color:${e.color}">
      <img src="pin.svg" class="pin">

      <h3>${e.title}</h3>
      <p class="small">${e.desc}</p>

      <p class="small">
        👥 ${e.people.length} Personen<br>
        ${e.people.join(", ")}
      </p>

      <button onclick="joinEvent('${e.id}')">✅ Dabei</button>

      ${e.creator === user
        ? `<button onclick="deleteEvent('${e.id}')">🗑️ Löschen</button>`
        : ""
      }
    </div>
  `;
}

// ---------- FIRESTORE ACTIONS ----------
function addEvent(user) {
  const title = document.getElementById("title").value.trim();
  const desc = document.getElementById("desc").value.trim();
  if (!title) return;

  db.collection("boards").doc(boardId).get().then(doc => {
    const events = doc.exists ? doc.data().events : [];

    events.push({
      id: Date.now().toString(),
      title,
      desc,
      creator: user,
      people: [],
      color: "#FFD966"
    });

    db.collection("boards").doc(boardId).set({ events });
  });
}

function joinEvent(id) {
  const user = getUsername();
  db.collection("boards").doc(boardId).get().then(doc => {
    const events = doc.data().events;
    const ev = events.find(e => e.id === id);
    if (!ev.people.includes(user)) ev.people.push(user);
    db.collection("boards").doc(boardId).set({ events });
  });
}

function deleteEvent(id) {
  db.collection("boards").doc(boardId).get().then(doc => {
    const events = doc.data().events.filter(e => e.id !== id);
    db.collection("boards").doc(boardId).set({ events });
  });
}
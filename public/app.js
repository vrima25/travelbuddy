// ── STATE ────────────────────────────────────────────────
let sessions = JSON.parse(localStorage.getItem("tb_sessions") || "[]");
let currentSessionId = null;
let history = [];
let isLoading = false;
let isDark = localStorage.getItem("tb_theme") === "dark";
let selectedFile = null;

// ── INIT ─────────────────────────────────────────────────
if (isDark) {
  document.documentElement.setAttribute("data-theme", "dark");
  document.getElementById("theme-toggle").textContent = "☀️";
}

renderHistory();

// ── THEME ────────────────────────────────────────────────
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  document.getElementById("theme-toggle").textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("tb_theme", isDark ? "dark" : "light");
}

// ── UTILS ────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTitle(text) {
  return text.length > 36 ? text.slice(0, 36) + "…" : text;
}

function saveSessions() {
  localStorage.setItem("tb_sessions", JSON.stringify(sessions));
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function handleKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ── FILE UPLOAD ──────────────────────────────────────────
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("preview-img").src = ev.target.result;
    document.getElementById("img-preview").style.display = "inline-block";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  selectedFile = null;
  document.getElementById("file-input").value = "";
  document.getElementById("img-preview").style.display = "none";
  document.getElementById("preview-img").src = "";
}

// ── HISTORY SIDEBAR ───────────────────────────────────────
function renderHistory() {
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");

  if (sessions.length === 0) {
    list.innerHTML = "";
    list.appendChild(empty);
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = "";

  [...sessions].reverse().forEach((s) => {
    const div = document.createElement("div");
    div.className =
      "history-item" + (s.id === currentSessionId ? " active" : "");
    div.dataset.id = s.id;
    div.innerHTML = `
      <span class="hi-icon">✈️</span>
      <span class="hi-title">${s.title}</span>
      <button class="hi-delete" title="Hapus">✕</button>
    `;
    div.querySelector(".hi-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSession(s.id);
    });
    div.addEventListener("click", () => loadSession(s.id));
    list.appendChild(div);
  });
}

// ── SESSION MANAGEMENT ────────────────────────────────────
function newChat() {
  currentSessionId = null;
  history = [];
  removeImage();

  document.getElementById("messages").innerHTML = "";
  document.getElementById("messages").style.display = "none";
  document.getElementById("chips-bar").style.display = "none";
  document.getElementById("welcome").style.display = "flex";

  renderHistory();
}

function loadSession(id) {
  const session = sessions.find((s) => s.id === id);
  if (!session) return;

  currentSessionId = id;
  history = [...session.messages];

  const msgs = document.getElementById("messages");
  msgs.innerHTML = "";
  msgs.style.display = "flex";
  document.getElementById("welcome").style.display = "none";
  document.getElementById("chips-bar").style.display = "flex";

  session.messages.forEach((m) => {
    renderBubble(
      m.role === "user" ? "user" : "bot",
      m.content,
      m.ts,
      m.imagePreview,
    );
  });

  msgs.scrollTop = msgs.scrollHeight;
  renderHistory();
}

function deleteSession(id) {
  sessions = sessions.filter((s) => s.id !== id);
  saveSessions();
  if (currentSessionId === id) newChat();
  else renderHistory();
}

// ── RENDER BUBBLE ─────────────────────────────────────────
function renderBubble(role, text, ts, imagePreview) {
  const msgs = document.getElementById("messages");
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper";

  const msg = document.createElement("div");
  msg.className = "msg " + role;

  const formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  let imgTag = "";
  if (imagePreview) {
    imgTag = `<img src="${imagePreview}" alt="uploaded" />`;
  }

  if (role === "bot") {
    msg.innerHTML = `<div class="msg-avatar">🌏</div><div class="bubble">${formatted}</div>`;
  } else {
    msg.innerHTML = `<div class="bubble">${imgTag}${formatted}</div>`;
  }

  const time = document.createElement("div");
  time.className = "msg-time";
  time.textContent = formatTime(ts || Date.now());

  wrapper.appendChild(msg);
  wrapper.appendChild(time);
  msgs.appendChild(wrapper);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── TYPING INDICATOR ──────────────────────────────────────
function showTyping() {
  const msgs = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = "msg bot";
  div.id = "typing-ind";
  div.innerHTML = `<div class="msg-avatar">🌏</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("typing-ind");
  if (t) t.remove();
}

// ── SEND MESSAGE ──────────────────────────────────────────
async function sendMessage() {
  if (isLoading) return;

  const input = document.getElementById("user-input");
  const text = input.value.trim();
  const file = selectedFile;

  if (!text && !file) return;

  input.value = "";
  autoResize(input);

  // Switch to chat view
  document.getElementById("welcome").style.display = "none";
  document.getElementById("messages").style.display = "flex";
  document.getElementById("chips-bar").style.display = "flex";

  const ts = Date.now();
  const imagePreview = file ? document.getElementById("preview-img").src : null;

  renderBubble("user", text || "(mengirim gambar)", ts, imagePreview);

  // Create session if new
  if (!currentSessionId) {
    currentSessionId = generateId();
    sessions.push({
      id: currentSessionId,
      title: getTitle(text || "Gambar dikirim"),
      messages: [],
      createdAt: ts,
    });
  }

  const userMsg = {
    role: "user",
    content: text || "(mengirim gambar)",
    ts,
    imagePreview,
  };
  history.push(userMsg);

  removeImage();
  isLoading = true;
  document.getElementById("send-btn").disabled = true;
  showTyping();

  try {
    let reply;

    if (file) {
      // Kirim dengan gambar via FormData → /api/chat/image
      const formData = new FormData();
      formData.append("image", file);
      formData.append(
        "message",
        text ||
          "Tolong analisis gambar ini dan berikan rekomendasi travel yang relevan!",
      );
      // Kirim history tanpa imagePreview (tidak bisa di-serialize ke API)
      const safeHistory = history.slice(0, -1).map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.content,
      }));
      formData.append("history", JSON.stringify(safeHistory));

      const res = await fetch("/api/chat/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim gambar");
      reply = data.reply;
    } else {
      // Kirim teks biasa → /api/chat
      const apiMessages = history.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      reply = data.reply;
    }

    // removeTyping();
    forceReset();
    const replyTs = Date.now();
    renderBubble("bot", reply, replyTs);
    history.push({ role: "bot", content: reply, ts: replyTs });
  } catch (err) {
    // removeTyping();
    forceReset();
    const errTs = Date.now();
    const errMsg = `Waduh, ada masalah nih: ${err.message}. Coba lagi ya! 😅`;
    renderBubble("bot", errMsg, errTs);
    history.push({ role: "bot", content: errMsg, ts: errTs });
  }

  // Simpan sesi
  const sIdx = sessions.findIndex((s) => s.id === currentSessionId);
  if (sIdx !== -1) sessions[sIdx].messages = [...history];
  saveSessions();
  renderHistory();

  isLoading = false;
  document.getElementById("send-btn").disabled = false;
}

// ── SHORTCUTS ─────────────────────────────────────────────
function sendFromWelcome(text) {
  forceReset();
  document.getElementById("user-input").value = text;
  sendMessage();
}

function sendChip(text) {
  forceReset();
  document.getElementById("user-input").value = text;
  sendMessage();
}

function forceReset() {
  isLoading = false;
  document.getElementById("send-btn").disabled = false;
  removeTyping();
}

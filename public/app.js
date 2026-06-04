// ---- DOM References ----
const chatContainer  = document.querySelector("#chatContainer");
const askInput       = document.querySelector("#askInput");
const sendBtn        = document.querySelector("#sendBtn");
const providerSelect = document.querySelector("#provider");
const modelSelect    = document.querySelector("#model");
const systemToggleBtn = document.querySelector("#systemToggleBtn");
const systemArea     = document.querySelector("#systemArea");
const systemInput    = document.querySelector("#systemInput");
const clearBtn       = document.querySelector("#clearBtn");
const attachBtn      = document.querySelector("#attachBtn");
const imageInput     = document.querySelector("#imageInput");
const imagePreviewBar = document.querySelector("#imagePreviewBar");
const previewImg     = document.querySelector("#previewImg");
const previewName    = document.querySelector("#previewName");
const removeImageBtn = document.querySelector("#removeImageBtn");
const newChatBtn     = document.querySelector("#newChatBtn");
const sessionList    = document.querySelector("#sessionList");

// ---- State ----
let messages        = [];
let selectedImage   = null;
let regenBtn        = null;
let currentSessionId = null;

// ---- Provider / Model Maps ----
const providerModelMap = {
  google: "gemma-4-26b-a4b-it",
  groq:   "openai/gpt-oss-120b",
};

const modelProviderMap = {
  "gemma-4-26b-a4b-it":   "google",
  "openai/gpt-oss-120b":  "groq",
};

const providerAvatarMap = {
  google: { bg: "#10a37f", label: "G" },
  groq:   { bg: "#7c3aed", label: "Q" },
};

providerSelect.addEventListener("change", () => {
  modelSelect.value = providerModelMap[providerSelect.value];
});

modelSelect.addEventListener("change", () => {
  providerSelect.value = modelProviderMap[modelSelect.value];
});

// ---- System Prompt ----
systemToggleBtn.addEventListener("click", () => {
  systemArea.classList.toggle("open");
  systemToggleBtn.classList.toggle("active");
});

// ---- Clear (현재 세션 초기화) ----
clearBtn.addEventListener("click", () => {
  messages = [];
  chatContainer.innerHTML = "";
  if (regenBtn) regenBtn = null;
  saveCurrentSession();
});

// ---- Image ----
attachBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const [meta, base64] = dataUrl.split(",");
    const mimeType = meta.match(/:(.*?);/)[1];
    selectedImage = { base64, mimeType, dataUrl };
    previewImg.src = dataUrl;
    previewName.textContent = file.name;
    imagePreviewBar.classList.add("visible");
    updateSendBtn();
  };
  reader.readAsDataURL(file);
  imageInput.value = "";
});

removeImageBtn.addEventListener("click", () => {
  selectedImage = null;
  imagePreviewBar.classList.remove("visible");
  previewImg.src = "";
  previewName.textContent = "";
  updateSendBtn();
});

// ---- Textarea Auto-resize ----
askInput.addEventListener("input", () => {
  askInput.style.height = "auto";
  askInput.style.height = Math.min(askInput.scrollHeight, 180) + "px";
  updateSendBtn();
});

function updateSendBtn() {
  sendBtn.disabled = !askInput.value.trim() && !selectedImage;
}

// ---- Session Management ----
function loadSessions() {
  return JSON.parse(localStorage.getItem("chatSessions") || "[]");
}

function saveSessions(sessions) {
  localStorage.setItem("chatSessions", JSON.stringify(sessions));
}

function createNewSession() {
  const session = {
    id: Date.now().toString(),
    title: "새 대화",
    provider: providerSelect.value,
    model: modelSelect.value,
    messages: [],
    createdAt: Date.now(),
  };
  currentSessionId = session.id;
  messages = [];

  const sessions = loadSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  renderSessionList();
}

function saveCurrentSession() {
  if (!currentSessionId) return;
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === currentSessionId);

  const firstUserMsg = messages.find((m) => m.role === "user");
  const title = firstUserMsg
    ? firstUserMsg.content.slice(0, 28) + (firstUserMsg.content.length > 28 ? "…" : "")
    : "새 대화";

  const updated = {
    id: currentSessionId,
    title,
    provider: providerSelect.value,
    model: modelSelect.value,
    messages: [...messages],
    createdAt: idx >= 0 ? sessions[idx].createdAt : Date.now(),
  };

  if (idx >= 0) sessions[idx] = updated;
  else sessions.unshift(updated);

  saveSessions(sessions);
  renderSessionList();
}

function loadSession(sessionId) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;

  currentSessionId = session.id;
  messages = [...session.messages];
  providerSelect.value = session.provider;
  modelSelect.value = session.model;
  regenBtn = null;

  chatContainer.innerHTML = "";
  messages.forEach((m) => addMessageRow(m.role, m.content));

  renderSessionList();
}

function deleteSession(sessionId, e) {
  e.stopPropagation();
  const sessions = loadSessions().filter((s) => s.id !== sessionId);
  saveSessions(sessions);

  if (currentSessionId === sessionId) {
    chatContainer.innerHTML = "";
    messages = [];
    regenBtn = null;
    if (sessions.length > 0) loadSession(sessions[0].id);
    else createNewSession();
  } else {
    renderSessionList();
  }
}

function renderSessionList() {
  const sessions = loadSessions();
  sessionList.innerHTML = "";

  sessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = "session-item" + (session.id === currentSessionId ? " active" : "");

    const titleSpan = document.createElement("span");
    titleSpan.className = "session-title";
    titleSpan.textContent = session.title;

    const delBtn = document.createElement("button");
    delBtn.className = "session-delete";
    delBtn.textContent = "✕";
    delBtn.title = "삭제";
    delBtn.addEventListener("click", (e) => deleteSession(session.id, e));

    item.append(titleSpan, delBtn);
    item.addEventListener("click", () => loadSession(session.id));
    sessionList.append(item);
  });
}

newChatBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  regenBtn = null;
  createNewSession();
});

// ---- Message Rendering ----
function addMessageRow(role, content = "", imageDataUrl = null) {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}`;
  if (role === "user") {
    avatar.textContent = "나";
  } else {
    const info = providerAvatarMap[providerSelect.value] || { bg: "#10a37f", label: "AI" };
    avatar.style.background = info.bg;
    avatar.textContent = info.label;
  }

  // Content wrapper
  const msgContent = document.createElement("div");
  msgContent.className = "msg-content";

  // Bubble
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;

  if (imageDataUrl) {
    const img = document.createElement("img");
    img.src = imageDataUrl;
    img.className = "bubble-image";
    bubble.append(img);
  }

  if (role === "assistant" && content) {
    bubble.innerHTML = DOMPurify.sanitize(marked.parse(content));
  } else if (content) {
    bubble.append(document.createTextNode(content));
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "msg-actions";

  if (role === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "action-btn";
    copyBtn.textContent = "복사";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(bubble._rawText || bubble.textContent).then(() => {
        copyBtn.textContent = "복사됨!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = "복사";
          copyBtn.classList.remove("copied");
        }, 1500);
      });
    });
    actions.append(copyBtn);
  }

  msgContent.append(bubble, actions);
  row.append(avatar, msgContent);

  chatContainer.append(row);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return bubble;
}

// ---- Streaming ----
async function streamResponse(bubble, imageBase64 = null, imageMimeType = null) {
  let fullText = "";
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider:     providerSelect.value,
        model:        modelSelect.value,
        messages,
        systemPrompt: systemInput.value.trim(),
        imageBase64,
        imageMimeType,
      }),
    });

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") break outer;
        try {
          const { chunk, error } = JSON.parse(data);
          if (error) throw new Error(error);
          fullText += chunk;
          bubble._rawText = fullText;
          bubble.innerHTML = DOMPurify.sanitize(marked.parse(fullText));
          chatContainer.scrollTop = chatContainer.scrollHeight;
        } catch {}
      }
    }
    return fullText;
  } catch {
    bubble.textContent = "오류가 발생했습니다. 다시 시도해주세요.";
    return null;
  }
}

// ---- Regen Button ----
function addRegenBtn(bubble) {
  regenBtn = document.createElement("button");
  regenBtn.className = "action-btn regen-btn";
  regenBtn.textContent = "다시 생성";
  regenBtn.addEventListener("click", regenerate);
  bubble.parentElement.querySelector(".msg-actions").append(regenBtn);
}

async function regenerate() {
  const rows = chatContainer.querySelectorAll(".msg-row.assistant");
  rows[rows.length - 1].remove();
  messages.pop();
  regenBtn = null;

  sendBtn.disabled = true;
  const bubble = addMessageRow("assistant", "");
  const fullText = await streamResponse(bubble);

  if (fullText !== null) {
    messages.push({ role: "assistant", content: fullText });
    saveCurrentSession();
    addRegenBtn(bubble);
  }

  sendBtn.disabled = false;
  askInput.focus();
}

// ---- Send Message ----
async function sendMessage() {
  const ask = askInput.value.trim();
  if (!ask && !selectedImage) return;

  askInput.value = "";
  askInput.style.height = "auto";
  sendBtn.disabled = true;
  if (regenBtn) { regenBtn.remove(); regenBtn = null; }

  const imageBase64   = selectedImage?.base64   || null;
  const imageMimeType = selectedImage?.mimeType || null;
  const imageDataUrl  = selectedImage?.dataUrl  || null;

  messages.push({ role: "user", content: ask || "(이미지 첨부)" });
  addMessageRow("user", ask, imageDataUrl);
  removeImageBtn.click();

  const bubble   = addMessageRow("assistant", "");
  const fullText = await streamResponse(bubble, imageBase64, imageMimeType);

  if (fullText !== null) {
    messages.push({ role: "assistant", content: fullText });
    saveCurrentSession();
    addRegenBtn(bubble);
  } else {
    messages.pop();
  }

  sendBtn.disabled = false;
  askInput.focus();
}

sendBtn.addEventListener("click", sendMessage);
askInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    sendMessage();
  }
});

// ---- Init ----
(function init() {
  const sessions = loadSessions();
  if (sessions.length > 0) loadSession(sessions[0].id);
  else createNewSession();
})();

(function () {
  const root = document.getElementById("ai-chatbot-root");
  const launcher = document.querySelector(".ai-chatbot-btn");
  if (!root || !launcher) return;

  // Prevent duplicate UI
  if (window.__aiChatbotUI) return;
  window.__aiChatbotUI = true;

  /* ================= CHAT BOX ================= */
  const box = document.createElement("div");
  box.style.cssText = `
    position:fixed;
    bottom:100px;
    right:20px;
    width:340px;
    height:440px;
    background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
    color:white;
    border-radius:16px;
    box-shadow:0 25px 60px rgba(0,0,0,.6);
    display:none;
    flex-direction:column;
    z-index:9998;
    font-family:system-ui,-apple-system,BlinkMacSystemFont;
    overflow:hidden;
  `;

  box.innerHTML = `
    <div style="
      padding:14px;
      background:linear-gradient(135deg,#7ffcff,#00c6ff);
      color:#000;
      font-weight:800;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">
      🤖 KAI · Kanan’s AI Assistant
      <span id="ai-close" style="cursor:pointer;font-size:18px">✕</span>
    </div>

    <div id="log" style="
      flex:1;
      padding:12px;
      overflow:auto;
      font-size:14px;
      line-height:1.5;
    "></div>

    <div style="
      display:flex;
      align-items:center;
      gap:6px;
      padding:10px;
      border-top:1px solid rgba(255,255,255,.15);
      background:#0b1c22;
    ">
      <button id="mic"
        title="Voice input"
        style="
          background:#00c6ff;
          border:none;
          border-radius:50%;
          width:36px;
          height:36px;
          cursor:pointer;
          font-size:18px;
        ">🎤</button>

      <input id="inp" placeholder="Ask something..."
        style="
          flex:1;
          padding:10px;
          border:none;
          outline:none;
          background:transparent;
          color:white;
          font-size:14px;
        "/>

      <button id="send"
        style="
          background:#00c6ff;
          border:none;
          padding:10px 14px;
          font-weight:800;
          cursor:pointer;
        ">➤</button>
    </div>
  `;

  root.appendChild(box);

  /* ================= ELEMENTS ================= */
  const log = box.querySelector("#log");
  const inp = box.querySelector("#inp");
  const send = box.querySelector("#send");
  const mic = box.querySelector("#mic");
  const closeBtn = box.querySelector("#ai-close");

  /* ================= TOGGLE ================= */
  function openChat() {
    box.style.display = "flex";
    launcher.classList.add("opened");
    inp.focus();
  }

  function closeChat() {
    box.style.display = "none";
    launcher.classList.remove("opened");
  }

  launcher.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  /* ================= SAFE MESSAGE ADD ================= */
  function add(who, text) {
    const d = document.createElement("div");
    d.style.margin = "8px 0";

    const label = document.createElement("b");
    label.textContent = who + ": ";

    const msg = document.createElement("span");
    msg.textContent = text;

    d.appendChild(label);
    d.appendChild(msg);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;

    return d;
  }

  /* ================= WELCOME ================= */
  add(
    "AI",
    "Hi 👋 I’m KAI (Kanan’s AI Assistant). Ask me about Kanan’s skills, projects, experience, or AI work."
  );

  /* ================= TEXT SEND ================= */
  async function sendMessage() {
    const msg = inp.value.trim();
    if (!msg) return;

    add("You", msg);
    inp.value = "";

    const thinking = add("AI", "Thinking…");

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      thinking.lastChild.textContent =
        data.reply || "⚠️ No response from AI.";
    } catch {
      thinking.lastChild.textContent =
        "⚠️ Error contacting server.";
    }
  }

  send.onclick = sendMessage;
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  /* ================= VOICE INPUT (BROWSER STT) ================= */
  mic.onclick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      add("AI", "Voice input not supported in this browser.");
      return;
    }

    const rec = new webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    add("AI", "🎤 Listening…");

    rec.onresult = e => {
      const transcript = e.results[0][0].transcript;
      inp.value = transcript;
      sendMessage();
    };

    rec.onerror = () => {
      add("AI", "⚠️ Voice recognition failed.");
    };

    rec.start();
  };

})();

(function () {
  const root = document.getElementById("ai-chatbot-root");
  const launcher = document.querySelector(".ai-chatbot-btn");
  if (!root || !launcher) return;

  // Prevent duplicate UI
  if (window.__aiChatbotUI) return;
  window.__aiChatbotUI = true;

  // ===== Chat Box =====
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
      🤖 Ask about Kanan Pandit
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
      border-top:1px solid rgba(255,255,255,.15);
      background:#0b1c22;
    ">
      <input id="inp" placeholder="Ask something..."
        style="
          flex:1;
          padding:12px;
          border:none;
          outline:none;
          background:transparent;
          color:white;
          font-size:14px;
        "/>
      <button id="send"
        style="
          padding:12px 16px;
          background:#00c6ff;
          border:none;
          font-weight:800;
          cursor:pointer;
        ">
        Send
      </button>
    </div>
  `;

  root.appendChild(box);

  // ===== Elements =====
  const log = box.querySelector("#log");
  const inp = box.querySelector("#inp");
  const send = box.querySelector("#send");
  const closeBtn = box.querySelector("#ai-close");

  // ===== Toggle Logic =====
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

  // ===== Safe Message Add =====
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

  // ===== Welcome =====
  add(
    "AI",
    "Hi 👋 I’m Kanan Pandit’s AI assistant. Ask me about his skills, projects, or experience."
  );

  // ===== Send =====
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

})();

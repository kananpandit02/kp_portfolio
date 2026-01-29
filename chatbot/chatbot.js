(function () {
  const root = document.getElementById("ai-chatbot-root");
  if (!root) return;

  // ===== Chat Box =====
  const box = document.createElement("div");
  box.style.cssText = `
    position:fixed;
    bottom:90px;
    right:20px;
    width:320px;
    height:420px;
    background:#0f2027;
    color:white;
    border-radius:14px;
    box-shadow:0 20px 50px rgba(0,0,0,.5);
    display:flex;
    flex-direction:column;
    z-index:9999;
    font-family:system-ui,-apple-system,BlinkMacSystemFont;
    overflow:hidden;
  `;

  box.innerHTML = `
    <div style="
      padding:12px;
      background:#00c6ff;
      color:black;
      font-weight:700;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">
      🤖 Ask about Kanan Pandit
      <span id="ai-close" style="cursor:pointer;font-weight:900">✕</span>
    </div>

    <div id="log" style="
      flex:1;
      padding:10px;
      overflow:auto;
      font-size:14px;
      line-height:1.4;
    "></div>

    <div style="display:flex;border-top:1px solid #333">
      <input
        id="inp"
        placeholder="Ask something..."
        style="
          flex:1;
          padding:10px;
          border:none;
          outline:none;
          font-size:14px;
        "
      />
      <button
        id="send"
        style="
          padding:10px 14px;
          background:#00c6ff;
          border:none;
          font-weight:700;
          cursor:pointer;
        "
      >
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

  // ===== Close Chat =====
  closeBtn.onclick = () => box.remove();

  // ===== Safe Message Add (XSS-safe) =====
  function add(who, text) {
    const d = document.createElement("div");
    d.style.margin = "6px 0";

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

  // ===== Initial Welcome (Text only, safe) =====
  add(
    "AI",
    "Hi 👋 I’m Kanan Pandit’s AI assistant. Ask me about his skills, projects, or experience."
  );

  // ===== Send Message =====
  async function sendMessage() {
    const msg = inp.value.trim();
    if (!msg) return;

    add("You", msg);
    inp.value = "";

    const thinkingNode = add("AI", "Thinking…");

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });

      const data = await res.json();
      thinkingNode.lastChild.textContent =
        data.reply || "⚠️ No response from AI.";
    } catch (err) {
      thinkingNode.lastChild.textContent =
        "⚠️ Error contacting server. Please try again.";
    }
  }

  // ===== Events =====
  send.onclick = sendMessage;

  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

})();

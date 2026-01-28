(function () {
  const root = document.getElementById("ai-chatbot-root");

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
    font-family:system-ui;
  `;

  box.innerHTML = `
    <div style="padding:12px;background:#00c6ff;color:black;font-weight:700">
      🤖 Ask about Kanan Pandit
    </div>
    <div id="log" style="flex:1;padding:10px;overflow:auto;font-size:14px"></div>
    <div style="display:flex;border-top:1px solid #333">
      <input id="inp" placeholder="Ask something..."
        style="flex:1;padding:10px;border:none;outline:none"/>
      <button id="send"
        style="padding:10px;background:#00c6ff;border:none;font-weight:700">
        Send
      </button>
    </div>
  `;

  root.appendChild(box);

  const log = box.querySelector("#log");
  const inp = box.querySelector("#inp");
  const send = box.querySelector("#send");

  function add(who, text) {
    const d = document.createElement("div");
    d.style.margin = "6px 0";
    d.innerHTML = `<b>${who}:</b> ${text}`;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  send.onclick = async () => {
    const msg = inp.value.trim();
    if (!msg) return;
    add("You", msg);
    inp.value = "";
    add("AI", "Thinking...");

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      log.lastChild.innerHTML = `<b>AI:</b> ${data.reply}`;
    } catch {
      log.lastChild.innerHTML = `<b>AI:</b> Error contacting server`;
    }
  };
})();

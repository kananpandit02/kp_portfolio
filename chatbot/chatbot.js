(function () {
  const root = document.getElementById("ai-chatbot-root");
  const launcher = document.querySelector(".ai-chatbot-btn");
  if (!root || !launcher || window.__aiChatbotUI) return;
  window.__aiChatbotUI = true;

  const box = document.createElement("div");
  box.style.cssText = `
    position:fixed; bottom:100px; right:20px; width:min(360px,calc(100vw - 32px));
    height:min(480px,calc(100vh - 130px)); background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
    color:white; border-radius:16px; box-shadow:0 25px 60px rgba(0,0,0,.6);
    display:none; flex-direction:column; z-index:9998; font-family:system-ui,-apple-system,BlinkMacSystemFont;
    overflow:hidden;
  `;
  box.innerHTML = `
    <div style="padding:14px;background:linear-gradient(135deg,#7ffcff,#00c6ff);color:#000;font-weight:800;display:flex;justify-content:space-between;align-items:center">
      🤖 KAI · Kanan’s AI Assistant
      <button id="ai-close" aria-label="Close chat" style="cursor:pointer;border:0;background:transparent;font-size:18px">✕</button>
    </div>
    <div id="log" role="log" aria-live="polite" style="flex:1;padding:12px;overflow:auto;font-size:14px;line-height:1.5"></div>
    <div style="display:flex;align-items:center;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.15);background:#0b1c22">
      <button id="mic" title="Voice input" aria-label="Voice input" style="background:#00c6ff;border:0;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px">🎤</button>
      <input id="inp" aria-label="Ask KAI a question" placeholder="Ask about Kanan..." style="min-width:0;flex:1;padding:10px;border:0;outline:none;background:transparent;color:white;font-size:14px"/>
      <button id="send" style="background:#00c6ff;border:0;border-radius:8px;padding:10px 14px;font-weight:800;cursor:pointer">➤</button>
    </div>`;
  root.appendChild(box);

  const log = box.querySelector("#log");
  const inp = box.querySelector("#inp");
  const send = box.querySelector("#send");
  const mic = box.querySelector("#mic");

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
  box.querySelector("#ai-close").addEventListener("click", closeChat);

  function add(who, text) {
    const item = document.createElement("div");
    item.style.margin = "8px 0";
    const label = document.createElement("b");
    label.textContent = who + ": ";
    const content = document.createElement("span");
    content.textContent = text;
    item.append(label, content);
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
    return content;
  }

  add("KAI", "Hi! 👋 I'm KAI, Kanan's AI assistant. Ask me about his experience, skills, projects, education, or AI work.");

  let sending = false;
  async function sendMessage() {
    const message = inp.value.trim();
    if (!message || sending) return;
    add("You", message);
    inp.value = "";
    const answer = add("KAI", "Thinking…");
    sending = true;
    send.disabled = true;
    send.style.opacity = ".55";
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        answer.textContent = data.reply || `KAI couldn't respond (HTTP ${response.status}). Please try again.`;
      } else {
        answer.textContent = data.reply || "KAI returned an empty response. Please try again.";
      }
    } catch (error) {
      console.error("KAI chat request failed:", error);
      answer.textContent = "I couldn't reach KAI's server. Please check your connection and try again.";
    } finally {
      sending = false;
      send.disabled = false;
      send.style.opacity = "1";
      inp.focus();
    }
  }

  send.addEventListener("click", sendMessage);
  inp.addEventListener("keydown", event => {
    if (event.key === "Enter") sendMessage();
  });

  mic.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      add("KAI", "Voice input isn't supported in this browser. You can type your question instead.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    add("KAI", "🎤 Listening…");
    recognition.onresult = event => {
      inp.value = event.results[0][0].transcript;
      sendMessage();
    };
    recognition.onerror = () => add("KAI", "Voice recognition failed. Please type your question instead.");
    recognition.start();
  });
})();
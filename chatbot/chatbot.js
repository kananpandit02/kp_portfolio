const root = document.getElementById("ai-chatbot-root");

root.innerHTML = `
<div id="ai-chatbox">
  <div class="ai-header">
    <strong>Kanan AI</strong>
    <span onclick="closeChat()">✖</span>
  </div>
  <div id="ai-messages" class="ai-messages">
    <div class="bot">Hi 👋 Ask me about Kanan Pandit.</div>
  </div>
  <div class="ai-input">
    <input id="ai-input" placeholder="Ask about skills, projects, work…" />
    <button onclick="sendMsg()">Send</button>
  </div>
</div>
`;

const style=document.createElement("style");
style.innerHTML=`
#ai-chatbox{
  position:fixed;
  right:110px;
  top:50%;
  transform:translateY(-50%);
  width:340px;
  background:#0f2027;
  color:#fff;
  border-radius:16px;
  box-shadow:0 20px 50px rgba(0,0,0,.5);
  z-index:9999;
  font-family:Poppins,sans-serif;
}
.ai-header{
  padding:12px;
  background:linear-gradient(135deg,#00f2fe,#4facfe);
  color:#000;
  display:flex;
  justify-content:space-between;
}
.ai-messages{
  height:260px;
  overflow-y:auto;
  padding:12px;
}
.bot,.user{margin-bottom:10px;font-size:14px}
.ai-input{
  display:flex;
  border-top:1px solid #222;
}
.ai-input input{
  flex:1;
  padding:10px;
  border:none;
  outline:none;
}
.ai-input button{
  background:#00f2fe;
  border:none;
  padding:10px 14px;
  cursor:pointer;
}
`;
document.head.appendChild(style);

async function sendMsg(){
  const input=document.getElementById("ai-input");
  const text=input.value.trim();
  if(!text) return;

  const box=document.getElementById("ai-messages");
  box.innerHTML+=`<div class="user">${text}</div>`;
  input.value="";

  const wait=document.createElement("div");
  wait.className="bot";
  wait.innerText="Thinking…";
  box.appendChild(wait);

  try{
    const r=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:text})
    });
    const d=await r.json();
    wait.innerText=d.reply;
  }catch{
    wait.innerText="AI connection error.";
  }

  box.scrollTop=box.scrollHeight;
}

function closeChat(){
  document.getElementById("ai-chatbox").remove();
  window.__aiChatbotLoaded=false;
  document.querySelector(".ai-chatbot-btn").classList.remove("opened");
}

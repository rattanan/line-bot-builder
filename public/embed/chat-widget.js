(function () {
  var currentScript = document.currentScript;
  var config = (window.LineBotBuilderChat || {});
  if (currentScript) {
    config.tenantId = currentScript.getAttribute("data-tenant-id") || config.tenantId;
    config.botName = currentScript.getAttribute("data-bot-name") || config.botName;
    config.themeColor = currentScript.getAttribute("data-theme-color") || config.themeColor;
    config.greetingMessage = currentScript.getAttribute("data-greeting-message") || config.greetingMessage;
    config.logoUrl = currentScript.getAttribute("data-logo-url") || config.logoUrl;
  }

  var tenantId = config.tenantId;
  if (!tenantId) return;

  var scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : window.location.origin;
  var botName = config.botName || "AI Assistant";
  var themeColor = config.themeColor || "#06C755";
  var greetingMessage = config.greetingMessage || "สวัสดีครับ มีอะไรให้ช่วยไหมครับ";
  var logoUrl = config.logoUrl || "";
  var storageKey = "lbb_visitor_id";

  function getVisitorId() {
    try {
      var existing = window.localStorage.getItem(storageKey);
      if (existing) return existing;
      var id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      window.localStorage.setItem(storageKey, id);
      return id;
    } catch (_) {
      return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var rootHost = document.createElement("div");
  rootHost.id = "line-bot-builder-chat";
  document.body.appendChild(rootHost);
  var shadow = rootHost.attachShadow ? rootHost.attachShadow({ mode: "open" }) : rootHost;

  shadow.innerHTML =
    "<style>" +
    ":host{all:initial}.lbb-wrap{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827}.lbb-button{width:60px;height:60px;border-radius:999px;border:0;background:" + themeColor + ";color:#fff;box-shadow:0 16px 35px rgba(0,0,0,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:26px}.lbb-panel{display:none;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 110px));border:1px solid rgba(17,24,39,.12);border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.22);overflow:hidden}.lbb-panel.open{display:flex;flex-direction:column}.lbb-head{background:" + themeColor + ";color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}.lbb-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px}.lbb-logo{width:30px;height:30px;border-radius:999px;background:#fff;object-fit:cover}.lbb-close{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:999px;width:32px;height:32px;cursor:pointer;font-size:18px}.lbb-messages{flex:1;padding:14px;overflow:auto;background:#f8fafc}.lbb-msg{max-width:82%;margin:0 0 10px;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.lbb-bot{background:#fff;border:1px solid #e5e7eb;border-top-left-radius:5px}.lbb-user{margin-left:auto;background:" + themeColor + ";color:#fff;border-top-right-radius:5px}.lbb-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff}.lbb-input{flex:1;border:1px solid #d1d5db;border-radius:999px;padding:11px 13px;font-size:14px;outline:none}.lbb-send{border:0;border-radius:999px;background:" + themeColor + ";color:#fff;padding:0 16px;font-weight:700;cursor:pointer}.lbb-send:disabled{opacity:.55;cursor:not-allowed}@media(max-width:520px){.lbb-wrap{right:12px;bottom:12px}.lbb-panel{width:calc(100vw - 24px);height:calc(100vh - 92px);border-radius:16px}.lbb-button{width:56px;height:56px}}" +
    "</style>" +
    "<div class='lbb-wrap'>" +
    "<div class='lbb-panel' role='dialog' aria-label='Chat with " + escapeHtml(botName) + "'>" +
    "<div class='lbb-head'><div class='lbb-title'>" + (logoUrl ? "<img class='lbb-logo' alt='' src='" + escapeHtml(logoUrl) + "'>" : "<span class='lbb-logo'></span>") + "<span>" + escapeHtml(botName) + "</span></div><button class='lbb-close' type='button' aria-label='Close'>×</button></div>" +
    "<div class='lbb-messages'></div>" +
    "<form class='lbb-form'><input class='lbb-input' autocomplete='off' placeholder='พิมพ์ข้อความ...' maxlength='2000'><button class='lbb-send' type='submit'>ส่ง</button></form>" +
    "</div>" +
    "<button class='lbb-button' type='button' aria-label='Open chat'>💬</button>" +
    "</div>";

  var panel = shadow.querySelector(".lbb-panel");
  var button = shadow.querySelector(".lbb-button");
  var close = shadow.querySelector(".lbb-close");
  var messages = shadow.querySelector(".lbb-messages");
  var form = shadow.querySelector(".lbb-form");
  var input = shadow.querySelector(".lbb-input");
  var send = shadow.querySelector(".lbb-send");
  var visitorId = getVisitorId();

  function addMessage(text, type) {
    var node = document.createElement("div");
    node.className = "lbb-msg " + (type === "user" ? "lbb-user" : "lbb-bot");
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  }

  function setOpen(open) {
    panel.classList.toggle("open", open);
    button.style.display = open ? "none" : "flex";
    if (open) input.focus();
  }

  button.addEventListener("click", function () {
    setOpen(true);
    if (!messages.dataset.greeted) {
      addMessage(greetingMessage, "bot");
      messages.dataset.greeted = "1";
    }
  });
  close.addEventListener("click", function () { setOpen(false); });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");
    send.disabled = true;
    var waiting = "กำลังพิมพ์...";
    addMessage(waiting, "bot");
    var waitingNode = messages.lastChild;
    try {
      var res = await fetch(scriptOrigin + "/api/embed/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenantId, visitorId: visitorId, message: text }),
      });
      var data = await res.json();
      waitingNode.textContent = data.response || data.error || "ขออภัย ระบบยังตอบไม่ได้ในขณะนี้";
    } catch (_) {
      waitingNode.textContent = "ขออภัย ไม่สามารถเชื่อมต่อแชทได้ในขณะนี้";
    } finally {
      send.disabled = false;
      input.focus();
    }
  });
})();

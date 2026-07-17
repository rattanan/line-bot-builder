(function () {
  "use strict";

  var currentScript = document.currentScript;
  var globalConfig = window.LineBotBuilderChat || {};
  var scriptOrigin;
  try {
    scriptOrigin = currentScript && currentScript.src ? new URL(currentScript.src).origin : window.location.origin;
  } catch {
    scriptOrigin = window.location.origin;
  }

  var widgetToken = currentScript && currentScript.getAttribute("data-widget-token") || globalConfig.widgetToken || "";
  var legacyTenantId = currentScript && (currentScript.getAttribute("data-bot-id") || currentScript.getAttribute("data-tenant-id")) || globalConfig.botId || globalConfig.tenantId || "";
  if (!widgetToken && !legacyTenantId) return;

  var legacyConfig = {
    botName: currentScript && currentScript.getAttribute("data-bot-name") || globalConfig.botName || "AI Assistant",
    primaryColor: currentScript && currentScript.getAttribute("data-theme-color") || globalConfig.themeColor || "",
    greetingMessage: currentScript && currentScript.getAttribute("data-greeting-message") || globalConfig.greetingMessage || "สวัสดีครับ มีอะไรให้ช่วยไหมครับ",
    launcherIconUrl: currentScript && currentScript.getAttribute("data-logo-url") || globalConfig.logoUrl || "",
    launcherIconType: currentScript && currentScript.getAttribute("data-logo-url") ? "custom" : "default",
    defaultIcon: "chat",
    launcherShape: "circle"
  };
  if (!isAllowedLegacyImageUrl(legacyConfig.launcherIconUrl)) legacyConfig.launcherIconUrl = "";

  var query = widgetToken ? "token=" + encodeURIComponent(widgetToken) : "botId=" + encodeURIComponent(legacyTenantId);
  fetch(scriptOrigin + "/api/embed/config?" + query, { method: "GET", mode: "cors", credentials: "omit" })
    .then(function (response) {
      if (!response.ok) throw new Error("Widget configuration unavailable");
      return response.json();
    })
    .then(function (remoteConfig) {
      mountWidget(normalizeConfig(remoteConfig, legacyConfig));
    })
    .catch(function () {
      if (isHexColor(legacyConfig.primaryColor)) mountWidget(normalizeConfig(legacyConfig, legacyConfig));
    });

  function normalizeConfig(value, fallback) {
    var iconTypes = { "default": true, "bot_profile": true, "custom": true };
    var icons = { "chat": true, "robot": true, "support": true, "shopping_bag": true, "store": true, "line_message": true };
    var primaryColor = isHexColor(value.primaryColor) ? value.primaryColor.toUpperCase() : fallback.primaryColor.toUpperCase();
    var launcherIconUrl = isSafeImageUrl(value.launcherIconUrl) ? value.launcherIconUrl : "";
    return {
      botName: String(value.botName || fallback.botName || "AI Assistant").slice(0, 150),
      primaryColor: primaryColor,
      foregroundColor: isHexColor(value.foregroundColor) ? value.foregroundColor.toUpperCase() : contrastingText(primaryColor),
      greetingMessage: String(value.greetingMessage || fallback.greetingMessage || "").slice(0, 1000),
      launcherIconType: iconTypes[value.launcherIconType] ? value.launcherIconType : "default",
      launcherIconUrl: launcherIconUrl,
      defaultIcon: icons[value.defaultIcon] ? value.defaultIcon : "chat",
      launcherShape: value.launcherShape === "rounded" ? "rounded" : "circle"
    };
  }

  function mountWidget(config) {
    if (!isHexColor(config.primaryColor) || document.getElementById("line-bot-builder-chat")) return;
    var rootHost = document.createElement("div");
    rootHost.id = "line-bot-builder-chat";
    document.body.appendChild(rootHost);
    var shadow = rootHost.attachShadow ? rootHost.attachShadow({ mode: "open" }) : rootHost;

    var style = document.createElement("style");
    style.textContent =
      ":host{all:initial}.lbb-wrap{--lbb-primary:#000;--lbb-on-primary:#fff;position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827}.lbb-button{width:60px;height:60px;border-radius:999px;border:0;background:var(--lbb-primary);color:var(--lbb-on-primary);box-shadow:0 16px 35px rgba(0,0,0,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}.lbb-button.rounded{border-radius:18px}.lbb-launcher-image{width:100%;height:100%;object-fit:cover}.lbb-icon{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.lbb-panel{display:none;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100dvh - 110px));border:1px solid rgba(17,24,39,.12);border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.22);overflow:hidden}.lbb-panel.open{display:flex;flex-direction:column}.lbb-head{background:var(--lbb-primary);color:var(--lbb-on-primary);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}.lbb-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px;min-width:0}.lbb-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lbb-logo{width:32px;height:32px;border-radius:999px;background:rgba(255,255,255,.92);object-fit:cover;display:grid;place-items:center;flex:none;color:#374151}.lbb-logo .lbb-icon{width:19px;height:19px}.lbb-close{border:0;background:rgba(255,255,255,.2);color:inherit;border-radius:999px;width:36px;height:36px;cursor:pointer;font-size:20px;flex:none}.lbb-messages{flex:1;padding:14px;overflow:auto;background:#f8fafc}.lbb-msg{max-width:82%;margin:0 0 10px;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.lbb-bot{background:#fff;border:1px solid #e5e7eb;border-top-left-radius:5px}.lbb-user{margin-left:auto;background:var(--lbb-primary);color:var(--lbb-on-primary);border-top-right-radius:5px}.lbb-loading{display:flex;align-items:center;gap:4px;width:max-content}.lbb-loading span{width:6px;height:6px;border-radius:50%;background:var(--lbb-primary);animation:lbb-pulse 1s infinite ease-in-out}.lbb-loading span:nth-child(2){animation-delay:.15s}.lbb-loading span:nth-child(3){animation-delay:.3s}@keyframes lbb-pulse{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}.lbb-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff}.lbb-input{flex:1;min-width:0;border:1px solid #d1d5db;border-radius:999px;padding:11px 13px;font-size:14px;outline:none;color:#111827;background:#fff}.lbb-input:focus{border-color:var(--lbb-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--lbb-primary) 22%,transparent)}.lbb-send{border:0;border-radius:999px;background:var(--lbb-primary);color:var(--lbb-on-primary);padding:0 16px;font-weight:700;cursor:pointer;min-height:44px}.lbb-send:disabled{opacity:.55;cursor:not-allowed}.lbb-button:focus-visible,.lbb-close:focus-visible,.lbb-send:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px var(--lbb-primary)}@media(max-width:520px){.lbb-wrap{right:12px;bottom:12px}.lbb-panel{width:calc(100vw - 24px);height:calc(100dvh - 88px);border-radius:16px}.lbb-button{width:56px;height:56px}}@media(prefers-reduced-motion:reduce){.lbb-loading span{animation:none}.lbb-button{transition:none}}";
    shadow.appendChild(style);

    var wrap = element("div", "lbb-wrap");
    wrap.style.setProperty("--lbb-primary", config.primaryColor);
    wrap.style.setProperty("--lbb-on-primary", config.foregroundColor);
    var panel = element("div", "lbb-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with " + config.botName);
    panel.setAttribute("aria-hidden", "true");
    var head = element("div", "lbb-head");
    var title = element("div", "lbb-title");
    var logo = element("span", "lbb-logo");
    appendLauncherContent(logo, config, false);
    var titleText = element("span", "lbb-title-text");
    titleText.textContent = config.botName;
    title.appendChild(logo); title.appendChild(titleText);
    var close = element("button", "lbb-close");
    close.type = "button"; close.setAttribute("aria-label", "Close chat"); close.textContent = "×";
    head.appendChild(title); head.appendChild(close);
    var messages = element("div", "lbb-messages");
    messages.setAttribute("aria-live", "polite");
    var form = element("form", "lbb-form");
    var input = element("input", "lbb-input");
    input.autocomplete = "off"; input.placeholder = "พิมพ์ข้อความ..."; input.maxLength = 2000; input.setAttribute("aria-label", "Message");
    var send = element("button", "lbb-send");
    send.type = "submit"; send.textContent = "ส่ง";
    form.appendChild(input); form.appendChild(send);
    panel.appendChild(head); panel.appendChild(messages); panel.appendChild(form);
    var button = element("button", "lbb-button" + (config.launcherShape === "rounded" ? " rounded" : ""));
    button.type = "button"; button.setAttribute("aria-label", "Open chat"); button.setAttribute("aria-expanded", "false");
    appendLauncherContent(button, config, true);
    wrap.appendChild(panel); wrap.appendChild(button); shadow.appendChild(wrap);

    var visitorId = getVisitorId();
    function addMessage(text, type) {
      var node = element("div", "lbb-msg " + (type === "user" ? "lbb-user" : "lbb-bot"));
      node.textContent = String(text);
      messages.appendChild(node); messages.scrollTop = messages.scrollHeight;
      return node;
    }
    function addLoading() {
      var node = element("div", "lbb-msg lbb-bot lbb-loading");
      node.setAttribute("aria-label", "กำลังพิมพ์");
      node.appendChild(document.createElement("span")); node.appendChild(document.createElement("span")); node.appendChild(document.createElement("span"));
      messages.appendChild(node); messages.scrollTop = messages.scrollHeight;
      return node;
    }
    function setOpen(open) {
      panel.classList.toggle("open", open); panel.setAttribute("aria-hidden", open ? "false" : "true");
      button.style.display = open ? "none" : "flex"; button.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) input.focus(); else button.focus();
    }
    button.addEventListener("click", function () {
      setOpen(true);
      if (!messages.getAttribute("data-greeted")) { addMessage(config.greetingMessage, "bot"); messages.setAttribute("data-greeted", "1"); }
    });
    close.addEventListener("click", function () { setOpen(false); });
    panel.addEventListener("keydown", function (event) { if (event.key === "Escape") setOpen(false); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = input.value.trim();
      if (!message) return;
      input.value = ""; addMessage(message, "user"); send.disabled = true;
      var waitingNode = addLoading();
      fetch(scriptOrigin + "/api/embed/chat", {
        method: "POST", mode: "cors", credentials: "omit", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetToken: widgetToken || undefined, tenantId: widgetToken ? undefined : legacyTenantId, visitorId: visitorId, message: message })
      }).then(function (response) { return response.json().then(function (data) { return { ok: response.ok, data: data }; }); })
        .then(function (result) { waitingNode.className = "lbb-msg lbb-bot"; waitingNode.removeAttribute("aria-label"); waitingNode.textContent = result.data.response || result.data.error || "ขออภัย ระบบยังตอบไม่ได้ในขณะนี้"; })
        .catch(function () { waitingNode.className = "lbb-msg lbb-bot"; waitingNode.removeAttribute("aria-label"); waitingNode.textContent = "ขออภัย ไม่สามารถเชื่อมต่อแชทได้ในขณะนี้"; })
        .then(function () { send.disabled = false; input.focus(); });
    });
  }

  function appendLauncherContent(parent, config, fullSize) {
    if (config.launcherIconType !== "default" && config.launcherIconUrl) {
      var image = document.createElement("img");
      image.alt = ""; image.src = config.launcherIconUrl; image.referrerPolicy = "no-referrer";
      image.className = fullSize ? "lbb-launcher-image" : "lbb-logo";
      parent.appendChild(image); return;
    }
    parent.appendChild(createIcon(config.defaultIcon));
  }

  function createIcon(name) {
    var paths = {
      chat: ["M21 12a8 8 0 0 1-9 8 9 9 0 0 1-3.8-.8L3 21l1.7-4.5A8.5 8.5 0 1 1 21 12Z", "M8 12h.01M12 12h.01M16 12h.01"],
      robot: ["M12 3v4M9 3h6", "M8 12h.01M16 12h.01M8 16h8"],
      support: ["M4 14v-2a8 8 0 0 1 16 0v2", "M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1ZM20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1ZM17 16c0 3-2 4-5 4"],
      shopping_bag: ["M5 8h14l-1 13H6L5 8Z", "M9 10V6a3 3 0 0 1 6 0v4"],
      store: ["M4 10v11h16V10M3 10l2-6h14l2 6", "M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-6h6v6"],
      line_message: ["M21 11.5c0 4.7-4.3 8.5-9.5 8.5a11 11 0 0 1-2.4-.3L4 22l1.5-4.2A8 8 0 0 1 2 11.5C2 6.8 6.3 3 11.5 3S21 6.8 21 11.5Z", "M7 12h.01M11.5 12h.01M16 12h.01"]
    };
    var namespace = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("class", "lbb-icon"); svg.setAttribute("aria-hidden", "true");
    if (name === "robot") { var rect = document.createElementNS(namespace, "rect"); rect.setAttribute("x", "4"); rect.setAttribute("y", "7"); rect.setAttribute("width", "16"); rect.setAttribute("height", "13"); rect.setAttribute("rx", "4"); svg.appendChild(rect); }
    (paths[name] || paths.chat).forEach(function (data) { var path = document.createElementNS(namespace, "path"); path.setAttribute("d", data); svg.appendChild(path); });
    return svg;
  }

  function element(tag, className) { var node = document.createElement(tag); node.className = className; return node; }
  function isHexColor(value) { return /^#[0-9a-f]{6}$/i.test(String(value || "")); }
  function isSafeImageUrl(value) { try { var url = new URL(String(value || ""), scriptOrigin); return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : ""; } catch { return ""; } }
  function isAllowedLegacyImageUrl(value) { try { var url = new URL(String(value || ""), scriptOrigin); return url.origin === scriptOrigin || url.hostname === "profile.line-scdn.net"; } catch { return false; } }
  function contrastingText(hex) { var channels = [1, 3, 5].map(function (offset) { var value = parseInt(hex.slice(offset, offset + 2), 16) / 255; return value <= .03928 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4); }); var luminance = .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]; return 1.05 / (luminance + .05) >= (luminance + .05) / .05 ? "#FFFFFF" : "#000000"; }
  function getVisitorId() { try { var key = "lbb_visitor_id"; var existing = window.localStorage.getItem(key); if (existing) return existing; var id = makeVisitorId(); window.localStorage.setItem(key, id); return id; } catch { return makeVisitorId(); } }
  function makeVisitorId() { return "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10); }
})();

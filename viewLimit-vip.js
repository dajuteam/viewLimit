window.addEventListener("DOMContentLoaded", function () {
  // === 可調整參數 ===
  const viewLimitPassword = "0427";                 // ✅ 密碼
  const skipVerifyDuration = 12 * 60 * 60 * 1000;   // ✅ 通過後 12 小時免驗證
  const countdownSeconds = 3;                       // ✅ 倒數秒數

  // 讀取驗證狀態
  const now = Date.now();
  const isVerified = localStorage.getItem("viewLimit_isVerified") === "true";
  const verifiedTime = parseInt(localStorage.getItem("viewLimit_verifiedTime")) || 0;
  const stillValid = isVerified && (now - verifiedTime < skipVerifyDuration);

  if (stillValid) return; // 已於有效期內驗證過 → 直接通行

  // === 建立覆蓋公告層（背景仍可見） ===
  const overlay = document.createElement("div");
  overlay.id = "siteCloseOverlay";
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 999999;
    background:rgba(255,255,255,.6); display:flex; align-items:center; justify-content:center;
    font-family: "Segoe UI", system-ui, -apple-system, "Noto Sans TC", Arial, sans-serif;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    max-width: 860px; width: calc(100% - 40px);
    border:1px solid #e5e7eb; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,.12);
    padding: 36px 32px; text-align:center; background:#fff;
  `;

  box.innerHTML = `
    <div style="font-size: 32px; font-weight: 800; margin-bottom:12px; color:#111827;">
      本團隊因遭不明人士惡意檢舉
    </div>
    <div style="font-size: 26px; font-weight: 700; margin-bottom:18px; color:#eb6100;">
      網站暫時關閉-僅供大橘團隊成員使用
    </div>
    <div style="font-size: 15px; color:#4b5563; margin-bottom: 28px;">
      為保障服務品質，請輸入內部密碼以繼續使用。
    </div>
    <div id="siteCloseCountdown" style="font-size: 56px; font-weight: 900; line-height:1; color:#111827;">${countdownSeconds}</div>
    <div style="margin-top:12px; font-size:12px; color:#6b7280;">倒數結束後會要求輸入密碼</div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // === 倒數計時 ===
  let remaining = countdownSeconds;
  const countdownEl = box.querySelector("#siteCloseCountdown");
  const timer = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(timer);
      requestPassword();
    } else {
      countdownEl.textContent = remaining;
    }
  }, 1000);

  // === 要求密碼 ===
  function requestPassword() {
    const input = prompt("請輸入密碼以繼續瀏覽");
    if (input && input === viewLimitPassword) {
      // 驗證成功
      localStorage.setItem("viewLimit_isVerified", "true");
      localStorage.setItem("viewLimit_verifiedTime", Date.now().toString());
      cleanupOverlay();
    } else {
      // 取消或錯誤 → 顯示全白頁＋美化提示視窗（可點連結）
      nukePage();
    }
  }

  // === 關閉公告層 ===
  function cleanupOverlay() {
    try { overlay.remove(); } catch(e) {}
  }

  // === 全白頁＋美化提示（含可點連結） ===
  function nukePage() {
    try { cleanupOverlay(); } catch(e) {}

    // 清空整個 <body>，並套用全白背景
    document.body.innerHTML = "";
    document.documentElement.style.background = "#ffffff";
    document.body.style.margin = "0";
    document.body.style.fontFamily = `"Segoe UI", system-ui, -apple-system, "Noto Sans TC", Arial, sans-serif`;

    // 容器
    const wrap = document.createElement("div");
    wrap.style.cssText = `
      min-height: 100vh; display:flex; align-items:center; justify-content:center; padding: 24px;
      background:#ffffff;
    `;

    // 卡片
    const card = document.createElement("div");
    card.style.cssText = `
      width: 100%; max-width: 720px; text-align:center; background:#fff;
      border:1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,.08);
      padding: 36px 28px;
    `;

    // 內容
    const title = document.createElement("div");
    titletextContent = "網站暫時關閉中-僅供大橘團隊成員使用";
    title.style.cssText = "font-size:32px; font-weight:800; color:#111827; margin-bottom:12px;";

    const subtitle = document.createElement("div");
    subtitle.textContent = "最新消息公告－請追蹤大橘團隊FB粉絲專頁";
    subtitle.style.cssText = "font-size:16px; color:#4b5563; margin-bottom:22px;";

    const linkBtn = document.createElement("a");
    linkBtn.href = "https://www.facebook.com/dajuteam";
    linkBtn.target = "_blank";
    linkBtn.rel = "noopener";
    linkBtn.textContent = "前往大橘團隊粉絲專頁";
    linkBtn.style.cssText = `
      display:inline-block; padding:12px 20px; border-radius:10px; text-decoration:none;
      font-weight:700; font-size:16px; background:#1877F2; color:#fff;
      box-shadow: 0 6px 16px rgba(24,119,242,.25);
    `;

    // 小字
    const foot = document.createElement("div");
    foot.textContent = "© 大橘團隊";
    foot.style.cssText = "margin-top:24px; font-size:12px; color:#9ca3af;";

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(linkBtn);
    card.appendChild(foot);

    wrap.appendChild(card);
    document.body.appendChild(wrap);
  }
});

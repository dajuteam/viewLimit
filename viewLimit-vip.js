
window.addEventListener("DOMContentLoaded", function () {
  // === 可調整參數 ===
  const viewLimitPassword = "0507";                 
  const skipVerifyDuration = 12 * 60 * 60 * 1000;   
  const countdownSeconds = 3;                      

  // 讀取驗證狀態
  const now = Date.now();
  const isVerified = localStorage.getItem("viewLimit_isVerified") === "true";
  const verifiedTime = parseInt(localStorage.getItem("viewLimit_verifiedTime")) || 0;
  const stillValid = isVerified && (now - verifiedTime < skipVerifyDuration);

  if (stillValid) return; // 已於有效期內驗證過 → 直接通行

  // === 建立覆蓋公告層 ===
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
    padding: 36px 32px; text-align:center;
    background:#fff;
  `;

  box.innerHTML = `
    <div style="font-size: 32px; font-weight: 800; margin-bottom:12px; color:#111827;">
      本團隊因遭不明人士惡意檢舉
    </div>
    <div style="font-size: 26px; font-weight: 700; margin-bottom:18px; color:#eb6100;">
      網站暫時關閉
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
      // 錯誤 → 再來才讓整個網站消失
      nukePage();
    }
  }

  // === 關閉公告層 ===
  function cleanupOverlay() {
    try { overlay.remove(); } catch(e) {}
  }

  // === 讓頁面消失 ===
  function nukePage() {
    try {
      document.documentElement.innerHTML = "";
    } catch (e) {
      document.documentElement.style.visibility = "hidden";
    }
  }
});


        window.addEventListener("DOMContentLoaded", function () {

            // ✅ 週一自動清除驗證紀錄
            (function clearViewLimitOnMonday() {
                const now = new Date();
                const isMonday = now.getDay() === 1;
                if (isMonday) {
                    localStorage.removeItem("viewLimit_isVerified");
                    localStorage.removeItem("viewLimit_verifiedTime");
                    localStorage.removeItem("viewLimit_errorCount");
                }
            })();

            // ✅ 限定每週五18:00～週日24:00期間啟用
            function isWithinActivePeriod() {
                const now = new Date();
                const day = now.getDay(); // 0=日, 1=一, ..., 6=六
                const hour = now.getHours();
                return (
                    (day === 5 && hour >= 18) ||
                    day === 6 ||
                    (day === 0 && hour < 24)
                );
            }

            if (!isWithinActivePeriod()) return; // ⛔ 不在期間 → 不啟動驗證功能

            // ✅ 設定參數
            const viewLimitPassword = "0902";  
            const viewLimitDelay = 60000;
            const maxErrorCount = 2;
            const skipVerifyDuration = 48 * 60 * 60 * 1000; // 48小時

            const now = Date.now();

            const isVerified = localStorage.getItem("viewLimit_isVerified") === "true";
            const verifiedTime = parseInt(localStorage.getItem("viewLimit_verifiedTime")) || 0;
            const errorCount = parseInt(localStorage.getItem("viewLimit_errorCount")) || 0;

            const stillValid = isVerified && (now - verifiedTime < skipVerifyDuration);

            // ✅ 顯示錯誤畫面（Windows 錯誤視窗風格）
           function showErrorPage() {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(255, 255, 255, 1);
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        font-family: "Segoe UI", sans-serif;
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 0 12px rgba(0,0,0,0.6);
         width: 100%;
    max-width: 500px;
    margin: 0 10px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    dialog.innerHTML = `
        <div style="
            background-color: #eb6100; 
            color: white; 
            padding: 14px 20px; 
            border-top-left-radius: 8px; 
            border-top-right-radius: 8px; 
            font-weight: bold; 
            font-size: 22px;
        ">
           🍊 大橘網站公告
        </div>
        <div style="
            padding: 28px 30px 20px 30px; 
            font-size: 18px;
            color: #333;
            flex-grow: 1;
        ">
            <p style="margin: 0 0 14px;">網站假日流量控管！大橘同仁優先使用</p>
            <p style="margin: 0 0 14px;">有其他需求請聯絡大橘總機</p>
            <p style="margin: 0 0 30px;">
              LINE@：
              <a href="https://lin.ee/s7ayOROf" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">
                @265ckfky
              </a>
            </p>
            <div style="text-align: center;">  <!-- 按鈕置中 -->
              <button id="viewLimitRetryBtn" style="
                font-size: 16px; 
                padding: 10px 18px; 
                background-color: #eb6100; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
                font-weight: 600;
              ">
                我知道密碼了
              </button>
            </div>
        </div>
        <a href="https://lin.ee/s7ayOROf" target="_blank" style="
            display: block;
            width: 100%;       /* 橫幅寬度調整為滿版 */
            cursor: pointer;
            text-decoration: none;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
            overflow: hidden;
        ">
          <img src="https://www.dajuteam.com.tw/upload/web/images/assets/daju-store-banner.gif?v=2" alt="大橘橫幅廣告" style="width: 100%; height: auto; display: block;">
        </a>
    `;

                wrapper.appendChild(dialog);
                document.body.appendChild(wrapper);

                document.getElementById("viewLimitRetryBtn").addEventListener("click", promptPasswordAgain);
            }


            // ✅ 清除紀錄
            function resetViewLimit() {
                localStorage.removeItem("viewLimit_isVerified");
                localStorage.removeItem("viewLimit_verifiedTime");
                localStorage.removeItem("viewLimit_errorCount");
                // ✅ 等待 localStorage 確實寫入後再 reload
                setTimeout(() => location.reload(), 100);
            }

            // ✅ 提示輸入密碼（可從錯誤畫面點「我知道密碼了」再次輸入）
            function promptPasswordAgain() {
                const input = prompt("請輸入密碼以繼續瀏覽");
                if (input && input === viewLimitPassword) {
                    localStorage.setItem("viewLimit_isVerified", "true");
                    localStorage.setItem("viewLimit_verifiedTime", Date.now());
                    localStorage.removeItem("viewLimit_errorCount");
                    alert("✅ 驗證成功，重新載入頁面");
                    location.reload();
                } else {
                    alert("❌ 密碼錯誤");
                }
            }

            // ✅ 第一次驗證時的流程（在延遲時間後觸發）
            function startViewLimitVerification() {
                const input = prompt("假日流量控管，您已瀏覽超過時間限制，請輸入密碼以繼續");
                if (input && input === viewLimitPassword) {
                    alert("✅ 驗證成功！歡迎大橘夥伴");
                    localStorage.setItem("viewLimit_isVerified", "true");
                    localStorage.setItem("viewLimit_verifiedTime", Date.now());
                    localStorage.removeItem("viewLimit_errorCount");
                } else {
                    let count = parseInt(localStorage.getItem("viewLimit_errorCount")) || 0;
                    count++;
                    localStorage.setItem("viewLimit_errorCount", count);

                    if (count >= maxErrorCount) {
                        showErrorPage();
                    } else {
                        alert(`密碼錯誤，您還有 ${maxErrorCount - count} 次機會`);
                        startViewLimitVerification(); // 再次要求輸入
                    }
                }
            }

            // ✅ 倒數提示區塊（右下角倒數計時用）
            function showViewLimitCountdown(seconds) {
                const timerDiv = document.createElement("div");
                timerDiv.id = "viewLimitCountdown";
                timerDiv.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 5px;
            color: white;
            font-size: 8px;
            opacity:0.2;
            padding: 2px 2px;
            border-radius: 4px;
            z-index: 9999;
            pointer-events: none;
          `;
                timerDiv.textContent = `剩餘 ${seconds} 秒`;
                document.body.appendChild(timerDiv);

                let remaining = seconds;
                const countdownInterval = setInterval(() => {
                    remaining--;
                    if (remaining > 0) {
                        timerDiv.textContent = `剩餘 ${remaining} 秒`;
                    } else {
                        clearInterval(countdownInterval);
                        timerDiv.remove(); // 時間到自動消失
                    }
                }, 1000);
            }

            // ✅ 啟動流程（如果尚未驗證）
            if (!stillValid) {
                // ✅ 呼叫倒數提示（右下角）
                showViewLimitCountdown(viewLimitDelay / 1000);

                setTimeout(() => {
                    const verified = localStorage.getItem("viewLimit_isVerified") === "true";
                    const currentErrorCount = parseInt(localStorage.getItem("viewLimit_errorCount")) || 0;

                    if (!verified && currentErrorCount >= maxErrorCount) {
                        showErrorPage();
                    } else {
                        if (currentErrorCount > 0) {
                            localStorage.removeItem("viewLimit_errorCount");
                        }
                        startViewLimitVerification();
                    }
                }, viewLimitDelay); // ⏱ 延遲時間（毫秒）
            }
        }); 

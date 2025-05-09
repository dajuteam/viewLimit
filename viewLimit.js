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
          const viewLimitPassword = "1124";  // 正確密碼
          const viewLimitDelay = 60000; // 10秒（10000毫秒）
          const maxErrorCount = 2;
          const skipVerifyDuration = 12 * 60 * 60 * 1000; // 12小時
      
          const now = Date.now();
      
          const isVerified = localStorage.getItem("viewLimit_isVerified") === "true";
          const verifiedTime = parseInt(localStorage.getItem("viewLimit_verifiedTime")) || 0;
          const errorCount = parseInt(localStorage.getItem("viewLimit_errorCount")) || 0;
      
          const stillValid = isVerified && (now - verifiedTime < skipVerifyDuration);
      
          // ✅ 顯示錯誤畫面
          function showErrorPage() {
            const wrapper = document.createElement("div");
            wrapper.style.cssText = `
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              background: white; color: red; z-index: 9999;
              font-size: 28px; text-align: center;
              padding: 80px 20px; overflow: auto;
            `;
      
            wrapper.innerHTML = `
              <p>母親節快樂!假日流量控管</p>
              <p>有其他需求請聯絡大橘總機</p>
              <p>
                LINE@：<a href="https://lin.ee/s7ayOROf" target="_blank" style="color: red; text-decoration: underline;">@265ckfky</a>
              </p>
              <button id="viewLimitResetBtn" style="margin-top: 40px; font-size: 20px; padding: 10px 20px; background-color: #eb6100; color: white; border: none; border-radius: 6px; cursor: pointer;">我愛大橘，再讓我看一眼</button>
              <br><br>
              <button id="viewLimitRetryBtn" style="margin-top: 10px; font-size: 18px; padding: 10px 18px; background-color: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">我知道密碼了</button>
            `;
      
            document.body.appendChild(wrapper);
      
            document.getElementById("viewLimitResetBtn").addEventListener("click", resetViewLimit);
            document.getElementById("viewLimitRetryBtn").addEventListener("click", promptPasswordAgain);
          }
      
          // ✅ 清除紀錄
          function resetViewLimit() {
            localStorage.removeItem("viewLimit_isVerified");
            localStorage.removeItem("viewLimit_verifiedTime");
            localStorage.removeItem("viewLimit_errorCount");
            location.reload();
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

// ==UserScript==
// @name         Video Volume Booster
// @version      0.0.9
// @author       HentaiSaru
// @description  加強影片的音量大小
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @run-at       document-start
// @match        *://*/*

// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==
// 待添加 : 快捷呼叫設置選單
var Booster, modal, enabledDomains = GM_getValue("啟用網域", []), domain = window.location.hostname, Increase=1.1;
GM_addStyle(`
    .show-modal-background {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        position: fixed;
        overflow: auto;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.1);
    }
    .show-button {
        top: 0;
        margin: 3% 2%;
        color: #d877ff;
        font-size: 16px;
        font-weight: bold;
        border-radius: 3px;
        background-color: #ffebfa;
        border: 1px solid rgb(124, 183, 252);
    }
    .show-button:hover,
    .show-button:focus {
        color: #fc0e85;
        cursor: pointer;
        text-decoration: none;
    }
    .set-modal-content {
        width: 400px;
        padding: 5px;
        overflow: auto;
        background-color: #cff4ff;
        border-radius: 10px;
        text-align: center;
        border: 2px ridge #82c4e2;
        border-collapse: collapse;
        margin: 2% auto 8px auto;
    }
    .multiplier {
        font-size:25px;
        color:rgb(253, 1, 85);
        margin: 10px;
        font-weight:bold;
    }
    .slider {
        width: 350px;
    }
    .hidden {
        display: none;
    }
`);

/* 主程式運行入口 */
(function() {
    async function FindVideo() {
        let interval, timeout=0;
        interval = setInterval(function() {
            const videoElement = document.querySelector("video");
            if (videoElement) {
                Booster = booster(videoElement, Increase);
                clearInterval(interval);
            } else {
                timeout++; // 超時到5秒後退出
                if (timeout === 5) {
                    clearInterval(interval);
                }
            }
        }, 1000);
    }
    if (enabledDomains.includes(domain)) {
        let inc = GM_getValue(domain, []);
        if (inc.length !== 0) {
            Increase = inc;
        }
        // 啟用查找
        FindVideo();
    }
    GM_registerMenuCommand("🔊 [開關] 自動增幅", function() {Useboost(enabledDomains, domain)});
    GM_registerMenuCommand("🛠️ 設置增幅", function() {IncrementalSetting()});
})();

/* 音量增量 */
function booster(video, increase) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext);
    // 音頻來源
    const source = audioContext.createMediaElementSource(video);
    // 增益節點
    const gainNode = audioContext.createGain();
    // 動態壓縮節點
    const compressorNode = audioContext.createDynamicsCompressor();

    // 將預設音量調整至 100%
    video.volume = 1;
    // 設置增量
    gainNode.gain.value = Math.min(Math.max(increase, 1.0), 30.0);

    // 設置動態壓縮器的參數(通用性測試)
    compressorNode.ratio.value = 4;
    compressorNode.knee.value = 5;
    compressorNode.threshold.value = -10;
    compressorNode.attack.value = 0.003;
    compressorNode.release.value = 0.6;

    // 進行節點連結
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    compressorNode.connect(audioContext.destination);
    return {
        // 設置音量(範圍 1.0 ~ 30.0)
        setVolume: function(increase) {
            gainNode.gain.value = Math.min(Math.max(increase, 1.0), 30.0);
        },
        // 獲取當前的設定值
        getAmpLevel: function() {
            return gainNode.gain.value;
        }
    };
}

/* 使用自動增幅 */
function Useboost(enabledDomains, domain) {
    if (enabledDomains.includes(domain)) {
        // 從已啟用列表中移除當前網域
        enabledDomains = enabledDomains.filter(function(value) {
            return value !== domain;
        });
        alert("❌ 禁用自動增幅");
    } else {
        // 添加當前網域到已啟用列表
        enabledDomains.push(domain);
        alert("✅ 啟用自動增幅");
    }
    GM_setValue("啟用網域", enabledDomains);
    location.reload();
}

/* 設定模態 */
function IncrementalSetting() {
    if (modal) {
        modal.remove();
        modal = null;
    }

    modal = document.createElement('div');
    modal.innerHTML = `
        <div class="set-modal-content">
            <h2 style="color: #3754f8;">音量增量</h2>
            <div style="margin:1rem auto 1rem auto;">
                <div class="multiplier">
                    <span><img src="https://cdn-icons-png.flaticon.com/512/8298/8298181.png" width="5%">增量倍數 </span><span id="currentValue">${Increase}</span><span> 倍</span>
                </div>
                <input type="range" class="slider" min="1.1" max="30.0" value="${Increase}" step="0.1"><br>
            </div>
            <div style="text-align: right;">
                <button class="show-button" id="save">保存設置</button>
                <button class="show-button" id="close">退出選單</button>
            </div>
        </div>
    `
    modal.classList.add('show-modal-background');
    document.body.appendChild(modal);
    modal.classList.remove('hidden');

    // 監聽設定拉條
    modal.addEventListener("input", function(event) {
        if (event.target.classList.contains("slider")) {
            let currentValueElement = document.getElementById("currentValue");
            let currentValue = event.target.value;
            currentValueElement.textContent = currentValue;
            Booster.setVolume(currentValue);
        }
    });

    // 監聽保存按鈕
    let saveButton = modal.querySelector("#save");
    saveButton.addEventListener("click", () => {
        let rangeValue = parseFloat(modal.querySelector(".slider").value);
        GM_setValue(domain, rangeValue);
        modal.classList.add("hidden");
    });

    // 監聽關閉按鈕點擊
    let CloseButton = modal.querySelector("#close");
    CloseButton.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}
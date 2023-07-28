// ==UserScript==
// @name         Video Volume Booster
// @version      0.0.15
// @author       HentaiSaru
// @license      MIT
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png
// @description:zh-TW  增強影片音量上限 , 最高增幅至10倍 , 未測試是否所有網域皆可使用 , 要全測試就把匹配改成 *://*/* , 單獨測試就是增加匹配的網域

// @run-at       document-start
// @match        *://*.twitch.tv/*
// @match        *://*.youtube.com/*
// @match        *://*.bilibili.com/*

// @exclude      *://video.eyny.com/*

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==
var Booster, modal, enabledDomains = GM_getValue("啟用網域", []), domain = window.location.hostname, Increase = 1.0;
GM_addStyle(`
    .YT-modal-background {
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
    .YT-modal-button {
        top: 0;
        margin: 3% 2%;
        color: #d877ff;
        font-size: 16px;
        font-weight: bold;
        border-radius: 3px;
        background-color: #ffebfa;
        border: 1px solid rgb(124, 183, 252);
    }
    .YT-modal-button:hover,
    .YT-modal-button:focus {
        color: #fc0e85;
        cursor: pointer;
        text-decoration: none;
    }
    .YT-modal-content {
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
                if (enabledDomains.includes(domain)) {
                    let inc = GM_getValue(domain, []);
                    if (inc.length !== 0) {
                        Increase = inc;
                    }
                }
                Booster = booster(videoElement, Increase);
                clearInterval(interval);
            } else {
                timeout++; // 超時退出
                if (timeout === 5) {
                    clearInterval(interval);
                }
            }
        }, 1000);
    }
    async function MenuHotkey() {
        document.addEventListener("keydown", function(event) {
            if (event.altKey && event.key === "b") {
                IncrementalSetting();
            }
        });
    }
    FindVideo();
    MenuHotkey();
    GM_registerMenuCommand("🔊 [開關] 自動增幅", function() {Useboost(enabledDomains, domain)});
    GM_registerMenuCommand("🛠️ 設置增幅", function() {IncrementalSetting()});
    GM_registerMenuCommand("📜 菜單熱鍵", function() {
        alert("可使用熱鍵方式呼叫設置菜單!!\n\n快捷組合 : (Alt + B)");
    });
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

    // 將預設音量調整至 100% [如果被其他腳本改變音量 , 可以使用監聽器持續修改 , 但會占用資源]
    video.volume = 1;
    // 設置增量
    gainNode.gain.value = increase * increase;

    // 設置動態壓縮器的參數(通用性測試!!)
    compressorNode.ratio.value = 6; // 壓縮率
    compressorNode.knee.value = 12; // 壓縮過度反應時間(越小越快)
    compressorNode.threshold.value = -6; // 壓縮閾值
    compressorNode.attack.value = 0.003; // 開始壓縮的速度
    compressorNode.release.value = 0.4; // 釋放壓縮的速度

    // 進行節點連結
    source.connect(gainNode);
    gainNode.connect(compressorNode);
    compressorNode.connect(audioContext.destination);
    return {
        // 設置音量
        setVolume: function(increase) {
            gainNode.gain.value = increase * increase;
            Increase = increase;
        }
    }
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
        <div class="YT-modal-content">
            <h2 style="color: #3754f8;">音量增量</h2>
            <div style="margin:1rem auto 1rem auto;">
                <div class="multiplier">
                    <span><img src="https://cdn-icons-png.flaticon.com/512/8298/8298181.png" width="5%">增量倍數 </span><span id="currentValue">${Increase}</span><span> 倍</span>
                </div>
                <input type="range" class="slider" min="0" max="10.0" value="${Increase}" step="0.1"><br>
            </div>
            <div style="text-align: right;">
                <button class="YT-modal-button" id="save">保存設置</button>
                <button class="YT-modal-button" id="close">退出選單</button>
            </div>
        </div>
    `
    modal.classList.add('YT-modal-background');
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
        if (enabledDomains.includes(domain)) {
            let rangeValue = parseFloat(modal.querySelector(".slider").value);
            GM_setValue(domain, rangeValue);
            modal.classList.add("hidden");
        } else {
            alert("需啟用自動增幅才可保存");
        }
    });

    // 監聽關閉按鈕點擊
    let CloseButton = modal.querySelector("#close");
    CloseButton.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
}
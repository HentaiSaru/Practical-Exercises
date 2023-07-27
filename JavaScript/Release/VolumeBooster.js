// ==UserScript==
// @name         Video Volume Booster
// @version      0.0.5
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

/*
後續開發!!

增加設置調整倍率功能
*/

(function() {
    var Booster, enabledDomains = GM_getValue("啟用網域", []), domain = window.location.hostname, Increase=2.5;
    async function FindVideo() {
        let interval ,timeout=0;
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
        // 啟用查找
        FindVideo();
    }
    GM_registerMenuCommand("🔊 [開關] 自動增幅", function() {Useboost(enabledDomains, domain)});
})();

function booster(video, increase) {
    // 將預設音量調整至 100%
    video.volume = 1;
    const audioContext = new (window.AudioContext || window.webkitAudioContext);
    // 音頻來源
    const source = audioContext.createMediaElementSource(video);
    // 增益節點
    const gainNode = audioContext.createGain();
    // 動態壓縮節點
    const compressorNode = audioContext.createDynamicsCompressor();

    // 設置音量
    gainNode.gain.value = increase;

    // 設置動態壓縮器的參數(通用性設置)
    compressorNode.ratio.value = 6;
    compressorNode.knee.value = 15;
    compressorNode.threshold.value = -12;
    compressorNode.attack.value = 0.005;
    compressorNode.release.value = 0.4;

    // 進行節點連結
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    compressorNode.connect(audioContext.destination);
    return {
        // 設置音量(範圍 1.0 ~ 10.0)
        setVolume: function(increase) {
            gainNode.gain.value = Math.min(Math.max(increase, 1.0), 10.0);
        },
        // 獲取當前的設定值
        getAmpLevel: function() {
            return gainNode.gain.value;
        }
    };
}

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
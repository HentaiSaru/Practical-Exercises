// ==UserScript==
// @name         Video Volume Booster
// @version      0.0.26
// @author       HentaiSaru
// @description  增強影片音量上限 , 最高增幅至10倍 , 未測試是否所有網域皆可使用 *://*/* , 目前只match特定網域

// @match        *://*.twitch.tv/*
// @match        *://*.youtube.com/*
// @match        *://*.bilibili.com/*
// @exclude      *://video.eyny.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    var Booster, Increase = 1.0,
    ListenerRecord = new Map(),
    domain = window.location.hostname,
    buffer = document.createDocumentFragment(),
    enabledDomains = GM_getValue("啟用網域", []);

    FindVideo();
    MenuHotkey();
    setTimeout(function() {MonitorAjax()}, 1000);

    /* ==================== 菜單註冊 ==================== */
    GM_registerMenuCommand("🔊 [開關] 自動增幅", function() {Useboost(enabledDomains, domain)});
    GM_registerMenuCommand("🛠️ 設置增幅", function() {IncrementalSetting()});
    GM_registerMenuCommand("📜 菜單熱鍵", function() {
        alert("可使用熱鍵方式呼叫設置菜單!!\n\n快捷組合 : (Alt + B)");
    });

    /* ==================== API ==================== */

    /* 添加監聽 API */
    async function addlistener(element, type, listener) {
        if (!ListenerRecord.has(element) || !ListenerRecord.get(element).has(type)) {
            element.addEventListener(type, listener, true);
            if (!ListenerRecord.has(element)) {
                ListenerRecord.set(element, new Map());
            }
            ListenerRecord.get(element).set(type, listener);
        }
    }

    /* 等待元素 */
    async function WaitElem(selector, timeout, callback) {
        let timer, element;
        const observer = new MutationObserver(() => {
            element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, timeout);
    }

    /* 監聽 Ajex 變化 */
    async function MonitorAjax() {
        let Video;
        const observer = new MutationObserver(() => {
            Video = document.querySelector("video");
            if (Video && !Video.hasAttribute("data-audio-context")) {
                FindVideo();
            }
        });
        observer.observe(document.head, { childList: true, subtree: true });
    }

    /* 註冊快捷鍵(開啟菜單) */
    async function MenuHotkey() {
        addlistener(document, "keydown", event => {
            if (event.altKey && event.key === "b") {
                IncrementalSetting()
            }
        });
    }

    /* ==================== 注入邏輯 ==================== */

    /* 查找 Video 元素 */
    async function FindVideo() {
        WaitElem("video", 10000, video => {
            try {
                if (enabledDomains.includes(domain)) {
                    Increase = GM_getValue(domain, null) || Increase;
                }
                // 音量增幅
                Booster = booster(video, Increase);
            } catch {}
        });
    }

    /* 音量增量邏輯 */
    function booster(video, increase) {
        const AudioContext = new (window.AudioContext || window.webkitAudioContext);
        const SourceNode = AudioContext.createMediaElementSource(video); // 音頻來源
        const GainNode = AudioContext.createGain(); // 增益節點
        const LowFilterNode = AudioContext.createBiquadFilter(); // 低音慮波器
        const HighFilterNode = AudioContext.createBiquadFilter(); // 高音濾波器
        const CompressorNode = AudioContext.createDynamicsCompressor(); // 動態壓縮節點

        // 將預設音量調整至 100% (有可能被其他腳本調整)
        video.volume = 1;
        // 設置增量
        GainNode.gain.value = increase * increase;

        // 設置動態壓縮器的參數(通用性測試!!)
        CompressorNode.ratio.value = 6; // 壓縮率
        CompressorNode.knee.value = 0.5; // 壓縮過渡反應時間(越小越快)
        CompressorNode.threshold.value = -14; // 壓縮閾值
        CompressorNode.attack.value = 0.020; // 開始壓縮的速度
        CompressorNode.release.value = 0.40; // 釋放壓縮的速度

        // 低音慮波增強
        LowFilterNode.frequency.value = 250;
        LowFilterNode.type = "lowshelf";
        LowFilterNode.gain.value = 2.2;

        // 高音慮波增強
        HighFilterNode.frequency.value = 10000;
        HighFilterNode.type = "highshelf";
        HighFilterNode.gain.value = 1.8;

        // 進行節點連結
        SourceNode.connect(GainNode);
        GainNode.connect(LowFilterNode);
        LowFilterNode.connect(HighFilterNode);
        GainNode.connect(CompressorNode);
        CompressorNode.connect(AudioContext.destination);
        // 節點創建標記
        video.setAttribute("data-audio-context", true);
        return {
            // 設置音量
            setVolume: function(increase) {
                GainNode.gain.value = increase * increase;
                Increase = increase;
            }
        }
    }

    /* 使用自動增幅 */
    async function Useboost(enabledDomains, domain) {
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

    GM_addStyle(`
        .modal-background {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            z-index: 9999;
            overflow: auto;
            position: fixed;
            align-items: center;
            justify-content: center;
        }
        .modal-button {
            top: 0;
            margin: 3% 2%;
            color: #d877ff;
            font-size: 16px;
            font-weight: bold;
            border-radius: 3px;
            background-color: #ffebfa;
            border: 1px solid rgb(124, 183, 252);
        }
        .modal-button:hover,
        .modal-button:focus {
            color: #fc0e85;
            cursor: pointer;
            text-decoration: none;
        }
        .modal-content {
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
    `);

    /* 設定菜單 */
    async function IncrementalSetting() {
        const modal = document.createElement("div");
        modal.innerHTML = `
            <div class="modal-content">
                <h2 style="color: #3754f8;">音量增量</h2>
                <div style="margin:1rem auto 1rem auto;">
                    <div class="multiplier">
                        <span><img src="https://cdn-icons-png.flaticon.com/512/8298/8298181.png" width="5%">增量倍數 </span><span id="CurrentValue">${Increase}</span><span> 倍</span>
                    </div>
                    <input type="range" id="sound-amplification" class="slider" min="0" max="10.0" value="${Increase}" step="0.1"><br>
                </div>
                <div style="text-align: right;">
                    <button class="modal-button" id="sound-save">保存設置</button>
                    <button class="modal-button" id="sound-close">退出選單</button>
                </div>
            </div>
        `
        modal.classList.add("modal-background");
        document.body.appendChild(buffer.appendChild(modal));
        const CurrentValue = document.getElementById("CurrentValue");
        const slider = document.getElementById("sound-amplification");

        // 監聽設定拉條
        addlistener(slider, "input", event => {
            const Current = event.target.value;
            CurrentValue.textContent = Current;
            Booster.setVolume(Current);
        });

        // 監聽保存
        addlistener(document.getElementById("sound-save"), "click", () => {
            if (enabledDomains.includes(domain)) {
                const RangeValue = parseFloat(slider.value);
                GM_setValue(domain, RangeValue);
                modal.remove();
            } else {
                alert("需啟用自動增幅才可保存");
            }
        });

        // 監聽關閉
        addlistener(document.getElementById("sound-close"), "click", () => {
            modal.remove();
        });
    }
})();
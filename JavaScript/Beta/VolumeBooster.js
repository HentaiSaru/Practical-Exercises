// ==UserScript==
// @name         影片音量增強器
// @version      0.0.30
// @author       HentaiSaru
// @description  增強影片音量上限，最高增幅至 10 倍，尚未測試是否所有網域都可使用，當影片無聲時，禁止該腳本在該網域上運行。

// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    const Support = /^(http|https):\/\/(?!chrome\/|about\/).*$/i;
    if (Support.test(document.URL)) {
        class API {
            constructor() {
                /* 添加監聽(簡化) */
                this.addlistener = async(element, type, listener, add={}) => {
                    element.addEventListener(type, listener, add);
                }

                /* 註冊菜單 API */
                this.Menu = async(item) => {
                    for (const [name, call] of Object.entries(item)) {
                        GM_registerMenuCommand(name, ()=> {call()});
                    }
                }
            }

            /* 查找元素 */
            $$(Selector, All=false, Source=document) {
                if (All) {return Source.querySelectorAll(Selector)}
                else {
                    const slice = Selector.slice(1);
                    const analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : Selector[0];
                    switch (analyze) {
                        case "#": return Source.getElementById(slice);
                        case " ": return Source.querySelector(Selector);
                        case ".": return Source.getElementsByClassName(slice)[0];
                        default: return Source.getElementsByTagName(Selector)[0];
                    }
                }
            }

            /* 數據保存讀取 API */
            store(operate, key, orig=null){
                return {
                    __verify: val => val !== undefined ? val : null,
                    set: function(val, put) {return GM_setValue(val, put)},
                    get: function(val, call) {return this.__verify(GM_getValue(val, call))},
                    setjs: function(val, put) {return GM_setValue(val, JSON.stringify(put, null, 4))},
                    getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
                }[operate](key, orig);
            }
        }

        class Main extends API {
            constructor() {
                super();
                this.Booster = null;
                this.Increase = null;
                this.Domain = location.hostname;
                this.EnabledDomains = this.store("get", "啟用網域", []);
                this.EnabledStatus = this.EnabledDomains.includes(this.Domain);

                /* 使用自動增幅 */
                this.Useboost = async(domain) => {
                    if (this.EnabledStatus) {
                        this.EnabledDomains = this.EnabledDomains.filter(value => { // 從已啟用列表中移除當前網域
                            return value !== domain;
                        });
                        alert("❌ 禁用自動增幅");
                    } else {
                        this.EnabledDomains.push(domain); // 添加當前網域到已啟用列表
                        alert("✅ 啟用自動增幅");
                    }
                    this.store("set", "啟用網域", this.EnabledDomains);
                    location.reload();
                }

                /* 註冊快捷鍵(開啟菜單) */
                this.MenuHotkey = () => {
                    this.addlistener(document, "keydown", event => {
                        if (event.altKey && event.key === "b") {
                            this.IncrementalSetting();
                        }
                    }, { passive: true, capture: true });
                }
            }

            /* 監聽注入 */
            async Injection() {
                let Video;
                const observer = new MutationObserver(() => {
                    Video = this.$$("video");
                    if (Video && !Video.hasAttribute("Video-Audio-Booster")) {
                        this.VideoBooster(Video);
                    }
                });
                observer.observe(document.head, { childList: true, subtree: true });
            }

            /* 找到 Video 元素後進行操作 */
            async VideoBooster(video) {
                try {
                    this.Increase = this.EnabledStatus ? this.store("get", this.Domain) || 1.0 : 1.0;
                    this.Booster = this.BoosterLogic(video, this.Increase);
                    GM_addStyle(`
                        .Booster-Modal-Background {
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
                        .Booster-Modal-Button {
                            top: 0;
                            margin: 3% 2%;
                            color: #d877ff;
                            font-size: 16px;
                            font-weight: bold;
                            border-radius: 3px;
                            background-color: #ffebfa;
                            border: 1px solid rgb(124, 183, 252);
                        }
                        .Booster-Modal-Button:hover,
                        .Booster-Modal-Button:focus {
                            color: #fc0e85;
                            cursor: pointer;
                            text-decoration: none;
                        }
                        .Booster-Modal-Content {
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
                        .Booster-Multiplier {
                            font-size:25px;
                            color:rgb(253, 1, 85);
                            margin: 10px;
                            font-weight:bold;
                        }
                        .Booster-Slider {width: 350px;}
                        div input {cursor: pointer;}
                    `);
                    this.MenuHotkey();
                    this.Menu({
                        "🔊 [開關] 自動增幅": ()=> this.Useboost(this.Domain),
                        "🛠️ 設置增幅": ()=> this.IncrementalSetting(),
                        "📜 菜單熱鍵": ()=> alert("熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)"),
                    })
                } catch {}
            }

            /* 音量增量邏輯 */
            BoosterLogic(video, increase) {
                const AudioContext = new (window.AudioContext || window.webkitAudioContext)();
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
                video.setAttribute("Video-Audio-Booster", true);

                return {
                    // 設置音量
                    setVolume: increase => {
                        GainNode.gain.value = increase ** 2;
                        this.Increase = increase;
                    }
                }
            }

            /* 調整菜單 */
            async IncrementalSetting() {
                if (!this.$$(".Booster-Modal-Background")) {
                    const modal = document.createElement("div");
                    modal.innerHTML = `
                        <div class="Booster-Modal-Background">
                            <div class="Booster-Modal-Content">
                                <h2 style="color: #3754f8;">音量增強</h2>
                                <div style="margin:1rem auto 1rem auto;">
                                    <div class="Booster-Multiplier">
                                        <span><img src="https://cdn-icons-png.flaticon.com/512/8298/8298181.png" width="5%">增強倍數 </span><span id="CurrentValue">${this.Increase}</span><span> 倍</span>
                                    </div>
                                    <input type="range" id="sound-amplification" class="Booster-Slider" min="0" max="10.0" value="${this.Increase}" step="0.1"><br>
                                </div>
                                <div style="text-align: right;">
                                    <button class="Booster-Modal-Button" id="sound-save">保存設置</button>
                                    <button class="Booster-Modal-Button" id="sound-close">退出選單</button>
                                </div>
                            </div>
                        </div>
                    `
                    document.body.appendChild(modal);

                    const CurrentValue = this.$$("#CurrentValue");
                    const slider = this.$$("#sound-amplification");

                    // 監聽設定拉條
                    this.addlistener(slider, "input", event => {
                        const Current = event.target.value;
                        CurrentValue.textContent = Current;
                        this.Booster.setVolume(Current);
                    }, { passive: true, capture: true });

                    // 監聽保存關閉
                    this.addlistener(this.$$(".Booster-Modal-Background"), "click", click => {
                        click.stopPropagation();
                        const target = click.target;
                        if (target.id === "sound-save") {
                            if (this.EnabledStatus) {
                                const value = parseFloat(slider.value);
                                this.Increase = value;
                                this.store("set", this.Domain, value);
                                this.$$(".Booster-Modal-Background").remove();
                            } else {alert("需啟用自動增幅才可保存")}
                        } else if (target.className === "Booster-Modal-Background" || target.id === "sound-close") {
                            this.$$(".Booster-Modal-Background").remove();
                        }
                    }, { capture: true });
                }
            }
        }
        const main = new Main();
        main.Injection();
    }
})();
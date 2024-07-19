// ==UserScript==
// @name         媒體音量增強器
// @version      0.0.36-Beta
// @author       Canaan HS
// @description  增強媒體音量最高至 20 倍，可記住增強設置後自動應用，部分網站可能無效或無聲，可選擇禁用。
// @description:zh-TW 增強媒體音量最高至 20 倍，可記住增強設置後自動應用，部分網站可能無效或無聲，可選擇禁用。
// @description:zh-CN 增强媒体音量最高至 20 倍，可记住增强设置后自动应用，部分网站可能无效或无声，可选择禁用。
// @description:en Boost media volume up to 20 times, automatically apply saved settings, may not work or have no sound on some sites, can disable if needed.

// @noframes
// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener
// @resource     Img https://cdn-icons-png.flaticon.com/512/8298/8298181.png
// @require      https://update.greasyfork.org/scripts/487608/1413530/ClassSyntax_min.js
// ==/UserScript==

(async () => {
    new class MediaEnhancer extends Syntax {
        constructor() {
            super();
            /* 增益用變數 */
            this.Booster = null; // 保存設置音量函數
            this.Increase = null; // 保存增量
            this.EnhanceNodes = []; // 保存被增強的節點
            this.MediaContent = null; // 保存音頻上下文實例
            this.AudioContext = window.AudioContext || window.webkitAudioContext;

            /* 觀察用變數 */
            this.MediaObserver = null;
            this.ObserverOption = null;

            /* 頁面資訊 */
            this.Init = null;
            this.ExcludeStatus = null;
            this.Host = this.Device.Host;
            this.Lang = this.Language(this.Device.Lang);
            this.BannedHost = this.Store("g", "BannedDomains_v2", {});

            /* 獲取初始化資訊 */
            this.GetBannedHost = (result) => { // 存在數據就是被禁止的
                this.ExcludeStatus = this.BannedHost[this.Host] ?? false;
                result(!this.ExcludeStatus);
            };

            /* 禁用操作 */
            this.Banned = async() => {
                if (this.ExcludeStatus) {
                    delete this.BannedHost[this.Host]; // 從排除列表刪除
                } else {
                    this.BannedHost[this.Host] = true; // 添加到排除列表
                }
                this.Store("s", "BannedDomains_v2", this.BannedHost);
                location.reload();
            };

            /* 註冊快捷鍵(開啟菜單) */
            this.MenuHotkey = async() => {
                this.AddListener(document, "keydown", event => {
                    if (event.altKey && event.key.toUpperCase() == "B") this.BoosterMenu();
                }, { passive: true, capture: true });
            };
        };

        /* 媒體添加增益節點 */
        BoosterFactory(media_object, search_time) {
            try {
                if (!this.AudioContext) throw this.Lang.BT1;
                if (!this.MediaContent) this.MediaContent = new this.AudioContext();

                const nodecount = this.EnhanceNodes.length; // 紀錄運行前的節點數
                for (const media of media_object) {

                    const SourceNode = this.MediaContent.createMediaElementSource(media); // 音頻來源
                    const GainNode = this.MediaContent.createGain(); // 增益節點
                    const LowFilterNode = this.MediaContent.createBiquadFilter(); // 低音慮波器
                    const MidFilterNode = this.MediaContent.createBiquadFilter(); // 中音慮波器
                    const HighFilterNode = this.MediaContent.createBiquadFilter(); // 高音濾波器
                    const CompressorNode = this.MediaContent.createDynamicsCompressor(); // 動態壓縮節點

                    const Interval = setInterval(() => {
                        media.volume = 1; // 將媒體音量設置為 100 % (有可能被其他腳本調整)
                    }, 1e3);
                    setTimeout(() => {clearInterval(Interval)}, 3e3); // 持續 3 秒停止

                    // 設置初始增量
                    GainNode.gain.value = this.Increase ** 2;

                    /* 低音慮波增強 */
                    LowFilterNode.type = "lowshelf";
                    LowFilterNode.gain.value = 2.2;
                    LowFilterNode.frequency.value = 200;

                    /* 中音慮波增強 */
                    MidFilterNode.type = "peaking";
                    MidFilterNode.Q.value = 1;
                    MidFilterNode.gain.value = 3;
                    MidFilterNode.frequency.value = 1200;

                    /* 高音慮波增強 */
                    HighFilterNode.type = "highshelf";
                    HighFilterNode.gain.value = 1.8;
                    HighFilterNode.frequency.value = 12000;

                    /* 設置動態壓縮器的參數 (!! 通用性測試) */
                    CompressorNode.ratio.value = 5.4; // 壓縮率 (調低會更大聲, 但容易爆音)
                    CompressorNode.knee.value = 0.4; // 壓縮過渡反應時間(越小越快)
                    CompressorNode.threshold.value = -12; // 壓縮閾值
                    CompressorNode.attack.value = 0.02; // 開始壓縮的速度
                    CompressorNode.release.value = 0.4; // 釋放壓縮的速度

                    // 進行節點連結
                    SourceNode
                        .connect(GainNode)
                        .connect(LowFilterNode)
                        .connect(MidFilterNode)
                        .connect(HighFilterNode)
                        .connect(CompressorNode)
                        .connect(this.MediaContent.destination);

                    // 節點創建標記
                    media.setAttribute("Enhanced-Node", true);
                    // 將完成的節點添加
                    this.EnhanceNodes.push(GainNode);
                };

                // 打印完成狀態 (要有增加節點才會打印)
                if (this.EnhanceNodes.length > nodecount) {
                    this.Log(
                        this.Lang.BT3,
                        {
                            "Booster Media : ": media_object,
                            "Elapsed Time : ": this.Runtime(search_time, {log: false})
                        },
                        {collapsed: false}
                    );

                    // 初始化創建
                    if (!this.Init) {
                        this.Init = true;
                        this.Menu({
                            [this.Lang.MK]: {func: ()=> alert(this.Lang.MKT)},
                            [this.Lang.MM]: {func: ()=> this.BoosterMenu()}
                        }, "Menu", 2);
                        this.MenuHotkey();
                        this.StoreListen([this.Host], call=> { // 全局監聽保存值變化
                            if (call.far && call.key == this.Host) { // 由遠端且觸發網域相同
                                this.Booster.setVolume(call.nv);
                            }
                        });
                    };
                };

                // 完成後繼續監聽 (3 秒後)
                setTimeout(()=> {
                    this.MediaObserver.observe(document, this.ObserverOption);
                }, 3e3);

                return {
                    setVolume: increase => { // 設置音量
                        this.Increase = increase;
                        this.EnhanceNodes.forEach(node => {
                            node.gain.value = this.Increase ** 2;
                        })
                    }
                };
            } catch (error) {
                this.Log(this.Lang.BT4, error, { type: "error", collapsed: false });
            }
        };

        /* 找到媒體觸發 */
        async Trigger(media_object, search_time) {
            try {
                this.Increase = this.Store("g", this.Host) ?? 1.0; // 初始增量
                this.Booster = this.BoosterFactory(media_object, search_time); // 添加節點

                this.AddStyle(`
                    .Booster-Modal-Background {
                        top: 0;
                        left: 0;
                        opacity: 1;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        z-index: 9999;
                        overflow: auto;
                        position: fixed;
                        align-items: center;
                        justify-content: center;
                        transition: opacity 0.4s ease;
                    }
                    .Booster-Modal-Button {
                        margin: 0 2% 2% 0;
                        color: #d877ff;
                        font-size: 16px;
                        font-weight: bold;
                        padding: 0 0.3rem;
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
                        margin: 15px;
                        font-weight:bold;
                    }
                    .Booster-Modal-Background-Closur {
                        opacity: 0;
                        pointer-events: none;
                    }
                    .Booster-Slider {width: 350px;}
                    div input {cursor: pointer;}
                    #sound-save {cursor: pointer;}
                `, "Booster-Menu", false);
            } catch (error) {
                this.Log("Trigger Error : ", error, { type: "error", collapsed: false });
            }
        };

        /* 調整菜單 */
        async BoosterMenu() {
            if (!this.$$(".Booster-Modal-Background")) {
                const modal = document.createElement("div");
                modal.innerHTML = `
                    <div class="Booster-Modal-Background">
                        <div class="Booster-Modal-Content">
                            <h2 style="color: #3754f8;">${this.Lang.ST}</h2>
                            <div style="margin:1rem auto 1rem auto;">
                                <div class="Booster-Multiplier">
                                    <span><img src="${GM_getResourceURL("Img")}" width="5%">${this.Lang.S1}</span><span id="Booster-CurrentValue">${this.Increase}</span><span>${this.Lang.S2}</span>
                                </div>
                                <input type="range" id="Adjustment-Sound-Enhancement" class="Booster-Slider" min="0" max="20.0" value="${this.Increase}" step="0.1"><br>
                            </div>
                            <div style="text-align: right;">
                                <button class="Booster-Modal-Button" id="sound-save">${this.Lang.SS}</button>
                            </div>
                        </div>
                    </div>
                `
                document.body.appendChild(modal);

                const CurrentValue = this.$$("#Booster-CurrentValue");
                const slider = this.$$("#Adjustment-Sound-Enhancement");

                // 監聽設定拉條
                let Current;
                this.Listen(slider, "input", event => {
                    requestAnimationFrame(()=> {
                        Current = event.target.value;
                        CurrentValue.textContent = Current;
                        this.Booster.setVolume(Current);
                    });
                }, { passive: true, capture: true });

                // 監聽保存關閉
                const Modal = this.$$(".Booster-Modal-Background");
                this.Listen(Modal, "click", click => {
                    click.stopPropagation();
                    const target = click.target;
                    if (target.id === "sound-save") {
                        const value = parseFloat(slider.value);
                        this.Increase = value;
                        this.Store("s", this.Host, value);
                        DeleteMenu();
                    } else if (target.className === "Booster-Modal-Background") {DeleteMenu()}
                }, { capture: true });

                function DeleteMenu() {
                    Modal.classList.add("Booster-Modal-Background-Closur");
                    setTimeout(()=> {Modal.remove()}, 1200);
                }
            }
        };

        /* 功能注入 */
        async Injec() {
            const Menu = async (name) => { // 簡化註冊菜單
                this.Menu({
                    [name]: {func: ()=> this.Banned()}
                });
            };

            this.GetBannedHost(NotBanned => {
                if (NotBanned) {
                    const FindMedia = this.Debounce((func) => {
                        const media_object = [
                            ...this.$$("video", {all: true}),
                            ...this.$$("audio", {all: true})
                        ].filter(media => media && !media.hasAttribute("Enhanced-Node"));
                        media_object.length > 0 && func(media_object);
                    }, 400);

                    this.Observer(document, ()=> { // 觀察者持續觸發查找
                        const Time = this.Runtime();

                        FindMedia(media => {
                            this.MediaObserver.disconnect();
                            this.Trigger(media, Time);
                        });

                    }, {mark: "Media-Booster", attributes: false, throttle: 500}, back=> {
                        this.MediaObserver = back.ob;
                        this.ObserverOption = back.op;
                        Menu(this.Lang.MD);
                    });
                } else Menu(this.Lang.MS);
            });
        };

        /* 語言 */
        Language(lang) {
            const Display = {
                Traditional: {
                    MS: "✅ 啟用增幅", MD: "❌ 禁用增幅",
                    MK: "📜 菜單熱鍵", MM: "🛠️ 調整菜單",
                    MKT: "熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)",
                    BT1: "不支援音頻增強節點", BT2: "添加增強節點失敗",
                    BT3: "添加增強節點成功", BT4: "增強失敗",
                    ST: "音量增強", S1: "增強倍數 ", S2: " 倍",
                    SS: "保存設置",
                },
                Simplified: {
                    MS: "✅ 启用增幅", MD: "❌ 禁用增幅",
                    MK: "📜 菜单热键", MM: "🛠️ 调整菜单",
                    MKT: "热键呼叫调整菜单!!\n\n快捷组合 : (Alt + B)",
                    BT1: "不支援音频增强节点", BT2: "添加增强节点失败",
                    BT3: "添加增强节点成功", BT4: "增强失败",
                    ST: "音量增强", S1: "增强倍数 ", S2: " 倍",
                    SS: "保存设置",
                },
                English: {
                    MS: "✅ Enable Boost", MD: "❌ Disable Boost",
                    MK: "📜 Menu Hotkey", MM: "🛠️ Adjust Menu",
                    MKT: "Hotkey to Call Menu Adjustments!!\n\nShortcut: (Alt + B)",
                    BT1: "Audio enhancement node not supported", BT2: "Failed to add enhancement node",
                    BT3: "Enhancement node added successfully", BT4: "Enhancement failed",
                    ST: "Volume Boost", S1: "Boost Level ", S2: " X",
                    SS: "Save Settings",
                }
            }, Match = {
                "zh-TW": Display.Traditional,
                "zh-HK": Display.Traditional,
                "zh-MO": Display.Traditional,
                "zh-CN": Display.Simplified,
                "zh-SG": Display.Simplified,
                "en-US": Display.English,
            };
            return Match[lang] ?? Match["en-US"];
        };
    }().Injec();
})();
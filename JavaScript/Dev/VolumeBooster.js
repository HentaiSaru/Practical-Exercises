// ==UserScript==
// @name         媒體音量增強器
// @version      0.0.36
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
// @require      https://update.greasyfork.org/scripts/487608/1456525/ClassSyntax_min.js
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
                if (!this.AudioContext) throw this.Lang.Transl("不支援音頻增強節點");
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
                        this.Lang.Transl("添加增強節點成功"),
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
                            [this.Lang.Transl("📜 菜單熱鍵")]: {func: ()=> alert(this.Lang.Transl("熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)"))},
                            [this.Lang.Transl("🛠️ 調整菜單")]: {func: ()=> this.BoosterMenu()}
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
                this.Log(this.Lang.Transl("增強錯誤"), error, { type: "error", collapsed: false });
            }
        };

        /* 找到媒體觸發 */
        async Trigger(media_object, search_time) {
            try {
                this.Increase = this.Store("g", this.Host) ?? 1.0; // 初始增量
                this.Booster = this.BoosterFactory(media_object, search_time); // 添加節點

                this.AddStyle(`
                    Booster_Modal_Background {
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
                        cursor: pointer;
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
                        text-decoration: none;
                    }
                    .Booster-Modal-Content {
                        width: 400px;
                        padding: 5px;
                        overflow: auto;
                        text-align: center;
                        border-radius: 10px;
                        background-color: #cff4ff;
                        border: 2px ridge #82c4e2;
                        border-collapse: collapse;
                        margin: 2% auto 8px auto;
                    }
                    .Booster-Slider {
                        width: 350px;
                        cursor: pointer;
                        margin-bottom: 1rem;
                    }
                    .Booster-Multiplier {
                        margin: 2rem;
                        font-size: 25px;
                        font-weight: bold;
                        color:rgb(253, 1, 85);
                    }
                    .Booster-Multiplier img {
                        width: 8%;
                    }
                    .Booster-Multiplier span {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .Booster-Modal-Background-Closur {
                        opacity: 0;
                        pointer-events: none;
                    }
                `, "Booster-Menu", false);
            } catch (error) {
                this.Log("Trigger Error : ", error, { type: "error", collapsed: false });
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
                            ...this.$$("video, audio", {all: true})
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
                        Menu(this.Lang.Transl("❌ 禁用增幅"));
                    });
                } else Menu(this.Lang.Transl("✅ 啟用增幅"));
            });
        };

        /* 調整菜單 */
        async BoosterMenu() {
            if (!this.$$("Booster_Modal_Background")) {
                const modal = document.createElement("div");
                modal.innerHTML = `
                    <Booster_Modal_Background id="Booster-Modal-Menu">
                        <div class="Booster-Modal-Content">
                            <div>
                                <h2 style="color: #3754f8;">${this.Lang.Transl("音量增強")}</h2>
                                <div class="Booster-Multiplier">
                                    <span>
                                        <img src="${GM_getResourceURL("Img")}">${this.Lang.Transl("增強倍數 ")}
                                        <span id="Booster-CurrentValue">${this.Increase}</span>${this.Lang.Transl(" 倍")}
                                    </span>
                                </div>
                                <input type="range" id="Adjustment-Sound-Enhancement" class="Booster-Slider" min="0" max="20.0" value="${this.Increase}" step="0.1"><br>
                            </div>
                            <div style="text-align: right;">
                                <button class="Booster-Modal-Button" id="Booster-Menu-Close">${this.Lang.Transl("關閉")}</button>
                                <button class="Booster-Modal-Button" id="Booster-Sound-Save">${this.Lang.Transl("保存")}</button>
                            </div>
                        </div>
                    </Booster_Modal_Background>
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
                const Modal = this.$$("Booster_Modal_Background");
                this.Listen(Modal, "click", click => {
                    click.stopPropagation();
                    const target = click.target;
                    if (target.id === "Booster-Sound-Save") {
                        const value = parseFloat(slider.value);
                        this.Increase = value;
                        this.Store("s", this.Host, value);
                        DeleteMenu();
                    } else if (
                        target.id === "Booster-Menu-Close" || target.id === "Booster-Modal-Menu"
                    ) {DeleteMenu()}
                }, { capture: true });

                function DeleteMenu() {
                    Modal.classList.add("Booster-Modal-Background-Closur");
                    setTimeout(()=> {Modal.parentNode.remove()}, 800);
                }
            }
        };

        /* 語言 */
        Language(lang) {
            const Word = {
                Traditional: {},
                Simplified: {
                    "✅ 啟用增幅": "✅ 启用增幅",
                    "📜 菜單熱鍵": "📜 菜单热键",
                    "🛠️ 調整菜單": "🛠️ 调整菜单",
                    "關閉": "关闭",
                    "音量增強": "音量增强",
                    "增強倍數 ": "增强倍数 ",
                    "增強錯誤" : "增强错误",
                    "添加增強節點成功": "添加增强节点成功",
                    "不支援音頻增強節點": "不支持音频增强节点",
                    "熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)" : "热键呼叫调整菜单!!\n\n快捷组合 : (Alt + B)"
                },
                English: {
                    "❌ 禁用增幅": "❌ Disable Boost",
                    "✅ 啟用增幅": "✅ Enable Boost",
                    "📜 菜單熱鍵": "📜 Menu Hotkey",
                    "🛠️ 調整菜單": "🛠️ Adjust Menu",
                    " 倍": "x",
                    "關閉": "Close",
                    "保存": "Save",
                    "音量增強": "Volume Boost",
                    "增強倍數 ": "Boost Multiplier ",
                    "增強錯誤" : "Boost Error",
                    "添加增強節點成功": "Successfully Added Boost Node",
                    "不支援音頻增強節點": "Audio Boost Node Not Supported",
                    "熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)" : "Hotkey to Call Adjust Menu!!\n\nShortcut: (Alt + B)"
                }
            }, Match = {
                "en-US": Word.English,
                "zh-CN": Word.Simplified,
                "zh-SG": Word.Simplified,
                "zh-TW": Word.Traditional,
                "zh-HK": Word.Traditional,
                "zh-MO": Word.Traditional
            }, ML = Match[lang] ?? Match["en-US"];
            return {
                Transl: (Str) => ML[Str] ?? Str,
            };
        };
    }().Injec();
})();
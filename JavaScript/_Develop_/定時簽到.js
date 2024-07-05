// ==UserScript==
// @name         定時簽到
// @version      0.0.1
// @author       HentaiSaru
// @description  定時簽到

// @noframes
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon         https://cdn-icons-png.flaticon.com/512/10233/10233926.png

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==

(async function() {
    // 不是每個網頁都能這樣檢測
    if (window.opener && window.opener !== window) return;

    const Syn = (()=> {
        const [
            day_ms, minute_ms, seconds_ms
        ] = [
            (24 * 60 ** 2 * 1e3), (60 ** 2 * 1e3), (60 * 1e3)
        ];

        // 去抖動
        function Debounce(func, delay=500) {
            let timer = null;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    func(...args);
                }, delay);
            }
        };

        // 等待多元素改 (改成使用 Debounce, 處理 ajex 生成網頁)
        async function WaitMap(selectors, found, {
            raf=false,
            timeout=10,
            debounce=800,
            subtree=true,
            childList=true,
            attributes=false,
            characterData=false,
            timeoutResult=false,
            object=document.body,
        }={}) {
            let timer, elements;

            if (raf) {
                let AnimationFrame;

                const query = () => {
                    elements = selectors.map(selector => object.querySelector(selector));
                    if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                        cancelAnimationFrame(AnimationFrame);
                        clearTimeout(timer);
                        found(elements);
                    } else {
                        AnimationFrame = requestAnimationFrame(query);
                    }
                };

                AnimationFrame = requestAnimationFrame(query);

                timer = setTimeout(() => {
                    cancelAnimationFrame(AnimationFrame);
                    timeoutResult && found(elements);
                }, (1000 * timeout));

            } else {
                const observer = new MutationObserver(Debounce(() => {
                    elements = selectors.map(selector => object.querySelector(selector));
                    if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                        observer.disconnect();
                        clearTimeout(timer);
                        found(elements);
                    }
                }, debounce));

                observer.observe(object, {
                    subtree: subtree,
                    childList: childList,
                    attributes: attributes,
                    characterData: characterData
                });

                timer = setTimeout(() => {
                    observer.disconnect();
                    timeoutResult && found(elements);
                }, (1000 * timeout));
            }
        };

        return {
            WaitMap,
            TimeFormat: (ms) => { // 將 (毫秒) 格式化
                const [
                    hour, minute, seconds,
                ] = [
                    Math.floor((ms % day_ms) / minute_ms),
                    Math.floor((ms % minute_ms) / seconds_ms),
                    Math.floor((ms % seconds_ms) / 1e3)
                ];
                return `距離觸發還剩: ${hour} 小時 ${minute} 分鐘 ${seconds} 秒`;
            }
        }
    })();

    class TimerGeneration {
        constructor() {
            this.Dev = false; // 不要打開
            this.Display = true;

            this.VCL = null;
            this.Timer = null;
            this.Record_key = null;
        };

        // 獲取到 到隔天整點相差毫秒
        __DiffMs() {
            const now = new Date(); // 當前時間
            const tomorrow = new Date(); // 獲取隔天凌晨
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return (tomorrow - now);
        };

        // 清除重複的設置
        async __RepeatClean() {
            // 監聽參數變化
            const self = this;
            self.VCL = GM_addValueChangeListener(this.Record_key, function(key, old_value, new_value, remote) {
                if (remote) { // 來自其他窗口修改
                    clearTimeout(self.Timer);
                    GM_removeValueChangeListener(self.VCL);
                    self.Display && console.log(`舊 ${self.Record_key} 簽到函數定時器已被清除`);
                }
            });
        };

        // 設定計時器
        async SetTimer(func) {
            const waiting_time = this.Dev ? 0 : this.__DiffMs();
            this.Record_key = func.name;

            // 設置定時器, 時間到運行一個函數
            this.Timer = setTimeout(()=> {
                func();
                GM_deleteValue(this.Record_key);
                GM_removeValueChangeListener(this.VCL);
                this.Display && console.log(`已觸發 ${this.Record_key} 的簽到`);
            }, waiting_time);

            GM_setValue(this.Record_key, waiting_time); // 紀錄時間

            if (this.Display) {
                console.group("設置簽到定時器");
                console.log(`觸發的簽到函數: ${this.Record_key}`);
                console.log(Syn.TimeFormat(waiting_time));
                console.groupEnd();
            }

            this.__RepeatClean();
        };

    };

    (new class Checkin {
        async ZoneZero_Checkin() {
            const Open_win = window.open("https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html?act_id=e202406031448091");
            Open_win.onload = () => {
                Open_win.document.querySelector("div.components-pc-assets-__dialog_---dialog-close---3G9gO2")?.click(); // 關閉彈窗
                Syn.WaitMap([
                    "img.mhy-hoyolab-account-block__avatar-icon",
                    "p.components-pc-assets-__main-module_---day---3Q5I5A.day span",
                    "div.components-pc-assets-__prize-list_---list---26M_YG"
                ], found=> {
                    const [icon, day, prize] = found;
                    if (icon.src.startsWith("data:image/png;base64")) {
                        alert("未登入無法自動簽到");
                        return;
                    }

                    const checkinday = (+day.textContent + 1);
                    const checkin = [...prize.querySelectorAll("span.components-pc-assets-__prize-list_---no---3smN44")].some(span=> {
                        if (span.textContent.includes(checkinday)) {
                            span.click();
                            return true;
                        }
                    });

                    if (checkin) Open_win.close();
                }, {object: Open_win.document, timeoutResult: true});
            }
        };

        async Main_Generate() {
            const Run = [this.ZoneZero_Checkin]; // 添加需要簽到的

            let Gen;
            for (Gen of Run) {
                const Timer = new TimerGeneration();
                Timer.SetTimer(Gen);
            }
        };
    }).Main_Generate();
})();
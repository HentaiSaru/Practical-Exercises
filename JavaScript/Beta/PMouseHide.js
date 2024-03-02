// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.2
// @author       HentaiSaru

// @description         在觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。
// @description:zh-TW   在觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。
// @description:zh-CN   在观看视频时，如果鼠标停留在视频区域内一段时间，将隐藏鼠标游标和进度条，当鼠标再次移动时将重新显示。隐藏功能仅在鼠标位于视频区域内时触发。
// @description:en      When watching a video, if the mouse stays in the video area for a period of time, the mouse cursor and progress bar will be hidden. They will reappear when the mouse moves again. The hiding function is triggered only when the mouse is in the video area.
// @description:ja      ビデオを视听中、マウスが一定时间ビデオ领域内に留まると、マウスカーソルと进行バーが非表示になります。マウスが再度移动すると、再び表示されます。非表示机能は、マウスがビデオ领域内にある场合にのみトリガーされます。
// @description:ko      동영상을 시청하는 동안 마우스가 일정 시간 동안 비디오 영역에 머무르면 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 이동하면 다시 표시됩니다. 숨기기 기능은 마우스가 비디오 영역에 있는 경우에만 트리거됩니다.

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @icon         https://ei.phncdn.com/www-static/favicon.ico

// @run-at       document-body

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==

(function() {
    class Pornhub_Hide {
        constructor() {
            this.ListenerRecord = new Map();
            this.StyalRules = null;
            this.Find = {
                video_box: ".video-wrapper div",
                progress_bar: ".mgp_seekBar",
            }
            this.set = {
                mouse: styal => this.StyalRules[0].style.cursor = styal,
                progress: styal => this.StyalRules[1].style.display = styal,
            }
        }

        async AddListener(element, type, listener, add={}) {
            if (!this.ListenerRecord.has(element) || !this.ListenerRecord.get(element).has(type)) {
                element.addEventListener(type, listener, add);
                if (!this.ListenerRecord.has(element)) {
                    this.ListenerRecord.set(element, new Map());
                }
                this.ListenerRecord.get(element).set(type, listener);
            }
        }

        async RemovListener(element, type) {
            if (this.ListenerRecord.has(element) && this.ListenerRecord.get(element).has(type)) {
                const listen = this.ListenerRecord.get(element).get(type);
                element.removeEventListener(type, listen);
                this.ListenerRecord.get(element).delete(type);
            }
        }

        async WaitMap(selectors, timeout, callback) {
            let timer, elements;
            const observer = new MutationObserver(() => {
                elements = selectors.map(selector => document.querySelector(selector))
                if (elements.every(element => {return element !== null && typeof "undefined"})) {
                    observer.disconnect();
                    clearTimeout(timer);
                    callback(elements);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
        }

        async AddStyle(Rule, ID="New-Style") {
            let new_style = document.getElementById(ID);
            if (!new_style) {
                new_style = document.createElement("style");
                new_style.id = ID;
                document.head.appendChild(new_style);
            }
            new_style.appendChild(document.createTextNode(Rule));
        }

        static async HiddenInjection() {
            const self = new Pornhub_Hide();
            let Mark = false, MouseMove;
            self.AddStyle("body {cursor: default;}.Hidden {display: block;}", "Mouse-Hide");
            self.WaitMap([self.Find.video_box, self.Find.progress_bar], 30, call=> {
                self.StyalRules = document.getElementById("Mouse-Hide").sheet.cssRules;
                const [target, bar] = call;

                bar.classList.add("Hidden"); // 添加樣式到進度條
                self.AddListener(target, "mouseover", ()=> {
                    !Mark && Hide(performance.now());
                }, { passive: true });

                self.AddListener(target, "pointerleave", ()=> {
                    if (Mark) {
                        Mark = false;
                        clearTimeout(MouseMove);
                        self.RemovListener(target, "pointerdown");
                        self.RemovListener(target, "pointermove");
                    }
                }, { passive: true });

                async function Hide(PastTime) {
                    Mark = true;

                    // 移動後重置
                    self.AddListener(target, "pointermove", ()=> {
                        if (performance.now() - PastTime > 300) {
                            TriggerTimer(); PastTime = performance.now();
                        }
                    }, { passive: true });

                    // 點擊後重置
                    self.AddListener(target, "pointerdown", () => {TriggerTimer()}, { passive: true });

                    function TriggerTimer() {
                        requestAnimationFrame(() => {
                            self.set.mouse("default");
                            self.set.progress("block");
                            clearTimeout(MouseMove);
                            MouseMove = setTimeout(()=> {
                                self.set.mouse("none");
                                self.set.progress("none");
                            }, 2200);
                        });
                    }
                }
            })
        }
    }
    Pornhub_Hide.HiddenInjection();
})();
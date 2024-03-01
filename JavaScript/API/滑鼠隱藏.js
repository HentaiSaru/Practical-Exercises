// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @version      0.0.1
// @author       HentaiSaru
// @description  在觀看視頻時，如果滑鼠停留在視頻區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*

// @run-at       document-body

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==

(function() {
    class Pornhub_Hide {
        constructor() {
            this.ListenerRecord = new Map();
            this.MouseMove = null;
            this.Find = {
                video_box: ".video-wrapper div",
                progress_bar: ".mgp_progressOverflow",
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

        static async HiddenInjection() {
            const self = new Pornhub_Hide();
            self.WaitMap([self.Find.video_box, self.Find.progress_bar], 10, call=> {
                let Mark = false, body = document.body;
                const [target, bar] = call;

                self.AddListener(target, "mouseover", ()=> { // 避免意外, 如要檢少性能換成 mouseenter
                    if (!Mark) {
                        Mark = true;
                        Hide();
                    }
                }, { passive: true });
                self.AddListener(target, "mouseleave", ()=> {
                    if (Mark) {
                        Mark = false;
                        clearTimeout(self.MouseMove);
                        self.RemovListener(document, "mousemove");
                    }
                }, { passive: true });

                function Hide() {
                    let PastTime = performance.now();
                    self.AddListener(target, "mousemove", ()=> {
                        if (performance.now() - PastTime > 500) {
                            PastTime = performance.now();
                            clearTimeout(self.MouseMove);
                            requestAnimationFrame(() => {
                                body.style.cursor = "default";
                                bar.style.display = "block";
                                self.MouseMove = setTimeout(()=> {
                                    body.style.cursor = "none";
                                    bar.style.display = "none";
                                }, 2300);
                            });
                        }
                    }, { passive: true });
                }
            })
        }
    }
    Pornhub_Hide.HiddenInjection();
})();
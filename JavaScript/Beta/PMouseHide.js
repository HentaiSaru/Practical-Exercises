// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.6
// @author       HentaiSaru

// @description         電腦端滑鼠於影片區塊上停留一段時間，會隱藏滑鼠遊標和進度條，滑鼠再次移動時將重新顯示，手機端在影片區塊向右滑，會觸發影片加速，滑越多加越多最高16倍，放開後恢復正常速度。
// @description:zh-TW   電腦端滑鼠於影片區塊上停留一段時間，會隱藏滑鼠遊標和進度條，滑鼠再次移動時將重新顯示，手機端在影片區塊向右滑，會觸發影片加速，滑越多加越多最高16倍，放開後恢復正常速度。
// @description:zh-CN   电脑端在观看视频时，鼠标停留在视频区域一段时间后，鼠标指针和进度条会被隐藏。当鼠标再次移动时，它们将重新显示。手机端观看视频时，在视频区域向右滑动手指会触发视频加速，滑动越多，加速效果越明显，最高可达16倍。释放手指后，视频将恢复正常速度。
// @description:en      On desktop, when the mouse hovers over the video for a while, the mouse cursor and progress bar will disappear. They will reappear when the mouse moves again. On mobile, swiping right in the video area triggers video acceleration, with more swipes resulting in faster acceleration, up to 16 times. Releasing the finger restores normal playback speed.
// @description:ja      デスクトップでは、マウスが動畫上にしばらく停止すると、マウスカーソルと進行バーが非表示になります。マウスが再度移動すると再表示されます。モバイル端末では、動畫エリアで右にスワイプすると、動畫の加速がトリガーされます。より多くスワイプすると、最大16倍までの加速が得られます。指を離すと、通常の再生速度に戻ります。
// @description:ko      데스크톱에서 비디오를 시청할 때 마우스가 비디오 위에 일정 시간 머물면 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 움직일 때 다시 나타납니다. 휴대폰에서 비디오 영역에서 오른쪽으로 스와이프하면 비디오가 가속됩니다. 스와이프할수록 더 빠른 가속이 발생하며 최대 16 배까지 가능합니다. 손가락을 놓으면 일반 재생 속도로 돌아갑니다.

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @icon         https://ei.phncdn.com/www-static/favicon.ico

// @run-at       document-start

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==

(function() {
    (new class Pornhub_Hide {
        constructor() {
            this.StyalRules = null;
            this.ListenerRecord = {};
            this.display = async(ms, ps) => {
                requestAnimationFrame(() =>{
                    this.StyalRules[0].style.setProperty("cursor", ms, "important");
                    this.StyalRules[1].style.setProperty("display", ps, "important");
                })
            }
            this.Device = {
                sY: ()=> window.scrollY,
                Width: ()=> window.innerWidth,
                Height: ()=> window.innerHeight,
                Agent: ()=> navigator.userAgent,
                _Type: undefined,
                Type: ()=> {
                    return this.Device._Type = this.Device._Type ? this.Device._Type
                        : (this.Device._Type = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Device.Agent()) || this.Device.Width() < 768
                        ? "Mobile" : "Desktop");
                }
            }
            this.throttle = (func, delay) => {
                let lastTime = 0;
                return (...args) => {
                    const now = Date.now();
                    if ((now - lastTime) >= delay) {
                        lastTime = now;
                        func(...args);
                    }
                }
            }
            this.FindObjects = this.Device.Type() == "Desktop" ? ".video-wrapper div" : this.Device.Type() == "Mobile" ? ".mgp_videoWrapper" : ".video-wrapper div";
        }

        async AddListener(element, type, listener, add={}) {
            if (!this.ListenerRecord[element]?.[type]) {
                element.addEventListener(type, listener, add);
                if (!this.ListenerRecord[element]) {
                    this.ListenerRecord[element] = {};
                }
                this.ListenerRecord[element][type] = listener;
            }
        }

        async RemovListener(element, type) {
            const Listen = this.ListenerRecord[element]?.[type];
            if (Listen) {
                element.removeEventListener(type, Listen);
                delete this.ListenerRecord[element][type];
            }
        }

        async WaitMap(selectors, timeout, callback, {object=document, throttle=0}={}) {
            let timer, elements;
            const observer = new MutationObserver(this.throttle(() => {
                elements = selectors.map(selector => document.querySelector(selector))
                if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                    observer.disconnect();
                    clearTimeout(timer);
                    callback(elements);
                }
            }, throttle));
    
            observer.observe(object, { childList: true, subtree: true });
            timer = setTimeout(() => {
                observer.disconnect();
                console.log("\x1b[1m\x1b[31m%s\x1b[0m", "Injection Failed");
            }, (1000 * timeout));
        }

        async AddStyle(Rule, ID="New-Style") {
            let new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
            new_style.appendChild(document.createTextNode(Rule));
        }

        async Injection() {
            let self = this, device = self.Device.Type(), MouseHide;
            /* 找到 影片區塊, 影片, 和進度條 */
            self.WaitMap([self.FindObjects, "video.mgp_videoElement", "div[class*='mgp_progress']"], 10, call=> {
                const [target, video, bar] = call;
                if (device == "Desktop") { /* 電腦端 */
                    console.log("\x1b[1m\x1b[32m%s\x1b[0m", "Hidden Injection Successful");
                    self.AddStyle("body {cursor: default;}.Hidden {display: block;}", "Mouse-Hide");
                    self.StyalRules = document.getElementById("Mouse-Hide").sheet.cssRules;
                    bar.parentNode.classList.add("Hidden"); // 添加樣式到進度條

                    // 離開目標後重置
                    self.AddListener(target, "pointerleave", ()=> {
                        self.display("default", "block");
                        clearTimeout(MouseHide);
                    }, { passive: true });

                    // 移動在目標上觸發隱形與重置
                    self.AddListener(target, "pointermove", self.throttle(()=> {TriggerHide()}, 200), { passive: true });

                    // 點擊在目標上觸發隱形與重置
                    self.AddListener(target, "pointerdown", () => {TriggerHide()}, { passive: true });

                    async function TriggerHide() {
                        clearTimeout(MouseHide);
                        self.display("default", "block");
                        MouseHide = setTimeout(()=> {
                            self.display("none", "none");
                        }, 2100);
                    }

                } else if (device == "Mobile") { /* 手機端 */
                    console.log("\x1b[1m\x1b[32m%s\x1b[0m", "Accelerate Injection Successfully");
                    let sidelineX, startX, moveX, PlaybackRate = video.playbackRate;

                    // 觸碰
                    self.AddListener(target, "touchstart", event => {
                        sidelineX = self.Device.Width() * .2;
                        startX = event.touches[0].clientX;
                    }, { passive: true });

                    // 滑動
                    self.AddListener(target, "touchmove", self.throttle(event => {
                        requestAnimationFrame(() => {
                            moveX = event.touches[0].clientX - startX;
                            if (moveX > sidelineX) { // 右滑
                                const exceed = (moveX - sidelineX) / 3;
                                const NewPlaybackRate = (PlaybackRate + exceed * 0.3).toPrecision(2);
                                video.playbackRate = Math.min(NewPlaybackRate, 16.0);
                            }
                        });
                    }, 200), { passive: true });

                    // 放開
                    self.AddListener(target, "touchend", ()=> {
                        video.playbackRate = PlaybackRate;
                    }, { passive: true });
                } else {
                    console.log("\x1b[1m\x1b[31m%s\x1b[0m", "Injection Failed");
                }
            }, {throttle: 300});
        }
    }).Injection();
})();
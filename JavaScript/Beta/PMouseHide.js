// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.3
// @author       HentaiSaru

// @description         電腦觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。 手機觀看影片時，向右滑動手指可加速影片播放，滑動距離越長，加速效果越明顯，最高可達16倍速。釋放手指後，影片將恢復到原始播放速度。此加速功能僅在觸碰影片區域時生效。
// @description:zh-TW   電腦觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。 手機觀看影片時，向右滑動手指可加速影片播放，滑動距離越長，加速效果越明顯，最高可達16倍速。釋放手指後，影片將恢復到原始播放速度。此加速功能僅在觸碰影片區域時生效。
// @description:zh-CN   电脑观看视频时，鼠标停留在视频区域一段时间后，会隐藏鼠标指针和进度条，当鼠标再次移动时会重新显示。隐藏功能仅在鼠标位于视频区域内时触发。手机观看视频时，向右滑动手指可加速视频播放，滑动距离越长，加速效果越明显，最高可达16倍速。松开手指后，视频将恢复到原始播放速度。此加速功能仅在触摸视频区域时生效。
// @description:en      When watching videos on a computer, if the mouse stays within the video area for a while, the mouse cursor and progress bar will be hidden. They will reappear when the mouse moves again. The hiding function is triggered only when the mouse is within the video area. When watching videos on a mobile phone, swiping the finger to the right accelerates video playback. The longer the swipe, the more noticeable the acceleration effect, up to 16 times speed. Upon releasing the finger, the video will return to the original playback speed. This acceleration function only works when touching the video area.
// @description:ja      コンピュータで動畫を視聽している場合、マウスが一定時間動畫領域內に滯在すると、マウスカーソルと進行バーが非表示になります。マウスが再度移動すると再表示されます。非表示機能は、マウスが動畫領域內にある場合にのみトリガーされます。攜帯電話で動畫を視聽している場合、指を右にスワイプすると動畫の再生が加速します。スワイプの長さが長いほど、加速効果がより顕著になり、最大16倍速までです。指を離すと、動畫は元の再生速度に戻ります。この加速機能は、動畫領域に觸れている場合のみ機能します。
// @description:ko      컴퓨터에서 비디오를 시청하는 경우, 마우스가 비디오 영역에 일정 시간 머무를 경우 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 움직이면 다시 표시됩니다. 숨기기 기능은 비디오 영역 내에 마우스가 있을 때만 트리거됩니다. 핸드폰에서 비디오를 시청하는 경우, 손가락을 오른쪽으로 스와이프하면 비디오 재생이 가속화됩니다. 스와이프가 길면 가속 효과가 더욱 뚜렷해지며 최대 16배 속도까지 가능합니다. 손가락을 놓으면 비디오는 원래의 재생 속도로 돌아갑니다. 이 가속 기능은 비디오 영역을 터치할 때만 작동합니다.

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
            this.ListenerRecord = new Map();
            this.display = async(ms, ps) => {
                requestAnimationFrame(() =>{
                    this.StyalRules[0].style.cursor = ms;
                    this.StyalRules[1].style.display = ps;
                })
            }
            this.Device = {
                Width: window.innerWidth,
                Height: window.innerHeight,
                Agent: navigator.userAgent,
                _Type: undefined,
                Type: function() {
                    if (this._Type) {
                        return this._Type;
                    } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent) || this.Width < 768) {
                        this._Type = "Mobile";
                    } else {
                        this._Type = "Desktop";
                    }
                    return this._Type;
                }
            }
            this.throttle = (func, delay) => {
                let lastTime = 0;
                return function() {
                    const context = this, args = arguments, now = Date.now();
                    if ((now - lastTime) >= delay) {
                        func.apply(context, args);
                        lastTime = now;
                    }
                };
            };
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
            observer.observe(document, { childList: true, subtree: true });
            timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
        }

        async AddStyle(Rule, ID="New-Style") {
            let new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
            new_style.appendChild(document.createTextNode(Rule));
        }

        async Injection() {
            let self = this, device = self.Device.Type(), MouseHide;
            const FindObjects = device == "Desktop" ? ".video-wrapper div" : device == "Mobile" ? ".mgp_videoWrapper" : "";
            self.AddStyle("body {cursor: default;}.Hidden {display: block;}", "Mouse-Hide");
            /* 找到 影片區塊, 影片, 和進度條 */
            self.WaitMap([FindObjects, "video.mgp_videoElement", ".mgp_seekBar"], 30, call=> {
                const [target, video, bar] = call;
                if (device == "Desktop") {
                    self.StyalRules = document.getElementById("Mouse-Hide").sheet.cssRules;
                    bar.classList.add("Hidden"); // 添加樣式到進度條

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

                } else if (device == "Mobile") {
                    let sidelineX, startX, moveX, PlaybackRate = video.playbackRate;

                    // 觸碰
                    self.AddListener(target, "touchstart", event => {
                        sidelineX = self.Device.Width * .2;
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
                    }, 100), { passive: true });

                    // 放開
                    self.AddListener(target, "touchend", ()=> {
                        video.playbackRate = PlaybackRate;
                    }, { passive: true });
                }
            })
        }
    }).Injection();
})();
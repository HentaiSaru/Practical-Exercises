// ==UserScript==
// @name         Twitch Beautify
// @name:zh-TW   Twitch Beautify
// @name:zh-CN   Twitch Beautify
// @name:ja      Twitch Beautify
// @name:en      Twitch Beautify
// @version      0.0.21
// @author       Canaan HS
// @description         美化 Twitch 觀看畫面 , 懶人自動點擊 , 主頁自動暫停靜音自動播放影片
// @description:zh-TW   美化 Twitch 觀看畫面 , 懶人自動點擊 , 主頁自動暫停靜音自動播放影片
// @description:zh-CN   美化 Twitch 观看画面 , 懒人自动点击 , 主页自动暂停静音自动播放视频
// @description:ja      Twitchの視聴画面を美化し、怠け者の自動クリック、ホームページの自動一時停止、ミュート、自動再生ビデオ
// @description:ko      Twitch 시청 화면을 미화하고, 게으른 사람들을 위한 자동 클릭, 홈페이지 자동 일시 정지, 음소거, 자동 재생 비디오
// @description:en      Beautify the Twitch viewing screen, automatic clicks for lazy people, automatic pause and mute on the homepage, and automatic playback of videos.

// @match        *://*.twitch.tv/*
// @icon         https://cdn-icons-png.flaticon.com/512/9290/9290165.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1361984/SyntaxSimplified.js
// @resource     jui https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css
// ==/UserScript==

(function() {
    const lang = language(navigator.language);

    (new class Beautify extends Syntax {
        constructor() {
            super();
            this.Resume = null;
            this.IsHome = (Url) => Url == "https://www.twitch.tv/";
            this.IsLive = (Url) => /^https:\/\/www\.twitch\.tv\/.+/.test(Url);

            // 菜單註冊
            this.RegisterMenu = (Name) => {
                this.Menu({
                    [Name]: {
                        func: ()=> this.Use(), close: false
                    }
                })
            }

            // 整體框架美化
            this.Beautify = async(Nav, Frame, Channel_Parent) => {
                requestAnimationFrame(() => {
                    Nav.classList.add("Nav_Effect");
                    // Frame.style.zIndex = "9999";
                    Channel_Parent.classList.add("Channel_Expand_Effect");
                })
            }

            /* 自動恢復觀看 */
            this.ResumeWatching = async(Frame) => {
                let Recover;
                this.Resume = new MutationObserver(() => {
                    Recover = this.$$(".itFOsv")
                    Recover && Recover.click();
                });
                this.Resume.observe(Frame, {childList: true, subtree: true});
            }

            // 清除頁腳
            this.ClearFooter = async() => {
                this.WaitElem("#twilight-sticky-footer-root", footer=> {
                    footer.remove();
                }, {throttle: 200});
            }
        }

        /* 主運行程式 */
        async Main() {
            if (this.store("g", "Beautify", [])) {
                this.ClearFooter(); // 清除頁腳
                this.ImportStyle(); // 導入樣式
                this.RegisterMenu(lang.MS_02); // 註冊菜單

                const Url = document.URL;
                if (this.IsHome(Url)) {
                    this.Start();
                    this.PlayControl(false);
                } else if (this.IsLive(Url)) {
                    this.Trigger();
                }
            } else {
                this.RegisterMenu(lang.MS_01);
            }
        }

        /* 檢測到 Live 頁面 */
        async Start() {
            this.AddListener(window, "urlchange", change => {
                if (this.IsLive(change.url)) {
                    this.RemovListener(window, "urlchange");
                    this.log("Live", this.ListenerRecord);
                    this.Trigger();
                }
            });
        }

        /* 檢測回到大廳 */
        async End(Nav, Channel_Parent, Channel_Button, Chat_Button) {
            this.AddListener(window, "urlchange", change => {
                if (this.IsHome(change.url)) {
                    this.RemovListener(window, "urlchange");
                    this.log("大廳", this.ListenerRecord);
                    this.Resume.disconnect();
                    Nav.classList.remove("Nav_Effect");
                    Channel_Button.removeAttribute("style");
                    Chat_Button.classList.remove("Button_Effect");
                    Channel_Button.classList.remove("Button_Effect");
                    Channel_Parent.classList.remove("Channel_Expand_Effect");

                    this.RemovListener(Chat_Button, "mouseenter");
                    this.RemovListener(Chat_Button, "mouseleave");
                    this.RemovListener(Channel_Button, "mouseenter");
                    this.RemovListener(Channel_Button, "mouseleave");

                    this.Start();
                }
            });
        }

        /* Live 頁面觸發美化 */
        async Trigger() {
            this.WaitMap([
                "nav", // 導覽列
                ".side-nav", // 頻道元素
                ".side-nav-section div", // 判斷收合狀態
                "[data-a-player-state='']", // 影片區塊
                "[data-a-target='side-nav-arrow']", // 頻道列 button
                "[data-a-target='right-column__toggle-collapse-btn']" // 聊天室 button
            ], found=> {
                const [
                    Nav,
                    Channel,
                    Collapsed_State,
                    VideoFrame,
                    Channel_Button,
                    Chat_Button
                ] = found;
                const Channel_Parent = Channel.parentNode;
                this.PlayControl(true); // 恢復播放
                this.Beautify(Nav, VideoFrame, Channel_Parent); // 介面美化 (大廳重置)
                this.AutoClick(Channel_Button, Chat_Button); // 使用自動點擊 (大廳重置)
                this.ResumeWatching(VideoFrame); // 自動恢復觀看 (大廳重置)
                !Collapsed_State.getAttribute("data-a-target") && Channel_Button.click(); // 自動展開菜單

                this.End(Nav, Channel_Parent, Channel_Button, Chat_Button); // 監聽回大廳
            }, {raf: true});
        }

        /* 切換使用狀態 */
        async Use() {
            this.store("g", "Beautify", [])?
            this.store("s", "Beautify", false):
            this.store("s", "Beautify", true);
        }

        // 自動點擊
        async AutoClick(Channel_Button, Chat_Button) {
            Chat_Button.classList.add("Button_Effect");
            Channel_Button.classList.add("Button_Effect");
            Channel_Button.style.transform = "translateY(15px)";

            // 頻道列
            let Channel_timer;
            this.AddListener(Channel_Button, "mouseenter", ()=> {
                Channel_timer = setTimeout(()=> {
                    Channel_Button.click();
                }, 250);
            });
            this.AddListener(Channel_Button, "mouseleave", ()=> {
                clearTimeout(Channel_timer);
                Channel_Button.classList.add("Button_Effect");
            });

            // 聊天室
            let Chat_timer; // 分開使用避免意外
            this.AddListener(Chat_Button, "mouseenter", ()=> {
                Chat_timer = setTimeout(()=> {
                    Chat_Button.click();
                }, 250);
            });
            this.AddListener(Chat_Button, "mouseleave", ()=> {
                clearTimeout(Chat_timer);
                Chat_Button.classList.add("Button_Effect");
            });
        }

        /* 影片播放 與 聲音操作 */
        async PlayControl(control) {
            let Interval, Delay=500, Wait=5e3;

            this.WaitElem("video", video=> {
                if (control) { // 控制是 true, 就是播放, 和恢復聲音
                    Interval = setInterval(()=> {
                        video.play();
                        video.muted=false;
                    }, Delay);

                    setTimeout(()=> { // 等待 5 秒後
                        !video.muted && !video.paused && clearInterval(Interval);
                    }, Wait);
                } else {
                    Interval = setInterval(()=> {
                        video.pause();
                        video.muted=true;
                    }, Delay);

                    setTimeout(()=> {
                        video.muted && video.paused && clearInterval(Interval);
                    }, Wait);
                }
            }, {raf: true});
        }

        /* 導入樣式 */
        async ImportStyle() {
            this.AddStyle(`
                ${GM_getResourceText("jui")}
                .Nav_Effect {
                    opacity: 0;
                    height: 1rem !important;
                    transition: opacity 0.5s , height 0.8s;
                }
                .Nav_Effect:hover {
                    opacity: 1;
                    height: 5rem !important;
                }
                .Channel_Expand_Effect {
                    opacity: 0;
                    width: 1rem;
                    transition: opacity 0.4s , width 0.7s;
                }
                .Channel_Expand_Effect:hover {
                    opacity: 1;
                    width: 24rem;
                }
                .Button_Effect {
                    transform: translateY(10px);
                    color: rgba(239, 239, 241, 0.3) !important;
                }
                .Button_Effect:hover {
                    color: rgb(239, 239, 241) !important;
                }
                .Drag_Effect {
                    border: 2px solid white;
                    border-radius: 10px;
                }
            `, "Effect");
        }
    }).Main();

    function language(lang) {
        const Display = {
            Simplified: {MS_01: "🛠️ 已禁用美化❌", MS_02: "🛠️ 已启用美化✅"},
            Traditional: {MS_01: "🛠️ 已禁用美化❌", MS_02: "🛠️ 已啟用美化✅"},
            Korea: {MS_01: "🛠️ 뷰티파이 비활성화됨❌", MS_02: "🛠️ 뷰티파이 활성화됨✅"},
            Japan: {MS_01: "🛠️ ビューティファイが無効です❌", MS_02: "🛠️ ビューティファイが有効です✅"},
            English: {MS_01: "🛠️ Beautification disabled❌", MS_02: "🛠️ Beautification enabled✅"}
        }, Match = {
            "ja": Display.Japan,
            "ko": Display.Korea,
            "en-US": Display.English,
            "zh-CN": Display.Simplified,
            "zh-SG": Display.Simplified,
            "zh-TW": Display.Traditional,
            "zh-HK": Display.Traditional,
            "zh-MO": Display.Traditional
        };
        return Match[lang] || Match["en-US"];
    }
})();
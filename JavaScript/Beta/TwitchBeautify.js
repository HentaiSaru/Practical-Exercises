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
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1361054/SyntaxSimplified.js
// @resource     jui https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css
// ==/UserScript==
const def = new Syntax();
def.AddListener(window, "urlchange",  change => {
    console.log("變更", change.url);
});
(function() {
    var EnabledState,
    Home = "https://www.twitch.tv/",
    Match = /^https:\/\/www\.twitch\.tv\/.+/,
    Language = display_language(navigator.language);

    /* 判斷是否運行美化 */
    if (store("get", "Beautify", [])) {
        EnabledState = Language[1];
        document.URL == Home ? PlayControl(false) : null;
        setTimeout(HideFooter, 1500);
        ImportStyles();
        Start();
    } else {
        EnabledState = Language[0];
    }

    GM_registerMenuCommand(EnabledState, function() {Use()});

    /* ========== 運行觸發前置 ========== */

    /* 監聽開始運行美化 */
    async function Start() {
        const observer = new MutationObserver(() => {
            if (Match.test(document.URL) && $_("video")) {
                observer.disconnect();
                BeautifyTrigger();
                Fun($("div[data-a-player-state='']"), false);
            }
        });
        observer.observe(document.head, {childList: true, subtree: true});
    }

    /* 監聽恢復美化 */
    async function End(Nav, CB, CX) {
        const observer = new MutationObserver(() => {
            if (document.URL == Home) {
                observer.disconnect();
                Nav.removeClass("Nav_Effect");
                CX.removeClass("Channel_Expand_Effect");
                CB.removeClass("button_Effect");
                Fun($("div[data-a-player-state='mini']"));
                Start();// 重新執行美化監聽
            }
        });
        observer.observe(document.head, {childList: true, subtree: true});
    }

    /* 查找video頁面元素 */
    async function BeautifyTrigger() {
        const Elem = [
            "nav", // 導覽列
            ".side-nav", // 頻道元素
            ".simplebar-track.vertical", // 收合狀態
            "div[data-a-player-state='']", // 影片區塊
            "button[data-a-target='side-nav-arrow']", // 頻道列 button
            "button[data-a-target='right-column__toggle-collapse-btn']" // 聊天室 button
        ];
        WaitElem(Elem, 8, element => {
            const [Nav, Channel, Collapsed_State, player, Channel_Button, Chat_button] = element;
            const Channel_Parent = Channel.parent();
            // 判斷兩次總該打開了吧
            if (Collapsed_State.css("visibility") !== "visible") {Channel_Button.click()}
            if (Collapsed_State.css("visibility") === "hidden") {Channel_Button.click()}
            if (!$_("#ADB")) {DeleteIframe()}
            Beautify(Nav, player, Channel_Parent); // 介面美化
            AutoClickC(Chat_button, Channel_Button); // 懶人自動點擊
            PlayControl(true); // 恢復聲音
            ResumeWatching(); // 自動恢復觀看(網路有問題時)
            End(Nav, Channel_Button, Channel_Parent); // 首頁復原監聽
        });
    }

    /* ========== 功能操作邏輯 ========== */

    /* 美化邏輯 */
    async function Beautify(Nav, play, CX) {
        //play.css("z-index", "9999");
        Nav.addClass("Nav_Effect");
        CX.addClass("Channel_Expand_Effect");
    }

    /* 影片播放聲音操作 */
    async function PlayControl(control) {
        let delay=500, interval = setInterval(() => {
            const player = $_("video");
            if (player) { // 查找影片元素, 找到後停止輪迴
                clearInterval(interval);
                if(control) { // 判斷要控制的邏輯 (播放 or 停止)
                    const interval = setInterval(() => {
                        player.play();
                        player.muted = false;
                        setTimeout(() => {
                            !player.paused && !player.muted ? clearInterval(interval) : null;
                        }, 1000 * 3);
                    }, delay);
                } else {
                    const interval = setInterval(() => {
                        player.pause();
                        player.muted = true;
                        setTimeout(() => {
                            player.paused && player.muted ? clearInterval(interval) : null;
                        }, 1000 * 3);
                    }, delay);
                }
            }
        }, delay);
    }

    /* 懶人自動點擊 */
    async function AutoClickC(Chat_button, Channel_Button) {
        let timer, timer2;
        Chat_button.addClass("button_Effect");
        Channel_Button.addClass("button_Effect");

        Chat_button.on('mouseenter', function() {
            timer = setTimeout(function() {
                Chat_button.click();
            }, 250);
        });
        Chat_button.on('mouseleave', function() {
            Chat_button.addClass("button_Effect");
            clearTimeout(timer);
        });

        Channel_Button.css("transform", "translateY(19px)");
        Channel_Button.on('mouseenter', function() {
            timer2 = setTimeout(function() {
                Channel_Button.click();
            }, 250);
        });
        Channel_Button.on('mouseleave', function() {
            Channel_Button.addClass("button_Effect");
            clearTimeout(timer2);
        });
    }

    /* ========== 附加額外功能 ========== */

    /* 拖動添加 */
    async function Fun(element, state=true) {
        if (element.length > 0) {
            if (state) {
                element.draggable({
                    cursor: "grabbing",
                    start: function(event, ui) {
                        $(this).find("div.ScAspectRatio-sc-18km980-1").addClass("drag-border");
                    },
                    stop: function(event, ui) {
                        $(this).find("div.ScAspectRatio-sc-18km980-1").removeClass("drag-border");
                    }
                });
                element.resizable({
                    handles: "all",
                    minWidth: 50,
                    minHeight: 50,
                    aspectRatio: 16 / 10
                });
            } else {
                if (element.data("ui-draggable")) {
                    element.draggable("destroy");
                    element.resizable("destroy");
                }
            }
        }
    }

    /* 自動恢復觀看 */
    async function ResumeWatching() {
        let recover;
        const observer = new MutationObserver(() => {
            document.querySelector(".itFOsv")
            try {recover = $("div[data-a-target='player-overlay-content-gate'] button")} catch {}
            if (document.URL === Home) {
                observer.disconnect();
            } else if (recover.length > 0) {
                recover.click();
            }
        });
        observer.observe($("div[data-a-player-state='']")[0], {childList: true, subtree: true});
    }

    /* 隱藏頁腳 */
    async function HideFooter() {
        try {$("#twilight-sticky-footer-root").css("display", "none")} catch {}
    }

    /* ========== 語法簡化 API ========== */

    /* 美化使用切換 */
    function Use() {
        store("get", "Beautify", [])?
        store("set", "Beautify", false):
        store("set", "Beautify", true);
        location.reload();
    }

    /* DOM 查找語法簡化 */
    function $_(element, all=false) {
        if (!all) {
            const slice = element.slice(1),
            analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : element[0];
            return analyze == " " ? document.querySelector(element)
            : analyze == "#" ? document.getElementById(element.slice(1))
            : analyze == "." ? document.getElementsByClassName(element.slice(1))[0]
            : document.getElementsByTagName(element)[0];
        } else {return document.querySelectorAll(element)}
    }

    /* 等待元素 */
    async function WaitElem(selectors, timeout, callback) {
        let timer, elements;
        const observer = new MutationObserver(() => {
            elements = selectors.map(selector => $(selector));
            if (elements.every(element => element[0])) {
                observer.disconnect();
                clearTimeout(timer);
                callback(elements);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, 1000 * timeout);
    }

    /* 添加js */
    async function addscript(Rule, ID="Add-script") {
        let new_script = document.getElementById(ID);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }

    /* 存儲操作 */
    function store(operate, key, orig=null){
        return {
            __verify: val => val !== undefined ? val : null,
            set: function(val, put) {return GM_setValue(val, put)},
            get: function(val, call) {return this.__verify(GM_getValue(val, call))},
            setjs: function(val, put) {return GM_setValue(val, JSON.stringify(put, null, 4))},
            getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
        }[operate](key, orig);
    }

    /* 載入所需樣式 */
    async function ImportStyles() {
        GM_addStyle(`
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
            .button_Effect {
                transform: translateY(10px);
                color: rgba(239, 239, 241, 0.3) !important;
            }
            .button_Effect:hover {
                color: rgb(239, 239, 241) !important;
            }
            .drag-border {
                border: 2px solid white;
                border-radius: 10px;
            }
        `);
    }

    /* 菜單語言顯示 */
    function display_language(language) {
        return {
            "zh-TW": ["🛠️ 以禁用美化❌", "🛠️ 以啟用美化✅"],
            "zh-CN": ["🛠️ 已禁用美化❌", "🛠️ 已启用美化✅"],
            "ko": ["🛠️ 미화 비활성화❌", "🛠️ 미화 활성화✅"],
            "ja": ["🛠️ 美化を無効にしました❌", "🛠️ 美化を有効にしました✅"],
            "en-US": ["🛠️ Beautification disabled❌", "🛠️ Beautification enabled✅"],
        }[language] || ["en-US"];
    }
})();
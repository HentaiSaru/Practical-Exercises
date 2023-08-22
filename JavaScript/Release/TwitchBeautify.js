// ==UserScript==
// @name         Twitch Beautify
// @name:zh-TW   Twitch Beautify
// @name:zh-CN   Twitch Beautify
// @name:ja      Twitch Beautify
// @name:en      Twitch Beautify
// @version      0.0.16
// @author       HentaiSaru
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

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @resource     jui https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css
// ==/UserScript==

(function() {
    const language = display_language(navigator.language);
    var enabledstate;
    if (GM_getValue("Beautify", [])) {
        enabledstate = language[1];
        main();
        if (window.location.href === "https://www.twitch.tv/") {PlayerAborted(true)}
        setTimeout(DeleteFooter, 500);
    } else {
        enabledstate = language[0];
    }
    GM_registerMenuCommand(enabledstate, function() {Use()});
})();

/* 使用美化監聽 */
async function main() {
    const pattern = /^https:\/\/www\.twitch\.tv\/.+/, observer = new MutationObserver(() => {
        if (pattern.test(window.location.href) && document.querySelector("video")) {
            observer.disconnect();
            FindPlayPage();
            // $("div[data-a-player-state='']").css("z-index", "9999");
            fun($("div[data-a-player-state='']"), false);
        }
    });
    observer.observe(document.head, {childList: true, subtree: true});
}

/* 首頁恢復監聽 */
async function HomeRecovery(Nav, CB, CX) {
    const observer = new MutationObserver(() => {
        if (window.location.href === "https://www.twitch.tv/") {
            observer.disconnect();
            Nav.removeClass("Nav_Effect");
            CX.removeClass("Channel_Expand_Effect");
            CB.removeClass("button_Effect");
            fun($("div[data-a-player-state='mini']"));
            main();// 重新執行美化監聽
        }
    });
    observer.observe(document.head, {childList: true, subtree: true});
}

/* 查找video頁面元素方法 */
function FindPlayPage() {
    let interval = setInterval(function() {
        // 取得導覽列
        const Nav = $("nav.InjectLayout-sc-1i43xsx-0.ghHeNF");
        // 取得聊天室 button
        const Chat_button = $("button[data-a-target='right-column__toggle-collapse-btn']");
        // 取得頻道列 button
        const Channel_Button = $("button[data-a-target='side-nav-arrow']");
        // 取得頻道元素
        const Channel_Xpath = $(".side-nav").parent();
        const Collapsed_State = $(".simplebar-track.vertical");
        if (Nav.length > 0 && Chat_button.length > 0 && Channel_Button.length > 0 && Channel_Xpath.length > 0 && Collapsed_State.length > 0) {
            // 判斷兩次總該打開了吧
            if (Collapsed_State.css("visibility") !== "visible") {Channel_Button.click()}
            if (Collapsed_State.css("visibility") === "hidden") {Channel_Button.click()}
            AdProcessing();
            Beautify(Nav, Channel_Xpath); // 介面美化
            AutoClickC(Chat_button, Channel_Button); // 懶人自動點擊
            PlayerAborted(false); // 恢復聲音
            ResumeWatching(); // 監聽恢復觀看
            HomeRecovery(Nav, Channel_Button, Channel_Xpath); // 首頁復原監聽
            clearInterval(interval);
        }
    }, 400);
}

/* 美化 */
async function Beautify(Nav, CX) {
    GM_addStyle(`
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
    `);
    Nav.addClass("Nav_Effect");
    CX.addClass("Channel_Expand_Effect");
}

/* 影片暫停和靜音 */
async function PlayerAborted(control) {
    let timeout=0, interval = setInterval(function() {
        const player = document.querySelector("video");
        if (player) {
            if(control) {
                player.muted = true;
                if (!player.paused) {
                    player.pause();
                    clearInterval(interval);
                } else {
                    timeout++;
                    if (timeout > 10) {
                        clearInterval(interval);
                    }
                }
            } else {
                player.play();
                if (player.muted) {
                    player.muted = false;
                    clearInterval(interval);
                } else {
                    timeout++;
                    if (timeout > 10) {
                        clearInterval(interval);
                    }
                }
            }
        }
    }, 1000);
}

/* 自動恢復觀看 */
async function ResumeWatching() {
    let recover;
    const observer = new MutationObserver(() => {
        try {recover = $("div[data-a-target='player-overlay-content-gate'] button")} catch {}
        if (recover.length > 0) {
            recover.click();
        } else if (window.location.href === "https://www.twitch.tv/") {
            observer.disconnect();
        }
    });
    observer.observe($("div[data-a-player-state='']")[0], {childList: true, subtree: true});
}

/* 懶人自動點擊 */
async function AutoClickC(Chat_button, Channel_Button) {
    GM_addStyle(`
        .button_Effect {
            transform: translateY(10px);
            color: rgba(239, 239, 241, 0.3) !important;
        }
        .button_Effect:hover {
            color: rgb(239, 239, 241) !important;
        }
    `);
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

GM_addStyle(GM_getResourceText("jui"));
/* 拖動添加 */
async function fun(element, state=true) {
    if (element.length > 0) {
        if (state) {
            element.draggable();
            element.resizable({
                handles: "all",
                minWidth: 50,
                minHeight: 50,
            });
        } else {
            element.draggable("destroy");
            element.resizable("destroy");
        }
    }
}

/* 刪除頁腳 */
async function DeleteFooter() {
    try {$("#twilight-sticky-footer-root").css("display", "none")} catch {}
}

/* 添加js */
async function addscript(Rule, ID="New-Add-script") {
    let new_script = document.getElementById(ID);
    if (!new_script) {
        new_script = document.createElement("script");
        new_script.id = ID;
        document.head.appendChild(new_script);
    }
    new_script.appendChild(document.createTextNode(Rule));
}

/* 隨便寫的隱藏廣告, 也不知道有沒有屁用 (測試) */
async function AdProcessing() {
    GM_addStyle(`
        .stream-display-ad__wrapper,
        .stream-display-ad__wrapper-hidden,
        .stream-display-ad__frame_squeezeback,
        .stream-display-ad__wrapper_squeezeback,
        .stream-display-ad__container_squeezeback,
        .stream-display-ad__transform-container_squeezeback {
            height: 0px;
            width: 0px;
            z-index: 1;
            display: none;
        }
    `);
    addscript(`
        const BlockDomains = [
            "sentry.io",
            "usher.ttvnw.net",
            "static.twitchcdn.net",
            "sb.scorecardresearch.com",
            "global.poe.live-video.net",
            "myemotes-backend.grab-colab.com",
        ];
        const ADobserver = new MutationObserver(() => {
            let FetchRequest = window.fetch;
            window.fetch = function(url, options) {
                if (BlockDomains.includes(new URL(url).hostname)) {
                    return;
                } else if (window.location.href === "https://www.twitch.tv/") {
                    ADobserver.disconnect();
                }
                return FetchRequest.apply(this, arguments);
            };
        });
        ADobserver.observe(document, {childList: true, subtree: true});
    `)
    const ad = $(".stream-display-ad__wrapper");
    if (ad.length > 0) {ad.remove()}
}

/* 使用設置開關 */
function Use() {
    if (GM_getValue("Beautify", [])) {
        GM_setValue("Beautify", false);
    } else {
        GM_setValue("Beautify", true);
    }
    location.reload();
}

function display_language(language) {
    let display = {
        "zh-TW": ["🛠️ 以禁用美化❌", "🛠️ 以啟用美化✅"],
        "zh-CN": ["🛠️ 已禁用美化❌", "🛠️ 已启用美化✅"],
        "ja": ["🛠️ 美化を無効にしました❌", "🛠️ 美化を有効にしました✅"],
        "en": ["🛠️ Beautification disabled❌", "🛠️ Beautification enabled✅"],
        "ko": ["🛠️ 미화 비활성화❌", "🛠️ 미화 활성화✅"]
    };
    return display[language] || display["en"];
}
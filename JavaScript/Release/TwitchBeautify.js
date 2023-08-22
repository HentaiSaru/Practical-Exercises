// ==UserScript==
// @name         Twitch Beautify
// @name:zh-TW   Twitch Beautify
// @name:zh-CN   Twitch Beautify
// @name:ja      Twitch Beautify
// @name:en      Twitch Beautify
// @version      0.0.15
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
// @grant        GM_registerMenuCommand
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
        }
    });
    observer.observe(document.head, {childList: true, subtree: true});
}

/* 首頁恢復監聽 */
async function HomeRecovery(Nav, CB, CX) {
    const observer = new MutationObserver(() => {
        if (window.location.href === "https://www.twitch.tv/") {
            observer.disconnect();
            Nav.classList.remove("Nav_Effect");
            CX.classList.remove("Channel_Expand_Effect");
            CB.classList.remove("button_Effect");
            main();// 重新執行美化監聽
        }
    });
    observer.observe(document.head, {childList: true, subtree: true});
}

/* 查找video頁面元素方法 */
function FindPlayPage() {
    let interval = setInterval(function() {
        // 取得導覽列
        const Nav = document.querySelector("nav.InjectLayout-sc-1i43xsx-0.ghHeNF");
        // 取得聊天室 button
        const Chat_button = document.querySelector("button[data-a-target='right-column__toggle-collapse-btn']");
        // 取得頻道列 button
        const Channel_Button = document.querySelector("button[data-a-target='side-nav-arrow']");
        // 取得頻道元素
        const Channel_Xpath = document.querySelector(".side-nav").parentNode;
        const Collapsed_State = document.querySelector(".simplebar-track.vertical");
        if (Nav && Chat_button && Channel_Button && Channel_Xpath && Collapsed_State) {
            // 判斷兩次總該打開了吧
            if (Collapsed_State.style.visibility !== "visible") {Channel_Button.click()}
            if (Collapsed_State.style.visibility === "hidden") {Channel_Button.click()}
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
    Nav.classList.add("Nav_Effect");
    CX.classList.add("Channel_Expand_Effect");
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

/* 恢復觀看 */
async function ResumeWatching() {
    let recover;
    const observer = new MutationObserver(() => {
        try {recover = document.querySelector("div[data-a-target='player-overlay-content-gate']").querySelector("button")} catch {}
        if (recover) {
            recover.click();
        } else if (window.location.href === "https://www.twitch.tv/") {
            observer.disconnect();
        }
    });
    observer.observe(document.querySelector("div.InjectLayout-sc-1i43xsx-0.persistent-player"), {childList: true, subtree: true});
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
    Chat_button.classList.add("button_Effect");
    Chat_button.addEventListener('mouseenter', function() {
        timer = setTimeout(function() {
            Chat_button.click();
        }, 250);
    });
    Chat_button.addEventListener('mouseleave', function() {
        Chat_button.classList.add("button_Effect");
        clearTimeout(timer);
    });
    Channel_Button.classList.add("button_Effect");
    Channel_Button.style.transform = "translateY(19px)";
    Channel_Button.addEventListener('mouseenter', function() {
        timer2 = setTimeout(function() {
            Channel_Button.click();
        }, 250);
    });
    Channel_Button.addEventListener('mouseleave', function() {
        Channel_Button.classList.add("button_Effect");
        clearTimeout(timer2);
    });
}

/* 刪除頁腳 */
async function DeleteFooter() {
    try {document.getElementById("twilight-sticky-footer-root").style.display = "none"} catch {}
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
// ==UserScript==
// @name         Twitch Beautify
// @version      0.0.11
// @author       HentaiSaru
// @license      MIT
// @icon         https://cdn-icons-png.flaticon.com/512/9290/9290165.png
// @description  美化 Twitch 觀看畫面 , 懶人自動點擊 , 在觀看介面啟用 , 回到大廳就會恢復

// @run-at       document-end
// @match        *://*.twitch.tv/*

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==
 
(function() {
    var enabledstate;
    if (GM_getValue("Beautify", [])) {
        enabledstate = "🛠️ 以啟用美化✅";
        main();
    } else {
        enabledstate = "🛠️ 以禁用美化❌";
    }
    const enabled = GM_registerMenuCommand(enabledstate, function() {Use()});
})();

/* 使用美化監聽 */
async function main() {
    let interval, pattern = /^https:\/\/www\.twitch\.tv\/.+/;
    interval = setInterval(function() {
        if (pattern.test(window.location.href)) {
            if (document.querySelector("video")) {
                FindPlayPage();
                clearInterval(interval);
            }
        }
    }, 500);
}

/* 首頁恢復監聽 */
async function HomeRecovery(Nav, CB, CX) {
    let interval
    interval = setInterval(function() {
        if (window.location.href === "https://www.twitch.tv/") {
            Nav.classList.remove("Nav_Effect");
            CX.singleNodeValue.classList.remove("Channel_Expand_Effect");
            CB.classList.remove("button_Effect");
            // 嘗試重新展開(非強制)
            if (document.querySelector(".simplebar-track.vertical").style.visibility === "hidden") {CB.click()}
            main();// 重新執行美化監聽
            clearInterval(interval);
        }
    }, 500);
}

/* 查找元素方法 */
function FindPlayPage() {
    let interval;
    interval = setInterval(function() {
        // 取得導覽列
        const Nav = document.querySelector("nav.InjectLayout-sc-1i43xsx-0.ghHeNF");
        // 取得聊天室 button
        const Chat_button = document.querySelector("button[data-a-target='right-column__toggle-collapse-btn']");
        // 取得頻道列 button
        const Channel_Button = document.querySelector("button[data-a-target='side-nav-arrow']");
        // 取得頻道元素
        const Channel_Xpath = document.evaluate('//*[@id="root"]/div/div[2]/div/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (Nav && Chat_button && Channel_Button && Channel_Xpath) {
            AutoClickC(Chat_button, Channel_Button);
            if (document.querySelector(".simplebar-track.vertical").style.visibility !== "visible") {Channel_Button.click()}
            Beautify(Nav, Channel_Xpath);
            // 首頁復原監聽
            HomeRecovery(Nav, Channel_Button, Channel_Xpath);
            clearInterval(interval);
        }
    }, 250);
    try {
        const Notlogged = document.getElementById("twilight-sticky-footer-root");
        Notlogged.style.display = "none";
    } catch {}
}

/* 美化 */
async function Beautify(Nav, CX) {
    GM_addStyle(`
        .Nav_Effect {
            opacity: 0;
            height: 1rem !important;
            transition: opacity 0.3s , height 0.8s;
        }
        .Nav_Effect:hover {
            opacity: 1;
            height: 5rem !important;
        }
        .Channel_Expand_Effect {
            opacity: 0;
            width: 1rem;
            transition: opacity 0.3s , width 0.6s;
        }
        .Channel_Expand_Effect:hover {
            opacity: 1;
            width: 24rem;
        }
    `);
    Nav.classList.add("Nav_Effect");
    CX.singleNodeValue.classList.add("Channel_Expand_Effect");
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

/* 使用設置開關 */
function Use() {
    if (GM_getValue("Beautify", [])) {
        GM_setValue("Beautify", false);
    } else {
        GM_setValue("Beautify", true);
    }
    location.reload();
}
// ==UserScript==
// @name         Twitch Beautify
// @version      0.0.1
// @author       HentaiSaru
// @license      MIT
// @icon         https://cdn-icons-png.flaticon.com/512/9290/9290165.png
// @description  美化 Twitch 觀看畫面

// @run-at       document-end
// @match        *://*.twitch.tv/*

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    GM_registerMenuCommand("🛠️ [啟用/禁用] 美化播放介面", function() {Use()});
    var currentUrl = window.location.href;
    const pattern = /^https:\/\/www\.twitch\.tv\/.+/;
    if (pattern.test(currentUrl)) {
        if (GM_getValue("Beautify", [])) { //預設是自動啟用美化
            let interval, timeout=0;
            interval = setInterval(function() {
                const video = document.querySelector("video");
                if (video) {
                    FindChannel();
                    clearInterval(interval);
                } else {
                    timeout++;
                    if (timeout === 3) {
                        clearInterval(interval);
                    }
                }
            }, 1000);
        }
    }
})();

async function FindChannel() {
    let interval;
    interval = setInterval(function() {
        // 取得導覽
        const Nav = document.querySelector("nav.InjectLayout-sc-1i43xsx-0.ghHeNF");
        // 取得聊天室 button
        const Chat_button = document.querySelector("button[data-a-target='right-column__toggle-collapse-btn']");
        // 取得狀態
        const Channel_State = document.querySelector(".simplebar-track.vertical").style.visibility;
        // 取得按鈕
        const Channel_Button = document.querySelector("button[data-a-target='side-nav-arrow']");
        // 取得頻道元素
        const Channel_Xpath = document.evaluate('//*[@id="root"]/div/div[2]/div/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (Nav && Chat_button &&Channel_State && Channel_Button && Channel_Xpath) {
            // 已展開狀態刪除按鈕
            if (Channel_State === "hidden") {
                Channel_Button.click();
            }
            Channel_Button.remove();
            AutoClickC(Chat_button);
            Beautify(Nav, Channel_Xpath);
            clearInterval(interval);
        }
    }, 1000);
}

async function Beautify(Nav, CX) {
    GM_addStyle(`
        .Nav_Effect {
            opacity: 0;
            height: 1rem !important;
            transition: opacity 0.3s , height 1s;
        }
        .Nav_Effect:hover {
            opacity: 1;
            height: 5rem !important;
        }
        .Channel_Effect {
            opacity: 0;
            width: 1rem;
            transition: opacity 0.3s , width 0.5s;
        }
        .Channel_Effect:hover {
            opacity: 1;
            width: 24rem;
        }
    `);
    Nav.classList.add("Nav_Effect");
    CX.singleNodeValue.classList.add("Channel_Effect");;
}

async function AutoClickC(CH) {
    let timer;
    CH.style.transform = "translateY(10px)";
    CH.addEventListener('mouseenter', function() {
        timer = setTimeout(function() {
            CH.click();
        }, 300);
    });
    CH.addEventListener('mouseleave', function() {
        clearTimeout(timer);
    });
}

function Use() {
    if (GM_getValue("Beautify", [])) {
        GM_setValue("Beautify", false);
        alert("❌ 禁用美化");
    } else {
        GM_setValue("Beautify", true);
        alert("✅ 啟用美化");
    }
    location.reload();
}
// ==UserScript==
// @version      0.0.3
// @author       HentaiSaru
// @name         YT Hide Recom Tool
// @description  將影片結尾推薦框透明化 , 滑鼠懸浮恢復 , 按下 Shift 則完全隱藏 , 再次按下恢復
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @run-at       document-start
// @match        *://*.youtube.com/watch?v=*

// @license      MIT
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*
Original Author Page : [https://github.com/hoothin/]
Original Author Link : [https://greasyfork.org/zh-TW/scripts/438403-youtube-hide-related-suggestion-which-occlude-the-video]

備註 :
document.getElementById('below') / 包含影片訊息到留言元素
*/

(function() {
    const Mene = GM_registerMenuCommand(
        "📜 [功能說明]",
        function() {
            alert("功能失效時(請重新整理)!!\n\nShift : 完全隱藏影片尾部推薦\nCtrl : 隱藏右側影片推薦");
        }
    )
    let css = `
        .ytp-ce-element{opacity: 0.1!important;}
        .ytp-ce-element:hover{opacity: 1!important;}
    `;
    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(css);
    } else {
        let ElementNode = document.createElement("style");
        ElementNode.appendChild(document.createTextNode(css));
        (document.querySelector("head") || document.documentElement).appendChild(ElementNode);
    }
    document.addEventListener("keydown", function(event) {
        if (event.shiftKey) {
            event.preventDefault();
            let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
            elements.forEach(function(element) {
                if (element.style.display === "none") {
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            });
        } else if (event.ctrlKey) {
            event.preventDefault();
            let element = document.getElementById('secondary');
            if (element.style.display === "none") {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }
    });
})();
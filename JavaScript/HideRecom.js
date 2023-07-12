// ==UserScript==
// @version      0.0.1
// @author       HentaiSaru
// @name         YouTube 隱藏播放建議
// @description  將影片結尾推薦框透明化 , 滑鼠懸浮恢復 , 按下 Shift 則完全隱藏 , 再次按下恢復
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @homepageURL  https://github.com/hoothin/
// @supportURL   https://github.com/hoothin/

// @grant        GM_addStyle
// @run-at       document-start
// @match        *://www.youtube.com/*

// Original      code by hoothin under MIT License
// Original      Code Link : [https://greasyfork.org/zh-TW/scripts/438403-youtube-hide-related-suggestion-which-occlude-the-video]
// ==/UserScript==
(function() {
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
        }
    });
})();
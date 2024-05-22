// ==UserScript==
// @name         AI 快速爬取
// @version      0.0.1
// @author       HentaiSaru
// @description  用於快速抓取當前網址, 給 AI 進行內容爬取

// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon64       https://cdn-icons-png.flaticon.com/512/10206/10206187.png

// @run-at       document-start
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    GM_registerMenuCommand("🕸️ 一鍵爬取", ()=> {
        window.open(`https://r.jina.ai/${decodeURIComponent(location.href)}`);
    });
})();
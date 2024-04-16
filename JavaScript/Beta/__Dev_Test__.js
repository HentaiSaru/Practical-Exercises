// ==UserScript==
// @name         影片音量增強器
// @version      0.0.34
// @author       Canaan HS
// @description  增強影片音量上限，最高增幅至 20 倍，有些不支援的網站，影片會沒聲音 或是 沒有效果，命令選單有時有 BUG 會多創建一個，但不影響原功能使用。
// @description:zh-TW 增強影片音量上限，最高增幅至 20 倍，有些不支援的網站，影片會沒聲音禁用增幅即可，命令選單有時有 BUG 會多創建一個，但不影響原功能使用。
// @description:zh-CN 增强影片音量上限，最高增幅至 20 倍。有些不支援的网站，影片会没声音，禁用增幅即可。命令选单有时有 BUG 会多创建一个，但不影响原功能使用。
// @description:en Enhance the upper limit of video volume, boosting up to 20 times. For unsupported websites where videos have no sound, disabling the boost is sufficient. Occasionally, there may be a bug in the command menu causing duplication, but it does not affect the original functionality.

// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/487608/1360115/SyntaxSimplified.js
// ==/UserScript==

(function() {
    if (/^(http|https):\/\/(?!chrome\/|about\/).*$/i.test(document.URL)) {
        
    }
})();
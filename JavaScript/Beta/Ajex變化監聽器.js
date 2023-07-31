// ==UserScript==
// @name         Ajex 監聽器
// @version      0.0.1
// @author       HentaiSaru
// @license      MIT
// @description  測試監聽網頁是否有Ajex變化

// @run-at       document-start
// @match        *://*/*
// ==/UserScript==
/*
youtube 變化後會在主控輸出 : location changed!
*/

async function MonitorAjaxUsage() {
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log("有 Ajax 變化");
            }
        });
        return originalXHROpen.apply(this, arguments);
    };
}
MonitorAjaxUsage();
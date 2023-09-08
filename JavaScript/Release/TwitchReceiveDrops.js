// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Receive Drops
// @version             0.0.2
// @author              HentaiSaru
// @description         Twitch 自動收取 [掉寶/Drops] , 簡易自訂設置 (優化版)
// @description:zh-TW   Twitch 自動收取 [掉寶/Drops] , 簡易自訂設置 (優化版)
// @description:zh-CN   Twitch 自动收取 [掉宝/Drops] , 简易自定义设置 (优化版)
// @description:en      Twitch Auto Receive Drops, Easy Custom Settings (Optimized Version)

// @match        https://www.twitch.tv/drops/inventory
// @icon         https://cdn-icons-png.flaticon.com/512/8214/8214044.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// ==/UserScript==

(function() {
    var Withdraw, title;
    /* 配置設定 */
    const config = {
        ProgressBar: "p.CoreText-sc-1txzju1-0.egOfyN span.CoreText-sc-1txzju1-0",
        Checkbutton: "button.ScCoreButton-sc-ocjdkq-0.ScCoreButtonPrimary-sc-ocjdkq-1",
        CheckInterval: 120, // 檢查間隔 (seconds / 秒數)
        ProgressDisplay: true // 在標題展示進度

    }, observer = new MutationObserver(() => {
        Withdraw = document.querySelector(config.Checkbutton);
        Withdraw ? (observer.disconnect(), Withdraw.click()) : null;

        if (config.ProgressDisplay) {
            title = `${document.querySelector(config.ProgressBar).textContent}%`;
            title !== null ? document.title = title : null;
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
    setInterval(()=> {location.reload()}, 1000 * config.CheckInterval);
})();
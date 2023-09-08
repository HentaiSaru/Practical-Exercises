// ==UserScript==
// @name                Twitch Auto Receive Drops
// @name:zh-TW          Twitch 自動收取 Drops
// @name:en             Twitch Auto Receive Drops
// @version             0.0.1
// @author              HentaiSaru
// @description         Twitch 自動收取 Drops , 自訂檢查間隔
// @description:zh-TW   Twitch 自動收取 Drops , 自訂檢查間隔
// @description:en      Twitch automatically collects Drops, custom check interval

// @match        https://www.twitch.tv/drops/inventory*
// @icon         https://cdn-icons-png.flaticon.com/512/8214/8214044.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// ==/UserScript==

(function() {
    const custom = {
        button: "button.ScCoreButton-sc-ocjdkq-0.ScCoreButtonPrimary-sc-ocjdkq-1.buUmIQ",
        CheckInterval: 60, // 檢查間隔 (seconds / 秒數)
    }
    const observer = new MutationObserver(() => {
        const claimButton = document.querySelector(custom.button);
        claimButton ? (observer.disconnect(), claimButton.click()) : null;
    });
    observer.observe(document.body, {childList: true, subtree: true});
    setInterval(()=> {location.reload()}, 1000 * custom.CheckInterval);
})();
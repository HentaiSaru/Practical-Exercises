// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Receive Drops
// @version             0.0.3
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
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    var Withdraw, title;
    /* 配置設定 */
    let config = {
        RestartTime: 3, // 重啟直播相差時間 (Minute / 分鐘) [設置太短可能勿檢測]
        FindTag: "drops", // 重啟直播查找標籤 (根據指定的Tag 標籤, 開啟直播)
        RestartLive: true, // 重新啟用直播 (功能)
        CheckInterval: 90, // 檢查間隔 (seconds / 秒數)
        ProgressDisplay: true, // 在選項卡展示進度 (功能)
        ProgressBar: "p.CoreText-sc-1txzju1-0.egOfyN span.CoreText-sc-1txzju1-0",
        Checkbutton: "button.ScCoreButton-sc-ocjdkq-0.ScCoreButtonPrimary-sc-ocjdkq-1",

    }, observer = new MutationObserver(() => {
        title = document.querySelectorAll(config.ProgressBar);
        title = title.length > 0 ? title[title.length - 1] : false;
        title && config.ProgressDisplay ? document.title = `${title.textContent}%` : null;

        if (config.RestartLive && title) {
            config.RestartLive = false;

            const time = new Date(), data = +title.textContent,
            record = GM_getValue("record", null) || [time.getTime(), data],
            [Timestamp, Progress] = record, conversion = (time - Timestamp) / (1000 * 60);

            if (conversion >= config.RestartTime && data === Progress) {
                AutoRestartLive();
                GM_setValue("record", [time.getTime(), data]);
            } else if (conversion === 0 || data !== Progress) {
                GM_setValue("record", [time.getTime(), data]);
            }
        }

        Withdraw = document.querySelector(config.Checkbutton);
        Withdraw ? (observer.disconnect(), Withdraw.click()) : null;
    });
    observer.observe(document.body, {childList: true, subtree: true});

    async function AutoRestartLive() {
        let article;
        const choose = {
            channel: "[data-test-selector='DropsCampaignInProgressDescription-no-channels-hint-text']", // 相關頻道
            TagType: ".InjectLayout-sc-1i43xsx-0.cerOzE span", // 頻道 Tag 類型
            LiveLink: "[data-a-target='preview-card-image-link']", // 直播連結按鈕

        }, channel = document.querySelector(choose.channel);
        if (channel) {
            const NewWindow = window.open(channel.href),
            Interval = setInterval(() => {
                article = NewWindow.document.getElementsByTagName("article");
                if (article.length > 20) {
                    clearInterval(Interval);
                    const index = Array.from(article).findIndex(element => {
                        const tag = element.querySelector(choose.TagType).textContent.toLowerCase();
                        return tag.includes(config.FindTag);
                    });
                    article[index].querySelector(choose.LiveLink).click();
                }
            }, 1000);
        }
    }
    setTimeout(()=> {location.reload()}, 1000 * config.CheckInterval);
})();
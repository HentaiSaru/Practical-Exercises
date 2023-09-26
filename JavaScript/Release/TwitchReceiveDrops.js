// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.5
// @author              HentaiSaru
// @description         Twitch 自動領取 (掉寶/Drops) , 窗口標籤顯示進度 , 直播結束時還沒領完 , 會自動尋找任意掉寶直播 , 並開啟後繼續掛機 , 代碼自訂義設置
// @description:zh-TW   Twitch 自動領取 (掉寶/Drops) , 窗口標籤顯示進度 , 直播結束時還沒領完 , 會自動尋找任意掉寶直播 , 並開啟後繼續掛機 , 代碼自訂義設置
// @description:zh-CN   Twitch 自动领取 (掉宝/Drops) , 窗口标签显示进度 , 直播结束时还没领完 , 会自动寻找任意掉宝直播 , 并开启后继续挂机 , 代码自定义设置
// @description:en      Automatically claim Twitch Drops, display progress in the tab, and if not finished when the stream ends, it will automatically find another Drops-enabled stream and continue farming. Customizable settings in the code.
// @description:ja      Twitch のドロップを自動的に受け取り、タブに進捗狀況を表示し、ストリーム終了時にまだ受け取っていない場合、自動的に別のドロップ有効なストリームを検索し、収穫を続けます。コードでのカスタマイズ可能な設定
// @description:ko      Twitch 드롭을 자동으로 받아오고 탭에 진행 상황을 표시하며, 스트림이 종료되었을 때 아직 완료되지 않았다면 자동으로 다른 드롭 활성 스트림을 찾아 계속 수집합니다. 코드에서 사용자 정의 설정 가능합니다

// @match        https://www.twitch.tv/drops/inventory
// @icon         https://cdn-icons-png.flaticon.com/512/8214/8214044.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    var Withdraw, title, state, NumberBox = [];
    /* 配置設定 */
    let config = {
        RestartLive: true, // 重新啟用直播
        ProgressDisplay: true, // 在選項卡展示進度

        RestartTime: 4, // 重啟直播相差時間 (Minute) [設置太短可能勿檢測]
        DetectionDelay: 1.5, // 延遲開始檢測時間 (seconds), 提高可降低性能消耗, 過高會找不到元素
        CheckInterval: 100, // 檢查間隔 (seconds)

        FindTag: ["drops", "启用掉宝", "드롭활성화됨"], // 直播查找標籤, 只要有包含該字串即可

        ProgressBar: "p.CoreText-sc-1txzju1-0.egOfyN span.CoreText-sc-1txzju1-0",
        Checkbutton: ".ScCoreButton-sc-ocjdkq-0.ScCoreButtonPrimary-sc-ocjdkq-1.buUmIQ.bxHedf",
    }, observer = new MutationObserver(() => {
        title = document.querySelectorAll(config.ProgressBar); // 會有特殊類型, 因此使用較繁瑣的處理 =>
        title = title.length > 0 && title != false ? (title.forEach(progress=> NumberBox.push(progress.textContent)), Math.max(...NumberBox)) : false;
        state = config.ProgressDisplay && title != false ? (ShowTitle(`${title}%`), true) : false;

        if (config.RestartLive && state) {
            config.RestartLive = false;

            const time = new Date(), record = GM_getValue("record", null) || [time.getTime(), title],
            [Timestamp, Progress] = record, conversion = (time - Timestamp) / (1000 * 60);

            if (conversion >= config.RestartTime && title === Progress) {
                AutoRestartLive();
                GM_setValue("record", [time.getTime(), title]);
            } else if (conversion === 0 || title !== Progress) {
                GM_setValue("record", [time.getTime(), title]);
            }
        }

        Withdraw = document.querySelector(config.Checkbutton);
        Withdraw ? (observer.disconnect(), Withdraw.click()) : null;
    });

    setTimeout(()=> {observer.observe(document.body, {childList: true, subtree: true})}, 1000 * config.DetectionDelay);

    async function ShowTitle(display) {
        config.ProgressDisplay = false;
        const TitleDisplay = setInterval(()=>{ // 避免載入慢時的例外 (持續15秒)
            document.title !== display ? document.title = display : null;
        }, 500);
        setTimeout(()=> {clearInterval(TitleDisplay)}, 1000 * 15);
    }

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
                        return config.FindTag.some(match=> tag.includes(match.toLowerCase()));
                    });
                    article[index].querySelector(choose.LiveLink).click();
                }
            }, 1000);
        }
    }

    setTimeout(()=> {location.reload()}, 1000 * config.CheckInterval);
})();
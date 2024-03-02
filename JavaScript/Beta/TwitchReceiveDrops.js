// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.10
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

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    const Config = {
        RestartLive: true, // 使用重啟直播
        RestartLiveMute: true, // 重啟的直播靜音
        ProgressDisplay: true, // 於標題展示掉寶進度

        InjectDelay: 1, // (seconds) 開始注入檢測的延遲 [提高降低性能消耗, 但太高會找不到]
        UpdateInterval: 120, // (seconds) 更新進度狀態的間隔
        JudgmentInterval: 5, // (Minute) 判斷經過多長時間, 進度無增加, 就重啟直播 [設置太短會可能誤檢測]

        ProgressBar: "p.mLvNZ span", // 掉寶進度數據
        ReceiveDropsButton: "button.caieTg", // 領取按鈕
        ActivityLink: "[data-test-selector='DropsCampaignInProgressDescription-no-channels-hint-text']", // 參與活動的頻道連結
        ActivityLink2: "[data-test-selector='DropsCampaignInProgressDescription-hint-text-parent']",

        TagType: "span", // 頻道 Tag 標籤
        FindTag: ["drops", "启用掉宝", "드롭활성화됨"], // 查找直播標籤, 只要有包含該字串即可
        WatchLiveLink: "[data-a-target='preview-card-image-link']", // 觀看直播的連結
    }

    /* 檢測邏輯 */
    class Detection {
        #ProgressParse; // 宣告私有變數
        #ShowTitle;

        constructor() {
            this.config = Config;

            /* 解析進度(找到 < 100 的最大值) */
            this.#ProgressParse = progress => {
                return progress.sort((a, b) => b - a).find(number => number < 1e2);
            }

            /* 展示進度於標題 */
            this.#ShowTitle = async display => {
                this.config.ProgressDisplay = !1;
                const TitleDisplay = setInterval(()=>{document.title = display}, 5e2);
                setTimeout(()=> {clearInterval(TitleDisplay)}, 1e3 * 10);
            }
        }

        /* 主要運行 */
        static async Ran() { /* true = !0, false = !1, 固定數字例如: 1000 = 1e3 = 1 * 10^3; e 代表 10 */
            let Withdraw, state, title, // dynamic = 靜態函數需要將自身類實例化, self = 這樣只是讓語法短一點, 沒有必要性
            data=[], deal=!0, dynamic=new Detection(), self=dynamic.config;
            const observer = new MutationObserver(() => { // 標題顯示進度, 和重啟是分開的, 所以無論如何都會獲取當前進度
                title = deal && document.querySelectorAll(self.ProgressBar); // 這邊會有各種特殊類型, 所以這樣處理, 取得所有進度值, 再取找到小於 100 的最大值
                title = title.length > 0 && deal ? (deal=!1, title.forEach(progress=> data.push(+progress.textContent)), dynamic.#ProgressParse(data)) : !1;
                state = title ? (self.ProgressDisplay && dynamic.#ShowTitle(`${title}%`), !0) : !1; // 只要有標題就是 true, 判斷是否顯示 不會影響取狀態

                if (self.RestartLive && state) {
                    self.RestartLive = !1;

                    const time=new Date(), // 格式為 = 時間戳, 進度值
                    [Timestamp, Progress] = GM_getValue("record", null) || [time.getTime(), title], conversion = (time - Timestamp) / (1e3 * 60);

                    if (conversion >= self.JudgmentInterval && title == Progress) { // 時間大於檢測間隔, 且標題與進度值相同, 代表需要重啟
                        Restart.Ran();
                        GM_setValue("record", [time.getTime(), title]);
                    } else if (conversion == 0 || title != Progress) { // 時間是 0 或 標題 不是 進度, 代表有變化
                        GM_setValue("record", [time.getTime(), title]);
                    }
                }

                Withdraw = document.querySelector(self.ReceiveDropsButton);
                if (Withdraw) {observer.disconnect(); Withdraw.click();}
            });
            /* 延遲注入 */
            setTimeout(()=> {observer.observe(document, {childList: !0, subtree: !0})}, 1e3 * self.InjectDelay);
        }
    }

    /* 重啟邏輯 */
    class RestartLive {
        #VideoMute;

        constructor() {
            this.config = Config;

            /* 重啟直播的影片靜音(持續執行 15 秒) */
            this.#VideoMute = async window => {
                let video;
                const Interval = setInterval(() => {
                    video = window.document.querySelector("video");
                    if (video) {
                        clearInterval(Interval);
                        const SilentInterval = setInterval(() => {video.muted = !0}, 5e2);
                        setTimeout(()=> {clearInterval(SilentInterval)}, 1e3 * 15);
                    }
                }, 1e3);
            }
        }

        async Ran() {
            let NewWindow, article, channel, self=this.config;
            channel = document.querySelector(self.ActivityLink) || document.querySelector(self.ActivityLink2);
            if (channel) { // 使用標籤 "LiveWindow" 找到先前開啟的直播, 嘗試將其關閉
                window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();
                NewWindow = window.open(channel.href || channel.querySelector("a").href, "LiveWindow");
                const Interval = setInterval(() => {
                    article = NewWindow.document.getElementsByTagName("article");
                    if (article.length > 20) { // 找到大於 20 個頻道
                        clearInterval(Interval);
                        const index = Array.from(article).findIndex(element => {
                            const tag = element.querySelector(self.TagType).textContent.toLowerCase();
                            return self.FindTag.some(match=> tag.includes(match.toLowerCase()));
                        });
                        article[index].querySelector(self.WatchLiveLink).click();
                        self.RestartLiveMute && this.#VideoMute(NewWindow);
                    }
                }, 5e2);
            }
        }
    }

    /* 主運行調用 */
    const Restart = new RestartLive();
    Detection.Ran();
    setTimeout(()=> {location.reload()}, 1e3 * Config.UpdateInterval);
})();
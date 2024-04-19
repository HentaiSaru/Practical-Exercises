// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.12
// @author              Canaan HS
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
// @grant        window.close
// @grant        GM_notification
// ==/UserScript==

(function() {
    const Config = {
        RestartLive: true, // 使用重啟直播
        EndAutoClose: true, // 全部進度完成後自動關閉
        TryStayActive: true, // 嘗試讓頁面保持活躍
        RestartLiveMute: true, // 重啟的直播靜音
        RestartLowQuality: false, // 重啟直播最低畫質

        ClearExpiration: true, // 清除過期的掉寶進度
        ProgressDisplay: true, // 於標題展示掉寶進度

        UpdateInterval: 90, // (seconds) 更新進度狀態的間隔
        JudgmentInterval: 5, // (Minute) 經過多長時間進度無增加, 就重啟直播 [設置太短會可能誤檢測]

        DropsButton: "button.caieTg", // 掉寶領取按鈕
        FindTag: ["drops", "启用掉宝", "드롭활성화됨"], // 查找直播標籤, 只要有包含該字串即可
    }

    /* 檢測邏輯 */
    class Detection {
        constructor() {
            /* 保存數據 */
            this.storage = (key, value=null) => {
                let data,
                Formula = {
                    Type: (parse) => Object.prototype.toString.call(parse).slice(8, -1),
                    Number: (parse) => parse ? Number(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                    Array: (parse) => parse ? JSON.parse(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                };
                return null != value
                    ? Formula[Formula.Type(value)]()
                    : !!(data = sessionStorage.getItem(key)) && Formula[Formula.Type(JSON.parse(data))](data);
            }

            /* 查找過期的項目將其刪除 */
            this.TimeComparison = async (Object, Timestamp, Callback) => {
                const match = Timestamp.match(/(\d{1,2})\D+(\d{1,2})\D+\D+(\d{1,2}:\d{2}) \[GMT([+-]\d{1,2})\]/);
                if (match) {
                    const month = parseInt(match[1], 10);
                    const day = parseInt(match[2], 10);
                    const timeString = match[3];
                    const offset = parseInt(match[4], 10);

                    const currentTime = new Date();
                    const targetTime = new Date(currentTime.getFullYear(), month-1, day);

                    targetTime.setHours(parseInt(timeString.split(":")[0], 10) + 12);
                    targetTime.setMinutes(parseInt(timeString.split(":")[1], 10));
                    targetTime.setHours(targetTime.getHours() - offset);

                    currentTime > targetTime ? (this.config.ClearExpiration && Object.remove()) : Callback(Object);
                }
            }

            /* 解析進度(找到 < 100 的最大值) */
            this.ProgressParse = progress => progress.sort((a, b) => b - a).find(number => number < 1e2);

            /* 展示進度於標題 */
            this.ShowTitle = async display => {
                this.config.ProgressDisplay = !1;
                (new MutationObserver(()=> {
                    document.title != display && (document.title = display);
                })).observe(document.querySelector("title"), {childList: !0, subtree: !1});
                document.title = display; // 觸發一次轉換
            }

            /* 設置數據 */
            this.config = Object.assign(Config, {
                EndLine: "div.gtpIYu", // 斷開觀察者的終止線
                AllProgress: "div.ilRKfU", // 所有的掉寶進度
                ProgressBar: "p.mLvNZ span", // 掉寶進度數據
                ActivityTime: "span.jSkguG", // 掉寶活動的日期
            });
        }

        /* 主要運行 */
        static async Ran() {
            // dynamic = 靜態函數需要將自身類實例化, self = 這樣只是讓語法短一點, 沒有必要性
            let Allbox, state, title, data=[], deal=!0, dynamic=new Detection(), self=dynamic.config,
            observer = new MutationObserver(Throttle(()=> {
                Allbox = deal && document.querySelectorAll(self.AllProgress);
                if (deal && Allbox.length > 0) {
                    deal=!1; Allbox.forEach(box=> {
                        dynamic.TimeComparison(box, box.querySelector(self.ActivityTime).textContent,
                            NotExpired=> { // 標題顯示進度, 和重啟是分開的, 所以無論如何都會獲取當前進度
                                if (title) {return !0}
                                NotExpired.querySelectorAll(self.ProgressBar).forEach(progress=> data.push(+progress.textContent));
                                title = data.length > 0 ? dynamic.ProgressParse(data) : !1;
                                state = title ? (self.ProgressDisplay && dynamic.ShowTitle(`${title}%`), !0) : !1;
                            }
                        )
                    })
                }

                if (self.RestartLive && state) {
                    self.RestartLive = !1;

                    const time=new Date(), // 格式為 = 進度值, 時間戳
                    [Progress, Timestamp] = dynamic.storage("Record") || [title, time.getTime()], conversion = (time - Timestamp) / (1e3 * 60);

                    if (conversion >= self.JudgmentInterval && title == Progress) { // 時間大於檢測間隔, 且標題與進度值相同, 代表需要重啟
                        Restart.Ran();
                        dynamic.storage("Record", [title, time.getTime()]);
                    } else if (conversion == 0 || title != Progress) { // 時間是 0 或 標題 不是 進度, 代表有變化
                        dynamic.storage("Record", [title, time.getTime()]);
                    }
                }

                // 領取按鈕
                document.querySelectorAll(self.DropsButton).forEach(draw => {draw.click()});

                if (document.querySelector(self.EndLine)) {
                    observer.disconnect(); // 斷開觀察
 
                    const count = dynamic.storage("NoProgressCount") || 0;
                    if (title) {
                        dynamic.storage("NoProgressCount", 0);
                    } else if (count > 2) {
                        dynamic.storage("NoProgressCount", 0);
                        if (self.EndAutoClose) {
                            window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();
                            window.close();
                        }
                    } else {
                        dynamic.storage("NoProgressCount", count+1);
                    }
                }
            }, 300));

            // 因為是後台運行, 使用 requestAnimationFrame 查找會不太穩定, 只能使用 MutationObserver
            observer.observe(document, {subtree: !0, childList: !0, characterData: !0});
            self.TryStayActive && StayActive(document);
        }
    }

    /* 重啟邏輯 */
    class RestartLive {
        constructor() {
            /* 簡易的 等待元素 */
            this.WaitElem = async (Newindow, selector, found) => {
                let element;
                const observer = new MutationObserver(Throttle(()=> {
                    element = Newindow.document.querySelector(selector);
                    element && (observer.disconnect(), found(element));
                }, 200));
                observer.observe(Newindow.document, {subtree: !0, childList: !0, characterData: !0});
            }

            /* 重啟直播的靜音(持續執行 15 秒) */
            this.LiveMute = async Newindow => {
                this.WaitElem(Newindow, "video", video => {
                    const SilentInterval = setInterval(() => {video.muted = !0}, 5e2);
                    setTimeout(()=> {clearInterval(SilentInterval)}, 1.5e4);
                })
            }

            /* 直播自動最低畫質 */
            this.LiveLowQuality = async Newindow => {
                this.WaitElem(Newindow, "[data-a-target='player-settings-button']", Menu => {
                    Menu.click(); // 點擊設置選單
                    this.WaitElem(Newindow, "[data-a-target='player-settings-menu-item-quality']", Quality => {
                        Quality.click(); // 點擊畫質設定
                        this.WaitElem(Newindow, "[data-a-target='player-settings-menu']", Settings => {
                            Settings.lastElementChild.click(); // 選擇最低畫質
                            setTimeout(() => {Menu.click()}, 800); // 等待一下關閉菜單
                        })
                    })
                })
            }

            this.config = Object.assign(Config, {
                TagType: "span", // 頻道 Tag 標籤
                Article: "article", // 直播目錄的文章
                OfflineTag: "p.fQYeyD", // 顯示離線的標籤
                ViewersTag: "span.hERoTc", // 觀看人數標籤
                WatchLiveLink: "[data-a-target='preview-card-image-link']", // 觀看直播的連結
                ActivityLink1: "[data-test-selector='DropsCampaignInProgressDescription-hint-text-parent']", // 參與活動的頻道連結
                ActivityLink2: "[data-test-selector='DropsCampaignInProgressDescription-no-channels-hint-text']",
            });
        }

        async Ran() {
            window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();
            let NewWindow, OpenLink, Channel, article, self=this.config, dir=this;
            Channel = document.querySelector(self.ActivityLink2);

            if (Channel) {
                NewWindow = window.open(Channel.href, "LiveWindow");
                DirectorySearch(NewWindow);
            } else {
                Channel = document.querySelector(self.ActivityLink1);
                OpenLink = [...Channel.querySelectorAll("a")].reverse();

                FindLive(0);
                async function FindLive(index) { // 持續找到有在直播的頻道
                    if ((OpenLink.length-1) < index) {
                        return !1;
                    }

                    const href = OpenLink[index].href;
                    NewWindow = !NewWindow ? window.open(href, "LiveWindow") : (NewWindow.location.assign(href), NewWindow);

                    if (href.includes("directory")) { // 是目錄頁面
                        DirectorySearch(NewWindow);
                    } else {
                        let Offline, Nowlive;
                        const observer = new MutationObserver(Throttle(()=> {
                            Offline = NewWindow.document.querySelector(self.OfflineTag);
                            Nowlive = NewWindow.document.querySelector(self.ViewersTag);

                            if (Offline) {
                                observer.disconnect();
                                FindLive(index+1);

                            } else if (Nowlive) {
                                observer.disconnect();
                                self.RestartLiveMute && dir.LiveMute(NewWindow);
                                self.TryStayActive && StayActive(NewWindow.document);
                                self.RestartLowQuality && dir.LiveLowQuality(NewWindow);

                            }
                        }, 300));

                        NewWindow.onload = () => {
                            observer.observe(NewWindow.document, {subtree: !0, childList: !0, characterData: !0});
                        }
                    }
                }
            }

            // 目錄頁面的查找邏輯
            async function DirectorySearch(NewWindow) {
                const observer = new MutationObserver(Throttle(()=> {
                    article = NewWindow.document.getElementsByTagName(self.Article);
                    if (article.length > 20) { // 找到大於 20 個頻道
                        observer.disconnect();

                        const index = Array.from(article).findIndex(element => {
                            const tag = element.querySelector(self.TagType).textContent.toLowerCase();
                            return self.FindTag.some(match=> tag.includes(match.toLowerCase()));
                        });

                        if (index != -1) {
                            article[index].querySelector(self.WatchLiveLink).click();
                            self.RestartLiveMute && dir.LiveMute(NewWindow);
                            self.TryStayActive && StayActive(NewWindow.document);
                            self.RestartLowQuality && dir.LiveLowQuality(NewWindow);
                        } else {
                            function Language(lang) {
                                const Display = {
                                    Simplified: {title: "搜索失败", text: "找不到启用掉落的频道"},
                                    Traditional: {title: "搜尋失敗", text: "找不到啟用掉落的頻道"},
                                    Korea: {title: "검색 실패", text: "드롭이 활성화된 채널을 찾을 수 없습니다"},
                                    Japan: {title: "検索失敗", text: "ドロップが有効なチャンネルが見つかりません"},
                                    English: {title: "Search failed", text: "Can't find a channel with drops enabled"},
                                }, Match = {
                                    "ko": Display.Korea,
                                    "ja": Display.Japan,
                                    "en-US": Display.English,
                                    "zh-CN": Display.Simplified,
                                    "zh-SG": Display.Simplified,
                                    "zh-TW": Display.Traditional,
                                    "zh-HK": Display.Traditional,
                                    "zh-MO": Display.Traditional,
                                }
                                return Match[lang] || Match["en-US"];
                            }
                            const show = Language(navigator.language);
                            GM_notification({title: show.title, text: show.text});
                        }
                    }
                }, 300));

                NewWindow.onload = () => {
                    observer.observe(NewWindow.document, {subtree: !0, childList: !0, characterData: !0});
                }
            }
        }
    }

    /* 對 DOM 查找進行節流 */
    function Throttle(func, delay) {
        let lastTime = 0;
        return (...args) => {
            const now = Date.now();
            if ((now - lastTime) >= delay) {
                lastTime = now;
                func(...args);
            }
        }
    }

    /* 使窗口保持活躍 */
    async function StayActive(Target) {
        const script = document.createElement("script");
        script.id = "Stay-Active";
        script.textContent = `
            function WorkerCreation(code) {
                const blob = new Blob([code], {type: "application/javascript"});
                return new Worker(URL.createObjectURL(blob));
            }
            const Active = WorkerCreation(\`
                onmessage = function(e) {
                    setTimeout(()=> {
                        const {url, visible} = e.data;
                        visible == "hidden" && fetch(url);
                        postMessage({url});
                    }, 6e4);
                }
            \`);
            Active.postMessage({ url: location.href, visible: document.visibilityState});
            Active.onmessage = (e) => {
                const { url } = e.data;
                const video = document.querySelector("video");
                video && video.play();
                Active.postMessage({ url: url, visible: document.visibilityState });
            };
        `
        Target.head.append(script);
    }

    // 等待重載
    setTimeout(()=> {window.open(location.href, "_self")}, 1e3 * Config.UpdateInterval);

    // 主運行調用
    const Restart = new RestartLive();
    Detection.Ran();
})();
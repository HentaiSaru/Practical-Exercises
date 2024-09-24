// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.15-Beta1
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

(async () => {

    const Config = {
        RestartLive: true, // 使用重啟直播
        EndAutoClose: true, // 全部進度完成後自動關閉
        TryStayActive: true, // 嘗試讓頁面保持活躍
        RestartLiveMute: true, // 重啟的直播靜音
        RestartLowQuality: false, // 重啟直播最低畫質

        UpdateDisplay: true, // 於標題顯示更新倒數
        ClearExpiration: true, // 清除過期的掉寶進度
        ProgressDisplay: true, // 於標題展示掉寶進度

        UpdateInterval: 90, // (seconds) 更新進度狀態的間隔
        JudgmentInterval: 5, // (Minute) 經過多長時間進度無增加, 就重啟直播 [設置太短會可能誤檢測]

        DropsButton: "button.ejeLlX", // 掉寶領取按鈕
        FindTag: ["drops", "启用掉宝", "啟用掉寶", "드롭활성화됨"], // 查找直播標籤, 只要有包含該字串即可
    };

    /* 檢測邏輯 */
    class Detection {
        constructor() {
            /* 保存數據 */
            this.Storage = (key, value = null) => {
                let data,
                    Formula = {
                        Type: (parse) => Object.prototype.toString.call(parse).slice(8, -1),
                        Number: (parse) => parse ? Number(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                        Array: (parse) => parse ? JSON.parse(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                    };
                return null != value
                    ? Formula[Formula.Type(value)]()
                    : !!(data = sessionStorage.getItem(key)) && Formula[Formula.Type(JSON.parse(data))](data);
            };

            /* 語言 時間格式 適配器 */
            this.Adapter = {
                __ConvertPM: (time) => time.replace(/(\d{1,2}):(\d{2})/, (match, hours, minutes) => `${+hours + 12}:${minutes}`), // 轉換 24 小時制 (PM)
                "en-US": (timeStamp, currentYear) => new Date(`${timeStamp} ${currentYear}`),
                "ja-JP": (timeStamp, currentYear) => {
                    const match = timeStamp.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{1,2}:\d{2}) (GMT[+-]\d{1,2})/);
                    return new Date(`${currentYear}-${match[1]}-${match[2]} ${match[3]}:00 ${match[4]}`);
                },
                "ko-KR": (timeStamp, currentYear) => { //? 這個怪怪的, 就算用一般函數, 直接 this 也指向錯誤
                    const match = timeStamp.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{1,2}:\d{2}) (GMT[+-]\d{1,2})/);
                    const time = timeStamp.includes("오후") ? this.Adapter.__ConvertPM(match[3]) : match[3];
                    return new Date(`${currentYear}-${match[1]}-${match[2]} ${time}:00 ${match[4]}`);
                },
                "zh-TW": (timeStamp, currentYear) => {
                    const match = timeStamp.match(/(\d{1,2})\D+(\d{1,2})\D+\D+(\d{1,2}:\d{2}) \[(GMT[+-]\d{1,2})\]/);
                    const time = timeStamp.includes("下午") ? this.Adapter.__ConvertPM(match[3]) : match[3];
                    return new Date(`${currentYear}-${match[1]}-${match[2]} ${time}:00 ${match[4]}`);
                },
                "zh-CN": (timeStamp, currentYear) => {
                    const match = timeStamp.match(/(\d{1,2})\D+(\d{1,2})\D+\D+(GMT[+-]\d{1,2}) (\d{1,2}:\d{2})/);
                    return new Date(`${currentYear}-${match[1]}-${match[2]} ${match[4]}:00 ${match[3]}`);
                }
            };

            /* 查找過期的項目將其刪除 */
            this.TimeComparison = (Object, Timestamp, Callback) => {
                const currentTime = new Date();
                const documentLang = document.documentElement.lang;

                const Supported = this.Adapter[documentLang];
                const targetTime = Supported ? Supported(Timestamp, currentTime.getFullYear()) : currentTime;
                currentTime > targetTime ? (this.config.ClearExpiration && Object.remove()) : Callback(Object);
            };

            /* 獲取當前時間 */
            this.GetTime = (time) => {
                const year = time.getFullYear();
                const month = `${time.getMonth() + 1}`.padStart(2, "0");
                const date = `${time.getDate()}`.padStart(2, "0");
                const hour = `${time.getHours()}`.padStart(2, "0");
                const minute = `${time.getMinutes()}`.padStart(2, "0");
                const second = `${time.getSeconds()}`.padStart(2, "0");
                return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
            };

            /* 解析進度(找到 < 100 的最大值) */
            this.ProgressParse = progress => progress.sort((a, b) => b - a).find(number => number < 1e2);

            /* 展示進度於 */
            this.ShowProgress = () => {
                (new MutationObserver(() => {
                    document.title != this.ProgressValue && (document.title = this.ProgressValue);
                })).observe(document.querySelector("title"), { childList: !0, subtree: !1 });
                document.title = this.ProgressValue; // 觸發一次轉換
            };

            /* 頁面刷新 */
            this.PageRefresh = async (display, interval) => {
                if (display) { // 展示倒數
                    setInterval(() => {
                        document.title = `【 ${interval--}s 】 ${this.ProgressValue}`
                        if (interval <= 0) location.reload();
                    }, 1e3);
                } else { // 不展示
                    setTimeout(() => { location.reload() }, interval);
                }
            };

            this.ProgressValue = "";

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
            let state, progress, Deal = !0, PI = 0, PV = 0; // PI 進度索引, PV 進度值
            const Progress_Info = {}; // 保存進度的資訊

            const Detec = new Detection(); // Detec = 靜態函數需要將自身類實例化
            const Self = Detec.config; // Self = 這樣只是讓語法短一點, 沒有必要性

            const Display = Self.UpdateDisplay;
            const Interval = Self.UpdateInterval;

            const observer = new MutationObserver(Throttle(() => {
                if (Deal) { // 這邊寫這麼複雜是為了處理, (1: 只有一個, 2: 存在兩個以上, 3: 存在兩個以上但有些過期)
                    const All_Data = document.querySelectorAll(Self.AllProgress);

                    if (All_Data && All_Data.length > 0) {
                        Deal = !1;

                        All_Data.forEach((data, index) => {
                            Detec.TimeComparison(data, data.querySelector(Self.ActivityTime).textContent,
                                NotExpired => { // 標題顯示進度, 和重啟是分開的, 所以無論如何都會獲取當前進度
                                    // 分別取得各自的進度
                                    Progress_Info[index] = [...NotExpired.querySelectorAll(Self.ProgressBar)].map(progress => +progress.textContent);
                                }
                            )
                        });

                        // 獲取最大進度值, 與他對應的 Index (目前是取所有對象中最大的)
                        for (const [key, value] of Object.entries(Progress_Info)) {
                            const cache = Detec.ProgressParse(value);
                            cache > PV && (PV = cache, PI = key);
                        };

                        // 取得標題和顯示進度
                        progress = PV > 0 ? PV : !1;
                        state = progress ? (
                            Self.ProgressDisplay && ( // 判斷需要顯示進度
                                Self.ProgressDisplay = !1, // 修改狀態, 避免重複觸發
                                Detec.ProgressValue = `${progress}%`, // 賦予進度值
                                !Display && Detec.ShowProgress() // 有顯示更新狀態, 就由他動態展示, 沒有在呼叫 ShowProgress 動態處理展示
                            ),
                            !0 // 賦予狀態
                        ) : !1;
                    }
                };

                if (Self.RestartLive && state) {
                    Self.RestartLive = !1;

                    const time = new Date(), // 格式為 = 進度值, 時間戳
                        [ProgressRecord, Timestamp] = Detec.Storage("Record") ?? [progress, Detec.GetTime(time)], conversion = ~~((time - new Date(Timestamp)) / (1e3 * 60)); // 捨棄小數後取整, ~~ 最多限制 32 位整數

                    if (conversion >= Self.JudgmentInterval && progress == ProgressRecord) { // 時間大於檢測間隔, 且標題與進度值相同, 代表需要重啟
                        Restart.Ran(PI); // 傳遞當前最高進度, 進行直播重啟

                        Detec.Storage("Record", [progress, Detec.GetTime(time)]);
                    } else if (conversion == 0 || progress != ProgressRecord) { // 時間是 0 | 標題 != 進度 = 有變化 (更新紀錄)
                        Detec.Storage("Record", [progress, Detec.GetTime(time)]);
                    }
                };

                // 領取按鈕
                document.querySelectorAll(Self.DropsButton).forEach(draw => { draw.click() });

                if (document.querySelector(Self.EndLine)) {
                    observer.disconnect(); // 斷開觀察

                    const count = Detec.Storage("NoProgressCount") ?? 0;
                    if (progress) {
                        Detec.Storage("NoProgressCount", 0);
                    } else if (count > 2) {
                        Detec.Storage("NoProgressCount", 0);
                        if (Self.EndAutoClose) {
                            window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();
                            window.close();
                        }
                    } else {
                        Detec.Storage("NoProgressCount", count + 1);
                    }
                };
            }, 300));

            // 因為是後台運行, 使用 requestAnimationFrame 查找會不太穩定, 只能使用 MutationObserver
            observer.observe(document, { subtree: !0, childList: !0, characterData: !0 });
            Self.TryStayActive && StayActive(document);
            Detec.PageRefresh(Display, Display ? Interval : Interval * 1e3); // 呼叫頁面刷新
        }
    };

    /* 重啟邏輯 */
    class RestartLive {
        constructor() {
            /* 簡易的 等待元素 */
            this.WaitElem = async (Newindow, selector, found) => {
                let element;
                const observer = new MutationObserver(Throttle(() => {
                    element = Newindow.document.querySelector(selector);
                    element && (observer.disconnect(), found(element));
                }, 200));
                observer.observe(Newindow.document, { subtree: !0, childList: !0, characterData: !0 });
            };

            /* 重啟直播的靜音(持續執行 15 秒) */
            this.LiveMute = async Newindow => {
                this.WaitElem(Newindow, "video", video => {
                    const SilentInterval = setInterval(() => { video.muted = !0 }, 5e2);
                    setTimeout(() => { clearInterval(SilentInterval) }, 1.5e4);
                })
            };

            /* 直播自動最低畫質 */
            this.LiveLowQuality = async Newindow => {
                this.WaitElem(Newindow, "[data-a-target='player-settings-button']", Menu => {
                    Menu.click(); // 點擊設置選單
                    this.WaitElem(Newindow, "[data-a-target='player-settings-menu-item-quality']", Quality => {
                        Quality.click(); // 點擊畫質設定
                        this.WaitElem(Newindow, "[data-a-target='player-settings-menu']", Settings => {
                            Settings.lastElementChild.click(); // 選擇最低畫質
                            setTimeout(() => { Menu.click() }, 800); // 等待一下關閉菜單
                        })
                    })
                })
            };

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

        async Ran(CI) { // 傳入對應的頻道索引
            window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close(); // 將查找標籤合併成正則
            const Dir = this;
            const Self = Dir.config;
            const FindTag = new RegExp(Self.FindTag.join("|"));

            let NewWindow, OpenLink, article;
            let Channel = document.querySelectorAll(Self.ActivityLink2)[CI];

            if (Channel) {
                NewWindow = window.open(Channel.href, "LiveWindow");
                DirectorySearch(NewWindow);
            } else {
                Channel = document.querySelectorAll(Self.ActivityLink1)[CI];
                OpenLink = [...Channel.querySelectorAll("a")].reverse();

                FindLive(0);
                async function FindLive(index) { // 持續找到有在直播的頻道
                    if ((OpenLink.length - 1) < index) {
                        return !1;
                    }

                    const href = OpenLink[index].href;
                    NewWindow = !NewWindow ? window.open(href, "LiveWindow") : (NewWindow.location.assign(href), NewWindow);

                    if (href.includes("directory")) { // 是目錄頁面
                        DirectorySearch(NewWindow);
                    } else {
                        let Offline, Nowlive;
                        const observer = new MutationObserver(Throttle(() => {
                            Offline = NewWindow.document.querySelector(Self.OfflineTag);
                            Nowlive = NewWindow.document.querySelector(Self.ViewersTag);

                            if (Offline) {
                                observer.disconnect();
                                FindLive(index + 1);

                            } else if (Nowlive) {
                                observer.disconnect();
                                Self.RestartLiveMute && Dir.LiveMute(NewWindow);
                                Self.TryStayActive && StayActive(NewWindow.document);
                                Self.RestartLowQuality && Dir.LiveLowQuality(NewWindow);

                            }
                        }, 300));

                        NewWindow.onload = () => {
                            observer.observe(NewWindow.document, { subtree: !0, childList: !0, characterData: !0 });
                        }
                    }
                }
            }

            // 目錄頁面的查找邏輯
            async function DirectorySearch(NewWindow) {
                const observer = new MutationObserver(Throttle(() => {
                    article = NewWindow.document.getElementsByTagName(Self.Article);
                    if (article.length > 10) { // 找到大於 10 個頻道
                        observer.disconnect();

                        // 解析 Tag
                        const index = [...article].findIndex(element => {
                            const Tag_box = element.querySelectorAll(Self.TagType);
                            return Tag_box.length > 0 && [...Tag_box].some(match => FindTag.test(match.textContent.toLowerCase()));
                        });

                        if (index != -1) {
                            article[index].querySelector(Self.WatchLiveLink).click();
                            Self.RestartLiveMute && Dir.LiveMute(NewWindow);
                            Self.TryStayActive && StayActive(NewWindow.document);
                            Self.RestartLowQuality && Dir.LiveLowQuality(NewWindow);
                        } else {
                            function Language(lang) {
                                const Word = {
                                    Traditional: {},
                                    Simplified: { 搜尋失敗: "搜索失败", 找不到啟用掉落的頻道: "找不到启用掉落的频道" },
                                    Korea: { 搜尋失敗: "검색 실패", 找不到啟用掉落的頻道: "드롭이 활성화된 채널을 찾을 수 없습니다" },
                                    Japan: { 搜尋失敗: "検索失敗", 找不到啟用掉落的頻道: "ドロップが有効なチャンネルが見つかりません" },
                                    English: { 搜尋失敗: "Search failed", 找不到啟用掉落的頻道: "Can't find a channel with drops enabled" },
                                }, Match = {
                                    ko: Word.Korea,
                                    ja: Word.Japan,
                                    "en-US": Word.English,
                                    "zh-CN": Word.Simplified,
                                    "zh-SG": Word.Simplified,
                                    "zh-TW": Word.Traditional,
                                    "zh-HK": Word.Traditional,
                                    "zh-MO": Word.Traditional,
                                },
                                    ML = Match[lang] ?? Match["en-US"];

                                return {
                                    Transl: (Str) => ML[Str] ?? Str,
                                };
                            }

                            const Lang = Language(navigator.language);
                            GM_notification({
                                title: Lang.Transl("搜尋失敗"),
                                text: Lang.Transl("找不到啟用掉落的頻道")
                            });
                        }
                    }
                }, 300));

                NewWindow.onload = () => {
                    observer.observe(NewWindow.document, { subtree: !0, childList: !0, characterData: !0 });
                }
            }
        }
    };

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
    };

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
    };

    // 主運行調用
    const Restart = new RestartLive();
    Detection.Ran();
})();
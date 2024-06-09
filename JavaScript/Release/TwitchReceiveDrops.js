// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.14
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

(function () {
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
        FindTag: ["drops", "启用掉宝", "啟用掉寶", "드롭활성화됨"], // 查找直播標籤, 只要有包含該字串即可
    };
    class Detection {
        constructor() {
            this.storage = (key, value = null) => {
                let data,
                    Formula = {
                        Type: (parse) => Object.prototype.toString.call(parse).slice(8, -1),
                        Number: (parse) =>
                            parse
                                ? Number(parse)
                                : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                        Array: (parse) =>
                            parse
                                ? JSON.parse(parse)
                                : (sessionStorage.setItem(key, JSON.stringify(value)), !0),
                    };
                return null != value
                    ? Formula[Formula.Type(value)]()
                    : !!(data = sessionStorage.getItem(key)) &&
                    Formula[Formula.Type(JSON.parse(data))](data);
            };
            this.TimeComparison = async (Object, Timestamp, Callback) => {
                const match = Timestamp.match(
                    /(\d{1,2})\D+(\d{1,2})\D+\D+(\d{1,2}:\d{2}) \[GMT([+-]\d{1,2})\]/
                );
                if (match) {
                    const month = parseInt(match[1], 10);
                    const day = parseInt(match[2], 10);
                    const timeString = match[3];
                    const offset = parseInt(match[4], 10);
                    const currentTime = new Date();
                    const targetTime = new Date(
                        currentTime.getFullYear(),
                        month - 1,
                        day
                    );
                    targetTime.setHours(parseInt(timeString.split(":")[0], 10) + 12);
                    targetTime.setMinutes(parseInt(timeString.split(":")[1], 10));
                    targetTime.setHours(targetTime.getHours() - offset);
                    currentTime > targetTime
                        ? this.config.ClearExpiration && Object.remove()
                        : Callback(Object);
                }
            };
            this.ProgressParse = (progress) =>
                progress.sort((a, b) => b - a).find((number) => number < 100);
            this.ShowTitle = async (display) => {
                this.config.ProgressDisplay = !1;
                new MutationObserver(() => {
                    document.title != display && (document.title = display);
                }).observe(document.querySelector("title"), {
                    childList: !0,
                    subtree: !1,
                });
                document.title = display;
            };
            this.config = Object.assign(Config, {
                EndLine: "div.gtpIYu",
                AllProgress: "div.ilRKfU",
                ProgressBar: "p.mLvNZ span",
                ActivityTime: "span.jSkguG",
            });
        }
        static async Ran() {
            let All_Data,
                Progress_Belong = {},
                PI = 0,
                PV = 0;
            let state,
                title,
                deal = !0,
                dynamic = new Detection(),
                self = dynamic.config,
                observer = new MutationObserver(
                    Throttle(() => {
                        if (deal) {
                            All_Data = document.querySelectorAll(self.AllProgress);
                            if (All_Data && All_Data.length > 0) {
                                deal = !1;
                                All_Data.forEach((data, index) => {
                                    dynamic.TimeComparison(
                                        data,
                                        data.querySelector(self.ActivityTime).textContent,
                                        (NotExpired) => {
                                            Progress_Belong[index] = [
                                                ...NotExpired.querySelectorAll(self.ProgressBar),
                                            ].map((progress) => +progress.textContent);
                                        }
                                    );
                                });
                                for (const [key, value] of Object.entries(Progress_Belong)) {
                                    const cache = dynamic.ProgressParse(value);
                                    cache > PV && ((PV = cache), (PI = key));
                                }
                                title = PV > 0 ? PV : !1;
                                state = title
                                    ? (self.ProgressDisplay && dynamic.ShowTitle(`${title}%`), !0)
                                    : !1;
                            }
                        }
                        if (self.RestartLive && state) {
                            self.RestartLive = !1;
                            const time = new Date(),
                                [Progress, Timestamp] = dynamic.storage("Record") || [
                                    title,
                                    time.getTime(),
                                ],
                                conversion = (time - Timestamp) / (1e3 * 60);
                            if (conversion >= self.JudgmentInterval && title == Progress) {
                                Restart.Ran(PI);
                                dynamic.storage("Record", [title, time.getTime()]);
                            } else if (conversion == 0 || title != Progress) {
                                dynamic.storage("Record", [title, time.getTime()]);
                            }
                        }
                        document.querySelectorAll(self.DropsButton).forEach((draw) => {
                            draw.click();
                        });
                        if (document.querySelector(self.EndLine)) {
                            observer.disconnect();
                            const count = dynamic.storage("NoProgressCount") || 0;
                            if (title) {
                                dynamic.storage("NoProgressCount", 0);
                            } else if (count > 2) {
                                dynamic.storage("NoProgressCount", 0);
                                if (self.EndAutoClose) {
                                    window
                                        .open("", "LiveWindow", "top=0,left=0,width=1,height=1")
                                        .close();
                                    window.close();
                                }
                            } else {
                                dynamic.storage("NoProgressCount", count + 1);
                            }
                        }
                    }, 300)
                );
            observer.observe(document, {
                subtree: !0,
                childList: !0,
                characterData: !0,
            });
            self.TryStayActive && StayActive(document);
        }
    }
    class RestartLive {
        constructor() {
            this.WaitElem = async (Newindow, selector, found) => {
                let element;
                const observer = new MutationObserver(
                    Throttle(() => {
                        element = Newindow.document.querySelector(selector);
                        element && (observer.disconnect(), found(element));
                    }, 200)
                );
                observer.observe(Newindow.document, {
                    subtree: !0,
                    childList: !0,
                    characterData: !0,
                });
            };
            this.LiveMute = async (Newindow) => {
                this.WaitElem(Newindow, "video", (video) => {
                    const SilentInterval = setInterval(() => {
                        video.muted = !0;
                    }, 500);
                    setTimeout(() => {
                        clearInterval(SilentInterval);
                    }, 15e3);
                });
            };
            this.LiveLowQuality = async (Newindow) => {
                this.WaitElem(
                    Newindow,
                    "[data-a-target='player-settings-button']",
                    (Menu) => {
                        Menu.click();
                        this.WaitElem(
                            Newindow,
                            "[data-a-target='player-settings-menu-item-quality']",
                            (Quality) => {
                                Quality.click();
                                this.WaitElem(
                                    Newindow,
                                    "[data-a-target='player-settings-menu']",
                                    (Settings) => {
                                        Settings.lastElementChild.click();
                                        setTimeout(() => {
                                            Menu.click();
                                        }, 800);
                                    }
                                );
                            }
                        );
                    }
                );
            };
            this.config = Object.assign(Config, {
                TagType: "span",
                Article: "article",
                OfflineTag: "p.fQYeyD",
                ViewersTag: "span.hERoTc",
                WatchLiveLink: "[data-a-target='preview-card-image-link']",
                ActivityLink1:
                    "[data-test-selector='DropsCampaignInProgressDescription-hint-text-parent']",
                ActivityLink2:
                    "[data-test-selector='DropsCampaignInProgressDescription-no-channels-hint-text']",
            });
        }
        async Ran(CI) {
            window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();
            let NewWindow,
                OpenLink,
                Channel,
                article,
                self = this.config,
                FindTag = new RegExp(self.FindTag.join("|")),
                dir = this;
            Channel = document.querySelectorAll(self.ActivityLink2)[CI];
            if (Channel) {
                NewWindow = window.open(Channel.href, "LiveWindow");
                DirectorySearch(NewWindow);
            } else {
                Channel = document.querySelectorAll(self.ActivityLink1)[CI];
                OpenLink = [...Channel.querySelectorAll("a")].reverse();
                FindLive(0);
                async function FindLive(index) {
                    if (OpenLink.length - 1 < index) {
                        return !1;
                    }
                    const href = OpenLink[index].href;
                    NewWindow = !NewWindow
                        ? window.open(href, "LiveWindow")
                        : (NewWindow.location.assign(href), NewWindow);
                    if (href.includes("directory")) {
                        DirectorySearch(NewWindow);
                    } else {
                        let Offline, Nowlive;
                        const observer = new MutationObserver(
                            Throttle(() => {
                                Offline = NewWindow.document.querySelector(self.OfflineTag);
                                Nowlive = NewWindow.document.querySelector(self.ViewersTag);
                                if (Offline) {
                                    observer.disconnect();
                                    FindLive(index + 1);
                                } else if (Nowlive) {
                                    observer.disconnect();
                                    self.RestartLiveMute && dir.LiveMute(NewWindow);
                                    self.TryStayActive && StayActive(NewWindow.document);
                                    self.RestartLowQuality && dir.LiveLowQuality(NewWindow);
                                }
                            }, 300)
                        );
                        NewWindow.onload = () => {
                            observer.observe(NewWindow.document, {
                                subtree: !0,
                                childList: !0,
                                characterData: !0,
                            });
                        };
                    }
                }
            }
            async function DirectorySearch(NewWindow) {
                const observer = new MutationObserver(
                    Throttle(() => {
                        article = NewWindow.document.getElementsByTagName(self.Article);
                        if (article.length > 20) {
                            observer.disconnect();
                            const index = [...article].findIndex((element) => {
                                const Tag_box = element.querySelectorAll(self.TagType);
                                return (
                                    Tag_box.length > 0 &&
                                    [...Tag_box].some((match) =>
                                        FindTag.test(match.textContent.toLowerCase())
                                    )
                                );
                            });
                            if (index != -1) {
                                article[index].querySelector(self.WatchLiveLink).click();
                                self.RestartLiveMute && dir.LiveMute(NewWindow);
                                self.TryStayActive && StayActive(NewWindow.document);
                                self.RestartLowQuality && dir.LiveLowQuality(NewWindow);
                            } else {
                                function Language(lang) {
                                    const Display = {
                                        Simplified: {
                                            title: "搜索失败",
                                            text: "找不到启用掉落的频道",
                                        },
                                        Traditional: {
                                            title: "搜尋失敗",
                                            text: "找不到啟用掉落的頻道",
                                        },
                                        Korea: {
                                            title: "검색 실패",
                                            text: "드롭이 활성화된 채널을 찾을 수 없습니다",
                                        },
                                        Japan: {
                                            title: "検索失敗",
                                            text: "ドロップが有効なチャンネルが見つかりません",
                                        },
                                        English: {
                                            title: "Search failed",
                                            text: "Can't find a channel with drops enabled",
                                        },
                                    },
                                        Match = {
                                            ko: Display.Korea,
                                            ja: Display.Japan,
                                            "en-US": Display.English,
                                            "zh-CN": Display.Simplified,
                                            "zh-SG": Display.Simplified,
                                            "zh-TW": Display.Traditional,
                                            "zh-HK": Display.Traditional,
                                            "zh-MO": Display.Traditional,
                                        };
                                    return Match[lang] || Match["en-US"];
                                }
                                const show = Language(navigator.language);
                                GM_notification({
                                    title: show.title,
                                    text: show.text,
                                });
                            }
                        }
                    }, 300)
                );
                NewWindow.onload = () => {
                    observer.observe(NewWindow.document, {
                        subtree: !0,
                        childList: !0,
                        characterData: !0,
                    });
                };
            }
        }
    }
    function Throttle(func, delay) {
        let lastTime = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                func(...args);
            }
        };
    }
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
        `;
        Target.head.append(script);
    }
    setTimeout(() => {
        location.reload();
    }, 1e3 * Config.UpdateInterval);
    const Restart = new RestartLive();
    Detection.Ran();
})();
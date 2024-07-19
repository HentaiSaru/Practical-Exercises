// ==UserScript==
// @name         YouTube Hide Tool
// @name:zh-TW   YouTube 隱藏工具
// @name:zh-CN   YouTube 隐藏工具
// @name:ja      YouTube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @version      0.0.34
// @author       Canaan HS
// @description         該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-TW   該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-CN   该脚本能够自动隐藏 YouTube 视频结尾的推荐卡，在鼠标悬停于视频上方时，推荐卡会恢复显示。并额外提供快捷键切换功能，可隐藏评论区、视频推荐、功能列表，并切换至极简模式。设置会自动保存，并在下次打开视频时自动应用。
// @description:ja      このスクリプトは、YouTube动画の终わりに表示される推奨カードを自动的に非表示にし、マウスがビデオ上にホバーされると、推奨カードが再表示されます。さらに、ショートカットキーでコメントセクション、动画の推奨、机能リストを非表示に切り替える机能が追加されており、シンプルモードに切り替えることもできます。设定は自动的に保存され、次回ビデオを开くと自动的に适用されます。
// @description:ko      이 스크립트는 YouTube 동영상 끝에 나오는 추천 카드를 자동으로 숨기고, 마우스가 비디오 위에 머무를 때 추천 카드가 다시 나타납니다. 또한, 댓글 섹션, 비디오 추천, 기능 목록을 숨기고 최소 모드로 전환하는 단축키를 제공합니다. 설정은 자동으로 저장되며, 다음 비디오를 열 때 자동으로 적용됩니다.
// @description:en      This script automatically hides the recommended cards at the end of YouTube videos. When the mouse hovers over the video, the recommended cards will reappear. Additionally, it provides shortcut keys to toggle the comment section, video recommendations, feature list, and switch to a minimalist mode. Settings are automatically saved and applied the next time the video is opened.

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://update.greasyfork.org/scripts/487608/1413530/ClassSyntax_min.js
// ==/UserScript==

(async ()=> {
    const Config = {
        Dev: false,
        GlobalChange: true, // 全局同時修改
        HotKey: {
            Adapt: k => k.key.toLowerCase(), // <- 適配大小寫差異
            Title: k => k.altKey && Config.HotKey.Adapt(k) == "t", // 標題
            MinimaList: k => k.ctrlKey && Config.HotKey.Adapt(k) == "z", // 極簡化
            RecomViewing: k => k.altKey && Config.HotKey.Adapt(k) == "1", // 推薦觀看
            Comment: k => k.altKey && Config.HotKey.Adapt(k) == "2", // 留言區
            FunctionBar: k => k.altKey && Config.HotKey.Adapt(k) == "3", // 功能區
            ListDesc: k => k.altKey && Config.HotKey.Adapt(k) == "4" // 播放清單資訊 
        }
    };

    new class Tool extends Syntax {
        constructor() {
            super();

            this.MRM = null; // 菜單註冊標記
            this.GCM = null; // 全局變更標記
            this.RST = null; // 運行開始時間
            this.TFT = false; // 轉換觸發器
            this.HVM = "Hide-Video";
            this.HPM = "Hide-Playlist";

            this.HotKey = Config.HotKey;
            this.Lang = this.Language(this.Device.Lang);
            this.Video = /^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/; // 影片播放區
            this.Playlist = /^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/; // 播放清單

            /* 判斷頁面 */
            this.Page = (url) => this.Video.test(url)
            ? "Video" : this.Playlist.test(url)
            ? "Playlist" : "NotSupport";

            /* 標題格式 (傳入標題元素) */
            this.TitleFormat = (title) => title.textContent.replace(/^\s+|\s+$/g, "");

            /* 設置標籤 */
            this.SetAttri = async (object, label) => object.setAttribute(label, true);

            /* 持續隱藏 */
            this.TitleOb = new MutationObserver(()=> {
                document.title != "..." && (document.title = "...");
            });
            /* 監聽配置 */
            this.TitleOp = {childList: true, subtree: false};

            /* 開發模式 - 打印 (語法簡化) */
            this.DevPrint = (title, content, show=Config.Dev) => {
                this.Log(title, content, {dev: show, collapsed: false});
            };
            /*  開發模式 - 時間打印 (語法簡化) */
            this.DevTimePrint = (title, show) => {
                this.DevPrint(title, this.Runtime(this.RST, {log: false}), show);
            };

            /**
             * 判斷設置
             * @param {Element} Element - 要修改的元素
             * @param {String} setKey - 要保存設置的 key, 如果沒傳遞該值, 就不會有保存操作
             */
            this.HideJudgment = async (Element, setKey=null) => {
                if (Element.style.display == "none" || this.TFT) {
                    Element.style.display = "block";
                    setKey && this.Store("s", setKey, false);
                } else {
                    Element.style.display = "none";
                    setKey && this.Store("s", setKey, true);
                }
            };

            /**
             * 風格轉換器
             * @param {Array} ObjList - 要修改的元素列表
             * @param {String} Type - 要修改的樣式類型
             * @param {String} Style - 要修改的樣式
             * @returns 回傳修改是否成功狀態 (有開啟 Dev 才會運作)
             */
            this.StyleTransform = async (ObjList, Type, Style) => {
                ObjList.forEach(element=>{element.style[Type] = Style});
                if (Config.Dev) {
                    return new Promise(resolve => {
                        resolve(ObjList.every(element => element.style[Type] == Style))
                    });
                }
            };
        };

        /* 檢測觸發 */
        async Detec() {
            this.Injec(this.Device.Url); // 立即注入
            this.AddListener(window, "urlchange", change=> {
                this.Injec(change.url); // 監聽變化
            })
        };

        /* 注入操作 */
        async Injec(URL) {
            const Page = this.Page(URL);

            this.DevPrint(this.Lang.DP_01, Page);
            if (Page == "NotSupport") return;

            // 等待的元素是, 判定可開始查找的框架
            this.WaitElem("#columns, #contents", trigger=> {
                if (!trigger) {
                    this.Log(this.Lang.ET_01, trigger, {type: "error"});
                    return;
                }

                if (Page == "Video" && !trigger.hasAttribute(this.HVM)) {
                    Config.Dev && (this.RST = this.Runtime());

                    // 隱藏結尾推薦樣式
                    this.AddStyle(`
                        .ytp-ce-element {
                            display: none !important;
                        }
                        #player.ytd-watch-flexy:hover .ytp-ce-element {
                            display: block !important;
                        }
                        .ytp-show-tiles .ytp-videowall-still {
                            cursor: pointer;
                        }
                    `, "Video-Tool-Hide", false);

                    // 等待影片頁面需隱藏的數據
                    this.WaitMap([
                        "title", "#title h1", "#end", "#below",
                        "#secondary.style-scope.ytd-watch-flexy", "#secondary-inner",
                        "#related", "#comments", "#actions"
                    ], found => {
                        const [
                            title, h1, end, below, secondary, inner, related, comments, actions
                        ] = found;

                        this.DevPrint(this.Lang.DP_02, found);
                        this.SetAttri(trigger, this.HVM);
                        if (!this.MRM) this.MRM = GM_registerMenuCommand(this.Lang.MT_01, ()=> {alert(this.Lang.MC_01)});

                        // 極簡化
                        if (this.Store("g", "Minimalist")) {
                            this.TitleOb.observe(title, this.TitleOp);
                            this.StyleTransform([document.body], "overflow", "hidden");
                            this.StyleTransform([h1, end, below, secondary, related], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_03, state));
                            document.title = "...";
                        } else {
                            // 標題
                            if (this.Store("g", "Title")) {
                                this.TitleOb.observe(title, this.TitleOp);
                                this.StyleTransform([h1], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_04, state));
                                document.title = "...";
                            };

                            // 推薦播放
                            if (this.Store("g", "RecomViewing")) {
                                this.StyleTransform([secondary, related], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_05, state));
                            };

                            // 評論區
                            if (this.Store("g", "Comment")) {
                                this.StyleTransform([comments], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_06, state));
                            };

                            // 功能選項區
                            if (this.Store("g", "FunctionBar")) {
                                this.StyleTransform([actions], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_07, state));
                            };
                        };

                        // 調整操作
                        const Modify = {
                            Title: (Mode, Save="Title") => { // 以下的 Save 不需要, 就傳遞 false 或是 空值
                                Mode = Save ? Mode : !Mode; // 同上

                                document.title = Mode ? (
                                    this.TitleOb.disconnect(), this.TitleFormat(h1)
                                ) : (
                                    this.TitleOb.observe(title, this.TitleOp), "..."
                                );
                                this.HideJudgment(h1, Save);
                            },
                            Minimalist: (Mode, Save=true) => { // 這個比較特別, 他時直接在這操作存儲, 所以 Save 是 Boolen
                                Mode = Save ? Mode : !Mode; // 全局修改時的判斷 Mode 需要是反的, 剛好全局判斷的 Save 始終為 false, 所以這樣寫

                                if (Mode) {
                                    Modify.Title(false, false);
                                    Save && this.Store("s", "Minimalist", false);
                                    this.StyleTransform([document.body], "overflow", "auto");
                                    this.StyleTransform([end, below, secondary, related], "display", "block");
                                } else {
                                    Modify.Title(true, false);
                                    Save && this.Store("s", "Minimalist", true);
                                    this.StyleTransform([document.body], "overflow", "hidden");
                                    this.StyleTransform([end, below, secondary, related], "display", "none");
                                }
                            },
                            RecomViewing: (Mode, Save="RecomViewing") => {
                                if (inner.childElementCount > 1) {
                                    this.HideJudgment(secondary);
                                    this.HideJudgment(related, Save);
                                    this.TFT = false;
                                } else {
                                    this.HideJudgment(related, Save);
                                    this.TFT = true;
                                }
                            },
                            Comment: (Mode, Save="Comment") => {
                                this.HideJudgment(comments, Save);
                            },
                            FunctionBar: (Mode, Save="FunctionBar") => {
                                this.HideJudgment(actions, Save);
                            }
                        };

                        // 註冊快捷鍵
                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HotKey.MinimaList(event)) {
                                event.preventDefault();
                                Modify.Minimalist(this.Store("g", "Minimalist"));
                            } else if (this.HotKey.Title(event)) {
                                event.preventDefault();
                                Modify.Title(document.title == "...");
                            } else if (this.HotKey.RecomViewing(event)) {
                                event.preventDefault();
                                Modify.RecomViewing();
                            } else if (this.HotKey.Comment(event)) {
                                event.preventDefault();
                                Modify.Comment();
                            } else if (this.HotKey.FunctionBar(event)) {
                                event.preventDefault();
                                Modify.FunctionBar();
                            }
                        }, {capture: true});

                        if (Config.GlobalChange && !this.GCM) {
                            // 動態全局修改
                            this.StoreListen(["Minimalist", "Title", "RecomViewing", "Comment", "FunctionBar"], call=> {
                                if (call.far) Modify[call.key](call.nv, false);
                            });
                            this.GCM = true; // 標記註冊
                        };

                    }, {throttle: 100, characterData: true, timeoutResult: true});

                } else if (Page == "Playlist" && !trigger.hasAttribute(this.HPM)) {
                    Config.Dev && (this.RST = this.Runtime());

                    this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse", playlist=> {

                        this.DevPrint(this.Lang.DP_02, playlist);
                        this.SetAttri(trigger, this.HPM);
                        if (!this.MRM) this.MRM = GM_registerMenuCommand(this.Lang.MT_01, ()=> {alert(this.Lang.MC_01)});

                        // 播放清單資訊
                        if (this.Store("g", "ListDesc")) {
                            this.StyleTransform([playlist], "display", "none").then(state => this.DevTimePrint(this.Lang.DP_08, state));
                        };

                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HotKey.ListDesc(event)) {
                                event.preventDefault();
                                this.HideJudgment(playlist, "ListDesc");
                            }
                        });
                    }, {throttle: 100, characterData: true, timeoutResult: true});

                };
            }, {object: document, timeout: 15, timeoutResult: true});
        };

        Language(lang) {
            const Display = {
                Traditional: {
                    MT_01: "📜 預設熱鍵",
                    MC_01: `@ 功能失效時 [請重新整理] =>
                    \r(Alt + 1)：隱藏推薦播放
                    \r(Alt + 2)：隱藏留言區
                    \r(Alt + 3)：隱藏功能列表
                    \r(Alt + 4)：隱藏播放清單資訊
                    \r(Alt + T)：隱藏標題文字
                    \r(Ctrl + Z)：使用極簡化`,
                    ET_01: "查找框架失敗",
                    DP_01: "頁面類型",
                    DP_02: "隱藏元素",
                    DP_03: "極簡化",
                    DP_04: "隱藏標題",
                    DP_05: "隱藏推薦觀看",
                    DP_06: "隱藏留言區",
                    DP_07: "隱藏功能選項",
                    DP_08: "隱藏播放清單資訊",
                },
                Simplified: {
                    MT_01: "📜 预设热键",
                    MC_01: `@ 功能失效时 [请重新整理] =>
                    \r(Alt + 1)：隐藏推荐播放
                    \r(Alt + 2)：隐藏评论区
                    \r(Alt + 3)：隐藏功能列表
                    \r(Alt + 4)：隐藏播放清单资讯
                    \r(Alt + T)：隐藏标题文字
                    \r(Ctrl + Z)：使用极简化`,
                    ET_01: "查找框架失败",
                    DP_01: "页面类型",
                    DP_02: "隐藏元素",
                    DP_03: "极简化",
                    DP_04: "隐藏标题",
                    DP_05: "隐藏推荐观看",
                    DP_06: "隐藏留言区",
                    DP_07: "隐藏功能选项",
                    DP_08: "隐藏播放清单信息",
                },
                Japan: {
                    MT_01: "📜 デフォルトホットキー",
                    MC_01: `@ 机能が无効になった场合 [ページを更新してください] =>
                    \r(Alt + 1)：おすすめ再生を非表示にする
                    \r(Alt + 2)：コメントエリアを非表示にする
                    \r(Alt + 3)：机能リストを非表示にする
                    \r(Alt + 4)：プレイリスト情报を非表示にする
                    \r(Alt + T)：タイトル文字を隠す
                    \r(Ctrl + Z)：シンプル化を使用する`,
                    ET_01: "フレームの検索に失敗しました",
                    DP_01: "ページタイプ",
                    DP_02: "要素を隠す",
                    DP_03: "ミニマリスト",
                    DP_04: "タイトルを隠す",
                    DP_05: "おすすめ視聴を隠す",
                    DP_06: "コメントセクションを隠す",
                    DP_07: "機能オプションを隠す",
                    DP_08: "再生リスト情報を隠す",
                },
                Korea: {
                    MT_01: "📜 기본 단축키",
                    MC_01: `@ 기능이 작동하지 않을 때 [새로 고침하세요] =>
                    \r(Alt + 1)：추천 재생 숨기기
                    \r(Alt + 2)：댓글 영역 숨기기
                    \r(Alt + 3)：기능 목록 숨기기
                    \r(Alt + 4)：재생 목록 정보 숨기기
                    \r(Alt + T)：제목 텍스트 숨기기
                    \r(Ctrl + Z)：간소화 사용`,
                    ET_01: "프레임 검색 실패",
                    DP_01: "페이지 유형",
                    DP_02: "요소 숨기기",
                    DP_03: "극단적 단순화",
                    DP_04: "제목 숨기기",
                    DP_05: "추천 시청 숨기기",
                    DP_06: "댓글 섹션 숨기기",
                    DP_07: "기능 옵션 숨기기",
                    DP_08: "재생 목록 정보 숨기기",
                },
                English: {
                    MT_01: "📜 Default Hotkeys",
                    MC_01: `@ If functionalities fail [Please refresh] =>
                    \r(Alt + 1)：Hide recommended playback
                    \r(Alt + 2)：Hide comments section
                    \r(Alt + 3)：Hide feature list
                    \r(Alt + 4)：Hide playlist info
                    \r(Alt + T)：Hide Title Text
                    \r(Ctrl + Z)：Use Simplification`,
                    ET_01: "Frame search failed",
                    DP_01: "Page type",
                    DP_02: "Hide elements",
                    DP_03: "Minimalize",
                    DP_04: "Hide title",
                    DP_05: "Hide recommended views",
                    DP_06: "Hide comments section",
                    DP_07: "Hide feature options",
                    DP_08: "Hide playlist information",
                },
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
            return Match[lang] ?? Match["en-US"];
        };
    }().Detec();
})();
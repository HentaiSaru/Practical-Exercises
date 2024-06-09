// ==UserScript==
// @name         YouTube Hide Tool
// @name:zh-TW   YouTube 隱藏工具
// @name:zh-CN   YouTube 隐藏工具
// @name:ja      YouTube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @version      0.0.33
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

// @require      https://update.greasyfork.org/scripts/487608/1382007/ClassSyntax_min.js
// ==/UserScript==

(function() {
    const HotKey = {
        Adapt: v => v.key.toLowerCase(), // 適配大小寫差異
        Title: k => k.altKey && HotKey.Adapt(k) == "t", // 標題
        MinimaList: k => k.ctrlKey && HotKey.Adapt(k) == "z", // 極簡化
        RecomViewing: k => k.altKey && HotKey.Adapt(k) == "1", // 推薦觀看
        Comment: k => k.altKey && HotKey.Adapt(k) == "2", // 留言區
        FunctionBar: k => k.altKey && HotKey.Adapt(k) == "3", // 功能區
        ListDesc: k => k.altKey && HotKey.Adapt(k) == "4" // 播放清單資訊
    }, Config = {
        Dev: false,
        GlobalChange: true, // 全局同時修改
    };
    class Tool extends Syntax {
        constructor(key, set) {
            super();
            this.HK = key;
            this.Con = set;
            this.Language = language(this.Device.Lang);
            this.Video = /^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/;
            this.Playlist = /^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/;
            this.Register = null;
            this.StartTime = null;
            this.Transform = false;
            this.Page = url => this.Video.test(url) ? "Video" : this.Playlist.test(url) ? "Playlist" : "NotSupport";
            this.TitleFormat = title => title.textContent.replace(/^\s+|\s+$/g, "");
            this.SetAttri = async (object, label) => {
                object.setAttribute(label, true);
            };
            this.HideJudgment = async (Element, setValue = null) => {
                if (Element.style.display == "none" || this.Transform) {
                    Element.style.display = "block";
                    setValue && this.Store("s", setValue, false);
                } else {
                    Element.style.display = "none";
                    setValue && this.Store("s", setValue, true);
                }
            };
            this.StyleConverter = async (EL, Type, Style, Result = null) => {
                EL.forEach(element => {
                    element.style[Type] = Style;
                });
                if (Result) {
                    return new Promise(resolve => {
                        resolve(EL.every(element => element.style[Type] == Style));
                    });
                }
            };
        }
        async Injection(URL) {
            const Page = this.Page(URL);
            this.Con.Dev && this.Log("頁面類型", Page);
            if (Page == "NotSupport") {
                return false;
            }
            this.WaitElem("#columns, #contents", trigger => {
                if (Page == "Video" && !trigger.hasAttribute("Hide-Video")) {
                    this.Con.Dev && (this.StartTime = this.Runtime());
                    if (this.Register == null) {
                        this.Register = GM_registerMenuCommand(this.Language[0], () => {
                            alert(this.Language[1]);
                        });
                    }
                    if (!this.$$("#Video-Tool-Hide")) {
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
                        `, "Video-Tool-Hide");
                    }
                    this.WaitMap([ "title", "#title h1", "#end", "#below", "#secondary.style-scope.ytd-watch-flexy", "#secondary-inner", "#related", "#comments", "#actions" ], element => {
                        const [ title, h1, end, below, secondary, inner, related, comments, actions ] = element;
                        this.Con.Dev && this.Log("隱藏對象", element, {
                            collapsed: false
                        });
                        this.SetAttri(trigger, "Hide-Video");
                        const Title_observer = new MutationObserver(() => {
                            document.title != "..." && (document.title = "...");
                        });
                        if (this.Store("g", "Minimalist")) {
                            this.StyleConverter([ document.body ], "overflow", "hidden");
                            this.StyleConverter([ end, below, secondary, related ], "display", "none", this.Con.Dev).then(Success => {
                                Success && this.Log("極簡化", this.Runtime(this.StartTime));
                            });
                        } else {
                            if (this.Store("g", "Title")) {
                                Title_observer.observe(title, {
                                    childList: true,
                                    subtree: false
                                });
                                this.StyleConverter([ h1 ], "display", "none", this.Con.Dev).then(Success => {
                                    Success && this.Log("隱藏標題", this.Runtime(this.StartTime));
                                });
                                document.title = "...";
                            }
                            if (this.Store("g", "RecomViewing")) {
                                this.StyleConverter([ secondary, related ], "display", "none", this.Con.Dev).then(Success => {
                                    Success && this.Log("隱藏推薦觀看", this.Runtime(this.StartTime));
                                });
                            }
                            if (this.Store("g", "Comment")) {
                                this.StyleConverter([ comments ], "display", "none", this.Con.Dev).then(Success => {
                                    Success && this.Log("隱藏留言區", this.Runtime(this.StartTime));
                                });
                            }
                            if (this.Store("g", "FunctionBar")) {
                                this.StyleConverter([ actions ], "display", "none", this.Con.Dev).then(Success => {
                                    Success && this.Log("隱藏功能選項", this.Runtime(this.StartTime));
                                });
                            }
                        }
                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HK.MinimaList(event)) {
                                event.preventDefault();
                                if (this.Store("g", "Minimalist")) {
                                    this.Store("s", "Minimalist", false);
                                    this.StyleConverter([ document.body ], "overflow", "auto");
                                    this.StyleConverter([ end, below, secondary, related ], "display", "block");
                                } else {
                                    this.Store("s", "Minimalist", true);
                                    this.StyleConverter([ document.body ], "overflow", "hidden");
                                    this.StyleConverter([ end, below, secondary, related ], "display", "none");
                                }
                            } else if (this.HK.Title(event)) {
                                event.preventDefault();
                                this.HideJudgment(h1, "Title");
                                document.title = document.title == "..." ? (Title_observer.disconnect(), 
                                this.TitleFormat(h1)) : (Title_observer.observe(title, {
                                    childList: true,
                                    subtree: false
                                }), "...");
                            } else if (this.HK.RecomViewing(event)) {
                                event.preventDefault();
                                if (inner.childElementCount > 1) {
                                    this.HideJudgment(secondary);
                                    this.HideJudgment(related, "RecomViewing");
                                    this.Transform = false;
                                } else {
                                    this.HideJudgment(related, "RecomViewing");
                                    this.Transform = true;
                                }
                            } else if (this.HK.Comment(event)) {
                                event.preventDefault();
                                this.HideJudgment(comments, "Comment");
                            } else if (this.HK.FunctionBar(event)) {
                                event.preventDefault();
                                this.HideJudgment(actions, "FunctionBar");
                            }
                        }, {
                            capture: true
                        });
                        if (this.Con.GlobalChange) {
                            this.StoreListen([ "Minimalist", "Title", "RecomViewing", "Comment", "FunctionBar" ], call => {
                                if (call.far) {
                                    switch (call.key) {
                                      case "Minimalist":
                                        if (call.nv) {
                                            this.StyleConverter([ document.body ], "overflow", "hidden");
                                            this.StyleConverter([ end, below, secondary, related ], "display", "none");
                                        } else {
                                            this.StyleConverter([ document.body ], "overflow", "auto");
                                            this.StyleConverter([ end, below, secondary, related ], "display", "block");
                                        }
                                        break;

                                      case "Title":
                                        document.title = call.nv ? (Title_observer.observe(title, {
                                            childList: true,
                                            subtree: false
                                        }), "...") : (Title_observer.disconnect(), 
                                        this.TitleFormat(h1));
                                        this.HideJudgment(h1);
                                        break;

                                      case "RecomViewing":
                                        if (inner.childElementCount > 1) {
                                            this.HideJudgment(secondary);
                                            this.HideJudgment(related);
                                            this.Transform = false;
                                        } else {
                                            this.HideJudgment(related);
                                            this.Transform = true;
                                        }
                                        break;

                                      case "Comment":
                                        this.HideJudgment(comments);
                                        break;

                                      case "FunctionBar":
                                        this.HideJudgment(actions);
                                        break;
                                    }
                                }
                            });
                        }
                    }, {
                        throttle: 100,
                        characterData: true,
                        timeoutResult: true
                    });
                } else if (Page == "Playlist" && !trigger.hasAttribute("Hide-Playlist")) {
                    this.Con.Dev && (this.StartTime = this.Runtime());
                    if (this.Register == null) {
                        this.Register = GM_registerMenuCommand(this.Language[0], () => {
                            alert(this.Language[1]);
                        });
                    }
                    this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse", playlist => {
                        this.Con.Dev && this.Log("隱藏對象", playlist, {
                            collapsed: false
                        });
                        this.SetAttri(trigger, "Hide-Playlist");
                        if (this.Store("g", "ListDesc")) {
                            this.StyleConverter([ playlist ], "display", "none", this.Con.Dev).then(Success => {
                                Success && this.Log("隱藏播放清單資訊", this.Runtime(this.StartTime));
                            });
                        }
                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HK.ListDesc(event)) {
                                event.preventDefault();
                                this.HideJudgment(playlist, "ListDesc");
                            }
                        });
                    }, {
                        throttle: 100,
                        characterData: true,
                        timeoutResult: true
                    });
                }
            }, {
                object: document,
                timeout: 10
            });
        }
        async Detection() {
            this.Injection(this.Device.Url);
            this.Listen(window, "urlchange", change => {
                this.Injection(change.url);
            });
        }
    }
    new Tool(HotKey, Config).Detection();
    function language(language) {
        let display = {
            "zh-TW": [ "📜 預設熱鍵", `@ 功能失效時 [請重新整理] =>

(Alt + 1)：隱藏推薦播放
(Alt + 2)：隱藏留言區
(Alt + 3)：隱藏功能列表
(Alt + 4)：隱藏播放清單資訊
(Alt + T)：隱藏標題文字
(Ctrl + Z)：使用極簡化` ],
            "zh-CN": [ "📜 预设热键", `@ 功能失效时 [请重新整理] =>

(Alt + 1)：隐藏推荐播放
(Alt + 2)：隐藏评论区
(Alt + 3)：隐藏功能列表
(Alt + 4)：隐藏播放清单资讯
(Alt + T)：隐藏标题文字
(Ctrl + Z)：使用极简化` ],
            ja: [ "📜 デフォルトホットキー", `@ 机能が无効になった场合 [ページを更新してください] =>

(Alt + 1)：おすすめ再生を非表示にする
(Alt + 2)：コメントエリアを非表示にする
(Alt + 3)：机能リストを非表示にする
(Alt + 4)：プレイリスト情报を非表示にする
(Alt + T)：タイトル文字を隠す
(Ctrl + Z)：シンプル化を使用する` ],
            "en-US": [ "📜 Default Hotkeys", `@ If functionalities fail [Please refresh] =>

(Alt + 1)：Hide recommended playback
(Alt + 2)：Hide comments section
(Alt + 3)：Hide feature list
(Alt + 4)：Hide playlist info
(Alt + T)：Hide Title Text
(Ctrl + Z)：Use Simplification` ],
            ko: [ "📜 기본 단축키", `@ 기능이 작동하지 않을 때 [새로 고침하세요] =>

(Alt + 1)：추천 재생 숨기기
(Alt + 2)：댓글 영역 숨기기
(Alt + 3)：기능 목록 숨기기
(Alt + 4)：재생 목록 정보 숨기기
(Alt + T)：제목 텍스트 숨기기
(Ctrl + Z)：간소화 사용` ]
        };
        return display[language] || display["en-US"];
    }
})();
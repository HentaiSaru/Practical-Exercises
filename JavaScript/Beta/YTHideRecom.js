// ==UserScript==
// @name         Youtube Hide Tool
// @name:zh-TW   Youtube 隱藏工具
// @name:zh-CN   Youtube 隐藏工具
// @name:ja      Youtube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @name:de      Youtube Versteckwerkzeug
// @name:pt      Ferramenta de Ocultação do Youtube
// @name:es      Herramienta de Ocultación de Youtube
// @name:fr      Outil de Masquage de Youtube
// @name:hi      यूट्यूब छुपाने का उपकरण
// @name:id      Alat Sembunyikan Youtube
// @version      0.0.25
// @author       HentaiSaru
// @description         快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-TW   快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-CN   快捷隐藏 YouTube 评论区、相关推荐、视频结尾推荐和设置菜单
// @description:ja      YouTubeのコメント欄、関連おすすめ、動画の最後のおすすめ、設定メニューを素早く非表示にする
// @description:ko      빠른 YouTube 댓글 영역, 관련 추천, 비디오 끝 추천 및 설정 메뉴 숨기기
// @description:en      Quickly hide YouTube comments, related recommendations, video end recommendations, and settings menu
// @description:de      Schnell verstecken YouTube Kommentare, verwandte Empfehlungen, Video-Ende-Empfehlungen und Einstellungsmenü
// @description:pt      Ocultar rapidamente comentários do YouTube, recomendações relacionadas, recomendações de final de vídeo e menu de configurações
// @description:es      Ocultar rápidamente comentarios de YouTube, recomendaciones relacionadas, recomendaciones de final de video y menú de configuración
// @description:fr      Masquer rapidement les commentaires de YouTube, les recommandations connexes, les recommandations de fin de vidéo et le menu des paramètres
// @description:hi      यूट्यूब टिप्पणियाँ, संबंधित सिफारिशें, वीडियो के अंत की सिफारिशें और सेटिंग्स मेनू को त्वरित रूप से छुपाएं
// @description:id      Sembunyikan cepat komentar YouTube, rekomendasi terkait, rekomendasi akhir video, dan menu pengaturan

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==

(function() {
    const HotKey = {
        RecomCard: event => event.shiftKey, // 影片結尾推薦卡
        MinimaList: event => event.ctrlKey && event.key == "z", // 極簡化
        RecomViewing: event => event.altKey && event.key == "1", // 推薦觀看
        Comment: event => event.altKey && event.key == "2", // 留言區
        FunctionBar: event => event.altKey && event.key == "3", // 功能區
        ListDesc: event => event.altKey && event.key == "4" // 播放清單資訊
    }

    class Tool extends API {
        constructor(hotKey) {
            super();
            this.HK = hotKey;
            this.Dev = false;
            this.Language = language(navigator.language);
            this.Video = /^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/; // 影片播放區
            this.Playlist = /^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/; // 播放清單

            this.Register = null;
            this.Transform = false;

            /* 觸發設置 */
            this.SetTrigger = async element => {
                element.style.display = "none";
                return new Promise(resolve => {
                    element.style.display == "none" ? resolve(true) : resolve(false);
                });
            }

            /* 判斷設置 */
            this.HideJudgment = async(element, gm=null) => {
                if (element.style.display === "none" || this.Transform) {
                    element.style.display = "block";
                    gm != null ? GM_setValue(gm, false) : null;
                } else {
                    element.style.display = "none";
                    gm != null ? GM_setValue(gm, true) : null;
                }
            }

            this.SetAttri = async(label, state) => {
                document.body.setAttribute(label, state);
            }
        }

        async Injection() {
            const observer = new MutationObserver(() => {
                const URL = document.URL;
                if (this.Video.test(URL) && !document.body.hasAttribute("Video-Tool-Injection")) {
                    this.SetAttri("Video-Tool-Injection", true);
                    if (this.Register == null) {
                        this.Register = GM_registerMenuCommand(this.Language[0], ()=> {alert(this.Language[1])});
                    }

                    // 結尾推薦樣式
                    if (!this.$$("#Video-Tool-Hide")) {
                        this.AddStyle(`
                            .ytp-ce-element{
                                opacity: 0.1 !important;
                            }
                            .ytp-ce-element:hover{
                                opacity: 1 !important;
                                transition: opacity 0.3s ease;
                            }
                        `, "Video-Tool-Hide");
                    }

                    // 等待影片頁面需隱藏的數據
                    this.WaitMap([
                        "#end",
                        "#below",
                        "#secondary",
                        "#secondary-inner",
                        "#related",
                        "#chat-container",
                        "#comments",
                        "#actions"
                    ], 10, element => {
                        const [
                            end,
                            below,
                            secondary,
                            inner,
                            related,
                            chat,
                            comments,
                            actions
                        ] = element;

                        // 極簡化
                        if (this.store("get", "Minimalist")) {
                            Promise.all([this.SetTrigger(end), this.SetTrigger(below), this.SetTrigger(secondary), this.SetTrigger(related)]).then(results => {
                                results.every(result => result) && this.Dev ? this.log("極簡化", true) : null;
                            });

                        } else {
                            // 推薦播放隱藏
                            if (this.store("get", "RecomViewing")) {
                                Promise.all([this.SetTrigger(chat), this.SetTrigger(secondary), this.SetTrigger(related)]).then(results => {
                                    results.every(result => result) && this.Dev ? this.log("隱藏推薦觀看", true) : null;
                                });
                            }
                            // 評論區
                            if (this.store("get", "Comment")) {
                                this.SetTrigger(comments).then(() => {this.Dev ? this.log("隱藏留言區", true) : null});
                            }
                            // 功能選項區
                            if (this.store("get", "FunctionBar")) {
                                this.SetTrigger(actions).then(() => {this.Dev ? this.log("隱藏功能選項", true) : null});
                            }
                        }

                        // 註冊快捷鍵
                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HK.MinimaList(event)) {
                                event.preventDefault();
                                if (this.store("get", "Minimalist")) {
                                    end.style.display = "block";
                                    below.style.display = "block";
                                    secondary.style.display = "block";
                                    related.style.display = "block";
                                    GM_setValue("Minimalist", false);
                                } else {
                                    end.style.display = "none";
                                    below.style.display = "none";
                                    secondary.style.display = "none";
                                    related.style.display = "none";
                                    GM_setValue("Minimalist", true);
                                }
                            } else if (this.HK.RecomCard(event)) {
                                event.preventDefault();
                                this.$$(".ytp-ce-element, .ytp-ce-covering", true).forEach(element => {
                                    this.HideJudgment(element);
                                });
                            } else if (this.HK.RecomViewing(event)) {
                                event.preventDefault();
                                if (inner.childElementCount > 1) {
                                    this.HideJudgment(chat);
                                    this.HideJudgment(secondary);
                                    this.HideJudgment(related, "RecomViewing");
                                    this.Transform = false;
                                } else {
                                    this.HideJudgment(chat);
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
                        });
                    });
                } else if (this.Playlist.test(URL) && !document.body.hasAttribute("Playlist-Tool-Injection")) {
                    this.SetAttri("Playlist-Tool-Injection", true);
                    if (this.Register == null) {
                        this.Register = GM_registerMenuCommand(this.Language[0], ()=> {alert(this.Language[1])});
                    }
                    this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse", false, 8, playlist=> {
                        // 播放清單資訊
                        if (this.store("get", "ListDesc")) {
                            this.SetTrigger(playlist).then(() => {this.Dev ? this.log("隱藏播放清單資訊", true) : null});
                        }
                        this.RemovListener(document, "keydown");
                        this.AddListener(document, "keydown", event => {
                            if (this.HK.ListDesc(event)) {
                                event.preventDefault();
                                this.HideJudgment(playlist, "ListDesc");
                            }
                        });
                    })
                }
            });
            observer.observe(document.head, {childList: true, subtree: true});
        }
    }

    const tool = new Tool(HotKey);
    tool.Injection();

    function language(language) {
        let display = {
            "zh-TW": ["📜 設置快捷", `@ 功能失效時 [請重新整理] =>

    (Shift) : 完全隱藏影片尾部推薦
    (Alt + 1) : 隱藏右側影片推薦
    (Alt + 2) : 隱藏留言區
    (Alt + 3) : 隱藏功能選項
    (Alt + 4) : 隱藏播放清單資訊
    (Ctrl + Z) : 使用極簡化`],

        "zh-CN": ["📜 设置快捷", `@ 功能失效时 [请重新刷新] =>
    (Shift) : 全部隐藏视频尾部推荐
    (Alt + 1) : 隐藏右侧视频推荐
    (Alt + 2) : 隐藏评论区
    (Alt + 3) : 隐藏功能选项
    (Alt + 4) : 隐藏播放列表信息
    (Ctrl + Z) : 使用极简化`],

        "ja": ["📜 設定ショートカット", `@ 機能が無効になった場合 [再読み込みしてください] =>
    (Shift) : 動画の最後のおすすめを完全に非表示にする
    (Alt + 1) : 右側の動画おすすめを非表示にする
    (Alt + 2) : コメント欄を非表示にする
    (Alt + 3) : 機能オプションを非表示にする
    (Alt + 4) : プレイリスト情報を非表示にする
    (Ctrl + Z) : 簡素化を使用する`],

        "en-US": ["📜 Settings Shortcut", `@ When function fails [Please refresh] =>
    (Shift) : Fully hide video end recommendations
    (Alt + 1) : Hide right side video recommendations
    (Alt + 2) : Hide comments section
    (Alt + 3) : Hide function options
    (Alt + 4) : Hide playlist information
    (Ctrl + Z) : Use minimalism`],

        "ko": ["📜 설정 바로 가기", `@ 기능이 실패하면 [새로 고침하세요] =>
    (Shift) : 비디오 끝 추천을 완전히 숨기기
    (Alt + 1) : 오른쪽 비디오 추천 숨기기
    (Alt + 2) : 댓글 섹션 숨기기
    (Alt + 3) : 기능 옵션 숨기기
    (Alt + 4) : 재생 목록 정보 숨기기
    (Ctrl + Z) : 미니멀리즘 사용하기`]};

        return display[language] || display["en-US"];
    }
})();
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
// @version      0.0.18
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

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    const pattern = /^https:\/\/www\.youtube\.com\/.+$/;
    var currentUrl;
    const observer = new MutationObserver(() => {
        currentUrl = window.location.href;
        if (pattern.test(currentUrl) && !document.body.hasAttribute("data-hide")) {
            document.body.setAttribute("data-hide", true);
            let transform = false, set; RunMaim();
            async function RunMaim() {
                GM_addStyle(`
                    .ytp-ce-element{opacity: 0.1!important;}
                    .ytp-ce-element:hover{opacity: 1!important;}
                `);
                const VVP_Pattern = /^https:\/\/www\.youtube\.com\/watch\?v=.+$/, // 判斷在播放頁面運行
                Playlist_Pattern = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/, // 判斷在播放清單運行
                language = display_language(navigator.language),
                Lookup_Delay = 300;
                /* 菜單 */
                GM_registerMenuCommand(language[0], function() {alert(language[1])});

                /* 設置觸發 */
                async function SetTrigger(element) {
                    element.style.display = "none";
                    return new Promise(resolve => {
                        setTimeout(function() {
                            if (element.style.display === "none") {resolve(true)}
                            else {resolve(false)}
                        }, Lookup_Delay);
                    });
                }
                /* 獲取設置 */
                if (VVP_Pattern.test(currentUrl)) {
                    set = GM_getValue("Minimalist", null);
                    if (set && set !== null) {
                        let interval;
                        interval = setInterval(() => {
                            const [end, below, secondary, related] = ["end", "below", "secondary", "related"].map(selector => document.getElementById(selector));
                            if (end && below && secondary && related) {
                                Promise.all([SetTrigger(end), SetTrigger(below), SetTrigger(secondary), SetTrigger(related)]).then(results => {
                                    if (results[0] && results[1] && results[2] && results[3]) {
                                        clearInterval(interval); return;
                                    }
                                });
                            }
                        }, Lookup_Delay);
                    }
                    set = GM_getValue("Trigger_1", null);
                    if (set && set !== null){
                        let interval;
                        interval = setInterval(() => {
                            const [chat, secondary, related] = ["chat-container", "secondary", "related"].map(selector => document.getElementById(selector));
                            if (chat && secondary && related) {
                                Promise.all([SetTrigger(chat), SetTrigger(secondary), SetTrigger(related)]).then(results => {
                                    if (results[0] && results[1]) {clearInterval(interval)}
                                });
                            }
                        }, Lookup_Delay);
                    }
                    set = GM_getValue("Trigger_2", null);
                    if (set && set !== null){
                        let interval;
                        interval = setInterval(() => {
                            let comments = document.getElementById("comments");
                            if (comments) {
                                SetTrigger(comments).then(() => {clearInterval(interval)});
                            }
                        }, Lookup_Delay);
                    }
                    set = GM_getValue("Trigger_3", null);
                    if (set && set !== null){
                        let interval;
                        interval = setInterval(() => {
                            const [menu, actions] = ["menu-container", "actions"].map(selector => document.getElementById(selector));
                            if (menu && actions) {
                                Promise.all([SetTrigger(menu), SetTrigger(actions)]).then(results => {
                                    if (results[0] && results[1]) {clearInterval(interval)}
                                });
                            }
                        }, Lookup_Delay);
                    }
                } else if (Playlist_Pattern.test(currentUrl)) {
                    set = GM_getValue("Trigger_4", null);
                    if (set && set !== null){
                        let interval;
                        interval = setInterval(function() {
                            let playlist = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                            if (playlist) {
                                SetTrigger(playlist).then(() => {clearInterval(interval)});
                            }
                        }, Lookup_Delay);
                    }
                }

                /* 設置判斷 */
                async function HideJudgment(element, gm="") {
                    if (element.style.display === "none" || transform) {
                        element.style.display = "block";
                        if (gm !== "") {GM_setValue(gm, false)}
                    } else {
                        element.style.display = "none";
                        if (gm !== "") {GM_setValue(gm, true)}
                    }
                }
                /* 設置快捷 */
                const interval = setInterval(() => {
                    const [
                        end, below, secondary, related, inner,
                        chat, comments, menu, actions
                    ] = [
                        "end", "below", "secondary", "related", "secondary-inner",
                        "chat-container", "comments", "menu-container", "actions"
                    ].map(selector => document.getElementById(selector));
                    if (end && below && secondary && related) {
                        clearInterval(interval);
                        document.addEventListener("keydown", function(event) {
                            if (event.shiftKey) {
                                event.preventDefault();
                                let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
                                elements.forEach(function(element) {
                                    HideJudgment(element);
                                });
                            } else if (event.ctrlKey && event.key === "z") {
                                event.preventDefault();
                                set = GM_getValue("Minimalist", null);
                                if (set && set != null) {
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
                            } else if (event.altKey && event.key === "1") {
                                event.preventDefault();
                                let child = inner.childElementCount;
                                if (child > 1) {// 子元素數量
                                    HideJudgment(chat, "Trigger_1");
                                    HideJudgment(secondary);
                                    HideJudgment(related);
                                    transform = false;
                                } else {
                                    HideJudgment(chat, "Trigger_1");
                                    HideJudgment(related);
                                    transform = true;
                                }
                            } else if (event.altKey && event.key === "2") {
                                event.preventDefault();
                                HideJudgment(comments, "Trigger_2");
                            } else if (event.altKey && event.key === "3") {
                                event.preventDefault();
                                HideJudgment(menu, "Trigger_3");
                                HideJudgment(actions);
                            } else if (event.altKey && event.key === "4") {
                                event.preventDefault();
                                let playlist = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                                HideJudgment(playlist, "Trigger_4");
                            }
                        });
                    }
                }, 500);
            }
        }
    });
    observer.observe(document.head, {childList: true, subtree: true});
})();

function display_language(language) {
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
    "en": ["📜 Settings Shortcut", `@ When function fails [Please refresh] =>

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
    return display[language] || display["en"];
}
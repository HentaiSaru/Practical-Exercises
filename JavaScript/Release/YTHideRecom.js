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
// @version      0.0.15
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
    var currentUrl = window.location.href, transform = false;
    let pattern = /^https:\/\/www\.youtube\.com\/.+$/;
    // Home page not loading
    if (pattern.test(currentUrl)) {
        let language = display_language(navigator.language);
        RunMaim();
        GM_addStyle(`
            .ytp-ce-element{opacity: 0.1!important;}
            .ytp-ce-element:hover{opacity: 1!important;}
        `);
        GM_registerMenuCommand(
            language[0],
            function() {
                alert(language[1]);
            }
        );
        async function RunMaim() {
            let set;
            async function HideJudgment(element, gm="") {
                if (element.style.display === "none" || transform) {
                    element.style.display = "block";
                    if (gm !== "") {GM_setValue(gm, false)}
                } else {
                    element.style.display = "none";
                    if (gm !== "") {GM_setValue(gm, true)}
                }
            }
            async function SetTrigger(element) {
                element.style.display = "none";
                return new Promise(resolve => {
                    setTimeout(function() {
                        if (element.style.display === "none") {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }, 100);
                });
            }
            document.addEventListener("keydown", function(event) {
                if (event.shiftKey) {
                    event.preventDefault();
                    let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
                    elements.forEach(function(element) {
                        HideJudgment(element);
                    });
                } else if (event.ctrlKey && event.key === "z") {
                    event.preventDefault();
                    let UserMenu = document.getElementById("end");
                    let Message = document.getElementById("below");
                    let RecommViewing = document.getElementById("secondary");
                    let RecommViewing2 = document.getElementById("related");
                    set = GM_getValue("Minimalist", null);
                    if (set && set != null) {
                        UserMenu.style.display = "block";
                        Message.style.display = "block";
                        RecommViewing.style.display = "block";
                        RecommViewing2.style.display = "block";
                        GM_setValue("Minimalist", false);
                    } else {
                        UserMenu.style.display = "none";
                        Message.style.display = "none";
                        RecommViewing.style.display = "none";
                        RecommViewing2.style.display = "none";
                        GM_setValue("Minimalist", true);
                    }
                } else if (event.altKey && event.key === "1") {
                    event.preventDefault();
                    let child = document.getElementById("secondary-inner").childElementCount;
                    if (child > 1) {// 子元素數量
                        let element1 = document.getElementById("secondary");
                        HideJudgment(element1, "Trigger_1");
                        let element2 = document.getElementById("related");
                        HideJudgment(element2, "Trigger_1");
                        transform = false;
                    } else {
                        let element2 = document.getElementById("related");
                        HideJudgment(element2, "Trigger_1");
                        transform = true;
                    }
                } else if (event.altKey && event.key === "2") {
                    event.preventDefault();
                    let element = document.getElementById("comments");
                    HideJudgment(element, "Trigger_2");
                } else if (event.altKey && event.key === "3") {
                    event.preventDefault();
                    let element = document.getElementById("menu-container");
                    HideJudgment(element, "Trigger_3");
                } else if (event.altKey && event.key === "4") {
                    event.preventDefault();
                    let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                    HideJudgment(element, "Trigger_4");
                }
            });
            // 判斷在播放頁面運行
            let VVP_Pattern = /^https:\/\/www\.youtube\.com\/watch\?v=.+$/;
            // 判斷在播放清單運行
            let Playlist_Pattern = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/;
            let Lookup_Delay = 300;
            if (VVP_Pattern.test(currentUrl)) {
                set = GM_getValue("Minimalist", null);
                if (set && set !== null) {
                    let interval;
                    interval = setInterval(function() {
                        let UserMenu = document.getElementById("end");
                        let Message = document.getElementById("below");
                        let RecommViewing = document.getElementById("secondary");
                        let RecommViewing2 = document.getElementById("related");
                        if (UserMenu && Message && RecommViewing && RecommViewing2) {
                            Promise.all([SetTrigger(UserMenu), SetTrigger(Message), SetTrigger(RecommViewing), SetTrigger(RecommViewing2)]).then(results => {
                                if (results[0] && results[1] && results[2] && results[3]) {
                                    clearInterval(interval);
                                }
                            });
                        }
                    }, Lookup_Delay);
                }
                set = GM_getValue("Trigger_1", null);
                if (set && set !== null){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("secondary");
                        let element2 = document.getElementById("related");
                        if (element && element2) {
                            Promise.all([SetTrigger(element), SetTrigger(element2)]).then(results => {
                                if (results[0] && results[1]) {
                                    clearInterval(interval);
                                }
                            });
                        }
                    }, Lookup_Delay);
                }
                set = GM_getValue("Trigger_2", null);
                if (set && set !== null){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("comments");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
                set = GM_getValue("Trigger_3", null);
                if (set && set !== null){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("menu-container");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
            } else if (Playlist_Pattern.test(currentUrl)) {
                set = GM_getValue("Trigger_4", null);
                if (set && set !== null){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
            }
        }
    }
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
// ==UserScript==
// @name         YT Hide Recom Tool
// @version      0.0.9
// @author       HentaiSaru
// @description  將 YT 某些元素進行隱藏
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @run-at       document-end
// @match        *://www.youtube.com/*

// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*
Original Author Page : [https://github.com/hoothin/]
Original Author Link : [https://greasyfork.org/zh-TW/scripts/438403-youtube-hide-related-suggestion-which-occlude-the-video]
*/

(function() {
    var currentUrl = window.location.href;
    let pattern = /^https:\/\/www\.youtube\.com\/.+$/;
    if (pattern.test(currentUrl)) {
        // 為推薦卡添加 css 樣式
        let css = `
            .ytp-ce-element{opacity: 0.1!important;}
            .ytp-ce-element:hover{opacity: 1!important;}
        `;
        if (typeof GM_addStyle !== "undefined") {
            GM_addStyle(css);
        } else {
            let ElementNode = document.createElement("style");
            ElementNode.appendChild(document.createTextNode(css));
            (document.querySelector("head") || document.documentElement).appendChild(ElementNode);
        }
        async function runAsync() {
            // 監聽快捷鍵
            document.addEventListener("keydown", function(event) {
                if (event.shiftKey) {
                    event.preventDefault();
                    let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
                    elements.forEach(function(element) {
                        if (element.style.display === "none") {
                            element.style.display = "block";
                        } else {
                            element.style.display = "none";
                        }
                    });
                } else if (event.altKey && event.key === "1") {
                    event.preventDefault();
                    let element = document.getElementById("secondary");
                    if (element.style.display === "none") {
                        element.style.display = "block";
                        GM_setValue("Trigger_1", false);
                    } else {
                        element.style.display = "none";
                        GM_setValue("Trigger_1", true);
                    }
                } else if (event.altKey && event.key === "2") {
                    event.preventDefault();
                    let element = document.getElementById("comments");
                    if (element.style.display === "none") {
                        element.style.display = "block";
                        GM_setValue("Trigger_2", false);
                    } else {
                        element.style.display = "none";
                        GM_setValue("Trigger_2", true);
                    }
                } else if (event.altKey && event.key === "3") {
                    event.preventDefault();
                    let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                    if (element.style.display === "none") {
                        element.style.display = "block";
                        GM_setValue("Trigger_3", false);
                    } else {
                        element.style.display = "none";
                        GM_setValue("Trigger_3", true);
                    }
                }
            });
            // 判斷在播放頁面運行
            let VVP_Pattern = /^https:\/\/www\.youtube\.com\/watch\?v=.+$/;
            // 判斷在播放清單運行
            let Playlist_Pattern = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/;
            if (VVP_Pattern.test(currentUrl)) {
                if (GM_getValue("Trigger_1", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("secondary");
                        if (element) {
                            element.style.display = "none";
                            clearInterval(interval);
                        }
                    }, 1000);
                }
                if (GM_getValue("Trigger_2", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("comments");
                        if (element) {
                            element.style.display = "none";
                            clearInterval(interval);
                        }
                    }, 1000);
                }
            } else if (Playlist_Pattern.test(currentUrl)) {
                if (GM_getValue("Trigger_3", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div")
                        if (element) {
                            element.style.display = "none";
                            clearInterval(interval);
                        }
                    }, 1000);
                }
            }
        }
        // 異步運行
        runAsync();
    }
})();

const Menu = GM_registerMenuCommand(
    "📜 [功能說明]",
    function() {
        alert(
            "功能失效時 [請重新整理] !!\n\n(Shift) : 完全隱藏影片尾部推薦\n(Alt + 1) : 隱藏右側影片推薦\n(Alt + 2) : 隱藏留言區\n(Alt + 3) : 隱藏播放清單資訊"
        );
    }
);
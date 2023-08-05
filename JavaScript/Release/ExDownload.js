// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.13
// @author       HentiSaru
// @description         暫時無說明
// @description:zh-TW   無
// @description:zh-CN   無
// @description:ja      無
// @description:ko      無
// @description:en      無

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_registerMenuCommand
// ==/UserScript==

ButtonCreation()

async function ButtonCreation() {
    GM_addStyle(`
        .Download_Button {
            color: #5C0D12;
            float: right;
            width: 9rem;
            cursor: pointer;
            font-weight: bold;
            padding: 1px 5px 2px;
            line-height: 20px;
            border: 2px solid #9a7c7e;
            border-radius: 5px;
            position: relative;
            background-color: #EDEADA;
            font-family: arial,helvetica,sans-serif;
        }
        .Download_Button:hover {
            color: rgb(143, 71, 1);
            border: 2px dashed #B5A4A4;
            background-color: #EDEADA;
        }
    `);
    let download_button;
    try {
        download_button = GM_addElement(document.querySelector("div#gd2"), "button", {
            class: "Download_Button"
        });
        download_button.textContent = "測試按鈕";
        // download_button.addEventListener("click", function() {
            // DownloadTrigger(download_button);
        // });
    } catch {}
}
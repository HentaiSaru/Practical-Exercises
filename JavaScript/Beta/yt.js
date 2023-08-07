// ==UserScript==
// @name         YT test
// @version      0.0.1
// @author       HentaiSaru
// @description  測試項目
// @icon         

// @run-at       document-end
// @match        *://www.youtube.com/*

// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// ==/UserScript==

GM_registerMenuCommand("開啟模態測試", function() {ChatModal()});

GM_addStyle(`
    .modal-background {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        position: fixed;
        overflow: auto;
        background-color: rgba(0,0,0,0.3);
    }
`)
// ytd-live-chat-frame iframe
async function ChatModal() {
    let interval, chat, modal;
    interval = setInterval(function() {
        chat = $("#secondary #secondary-inner #chat-container");
        if (chat) {
            modal = `
                <div id="backmodal" class="modal-background"></div>
            `
            $(document.body).append(modal);
            $("#backmodal").append(chat.contentWindow.document.body);
            $("#backmodal").on("click", function() {
                $("#backmodal").remove();
            })
            clearInterval(interval);
        }
    }, 500);
}
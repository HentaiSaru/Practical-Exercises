// ==UserScript==
// @name         登入提示
// @name:zh-TW
// @name:zh-CN
// @name:ja
// @name:ko
// @name:en
// @version      0.0.1
// @author       HentiSaru
// @description         無
// @description:zh-TW
// @description:zh-CN
// @description:ja
// @description:ko
// @description:en

// @match        *://*/*
// @icon

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @resource     https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.8/sjcl.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @resource     https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js
// ==/UserScript==

/**
 * 保存輸入帳號, 密碼
 * 密碼進行加密, 密碼添加顯示眼睛
 * 加密Key設置, 選擇是否加密
 * 調整選單設置, 背景色, 文字色, 透明度, 位置
 * PBKDF2 : 用於使用用戶密碼, 生成key值進行加密
 * OpenSSL : 生成 IV 值
 * AES : 進行加密
 * MD5 : 生成 Key
 * sjcl : 進行加密
 */

// 帳號 input type="text"
// 密碼 input type="password"

var ImportRecord = true, modal;
(function() {
    GM_registerMenuCommand("設置菜單", function() {UICreation()});
})();

async function UICreation() {
    if (ImportRecord) {
        GM_addStyle(`
            .Modal-background {
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                z-index: 9999;
                position: fixed;
                overflow: auto;
                pointer-events: none;
                background-color: rgba(0, 0, 0, 0.3);
            }
        `)
        ImportRecord = false;
    }

    modal = `
        <div class="Modal-background">
        </div>
    `
    $(document.body).append(modal);
}
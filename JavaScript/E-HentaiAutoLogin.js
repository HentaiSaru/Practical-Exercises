// ==UserScript==
// @name         E/Ex - Hentai - AutoLogin
// @namespace    http://tampermonkey.net/

// @version      0.0.3
// @description  test script
// @author       HentiSaru

// @icon         http://g.e-hentai.org/favicon.ico
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*

// @license      GPL-3.0
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_notification
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==
/*
- 教學 -
=> https://juejin.cn/post/6844903997698998285
*/

// 檢查的需要的 cookie 名稱
var RequiredCookies = ["ipb_member_id","ipb_pass_hash","igneous","sk","sl"];

// 登入的 cookie
var LoginCookies = [
    { name: "igneous", value: "f9353cf57" },
    { name: "ipb_member_id", value: "7367154" },
    { name: "ipb_pass_hash", value: "45278fc586de19ade85f8efbd26e40b2" },
    { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
    { name: "sl", value: "dm_2" }
];

// 添加 cookie
function AddCookies() {
    for (var i = 0; i < LoginCookies.length; i++) {
        var cookie = LoginCookies[i];
        document.cookie = cookie.name + "=" + cookie.value;
    }
}

// 刪除所有 cookie
function DeleteAllCookies() {
    var cookies = document.cookie.split("; ");
    
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var cookieName = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

// 獲取當前頁面 cookie
function GetCookies() {
  var cookies = {};
  var cookiePairs = document.cookie.split("; ");

  for (var i = 0; i < cookiePairs.length; i++) {
    var cookiePair = cookiePairs[i].split("=");
    var cookieName = decodeURIComponent(cookiePair[0]);
    var cookieValue = decodeURIComponent(cookiePair[1]);
    cookies[cookieName] = cookieValue;
  }

  return cookies;
}

// 檢查 cookie 是否存在
function CheckCookies() {
    var cookies = GetCookies();
    var cookiesFound = RequiredCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName);
    });

    // 如果未找到所有指定的 cookie，則進行相應操作
    if (!cookiesFound) {
        console.log("需進行登入");
        DeleteAllCookies();         // 刪除當前頁面的所有 cookie
        AddCookies();               // 添加指定的 cookie
        location.reload();          // 刷新頁面
    }
}

// 啟用檢測
CheckCookies();
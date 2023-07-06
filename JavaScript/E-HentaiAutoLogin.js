// ==UserScript==
// @name         Automatic-Login
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  test script
// @author       HentiSaru
// @icon         http://g.e-hentai.org/favicon.ico
// @run-at       document-start
// @match        https://e-hentai.org/g/*
// @match        https://exhentai.org/g/*
// @include      https://e-hentai.org/g/*
// @include      https://exhentai.org/g/*
// @grant        unsafeWindow
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_openInTab
// @grant        GM_notification
// ==/UserScript==

// 要檢查的 cookie 名稱
var cookiesToCheck = ["ipb_member_id","ipb_pass_hash","igneous","sl"];

// 要添加的 cookie
var cookiesToAdd = [
    { name: "igneous", value: "f9353cf57" },
    { name: "ipb_member_id", value: "7367154" },
    { name: "ipb_pass_hash", value: "45278fc586de19ade85f8efbd26e40b2" },
    { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
    { name: "sl", value: "dm_2" }
];

// 添加指定的 cookie
function addCookies() {
    for (var i = 0; i < cookiesToAdd.length; i++) {
        var cookie = cookiesToAdd[i];
        document.cookie = cookie.name + "=" + cookie.value + "; path=/;";
    }
}

// 刪除當前頁面的所有 cookie
function deleteAllCookies() {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var cookieName = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

// 獲取所有的 cookie
function getCookies() {
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
function checkCookies() {
    var cookies = getCookies();
    var cookiesFound = cookiesToCheck.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName);
    });
    if (!cookiesFound) {
        // 如果未找到所有指定的 cookie，則進行相應操作
        console.log("需要添加指定的 cookie");
        deleteAllCookies(); // 刪除當前頁面的所有 cookie
        addCookies(); // 添加指定的 cookie
        location.reload(); // 刷新頁面
    } else {
        console.log("已找到所有指定的 cookie");
    }
}

checkCookies();
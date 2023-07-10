// ==UserScript==
// @name         LoginStatusBackup
// @version      0.0.3
// @author       HentiSaru
// @description  備份登入狀態 , 如果登出了嘗試進行登入

// @match        *://*/*
// @exclude      https://www.google.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/2447/2447689.png

// @license      Apache
// @run-at       document-end

// @grant        GM_info
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener

// ==/UserScript==

var check_settings = ["自動登入檢測設置 [已啟用✅]" , "自動登入檢測設置 [未啟用❌]"];
var enabledDomains = GM_getValue("enabledDomains", []);
var Cookies_Backup = localStorage.getItem("CookiesBackup");
var domain = window.location.hostname;
var MenuId = "LoginStatusBackup_MenuId"; // 菜單標示符
var LoginCookies , login_detection;
// 檢查是否已註冊了菜單
var MenuRegistered = GM_listValues().includes(MenuId);

/* ==================== 菜單創建 (有Bug) ==================== */
if (!MenuRegistered) {
    GM_registerMenuCommand("自動備份網站登入狀態 [請先登入]", login_backup)
    GM_registerMenuCommand("備份手動登入測試 [測試功能]", Manual_Login)
    GM_registerMenuCommand(Detect_enabled_state(), AutomaticLogin);
}/* ==================== 菜單創建 ==================== */

/* ==================== 檢測登入 (CheckCookies 邏輯不夠好 , 待修正) ==================== */
login_detection = sessionStorage.getItem("login_detection");
if (!login_detection) {
    if (enabledDomains.includes(domain) & Cookies_Backup !== null) {
        LoginCookies = JSON.parse(Cookies_Backup);
        CheckCookies();
    }
}/* ==================== 檢測登入 ==================== */

/* ==================== 保存頁面 cookie ==================== */
function login_backup() {
    var cookies = GetCookies() , cookie_list = [];
    for (var cookieName in cookies) {
        if (cookies.hasOwnProperty(cookieName)) {
            var cookieValue = cookies[cookieName];
            cookie_list.push({"name" : cookieName,"value" : cookieValue})
        }
    }
    if (cookie_list.length > 0) {
        localStorage.setItem("CookiesBackup", JSON.stringify(cookie_list));
        alert("以備份 Cookie");
    } else {
        alert("無可備份項目");
    }
}/* ==================== 保存頁面 cookie ==================== */

/* ==================== 獲取頁面 cookie ==================== */
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
}/* ==================== 獲取頁面 cookie ==================== */

/* ==================== 檢查 cookie 狀態 ==================== */
function CheckCookies() {
    var cookies = GetCookies();
    var cookiesFound = LoginCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName);
    });
    // 與備份 Cookie 不同 (判斷為沒有登入)
    if (!cookiesFound) {
        // 刪除當前頁面的所有 cookie
        DeleteCookies();
        // 添加指定的 cookie
        AddCookies();
        // 會話設置為已檢測
        sessionStorage.setItem("login_detection", true);
        // 刷新頁面
        location.reload();
    }
}/* ==================== 檢查 cookie 狀態 ==================== */

/* ==================== 測試手動添加 ==================== */
function Manual_Login() {
    if (Cookies_Backup !== null) {
        DeleteCookies();
        AddCookies();
        location.reload();
    } else {
        alert("未檢測到備份項目");
    }
}/* ==================== 測試手動添加 ==================== */

/* ==================== 添加 cookie ==================== */
function AddCookies() {
    for (var i = 0; i < LoginCookies.length; i++) {
        var cookie = LoginCookies[i];
        document.cookie = cookie.name + "=" + cookie.value;
    }
}/* ==================== 添加 cookie ==================== */

/* ==================== 刪除 cookie ==================== */
function DeleteCookies() {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var cookieName = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}/* ==================== 刪除 cookie ==================== */

/* ==================== 讀取設置網域顯示狀態 ==================== */
function Detect_enabled_state() {
    if (enabledDomains.includes(domain)) {
        return check_settings[0];
    } else {
        return check_settings[1];
    }
}/* ==================== 讀取設置網域顯示狀態 ==================== */

/* ==================== 設置網域 啟用自動登入 ==================== */
function AutomaticLogin() {
    Cookies_Backup = localStorage.getItem("CookiesBackup")
    if (Cookies_Backup !== null) {
        // 獲取設置網域資訊
        if (enabledDomains.includes(domain)) {
            // 從已啟用列表中移除當前網域
            enabledDomains = enabledDomains.filter(function(value) {
                return value !== domain;
            });
            alert("已停用自動登入檢測");
        } else {
            // 添加當前網域到已啟用列表
            enabledDomains.push(domain);
            alert("已啟用自動登入檢測");
        }
        GM_setValue("enabledDomains", enabledDomains);
        location.reload();
    } else {
        alert("未備份網站登入狀態 [無法啟用檢測]");
    }
}/* ==================== 設置網域 啟用自動登入 ==================== */
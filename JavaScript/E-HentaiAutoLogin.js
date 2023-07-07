// ==UserScript==
// @name         (E/Ex-Hentai) AutoLogin
// @namespace    http://tampermonkey.net/

// @version      0.0.3
// @author       HentiSaru
// @description  檢測 E 站的登入狀態 , 沒有登入就添加 cookie 進去

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         http://g.e-hentai.org/favicon.ico

// @license      Apache
// @run-at       document-end

// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_getResourceURL
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==
/*=> https://juejin.cn/post/6844903997698998285 */

/* ==================== 全局設置變數 ==================== */
// [RequiredCookies] 需要存在的 cookie / [LoginCookies] 登入 cookie (字典)
var RequiredCookies = ["ipb_member_id","ipb_pass_hash"] , LoginCookies;
GM_registerMenuCommand("登入 Cookie 設置", CookieSettings);// 設置選單(顯示)

// localStorage.getItem() 將保存在本地 , 直到數據被清除 , 不然理論上永久;
var UseCheck = sessionStorage.getItem('UseCheck');// 判斷是否使用檢查方法(會話檢測)
var NoReminderSet = sessionStorage.getItem('NoReminderSet');// 判斷是否提醒過 設置cookie
/* ==================== 全局設置變數 ==================== */

/* ==================== 檢查會話狀態/呼叫檢查方法 ==================== */
if (!UseCheck) {
    // 從 localStorage 中獲取存儲的 Cookies 字串 , 轉換為 LoginCookies 對象
    var cookies = localStorage.getItem("E/Ex_Cookies")

    if (cookies !== null) {
        LoginCookies = JSON.parse(cookies);
        // 啟用檢測
        CheckCookies();
    } else {
        if (!NoReminderSet) {
            alert("未檢測到設置的 Cookies\n請從 [登入 Cookie 設置] 選單中進行設置");
            sessionStorage.setItem('NoReminderSet', true);
        }
    }
}/* ==================== 檢查會話狀態/呼叫檢查方法 ==================== */

/* ==================== 檢查 cookie 狀態 ==================== */
function CheckCookies() {
    var cookies = GetCookies();
    var cookiesFound = RequiredCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName);
    });

    // 如果未找到所有指定的 cookie，則進行相應操作
    if (!cookiesFound) {
        // 刪除當前頁面的所有 cookie
        DeleteAllCookies();
        // 添加指定的 cookie
        AddCookies();
        // 刷新頁面
        location.reload();
    }

    // 判斷 exhentai 的 cookie 值是否符合要求
    var currentDomain = window.location.hostname;
    if (currentDomain === "exhentai.org" && cookies.igneous === "mystery") {
        DeleteAllCookies();
        location.reload();
    }

    // 檢查後將 會話標籤 設置為 true , 重開瀏覽器重置會話
    sessionStorage.setItem('UseCheck', true);
}/* ==================== 檢查 cookie 狀態 ==================== */

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

/* ==================== 添加 cookie ==================== */
function AddCookies() {
    for (var i = 0; i < LoginCookies.length; i++) {
        var cookie = LoginCookies[i];
        document.cookie = cookie.name + "=" + cookie.value;
    }
}/* ==================== 添加 cookie ==================== */

/* ==================== 刪除 cookie ==================== */
function DeleteAllCookies() {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var cookieName = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}/* ==================== 刪除 cookie ==================== */

/* ==================== cookie 設置函式 ==================== */
function CookieSettings() {
    // 設定的項目
    var igneous , ipb_member_id , ipb_pass_hash , Input;

    // 使用 prompt 輸入框進行添加數據
    Input = prompt("[可直接取消]\n輸入 igneous：");
    if (Input !== null) {
        igneous = Input.trim();
    } else {
        igneous = null
    }
    while (true) {
        Input = prompt("[*必要輸入]\n輸入 ipb_member_id：");
        if (Input !== null) {
            ipb_member_id = Input.trim();
            break;
        } else {
            alert("[ipb_member_id] 不得為空");
        }
    }
    while (true) {
        Input = prompt('[*必要輸入]\n輸入 ipb_pass_hash：');
        if (Input !== null) {
            ipb_pass_hash = Input.trim();
            break;
        } else {
            alert("[ipb_pass_hash] 不得為空");
        }
    }

    // 確認輸入字串
    var Confirm_input;

    if (igneous !== null) {
        LoginCookies = [
            { name: "igneous", value: igneous },
            { name: "ipb_member_id", value: ipb_member_id },
            { name: "ipb_pass_hash", value: ipb_pass_hash },
            { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
            { name: "yay", value: "louder" },
            { name: "sl", value: "dm_2" }
        ];

        Confirm_input = "\n--------------------\nigneous : " + igneous + "\nipb_member_id : " + ipb_member_id + "\nipb_pass_hash : " + ipb_pass_hash + "\n--------------------"
    } else {
        LoginCookies = [
            { name: "ipb_member_id", value: ipb_member_id },
            { name: "ipb_pass_hash", value: ipb_pass_hash },
            { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
            { name: "yay", value: "louder" },
            { name: "sl", value: "dm_2" }
        ];

        Confirm_input = "\n--------------------\nipb_member_id : " + ipb_member_id + "\nipb_pass_hash : " + ipb_pass_hash + "\n--------------------"
    }
    // 使用 confirm() 進行確認
    var confirmed = confirm("確認輸入是否正確？" + Confirm_input);

    // 確認正確，進行保存
    if (confirmed) {
        // 將 LoginCookies 對象轉換為字符串並存儲在 localStorage 中
        var CookiesJson = JSON.stringify(LoginCookies);
        localStorage.setItem("E/Ex_Cookies", CookiesJson);
        alert("保存成功");
        location.reload();
    } else {
        // 不正確，重新調用方法重新輸入
        CookieSettings();
    }
}/* ==================== cookie 設置函式 ==================== */
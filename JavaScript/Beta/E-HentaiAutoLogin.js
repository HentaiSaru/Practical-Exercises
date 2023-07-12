// ==UserScript==
// @name         (E/Ex-Hentai) AutoLogin
// @version      0.0.11
// @author       HentiSaru
// @description  檢測 E 站的登入狀態 , 沒有登入 就將設置的 cookie 自動添加進去

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         http://g.e-hentai.org/favicon.ico

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

// @require      https://cdn.jsdelivr.net/npm/vue
// @require      https://cdn.jsdelivr.net/npm/jquery
// @resource     https://cdn.jsdelivr.net/npm/bootstrap

// ==/UserScript==

/*
上方好像導入太多的 API 會影響效能 , 不過此代碼較少 , 感覺沒啥影響
=> https://juejin.cn/post/6844903997698998285 
*/

/* ==================== 全局設置變數 ==================== */
// [RequiredCookies] 需要存在的 cookie / [LoginCookies] 登入 cookie (字典)
var RequiredCookies = ["ipb_member_id","ipb_pass_hash"] , LoginCookies;
var domain = window.location.hostname; // 取得域名
var custom = false; // 自訂使用狀態

// 設置選單
GM_registerMenuCommand("複製網站 Cookie", CookieClipboard);
GM_registerMenuCommand("刪除網站 Cookie", CookieDelete);
GM_registerMenuCommand("手動添加 Cookie", ManuallyAddCookies);
GM_registerMenuCommand("登入 Cookie 設置 [分別設置]", CookieSettings);
GM_registerMenuCommand("登入 Cookie 設置 [單條設置]", CookieSettings2);

// localStorage.getItem() 將保存在本地 , 直到數據被清除 , 不然理論上永久 , 受同源政策限制;
var UseCheck = sessionStorage.getItem('UseCheck');// 判斷是否使用檢查方法(會話檢測)
var NoReminderSet = sessionStorage.getItem('NoReminderSet');// 判斷是否提醒過 設置cookie
/* ==================== 全局設置變數 ==================== */

/* ==================== 檢查會話狀態/呼叫檢查方法 [運行入口點] ==================== */
// 使用自訂方法 , 就不會受到同源政策影響 , 但需要修改代碼 , 並將 cookie 輸入至 , CustomCookies() 方法內
// CustomCookies()

if (!UseCheck) {
    if (domain === "exhentai.org") {
        RequiredCookies.push("igneous");
    }
    if (!custom) { // 檢查是否使用自訂
        // 從 localStorage 中獲取存儲的 Cookies 字串 , 轉換為 LoginCookies 對象
        var cookies = localStorage.getItem("E/Ex_Cookies")
        if (cookies !== null) {
            LoginCookies = JSON.parse(cookies);
            // 啟用檢測
            CheckCookies();
        } else {
            if (!NoReminderSet) {
                alert("未檢測到設置的 Cookies!!\n根據同源政策[表裏站]必須分別設置!!\n請從 [登入 Cookie 設置] 選單中進行設置");
                sessionStorage.setItem('NoReminderSet', true);
            }
        }
    } else {
        CheckCookies();
    }
}/* ==================== 檢查會話狀態/呼叫檢查方法 ==================== */

/* ==================== 自訂 Cookies ==================== */
function CustomCookies() {
    LoginCookies = [
        { name: "igneous", value: "" },
        { name: "ipb_member_id", value: "" },
        { name: "ipb_pass_hash", value: "" },
        { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
        { name: "yay", value: "louder" },
        { name: "sl", value: "dm_2" }
    ];
    custom = true;
}/* ==================== 自訂 Cookies ==================== */

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
    if (domain === "exhentai.org" & cookies.igneous === "mystery") {
        DeleteAllCookies();
        AddCookies();
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

/* ==================== cookie 設置函式 [分別設置] ==================== */
function CookieSettings() {
    // 設定的項目
    var igneous=null , ipb_member_id , ipb_pass_hash , Input;

    if (domain === "exhentai.org") {
        while (true) {
            Input = prompt("輸入 igneous：");
            if (Input === "") {
                alert("[igneous] 不得為空");
            } else if (Input !== null) {
                igneous = Input.trim();
                break;
            } else {
                return;
            }
        }
    }
    while (true) {
        Input = prompt("輸入 ipb_member_id：");
        if (Input === "") {
            alert("[ipb_member_id] 不得為空");
        } else if (Input !== null) {
            ipb_member_id = Input.trim();
            break;
        } else {
            return;
        }
    }
    while (true) {
        Input = prompt("輸入 ipb_pass_hash：");
        if (Input === "") {
            alert("[ipb_pass_hash] 不得為空");
        } else if (Input !== null) {
            ipb_pass_hash = Input.trim();
            break;
        } else {
            return;
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
        localStorage.setItem("E/Ex_Cookies", JSON.stringify(LoginCookies));
        alert("保存成功");
        location.reload();
    }
}/* ==================== cookie 設置函式 [分別設置] ==================== */

/* ==================== cookie 設置函式 [單條設置] ==================== */
function CookieSettings2() {
    var cookies , Input , Confirm_input;

    LoginCookies = [
        { name: "sk", value: "gy8wgij076agx1ax6is9htzrj40i" },
        { name: "yay", value: "louder" },
        { name: "sl", value: "dm_2" }
    ];

    if (domain === "exhentai.org") {
        while (true) {
            Input = prompt("根據以下格式設置\n中間使用/來隔開\nigneous/ipb_member_id/ipb_pass_hash：").trim();
            cookies = Input.split("/")
            if (cookies.length === 3) {
                LoginCookies.push({ name: "igneous", value: cookies[0] });
                LoginCookies.push({ name: "ipb_member_id", value: cookies[1] });
                LoginCookies.push({ name: "ipb_pass_hash", value: cookies[2] });
                Confirm_input = "\n--------------------\nigneous : " + cookies[0] + "\nipb_member_id : " + cookies[1] + "\nipb_pass_hash : " + cookies[2] + "\n--------------------"
                break;
            } else if (cookies.length !== 3) {
                alert("請以 / 符號分格\n設置三個 Cookie 值");
            } else {
                return;
            }
        }
    } else {
        while (true) {
            Input = prompt("根據以下格式設置\n中間使用/來隔開\nipb_member_id/ipb_pass_hash：").trim();
            cookies = Input.split("/")
            if (cookies.length === 2) {
                LoginCookies.push({ name: "ipb_member_id", value: cookies[0] });
                LoginCookies.push({ name: "ipb_pass_hash", value: cookies[1] });
                Confirm_input = "\n--------------------\nipb_member_id : " + cookies[0] + "\nipb_pass_hash : " + cookies[1] + "\n--------------------"
                break;
            } else if (cookies.length !== 3) {
                alert("請以 / 符號分格\n設置二個 Cookie 值");
            } else {
                return;
            }
        }
    }
    var confirmed = confirm("確認輸入是否正確？" + Confirm_input);
    if (confirmed) {
        localStorage.setItem("E/Ex_Cookies", JSON.stringify(LoginCookies));
        alert("保存成功");
        location.reload();
    } else {
        return;
    }
}/* ==================== cookie 設置函式 [單條設置] ==================== */

/* ==================== 取得網頁 cookie ==================== */
function CookieClipboard() {
    var cookies = GetCookies() , cookie_list = [];
    for (var cookieName in cookies) {
        if (cookies.hasOwnProperty(cookieName)) {
            var cookieValue = cookies[cookieName];
            cookie_list.push({"name" : cookieName,"value" : cookieValue})
        }
    }
    // 創建文本框 , 添加 cookie_list
    var textBox = document.createElement('textarea');
    textBox.value = JSON.stringify(cookie_list, null, 4);
    document.body.appendChild(textBox);
    // 選取文本框內容
    textBox.select();
    // 複製 (被棄用方法)
    document.execCommand('copy');
    // 移除文本框
    document.body.removeChild(textBox);
    //navigator.clipboard.writeText(JSON.stringify(cookie_list, null, 4));
    alert("已複制 cookie 資訊");
}/* ==================== 取得網頁 cookie ==================== */

/* ==================== 刪除網頁 cookie ==================== */
function CookieDelete() {
    DeleteAllCookies()
    location.reload();
}/* ==================== 刪除網頁 cookie ==================== */

/* ==================== 手動添加 cookie ==================== */
function ManuallyAddCookies() {
    var cookies = localStorage.getItem("E/Ex_Cookies")
    if (cookies !== null) {
        LoginCookies = JSON.parse(cookies);
        AddCookies();
        location.reload()
    } else {
        alert("無效的添加!!\n未檢測到設置的 Cookies")
    }
}/* ==================== 手動添加 cookie ==================== */
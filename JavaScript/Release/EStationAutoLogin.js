// ==UserScript==
// @name         (E/Ex-Hentai) AutoLogin
// @version      0.0.5
// @author       HentiSaru
// @description  自動檢測 E 站的登入狀態 , 沒有登入 就將設置的 cookies 自動添加進去 , 進行快速登入
// @namespace    https://greasyfork.org/users/989635

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         http://g.e-hentai.org/favicon.ico

// @license      Apache
// @run-at       document-end

// @grant        GM_cookie
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand

// ==/UserScript==

/*
新手開發 !!

待修正添加 :

表單動畫效果
表單排版問題

版本更新 :
v0.0.4 修正支援Edge , 代碼排版
v0.0.3 添加手動注入功能
v0.0.2 菜單顯示邏輯修正
v0.0.1 基本架構完成
*/

/* ==================== 初始化設置 ==================== */
var modal, Domain;

GM_addStyle(`
    .show-modal-background {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        position: fixed;
        overflow: auto;
        background-color: rgba(0,0,0,0.5);
    }
    .show-modal-content {
        width: 23%;
        padding: 20px;
        overflow: auto;
        color: #5C0D11;
        margin: 5% auto;
        text-align: left;
        border-radius: 10px;
        border-collapse: collapse;
        background-color: #fefefe;
        border: 2px ridge #5C0D12;
    }
    .show-button {
        top: 0;
        margin: 3% 2%;
        color: #5C0D12;
        font-size: 14px;
        font-weight: bold;
        border-radius: 3px;
        background-color: #EDEADA;
        border: 2px solid #B5A4A4;
    }
    .show-button:hover, .show-button:focus {
        color: #FF8033;
        cursor: pointer;
        text-decoration: none;
    }
    .set-modal-content  {
        width: 720px;
        padding: 5px;
        overflow: auto;
        border-radius: 10px;
        text-align: center;
        border: 2px ridge #5C0D12;
        border-collapse: collapse;
        margin: 2% auto 8px auto;
    }
    .set-list {
        height: 25px;
        width: 70%;
        text-align: center;
    }
    .hidden {
        display: none;
    }
`);/* ==================== 初始化設置 ==================== */

/* ==================== 自動獲取 Cookies (菜單) ==================== */
const GetCookiesAutomatically = GM_registerMenuCommand(
    "📜 自動獲取 Cookies [請先登入]",
    function() {
        let cookies = GetCookies() , cookie_list = [];
        for (var cookieName in cookies) {
            if (cookies.hasOwnProperty(cookieName)) {
                var cookieValue = cookies[cookieName];
                cookie_list.push({"name" : cookieName,"value" : cookieValue})
            }
        }
        cookies = JSON.stringify(cookie_list, null, 4);
        Cookies_Show(cookies)
    }
)

function Cookies_Show(cookie_list) {
    if (modal) {
        modal.remove();
        modal = null;
    }
    modal = document.createElement('div');
    modal.innerHTML = `
        <div class="show-modal-content">
        <h1 style="text-align:center;">確認選擇的 Cookies</h1>
            <pre><b>${cookie_list}</b></pre>
            <div style="text-align: right;">
                <button class="show-button" id="save_cookie">確認保存</button>
                <button class="show-button" id="modal_close">取消退出</button>
            </div>
        </div>
    `
    modal.classList.add('show-modal-background');
    // 添加模態框元素到頁面中
    document.body.appendChild(modal);
    modal.classList.remove('hidden');

    let CloseButton = document.getElementById('modal_close');
    CloseButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.removeEventListener('click', CloseButton);
    });
    let SaveButton = document.getElementById('save_cookie');
    SaveButton.addEventListener('click', () => {
        GM_setValue("E/Ex_Cookies", cookie_list);
        alert("保存成功!");
        modal.classList.add('hidden');
        document.removeEventListener('click', SaveButton);
    });
}/* ==================== 自動獲取 Cookies (菜單) ==================== */

/* ==================== 手動輸入 Cookies (菜單) ==================== */
const ManualSetting = GM_registerMenuCommand(
    "📝 手動輸入 Cookies",
    function() {
        if (modal) {
            modal.remove();
            modal = null;
        }

        Domain = window.location.hostname;
        if (Domain === "e-hentai.org") {
            GM_addStyle('.set-modal-content { background-color: #fefefe; }');
        } else if (Domain === "exhentai.org") {
            GM_addStyle('.set-modal-content { background-color: #34353b; }');
        }

        modal = document.createElement('div');
        modal.innerHTML = `
            <div class="set-modal-content">
            <h1>設置 Cookies</h1>
                <form id="set_cookies">
                    <div style="margin:10px">
                        [igneous] : <input class="set-list" type="text" name="igneous" placeholder="要登入 Ex 才需要填寫"><br>
                        [ipb_member_id] : <input class="set-list" type="text" name="ipb_member_id" placeholder="必填項目" required><br>
                        [ipb_pass_hash] : <input class="set-list" type="text" name="ipb_pass_hash" placeholder="必填項目" required><hr>
                        <h2>下方選填 也可不修改</h2>
                        [sl] : <input class="set-list" type="text" name="sl" value="dm_2"><br>
                        [sk] : <input class="set-list" type="text" name="sk" value="gy8wgij076agx1ax6is9htzrj40i"><br>
                        [yay] : <input class="set-list" type="text" name="yay" value="louder"><br>
                    </div>
                    <button type="submit" class="show-button" id="set_save_cookie">確認保存</button>
                    <button class="show-button" id="set_modal_close">退出選單</button>
                </form>
            </div>
        `

        modal.classList.add('show-modal-background');
        document.body.appendChild(modal);
        modal.classList.remove('hidden');

        // 捕獲表單提交事件
        document.getElementById("set_cookies").addEventListener("submit", function(event) {
        event.preventDefault(); // 阻止默認的表單提交行為
            if (event.submitter.id === "set_save_cookie") {
                // 獲取所有的輸入表單
                const formElements = document.querySelectorAll("#set_cookies .set-list");
                const cookie_list = Array.from(formElements).map(input => {
                    return { name: input.name, value: input.value };
                });

                // 創建 textarea 元素
                const textarea = document.createElement("textarea");
                textarea.name = "confirm_cookies";
                textarea.style = "margin-top:20px";
                textarea.rows = 20;
                textarea.cols = 60;

                // 保存後 , 在獲取並轉換格式 , 並將其顯示
                GM_setValue("E/Ex_Cookies", JSON.stringify(cookie_list, null, 4));
                let cookies = JSON.parse(GM_getValue("E/Ex_Cookies", []));
                textarea.value = JSON.stringify(cookies , null, 4);

                // 將 textarea 添加到指定的 div 元素中
                const formDiv = document.querySelector("#set_cookies div");
                formDiv.appendChild(textarea);
                alert("保存成功!\n[確認正確後 按下退出選單]");
            }
        });

        // 退出按鈕
        let CloseButton = document.getElementById("set_modal_close");
        CloseButton.addEventListener("click", () => {
            modal.classList.add("hidden");
            document.removeEventListener("click", CloseButton);
        });
    }
)/* ==================== 手動輸入 Cookies (菜單) ==================== */

/* ==================== 手動注入 Cookies (菜單) ==================== */
const CookieInjection = GM_registerMenuCommand(
    "🔃 手動注入 Cookies",
    function() {
        try {
            let login_cookies = GM_getValue("E/Ex_Cookies", []);
            let cookies = GetCookies();
            login_cookies = JSON.parse(login_cookies);
            deleteCookies(cookies);
            AddCookies(login_cookies);
            location.reload();
        } catch (error) {
            alert("未檢測到可注入的 Cookies !!\n請從選單中進行設置");
        }
    }
);/* ==================== 手動注入 Cookies (菜單) ==================== */

/* ==================== 刪除所有 Cookies (菜單) ==================== */
const CookieDelete = GM_registerMenuCommand(
    "🗑️ 刪除所有 Cookies",
    function() {
        let cookies = document.cookie.split("; ");
        deleteCookies(cookies);
        location.reload();
    }
);

function deleteCookies(cookies) {
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let cookieName = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}/* ==================== 刪除所有 Cookies (菜單) ==================== */
/* ---------------------------------------------------------------- */
/* ==================== 程式入口點 ==================== */
if (sessionStorage.getItem("UseCheck") !== "true") {
    try {
        let cookies = GM_getValue("E/Ex_Cookies", []);
        AutomaticLoginCheck(JSON.parse(cookies));
    } catch (error) {
        alert("未檢測到設置的 Cookies !!\n請從選單中進行設置");
    }
}/* ==================== 程式入口點 ==================== */

/* ==================== 登入檢測方法 ==================== */
function AutomaticLoginCheck(login_cookies) {
    // 需要的 cookie 值
    const RequiredCookies = ["ipb_member_id","ipb_pass_hash"];
    Domain = window.location.hostname;
    let cookies = GetCookies();
    let cookiesFound = RequiredCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName) && cookies[cookieName] !== undefined;
    });
    if (!cookiesFound || RequiredCookies.length !== 2) {
        let cookies = document.cookie.split("; ");
        deleteCookies(cookies);
        AddCookies(login_cookies);
        location.reload();
        if (Domain === "exhentai.org" && (!cookies.hasOwnProperty("igneous") || cookies.igneous === "mystery")) {
            deleteCookies(cookies);
            AddCookies(login_cookies);
            location.reload();
        }
    }
    sessionStorage.setItem("UseCheck", true);
}/* ==================== 登入檢測方法 ==================== */

/* ==================== 添加 cookie ==================== */
function AddCookies(LoginCookies) {
    for (let i = 0; i < LoginCookies.length; i++) {
        let cookie = LoginCookies[i];
        document.cookie = cookie.name + "=" + cookie.value;
    }
}/* ==================== 添加 cookie ==================== */

/* ==================== 取得 Cookies ==================== */
function GetCookies() {
    let cookies = {} , cookiePairs = document.cookie.split("; ");
    for (let i = 0; i < cookiePairs.length; i++) {
        let cookiePair = cookiePairs[i].split("=");
        let cookieName = decodeURIComponent(cookiePair[0]);
        let cookieValue = decodeURIComponent(cookiePair[1]);
        cookies[cookieName] = cookieValue;
    }
    return cookies;
}/* ==================== 取得 Cookies ==================== */
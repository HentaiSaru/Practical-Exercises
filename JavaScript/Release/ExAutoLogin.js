// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.11
// @author       HentiSaru
// @description         設置 E/Ex - Cookies 本地備份保存 , 自動擷取設置 , 手動選單設置 , 自動檢測登入狀態自動登入 , 手動選單登入
// @description:zh-TW   設置 E/Ex - Cookies 本地備份保存 , 自動擷取設置 , 手動選單設置 , 自動檢測登入狀態自動登入 , 手動選單登入
// @description:zh-CN   设置 E/Ex - Cookies 本地备份保存 , 自动撷取设置 , 手动选单设置 , 自动检测登入状态自动登入 , 手动选单登入
// @description:ja      E/Ex - Cookies をローカルバックアップ保存し、自動的に設定し、手動でメニューを設定し、ログイン狀態を自動的に検出して自動ログインし、手動でメニューログインします
// @description:ko      E/Ex - 쿠키를 로컬 백업으로 저장하고 자동으로 설정하며 수동으로 메뉴를 설정하고 로그인 상태를 자동으로 감지하여 자동으로 로그인하거나 메뉴로 수동으로 로그인합니다
// @description:en      Save E/Ex cookies as local backups, automatically retrieve settings, manually configure the menu, automatically detect login status for auto-login, and allow manual login through the menu

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// ==/UserScript==

/* ==================== 初始化設置 ==================== */
var modal, Domain;

(function() {
    try {
        let cookies = GM_getValue("E/Ex_Cookies", []), domain = window.location.hostname,
        sessiontime = new Date(GM_getValue(`${domain}_SessionTime`, null)), time = new Date(), conversion;
        if (isNaN(sessiontime)) {sessiontime = new Date(time.getTime() + 6 * 60 * 1000)}
        conversion = (time - sessiontime) / (1000 * 60);
        if (conversion > 5) {
            GM_setValue(`${domain}_SessionTime`, time.getTime());
            AutomaticLoginCheck(JSON.parse(cookies), domain);
        }
    } catch (error) {console.log(error)}
})();

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
`);

/* 自動獲取 Cookies */
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

/* 顯示自動獲取的 Cookies */
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
}

/* 手動輸入 Cookies */
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
        const textarea = document.createElement("textarea");

        // 捕獲表單提交事件
        document.getElementById("set_cookies").addEventListener("submit", function(event) {
        event.preventDefault(); // 阻止默認的表單提交行為
            if (event.submitter.id === "set_save_cookie") {
                // 獲取所有的輸入表單
                const formElements = document.querySelectorAll("#set_cookies .set-list");
                const cookie_list = Array.from(formElements).map(input => {
                    return { name: input.name, value: input.value };
                });

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
                GM_notification({
                    title: "保存通知",
                    text: "[確認輸入正確]按下退出選單保存",
                    image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                    timeout: 4000
                });
            }
        });

        // 退出按鈕
        let CloseButton = document.getElementById("set_modal_close");
        CloseButton.addEventListener("click", () => {
            modal.classList.add("hidden");
            document.removeEventListener("click", CloseButton);
        });
    }
)

/* 查看保存的 Cookies */
const ViewSaveCookie = GM_registerMenuCommand(
    "🔍 查看保存的 Cookies",
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
            <h1>當前設置 Cookies</h1>
                <div id="view_cookies" style="margin:10px"></div>
                <button class="show-button" id="save_changes">更改保存</button>
                <button class="show-button" id="close">退出選單</button>
            </div>
        `

        modal.classList.add('show-modal-background');
        document.body.appendChild(modal);
        modal.classList.remove('hidden');

        const textarea = document.createElement("textarea");
        const login_cookies = JSON.parse(GM_getValue("E/Ex_Cookies", []));
        textarea.value = JSON.stringify(login_cookies , null, 4);

        textarea.id = "view_SC";
        textarea.style = "margin-top:20px";
        textarea.rows = 20;
        textarea.cols = 60;
        document.getElementById("view_cookies").appendChild(textarea);

        let SaveButton = document.getElementById("save_changes");
        SaveButton.addEventListener("click", () => {
            GM_setValue("E/Ex_Cookies", JSON.stringify(JSON.parse(document.getElementById("view_SC").value), null, 4));
            GM_notification({
                title: "變更通知",
                text: "以保存變更",
                image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                timeout: 4000
            });
            modal.classList.add("hidden");
            document.removeEventListener("click", SaveButton);
        });

        let CloseButton = document.getElementById("close");
        CloseButton.addEventListener("click", () => {
            modal.classList.add("hidden");
            document.removeEventListener("click", CloseButton);
        });
    }
)

/* 手動注入 Cookies 登入 */
const CookieInjection = GM_registerMenuCommand(
    "🔃 手動注入 Cookies",
    function() {
        try {
            let login_cookies = GM_getValue("E/Ex_Cookies", []);
            let cookies = GetCookies();
            login_cookies = JSON.parse(login_cookies);
            DeleteCookies(cookies);
            AddCookies(login_cookies);
            GM_setValue("SessionTime", new Date().getTime());
            location.reload();
        } catch (error) {
            alert("未檢測到可注入的 Cookies !!\n請從選單中進行設置");
        }
    }
);

/* 刪除所有 Cookies */
const CookieDelete = GM_registerMenuCommand(
    "🗑️ 刪除所有 Cookies",
    function() {
        DeleteCookies(GetCookies());
        location.reload();
    }
);

/* 登入檢測函數 */
async function AutomaticLoginCheck(login_cookies , Domain) {
    // 需要的 cookie 值
    let RequiredCookies = ["ipb_member_id","ipb_pass_hash"];
    if (Domain === "exhentai.org") {
        RequiredCookies = ["igneous","ipb_member_id","ipb_pass_hash"];
    }
    let cookies = GetCookies();
    let cookiesFound = RequiredCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName) && cookies[cookieName] !== undefined;
    });
    if (Domain === "exhentai.org" && (!cookies.hasOwnProperty("igneous") || cookies.igneous === "mystery") || !cookiesFound) {
        DeleteCookies(cookies);
        AddCookies(login_cookies);
        location.reload();
    } else if (!cookiesFound || !RequiredCookies.length >= 2) {
        let cookies = document.cookie.split("; ");
        DeleteCookies(cookies);
        AddCookies(login_cookies);
        location.reload();
    }
}

/* 添加 cookie */
function AddCookies(LoginCookies) {
    for (let i = 0; i < LoginCookies.length; i++) {
        let cookie = LoginCookies[i];
        document.cookie = cookie.name + "=" + cookie.value;
    }
}

/* 刪除 cookie */
function DeleteCookies(cookies) {
    const cookieNames = Object.keys(cookies);
    for (let i = 0; i < cookieNames.length; i++) {
        let cookieName = cookieNames[i]; // 為了避免例外狀況沒刪除乾淨
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.exhentai.org";
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.e-hentai.org";
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}

/* 取得 Cookies */
function GetCookies() {
    let cookies = {} , cookiePairs = document.cookie.split("; ");
    for (let i = 0; i < cookiePairs.length; i++) {
        let cookiePair = cookiePairs[i].split("=");
        let cookieName = decodeURIComponent(cookiePair[0]);
        let cookieValue = decodeURIComponent(cookiePair[1]);
        cookies[cookieName] = cookieValue;
    }
    return cookies;
}
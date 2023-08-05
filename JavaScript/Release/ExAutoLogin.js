// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.15
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
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js
// @resource     jgrowl-css https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.css
// ==/UserScript==

/* ==================== 初始化設置 ==================== */
const language = display_language(navigator.language)
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
    ${GM_getResourceText("jgrowl-css")}
    .jGrowl {
        top: 0;
        left: 50%;
        width: 50rem;
        z-index: 9999;
        font-size: 3rem;
        border-radius: 3%;
        transform: translateX(-50%);
        text-align: center;
    }
    .show-modal-background {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
        position: fixed;
        overflow: auto;
        background-color: rgba(0,0,0,0.3);
    }
    .show-modal-content {
        width: 24%;
        padding: 20px;
        overflow: auto;
        margin: 5% auto;
        text-align: left;
        border-radius: 10px;
        border-collapse: collapse;
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
`);

/* 自動獲取 Cookies */
const GetCookiesAutomatically = GM_registerMenuCommand(
    language[0],
    function() {
        let cookies = GetCookies() , cookie_list = [];
        for (var cookieName in cookies) {
            if (cookies.hasOwnProperty(cookieName)) {
                var cookieValue = cookies[cookieName];
                cookie_list.push({"name" : cookieName,"value" : cookieValue})
            }
        }
        Cookies_Show(JSON.stringify(cookie_list, null, 4))
    }
)

/* 顯示自動獲取的 Cookies */
function Cookies_Show(cookie_list) {
    AdaptiveCSS(
        ".show-modal-content { background-color: #fefefe;}",
        ".show-modal-content { background-color: #34353b;}"
    );
    modal = `
        <div class="show-modal-background">
            <div class="show-modal-content">
            <h1 style="text-align:center;">${language[5]}</h1>
                <pre><b>${cookie_list}</b></pre>
                <div style="text-align: right;">
                    <button class="show-button" id="save">${language[6]}</button>
                    <button class="show-button" id="close">${language[7]}</button>
                </div>
            </div>
        </div>
    `
    $(document.body).append(modal);
    $(document).on('click', '#close, .show-modal-background', function(click) {
        if ($(click.target).hasClass('show-modal-background') || $(click.target).attr('id') === 'close') {
            $(document).off('click', '#close, .show-modal-background');
            $('.show-modal-background').remove();
        }
        click.stopPropagation();
    });
    AdaptiveCSS(
        ".jGrowl { background-color: #34353b; color: #fefefe;}",
        ".jGrowl { background-color: #fefefe; color: #5C0D11;}"
    );
    $(document).on('click', '#save', function() {
        GM_setValue("E/Ex_Cookies", cookie_list);
        $.jGrowl(language[9], {
            theme: "jGrowl",
            life: 1500,
        });
        $(document).off('click', '#save');
        $('.show-modal-background').remove();
    });
}

/* 手動輸入 Cookies */
const ManualSetting = GM_registerMenuCommand(
    language[1],
    function() {
        AdaptiveCSS(
            ".set-modal-content { background-color: #fefefe;}",
            ".set-modal-content { background-color: #34353b;}"
        );
        modal = `
            <div class="show-modal-background">
                <div class="set-modal-content">
                <h1>${language[14]}</h1>
                    <form id="set_cookies">
                        <div id="input_cookies" style="margin:10px">
                            [igneous] : <input class="set-list" type="text" name="igneous" placeholder="${language[15]}"><br>
                            [ipb_member_id] : <input class="set-list" type="text" name="ipb_member_id" placeholder="${language[16]}" required><br>
                            [ipb_pass_hash] : <input class="set-list" type="text" name="ipb_pass_hash" placeholder="${language[16]}" required><hr>
                            <h2>${language[17]}</h2>
                            [sl] : <input class="set-list" type="text" name="sl" value="dm_2"><br>
                            [sk] : <input class="set-list" type="text" name="sk" value="gy8wgij076agx1ax6is9htzrj40i"><br>
                            [yay] : <input class="set-list" type="text" name="yay" value="louder"><br>
                        </div>
                        <button type="submit" class="show-button" id="save">${language[6]}</button>
                        <button class="show-button" id="close">${language[8]}</button>
                    </form>
                </div>
            </div>
        `
        $(document.body).append(modal);
        // 創建文本元素
        const textarea = $("<textarea>").attr({
            style: "margin-top:20px",
            rows: 20,
            cols: 60,
            readonly: true
        });
        $(document).on('click', '#close, .show-modal-background', function(click) {
            if ($(click.target).hasClass('show-modal-background') || $(click.target).attr('id') === 'close') {
                $(document).off('click', '#close, .show-modal-background');
                $('.show-modal-background').remove();
            }
            click.stopPropagation();
        });
        $("#set_cookies").on("submit", function(event) {
            event.preventDefault(); // 阻止默認的表單提交行為
            if ($(event.originalEvent.submitter).attr("id") === "save") {
                const cookie_list = Array.from($("#set_cookies .set-list")).map(function(input) {
                    return { name: $(input).attr("name"), value: $(input).val() };
                });
                // 保存後 , 在獲取並轉換格式 , 並將其顯示
                GM_setValue("E/Ex_Cookies", JSON.stringify(cookie_list, null, 4));
                const cookies = JSON.parse(GM_getValue("E/Ex_Cookies", []));
                textarea.val(JSON.stringify(cookies, null, 4));
                // 將 textarea 添加到指定的 div 元素中
                $("#set_cookies div").append(textarea);
                $.jGrowl(language[18], {
                    theme: "jGrowl",
                    life: 3500
                });
            }
        });
    }
)

/* 查看保存的 Cookies */
const ViewSaveCookie = GM_registerMenuCommand(
    language[2],
    function() {
        AdaptiveCSS(
            ".set-modal-content { background-color: #fefefe;}",
            ".set-modal-content { background-color: #34353b;}"
        );
        modal = `
            <div class="show-modal-background">
                <div class="set-modal-content">
                <h1>${language[19]}</h1>
                    <div id="view_cookies" style="margin:10px"></div>
                    <button class="show-button" id="save">${language[11]}</button>
                    <button class="show-button" id="close">${language[8]}</button>
                </div>
            </div>
        `
        $(document.body).append(modal);
        // 展示
        const login_cookies = JSON.parse(GM_getValue("E/Ex_Cookies", []));
        const textarea = $("<textarea>").attr({
            rows: 20,
            cols: 60,
            id: "view_SC",
            style: "margin-top:20px",
        });
        textarea.val(JSON.stringify(login_cookies , null, 4))
        $("#view_cookies").append(textarea);
        // 監聽關閉
        $(document).on('click', '#close, .show-modal-background', function(click) {
            if ($(click.target).hasClass('show-modal-background') || $(click.target).attr('id') === 'close'){
                $(document).off('click', '#close, .show-modal-background');
                $('.show-modal-background').remove();
            }
            click.stopPropagation();
        });
        // 監聽改變保存
        $('#save').on('click', function() {
            GM_notification({
                title: language[12],
                text: language[13],
                image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                timeout: 4000
            });
            GM_setValue("E/Ex_Cookies", JSON.stringify(JSON.parse(document.getElementById("view_SC").value), null, 4));
            $(document).off('click', '#save');
            $('.show-modal-background').remove();
        });
    }
)

/* 手動注入 Cookies 登入 */
const CookieInjection = GM_registerMenuCommand(
    language[3],
    function() {
        try {
            DeleteCookies(GetCookies());
            AddCookies(JSON.parse(GM_getValue("E/Ex_Cookies", [])));
            GM_setValue("SessionTime", new Date().getTime());
            location.reload();
        } catch (error) {
            alert(language[20]);
        }
    }
);

/* 刪除所有 Cookies */
const CookieDelete = GM_registerMenuCommand(
    language[4],
    function() {
        DeleteCookies(GetCookies());
        location.reload();
    }
);

/* 登入檢測函數 */
async function AutomaticLoginCheck(login_cookies, Domain) {
    // 需要的 cookie 值
    let cookies = GetCookies(), RequiredCookies = ["ipb_member_id", "ipb_pass_hash"];
    if (Domain === "exhentai.org") {RequiredCookies = ["igneous", "ipb_member_id", "ipb_pass_hash"]}
    let cookiesFound = RequiredCookies.every(function(cookieName) {
        return cookies.hasOwnProperty(cookieName) && cookies[cookieName] !== undefined;
    });
    if (!cookiesFound || (!cookies.hasOwnProperty("igneous") || cookies.igneous === "mystery")) {
        DeleteCookies(cookies);
        AddCookies(login_cookies);
        location.reload();
    }
}

/* 自適應 css */
function AdaptiveCSS(e, ex) {
    Domain = window.location.hostname;
    if (Domain === "e-hentai.org") {
        GM_addStyle(`${e}`);
    } else if (Domain === "exhentai.org") {
        GM_addStyle(`${ex}`);
    }
}

/* 添加 cookie */
function AddCookies(LoginCookies) {
    let cookie, date = new Date();
    for (let i = 0; i < LoginCookies.length; i++) {
        cookie = LoginCookies[i]; // 添加一年後過期
        $.cookie(cookie.name, cookie.value, { expires: date.setFullYear(date.getFullYear() + 1) });
    }
}

/* 刪除 cookie */
function DeleteCookies(cookies) {
    const cookieName = Object.keys(cookies);
    for (let i = 0; i < cookieName.length; i++) {// 為了避免例外狀況沒刪除乾淨
        $.removeCookie(cookieName[i], { path: "/", domain: ".exhentai.org" });
        $.removeCookie(cookieName[i], { path: "/", domain: ".e-hentai.org" });
        $.removeCookie(cookieName[i], { path: "/" });
    }
}

/* 取得 Cookies */
function GetCookies() {
    let cookies = {};
    $.each($.cookie(), function(key, value) {
        cookies[key] = value;
    });
    return cookies;
}

/* 語言顯示 */
function display_language(language) {
    let display = {
        "zh-TW": [
            "📜 自動獲取 Cookies [請先登入]",
            "📝 手動輸入 Cookies",
            "🔍 查看保存的 Cookies",
            "🔃 手動注入 Cookies",
            "🗑️ 刪除所有 Cookies",
            "確認選擇的 Cookies",
            "確認保存",
            "取消退出",
            "退出選單",
            "保存成功!",
            "保存通知",
            "更改保存",
            "變更通知",
            "已保存變更",
            "設置 Cookies",
            "要登入 Ex 才需要填寫",
            "必填項目",
            "下方選填 也可不修改",
            "[確認輸入正確]按下退出選單保存",
            "當前設置 Cookies",
            "未檢測到可注入的 Cookies !!\n請從選單中進行設置"
        ],
        "zh-CN": [
            "📜 自动获取 Cookies [请先登录]",
            "📝 手动输入 Cookies",
            "🔍 查看保存的 Cookies",
            "🔃 手动注入 Cookies",
            "🗑️ 删除所有 Cookies",
            "确认选择的 Cookies",
            "确认保存",
            "取消退出",
            "退出菜单",
            "保存成功!",
            "保存通知",
            "更改保存",
            "变更通知",
            "已保存变更",
            "设置 Cookies",
            "要登录 Ex 才需要填写",
            "必填项目",
            "下方选填 也可不修改",
            "[确认输入正确]按下退出菜单保存",
            "当前设置 Cookies",
            "未检测到可注入的 Cookies !!\n请从菜单中进行设置"
        ],
        "ja": [
            '📜自動的にクッキーを取得する[ログインしてください]',
            '📝手動でクッキーを入力する',
            '🔍保存されたクッキーを見る',
            '🔃手動でクッキーを注入する',
            '🗑️すべてのクッキーを削除する',
            '選択したクッキーを確認する',
            '保存を確認する',
            'キャンセルして終了する',
            'メニューを終了する',
            '保存に成功しました!',
            '保存通知',
            '変更の保存',
            '変更通知',
            '変更が保存されました',
            'クッキーの設定',
            'Exにログインする必要があります',
            '必須項目',
            '下記は任意で、変更しなくても構いません',
            '[正しく入力されていることを確認してください]メニューを終了して保存します',
            '現在のクッキーの設定',
            '注入可能なクッキーが検出されませんでした!!\nメニューから設定してください'
        ],
        "en": [
            '📜 Automatically retrieve cookies [Please log in first]',
            '📝 Manually enter cookies',
            '🔍 View saved cookies',
            '🔃 Manually inject cookies',
            '🗑️ Delete all cookies',
            'Confirm selected cookies',
            'Confirm save',
            'Cancel and exit',
            'Exit menu',
            'Saved successfully!',
            'Save notification',
            'Change save',
            'Change notification',
            'Changes saved',
            'Set cookies',
            'Need to log in to Ex',
            'Required fields',
            'Optional below, can also not be modified',
            '[Make sure the input is correct] Press to exit the menu and save',
            'Current cookie settings',
            'No injectable cookies detected !!\nPlease set from the menu'
        ],
        "ko": [
            '📜 자동으로 쿠키 가져오기 [먼저 로그인하세요]',
            '📝 수동으로 쿠키 입력',
            '🔍 저장된 쿠키보기',
            '🔃 수동으로 쿠키 주입',
            '🗑️ 모든 쿠키 삭제',
            '선택한 쿠키 확인',
            '저장 확인',
            '취소하고 종료',
            '메뉴 종료',
            '저장 성공!',
            '저장 알림',
            '변경 저장',
            '변경 알림',
            '변경 사항이 저장되었습니다',
            '쿠키 설정',
            'Ex에 로그인해야합니다',
            '필수 항목',
            '아래는 선택적으로 수정하지 않아도됩니다',
            '[입력이 올바른지 확인하세요] 메뉴를 종료하고 저장하려면 누르세요',
            '현재 쿠키 설정',
            '주입 가능한 쿠키가 감지되지 않았습니다 !!\n메뉴에서 설정하세요'
        ]
    };
    return display[language] || display["en"];
}
// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.19
// @author       HentaiSaru
// @description         E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-TW   E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-CN   E/Ex - 共享帐号登录、自动获取 Cookies、手动输入 Cookies、本地备份以及查看备份，自动检测登录
// @description:ja      E/Ex - 共有アカウントでのログイン、クッキーの自动取得、クッキーの手动入力、ローカルバックアップおよびバックアップの表示、自动ログインの検出
// @description:ko      E/Ex - 공유 계정 로그인, 자동으로 쿠키 가져오기, 쿠키 수동 입력, 로컬 백업 및 백업 보기, 자동 로그인 감지
// @description:en      E/Ex - Shared account login, automatic cookie retrieval, manual cookie input, local backup, and backup viewing, automatic login detection

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-cookie/3.0.5/js.cookie.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.js
// @resource     jgrowl-css https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.css
// ==/UserScript==

(function() {
    var modal, domain = window.location.hostname;
    const language = display_language(navigator.language);
    let sessiontime = new Date(GM_getValue(`${domain}_SessionTime`, null)), time = new Date();

    /* ==================== 主運行 ==================== */
    if (isNaN(sessiontime)) {sessiontime = new Date(time.getTime() + 11 * 60 * 1000)} // 沒有時間戳時的預
    const conversion = (time - sessiontime) / (1000 * 60); // 轉換時間

    if (conversion > 10) {
        const cookie = GM_getValue("E/Ex_Cookies", null); // 獲取保存 Cookie
        if (cookie !== null) {
            CookieCheck(JSON.parse(cookie));
            GM_setValue(`${domain}_SessionTime`, time.getTime());
        }
    }

    /* ==================== 註冊菜單 ==================== */
    ImportStyle(); // 導入樣式
    GM_registerMenuCommand(language.RM_00, function(){SharedLogin()});
    GM_registerMenuCommand(language.RM_01, function(){GetCookiesAutomatically()});
    GM_registerMenuCommand(language.RM_02, function(){ManualSetting()});
    GM_registerMenuCommand(language.RM_03, function(){ViewSaveCookie()});
    GM_registerMenuCommand(language.RM_04, function(){CookieInjection()});
    GM_registerMenuCommand(language.RM_05, function(){CookieDelete()});

    /* ==================== API ==================== */

    /* Style 添加 */
    async function addstyle(rule) {
        let new_style = document.getElementById("New-Add-Style");
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = "New-Add-Style";
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(rule));
    }

    /* 通知展示 */
    async function Growl(message, theme, life) {
        $.jGrowl(message, {
            theme: theme,
            life: life
        });
    }

    /* 取得 Cookies */
    function GetCookies() {
        return Cookies.get();
    }

    /* 添加 cookie */
    function AddCookies(LoginCookies) {
        let cookie, date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        for (cookie of LoginCookies) {
            Cookies.set(cookie.name, cookie.value, { expires: date });
        }
    }

    /* 刪除 cookie */
    function DeleteCookies(cookies) {
        for (const Name of Object.keys(cookies)) {
            Cookies.remove(Name, { path: "/" })
            Cookies.remove(Name, { path: "/", domain: ".e-hentai.org" })
            Cookies.remove(Name, { path: "/", domain: ".exhentai.org" })
        }
    }

    /* 創建選單前檢測 */
    function CreateDetection(element) {
        const detection = $(element);
        if (detection[0]) {
            detection.remove();
        }
    }

    /* 獲取共享帳號 */
    function GetShare() {
        return [{
            1: [{"name":"igneous","value":"3fef094b8"},{"name":"ipb_member_id","value":"5191636"},{"name":"ipb_pass_hash","value":"544b6a81f07d356f3753032183d1fdfb"},{"name":"sl","value":"dm_2"}],
            2: [{"name":"igneous","value":"a471a8815"},{"name":"ipb_member_id","value":"7317440"},{"name":"ipb_pass_hash","value":"dbba714316273efe9198992d40a20172"},{"name":"sl","value":"dm_2"}],
        }][0]
    }

    /* ==================== 檢測注入 ==================== */
    
    /* 登入檢測 */
    async function CookieCheck(cookies) {
        let RequiredCookies = ["ipb_member_id", "ipb_pass_hash"]; // 需要的 cookie
        if (domain === "exhentai.org") {RequiredCookies.unshift("igneous")}
        const cookie = new Set(Object.keys(GetCookies())); // 檢測
        let cookiesFound = RequiredCookies.every(CookieName => cookie.has(CookieName));
        if (!cookiesFound) { // 判斷
            DeleteCookies(cookie);
            AddCookies(cookies);
            location.reload();
        }
    }

    /* ==================== 菜單功能觸發 ==================== */

    /* 共享號登入 */
    async function SharedLogin() {
        const Share = GetShare();
        const AccountQuantity = Object.keys(Share).length

        CreateDetection(".modal-background");
        modal = `
            <div class="modal-background">
                <div class="acc-modal">
                <h1>${language.SM_17}</h1>
                    <div class="acc-flex">
                        <select id="account-select" class="acc-select"></select>
                        <button class="modal-button" id="login">${language.SM_18}</button>
                    </div>
                </div>
            </div>
        `

        $(document.body).append(modal);
        for (let i = 1; i <= AccountQuantity; i++) {
            const option = $("<option>").attr({value: i}).text(`${language.SM_19} ${i}`);
            $("#account-select").append(option);
        }

        $(document).on("click", ".modal-background, #login", function(event) {
            if ($(event.target).hasClass("modal-background")) {
                $(document).off("click", ".modal-background, #login");
                $(".modal-background").remove();
            } else if ($(event.target).attr("id") === "login") {
                DeleteCookies(GetCookies());
                AddCookies(Share[+$("#account-select").val()]);
                GM_setValue(`${domain}_SessionTime`, new Date().getTime());
                location.reload();
            }
            event.stopPropagation();
        });
    }
    
    /* 自動獲取 Cookies */
    async function GetCookiesAutomatically() {
        let cookie_box = [];
        for (const [name, value] of Object.entries(GetCookies())) {
            cookie_box.push({"name": name, "value" : value});
        }
        if (cookie_box.length > 1) {
            Cookie_Show(JSON.stringify(cookie_box, null, 4));
        } else {
            alert(language.SM_15);
        }
    }
    /* 展示自動獲取 Cookies */
    async function Cookie_Show(cookies){
        CreateDetection(".modal-background");
        modal = `
            <div class="modal-background">
                <div class="show-modal">
                <h1 style="text-align: center;">${language.SM_01}</h1>
                    <pre><b>${cookies}</b></pre>
                    <div style="text-align: right;">
                        <button class="modal-button" id="save">${language.SM_02}</button>
                        <button class="modal-button" id="close">${language.SM_03}</button>
                    </div>
                </div>
            </div>
        `
        $(document.body).append(modal);
        $(document).on('click', '#close, .modal-background', function(click) {
            if ($(click.target).hasClass('modal-background') || $(click.target).attr('id') === 'close') {
                $(document).off('click', '#close, .show-modal-background');
                $('.modal-background').remove();
            }
            click.stopPropagation();
        });
        $(document).on('click', '#save', function() {
            GM_setValue("E/Ex_Cookies", cookies);
            Growl(language.SM_05, "jGrowl", 1500);
            $(document).off('click', '#save');
            $('.modal-background').remove();
        });
    }

    /* 手動設置 Cookies */
    async function ManualSetting() {
        CreateDetection(".modal-background");
        modal = `
            <div class="modal-background">
                <div class="set-modal">
                <h1>${language.SM_09}</h1>
                    <form id="set_cookies">
                        <div id="input_cookies" class="set-box">
                            <label>[igneous]：</label><input class="set-list" type="text" name="igneous" placeholder="${language.SM_10}"><br>
                            <label>[ipb_member_id]：</label><input class="set-list" type="text" name="ipb_member_id" placeholder="${language.SM_11}" required><br>
                            <label>[ipb_pass_hash]：</label><input class="set-list" type="text" name="ipb_pass_hash" placeholder="${language.SM_11}" required><hr>
                            <h3>${language.SM_12}</h3>
                            <label>[sl]：</label><input class="set-list" type="text" name="sl" value="dm_2"><br>
                            <label>[sk]：</label><input class="set-list" type="text" name="sk"><br>
                        </div>
                        <button type="submit" class="modal-button" id="save">${language.SM_02}</button>
                        <button class="modal-button" id="close">${language.SM_04}</button>
                    </form>
                </div>
            </div>
        `
        $(document.body).append(modal);
        const textarea = $("<textarea>").attr({
            style: "margin-top: 1.15rem",
            rows: 20,
            cols: 50,
            readonly: true
        });
        $(document).on('click', '#close, .modal-background', function(click) {
            if ($(click.target).hasClass('modal-background') || $(click.target).attr('id') === 'close') {
                $(document).off('click', '#close, .modal-background');
                $('.modal-background').remove();
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
                const cookie = JSON.parse(GM_getValue("E/Ex_Cookies", null));
                textarea.val(JSON.stringify(cookie, null, 4));
                // 將 textarea 添加到指定的 div 元素中
                $("#set_cookies div").append(textarea);
                Growl(language.SM_13, "jGrowl", 3500);
            }
        });
    }

    /* 查看保存的 Cookies */
    async function ViewSaveCookie() {
        CreateDetection(".modal-background");
        modal = `
            <div class="modal-background">
                <div class="set-modal">
                <h1>${language.SM_14}</h1>
                    <div id="view_cookies" style="margin: 0.6rem"></div>
                    <button class="modal-button" id="save">${language.SM_06}</button>
                    <button class="modal-button" id="close">${language.SM_04}</button>
                </div>
            </div>
        `
        $(document.body).append(modal);
        const cookie = JSON.parse(GM_getValue("E/Ex_Cookies", null)) || [];
        const textarea = $("<textarea>").attr({
            rows: 20,
            cols: 50,
            id: "view_SC",
            style: "margin-top: 1.25rem",
        });
        textarea.val(JSON.stringify(cookie , null, 4));
        $("#view_cookies").append(textarea);
        // 監聽關閉
        $(document).on('click', '#close, .modal-background', function(click) {
            if ($(click.target).hasClass('modal-background') || $(click.target).attr('id') === 'close'){
                $(document).off('click', '#close, .modal-background');
                $('.modal-background').remove();
            }
            click.stopPropagation();
        });
        // 監聽改變保存
        $('#save').on('click', function() {
            GM_notification({
                title: language.SM_07,
                text: language.SM_08,
                image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                timeout: 4000
            });
            GM_setValue("E/Ex_Cookies", JSON.stringify(JSON.parse(document.getElementById("view_SC").value), null, 4));
            $(document).off('click', '#save');
            $('.modal-background').remove();
        });
    }

    /* 手動注入 Cookies 登入 */
    async function CookieInjection() {
        try {
            DeleteCookies(GetCookies());
            AddCookies(JSON.parse(GM_getValue("E/Ex_Cookies", null)));
            GM_setValue(`${domain}_SessionTime`, new Date().getTime());
            location.reload();
        } catch (error) {
            alert(language.SM_16);
        }
    }

    /* 刪除所有 Cookies */
    async function CookieDelete() {
        DeleteCookies(GetCookies());
        location.reload();
    }

    /* ==================== 依賴項目 ==================== */

    /* 導入 Style */
    async function ImportStyle() {
        let show_style, button_style, button_hover, jGrowl_style, acc_style;
        GM_addStyle(GM_getResourceText("jgrowl-css"));
        if (domain === "e-hentai.org") {
            button_hover = "color: #8f4701;"
            jGrowl_style = "background-color: #5C0D12; color: #fefefe;"
            show_style = "background-color: #fefefe; border: 3px ridge #34353b;"
            acc_style = "color: #5C0D12; background-color: #fefefe; border: 2px solid #B5A4A4;"
            button_style = "color: #5C0D12; border: 2px solid #B5A4A4; background-color: #fefefe;"
        } else if (domain === "exhentai.org") {
            button_hover = "color: #989898;"
            jGrowl_style = "background-color: #fefefe; color: #5C0D12;"
            show_style = "background-color: #34353b; border: 2px ridge #5C0D12;"
            acc_style = "color: #f1f1f1; background-color: #34353b; border: 2px solid #8d8d8d;"
            button_style = "color: #fefefe; border: 2px solid #8d8d8d; background-color: #34353b;"
            addstyle(`
                body {
                    padding: 2px;
                    color: #f1f1f1;
                    text-align: center;
                    background: #34353b;
                }
            `)
        }
        addstyle(`
            .jGrowl {
                ${jGrowl_style}
                top: 0;
                left: 50%;
                z-index: 9999;
                font-size: 1.5rem;
                border-radius: 2px;
                text-align: center;
                transform: translateX(-50%);
            }
            .modal-background {
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9998;
                position: fixed;
                overflow: auto;
                background-color: rgba(0,0,0,0.5);
            }
            .acc-modal {
                ${show_style}
                width: 20%;
                overflow: auto;
                margin: 1rem auto;
                border-radius: 10px;
            }
            .acc-flex {
                display: flex;
                align-items: center;
                flex-direction: initial;
                justify-content: space-around;
            }
            .acc-select {
                ${acc_style}
                width: 10rem;
                padding: 4px;
                margin: 1.1rem 1.4rem 1.5rem 1.4rem;
                font-weight: bold;
                cursor: pointer;
                font-size: 1.2rem;
                text-align: center;
                border-radius: 5px;
            }
            .show-modal {
                ${show_style}
                width: 25%;
                padding: 1.5rem;
                overflow: auto;
                margin: 1rem auto;
                text-align: left;
                border-radius: 10px;
                border-collapse: collapse;
            }
            .modal-button {
                ${button_style}
                top: 0;
                margin: 3% 2%;
                font-size: 14px;
                font-weight: bold;
                border-radius: 3px;
            }
            .modal-button:hover, .modal-button:focus {
                ${button_hover}
                cursor: pointer;
                text-decoration: none;
            }
            .set-modal {
                ${show_style}
                width: 30rem;
                padding: 0.3rem;
                overflow: auto;
                border-radius: 10px;
                text-align: center;
                border-collapse: collapse;
                margin: 2% auto 8px auto;
            }
            .set-box {
                display: flex;
                margin: 0.6rem;
                font-weight: bold;
                flex-direction: column;
                align-items: flex-start;
            }
            .set-list {
                width: 95%;
                font-weight: 550;
                font-size: 1.1rem;
                text-align: center;
            }
            hr {
                width: 98%;
                opacity: 0.2;
                border: 1px solid;
                margin-top: 1.3rem;
            }
            label {
                font-size: 0.9rem;
                margin: 0.4rem;
            }
        `)
    }

    /* 語言顯示 */
    function display_language(language) {
        let display = {
            "zh-TW": [{
                "RM_00": "🍪 共享登入",
                "RM_01": "📜 自動獲取",
                "RM_02": "📝 手動輸入",
                "RM_03": "🔍 查看保存",
                "RM_04": "🔃 手動注入",
                "RM_05": "🗑️ 清除登入",
                "SM_01": "確認選擇的 Cookies",
                "SM_02": "確認保存",
                "SM_03": "取消退出",
                "SM_04": "退出選單",
                "SM_05": "保存成功!",
                "SM_06": "更改保存",
                "SM_07": "變更通知",
                "SM_08": "已保存變更",
                "SM_09": "設置 Cookies",
                "SM_10": "要登入 Ex 才需要填寫",
                "SM_11": "必填項目",
                "SM_12": "下方選填 也可不修改",
                "SM_13": "[確認輸入正確]按下退出選單保存",
                "SM_14": "當前設置 Cookies",
                "SM_15": "未獲取到 Cookies !!\n\n請先登入帳戶",
                "SM_16": "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置",
                "SM_17": "帳戶選擇",
                "SM_18": "登入",
                "SM_19": "帳號"
            }],
            "zh-CN": [{
                "RM_00": "🍪 共享登录",
                "RM_01": "📜 自动获取",
                "RM_02": "📝 手动输入",
                "RM_03": "🔍 查看保存",
                "RM_04": "🔃 手动注入",
                "RM_05": "🗑️ 清除登录",
                "SM_01": "确认选择的 Cookies",
                "SM_02": "确认保存",
                "SM_03": "取消退出",
                "SM_04": "退出菜单",
                "SM_05": "保存成功!",
                "SM_06": "更改保存",
                "SM_07": "变更通知",
                "SM_08": "已保存变更",
                "SM_09": "设置 Cookies",
                "SM_10": "要登录 Ex 才需要填写",
                "SM_11": "必填项目",
                "SM_12": "下方选填 也可不修改",
                "SM_13": "[确认输入正确]按下退出菜单保存",
                "SM_14": "当前设置 Cookies",
                "SM_15": "未获取到 Cookies !!\n\n请先登录账户",
                "SM_16": "未检测到可注入的 Cookies !!\n\n请从菜单中进行设置",
                "SM_17": "帐户选择",
                "SM_18": "登录",
                "SM_19": "帐号"
            }],
            "ja": [{
                "RM_00": "🍪 共有ログイン",
                "RM_01": "📜 自動取得",
                "RM_02": "📝 手動入力",
                "RM_03": "🔍 保存を見る",
                "RM_04": "🔃 手動注入",
                "RM_05": "🗑️ ログインをクリア",
                "SM_01": "選択したクッキーを確認する",
                "SM_02": "保存を確認する",
                "SM_03": "キャンセルして終了する",
                "SM_04": "メニューを終了する",
                "SM_05": "保存に成功しました!",
                "SM_06": "変更の保存",
                "SM_07": "変更通知",
                "SM_08": "変更が保存されました",
                "SM_09": "クッキーの設定",
                "SM_10": "Exにログインする必要があります",
                "SM_11": "必須項目",
                "SM_12": "下記は任意で、変更しなくても構いません",
                "SM_13": "[正しく入力されていることを確認してください]メニューを終了して保存します",
                "SM_14": "現在のクッキーの設定",
                "SM_15": "Cookies を取得できませんでした !!\n\n最初にアカウントにログインしてください",
                "SM_16": "注入可能なクッキーが検出されませんでした!!\n\nメニューから設定してください",
                "SM_17": "アカウント选択",
                "SM_18": "ログイン",
                "SM_19": "アカウント"
            }],
            "en-US": [{
                "RM_00": "🍪 Shared Login",
                "RM_01": "📜 Automatically get",
                "RM_02": "📝 Manual input",
                "RM_03": "🔍 View saved",
                "RM_04": "🔃 Manual injection",
                "RM_05": "🗑️ Clear Login",
                "SM_01": "Confirm selected cookies",
                "SM_02": "Confirm save",
                "SM_03": "Cancel and exit",
                "SM_04": "Exit menu",
                "SM_05": "Saved successfully!",
                "SM_06": "Change save",
                "SM_07": "Change notification",
                "SM_08": "Changes saved",
                "SM_09": "Set cookies",
                "SM_10": "Need to log in to Ex",
                "SM_11": "Required fields",
                "SM_12": "Optional below, can also not be modified",
                "SM_13": "[Make sure the input is correct] Press to exit the menu and save",
                "SM_14": "Current cookie settings",
                "SM_15": "Failed to get Cookies !!\n\nPlease log in to your account first",
                "SM_16": "No injectable cookies detected !!\n\nPlease set from the menu",
                "SM_17": "Account Selection",
                "SM_18": "Log In",
                "SM_19": "Account"
            }],
            "ko": [{
                "RM_00": "🍪 공유 로그인",
                "RM_01": "📜 자동으로 가져오기",
                "RM_02": "📝 수동 입력",
                "RM_03": "🔍 저장된 것 보기",
                "RM_04": "🔃 수동 주입",
                "RM_05": "🗑️ 로그인 지우기",
                "SM_01": "선택한 쿠키 확인",
                "SM_02": "저장 확인",
                "SM_03": "취소하고 종료",
                "SM_04": "메뉴 종료",
                "SM_05": "저장 성공!",
                "SM_06": "변경 저장",
                "SM_07": "변경 알림",
                "SM_08": "변경 사항이 저장되었습니다",
                "SM_09": "쿠키 설정",
                "SM_10": "Ex에 로그인해야합니다",
                "SM_11": "필수 항목",
                "SM_12": "아래는 선택적으로 수정하지 않아도됩니다",
                "SM_13": "[입력이 올바른지 확인하세요] 메뉴를 종료하고 저장하려면 누르세요",
                "SM_14": "현재 쿠키 설정",
                "SM_15": "Cookies를 가져오지 못했습니다 !!\n\n먼저 계정에 로그인하십시오",
                "SM_16": "주입 가능한 쿠키가 감지되지 않았습니다 !!\n\n메뉴에서 설정하세요",
                "SM_17": "계정 선택",
                "SM_18": "로그인",
                "SM_19": "계정"
            }]
        };

        if (display.hasOwnProperty(language)) {
            return display[language][0];
        } else {
            return display["en-US"][0];
        }
    }
})();
// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.27
// @author       Canaan HS
// @description         E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-TW   E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-CN   E/Ex - 共享帐号登录、自动获取 Cookies、手动输入 Cookies、本地备份以及查看备份，自动检测登录
// @description:ja      E/Ex - 共有アカウントでのログイン、クッキーの自动取得、クッキーの手动入力、ローカルバックアップおよびバックアップの表示、自动ログインの検出
// @description:ko      E/Ex - 공유 계정 로그인, 자동으로 쿠키 가져오기, 쿠키 수동 입력, 로컬 백업 및 백업 보기, 자동 로그인 감지
// @description:en      E/Ex - Shared account login, automatic cookie retrieval, manual cookie input, local backup, and backup viewing, automatic login detection

// @match        *://e-hentai.org/*
// @match        *://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/js-cookie/3.0.5/js.cookie.min.js
// @require      https://update.greasyfork.org/scripts/487608/1365414/SyntaxSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.js
// @resource     jgrowl-css https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.css
// ==/UserScript==

(function() {
    const def = new Syntax(), domain = location.hostname, lang = language(navigator.language);

    class Cookie_Operations {
        constructor() {
            /* 取得 Cookies */
            this.GetCookie = () => Cookies.get();
            /* 添加 cookie */
            this.AddCookie = (LoginCookies) => {
                let cookie, date = new Date();
                date.setFullYear(date.getFullYear() + 1);
                for (cookie of LoginCookies) {
                    Cookies.set(cookie.name, cookie.value, { expires: date });
                }
            }
            /* 刪除 cookie */
            this.DeleteCookie = () => {
                for (const Name of Object.keys(Cookies.get())) {
                    Cookies.remove(Name, { path: "/" });
                    Cookies.remove(Name, { path: "/", domain: `.${domain}` });
                }
            }
        }
    }

    (new class AutoLogin extends Cookie_Operations {
        constructor() {
            super();
            this.modal = null;

            /* 共享帳號 */
            this.Share = () => {
                return {
                    1: [{"name":"igneous","value":"cjlxia7km3va6v1cbly"},{"name":"ipb_member_id","value":"8176350"},{"name":"ipb_pass_hash","value":"ff951af3fcfdf0d596e284bfc2fc8812"},{"name":"sl","value":"dm_2"}],
                    2: [{"name":"igneous","value":"day3o30a0n6zig1cbm2"},{"name":"ipb_member_id","value":"8176372"},{"name":"ipb_pass_hash","value":"7838c2242a12a66e0ed4e0401f1c2a42"},{"name":"sl","value":"dm_2"}],
                    3: [{"name":"igneous","value":"eebe6f1e6"},{"name":"ipb_member_id","value":"7498513"},{"name":"ipb_pass_hash","value":"e36bf990b97f805acb2dd5588440c203"},{"name":"sl","value":"dm_2"}],
                    4: [{"name":"igneous","value":"3fef094b8"},{"name":"ipb_member_id","value":"5191636"},{"name":"ipb_pass_hash","value":"544b6a81f07d356f3753032183d1fdfb"},{"name":"sl","value":"dm_2"}],
                    5: [{"name":"igneous","value":"a471a8815"},{"name":"ipb_member_id","value":"7317440"},{"name":"ipb_pass_hash","value":"dbba714316273efe9198992d40a20172"},{"name":"sl","value":"dm_2"}],
                    6: [{"name":"igneous","value":"cf2fa3bca"},{"name":"ipb_member_id","value":"7711946"},{"name":"ipb_pass_hash","value":"15f08fb3ee7a311293b00d888c6889a7"},{"name":"sl","value":"dm_2"}],
                }
            }

            /* 添加監聽器 */
            this.on = async(element, type, listener) => {
                $(element).on(type, listener);
            }

            /* 通知展示 */
            this.Growl = async(message, theme, life) => {
                $.jGrowl(`&emsp;&emsp;${message}&emsp;&emsp;`, {
                    theme: theme,
                    life: life
                });
            }

            /* 創建選單前檢測 (刪除重創) */
            this.CreateDetection = () => {
                const detection = $(".modal-background");
                detection[0] && detection.remove();
            }

            /* 創建菜單 */
            this.CreateMenu = async() => {
                $(document.body).append(this.modal);
                requestAnimationFrame(()=> {
                    $(".modal-background").css({
                        "opacity": "1",
                        "background-color": "rgba(0,0,0,0.5)",
                        "transform": "translate(-50%, -50%) scale(1)"
                    });
                });
            }

            /* 刪除菜單 */
            this.DeleteMenu = async() => {
                const modal = $(".modal-background");
                modal.css({
                    "opacity": "0",
                    "pointer-events": "none",
                    "background-color": "rgba(0,0,0,0)",
                    "transform": "translate(-50%, -50%) scale(0)"
                });
                setTimeout(()=> {modal.remove()}, 1300);
            }

            /* 監聽選單切換, 全局套用 */
            this.GlobalMenuToggle = async() => {
                def.storeListen(["Expand"], listen=> {
                    listen.far && this.MenuToggle();
                });
            }

            /* 切換開合選單 */
            this.MenuToggle = async() => {
                const state = def.store("g", "Expand", false),
                disp = state ? lang.RM_C1 : lang.RM_C0;
                def.Menu({
                    [disp]: {func: ()=> {
                        state
                        ? def.store("s", "Expand", false)
                        : def.store("s", "Expand", true);
                        this.MenuToggle();
                    }, hotkey: "c", close: false}
                }, "Switch");
                // 開合需要比切換菜單晚創建, 不然會跑版
                state ? this.Expand() : this.Collapse();
            }

            /* 創建延伸選單 */
            this.Expand = async() => {
                def.Menu({
                    [lang.RM_01]: {func: ()=> this.GetCookieAutomatically() },
                    [lang.RM_02]: {func: ()=> this.ManualSetting() },
                    [lang.RM_03]: {func: ()=> this.ViewSaveCookie() },
                    [lang.RM_04]: {func: ()=> this.CookieInjection() },
                    [lang.RM_05]: {func: ()=> this.ClearLogin() },
                }, "Expand");
            }

            /* 刪除延伸選單 */
            this.Collapse = async() => {
                for (let i=1; i <= 5; i++) {GM_unregisterMenuCommand("Expand-" + i)}
            }
        }

        /* 主要調用 */
        async Main() {
            let CurrentTime = new Date(), DetectionTime = def.Storage("DetectionTime", {type: localStorage});
            DetectionTime = DetectionTime ? new Date(DetectionTime) : new Date(CurrentTime.getTime() + 11 * 60 * 1000);

            const Conversion = (DetectionTime - CurrentTime) / (1000 * 60), self = this; // 轉換時間
            if (Conversion >= 10) { // 隔 10 分鐘檢測
                const cookie = def.store("gj", "E/Ex_Cookies");
                cookie && CookieCheck(cookie);
                def.Storage("DetectionTime", {type: localStorage, value: CurrentTime.getTime()});
            }

            /* 登入檢測 */
            async function CookieCheck(cookies) {
                let RequiredCookies = ["ipb_member_id", "ipb_pass_hash"];
                if (domain == "exhentai.org") {RequiredCookies.unshift("igneous")}

                const cookie = new Set(Object.keys(self.GetCookie()));
                const CookieFound = RequiredCookies.every(Name => cookie.has(Name));

                if (!CookieFound) { // 判斷
                    self.DeleteCookie();
                    self.AddCookie(cookies);
                    location.reload();
                }
            }

            /* 創建選單 */
            def.Menu({[lang.RM_00]: {func: ()=> this.SharedLogin()}});
            this.MenuToggle();
            this.GlobalMenuToggle();
        }

        /* 共享號登入 */
        async SharedLogin() {
            this.CreateDetection();
            const Share = this.Share(), AccountQuantity = Object.keys(Share).length, Igneous = this.GetCookie().igneous;

            // 創建選項模板
            let Select = $(`<select id="account-select" class="acc-select"></select>`), Value;
            for (let i = 1; i <= AccountQuantity; i++) { // 判斷選擇值
                if (Share[i][0].value == Igneous) {
                    Value = i;
                }
                Select.append($("<option>").attr({value: i}).text(`${lang.SM_19} ${i}`));
            }

            // 創建菜單模板
            this.modal = $(`
                <div class="modal-background">
                    <div class="acc-modal">
                        <h1>${lang.SM_17}</h1>
                        <div class="acc-flex">
                            ${Select.prop("outerHTML")}
                            <button class="modal-button" id="login">${lang.SM_18}</button>
                        </div>
                    </div>
                </div>
            `);

            // 創建菜單
            this.CreateMenu();
            // 如果有選擇值, 就進行選取
            Value && $("#account-select").val(Value);

            const self = this;
            self.on(".modal-background", "click", function(click) {
                click.stopImmediatePropagation();

                const target = click.target;
                if (target.id == "login") {
                    self.DeleteCookie();
                    def.Storage("DetectionTime", {type: localStorage, value: new Date().getTime()});
                    self.AddCookie(Share[+$("#account-select").val()]);
                    location.reload();
                } else if (target.className == "modal-background") {
                    self.DeleteMenu();
                }
            });
        }

        /* 自動獲取 Cookies */
        async GetCookieAutomatically() {
            let cookie_box = [];
            for (const [name, value] of Object.entries(this.GetCookie())) {
                cookie_box.push({"name": name, "value" : value});
            }
            cookie_box.length > 1
            ? this.Cookie_Show(JSON.stringify(cookie_box, null, 4))
            : alert(lang.SM_15);
        }
        /* 展示自動獲取 Cookies */
        async Cookie_Show(cookies){
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="show-modal">
                    <h1 style="text-align: center;">${lang.SM_01}</h1>
                        <pre><b>${cookies}</b></pre>
                        <div style="text-align: right;">
                            <button class="modal-button" id="save">${lang.SM_02}</button>
                            <button class="modal-button" id="close">${lang.SM_03}</button>
                        </div>
                    </div>
                </div>
            `
            this.CreateMenu();
            const self = this;
            self.on(".modal-background", "click", function(click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.id == "save") {
                    def.store("s", "E/Ex_Cookies", cookies);
                    self.Growl(lang.SM_05, "jGrowl", 1500);
                    self.DeleteMenu();
                } else if (target.className == "modal-background" || target.id == "close") {
                    self.DeleteMenu();
                }
            });
        }

        /* 手動設置 Cookies */
        async ManualSetting() {
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${lang.SM_09}</h1>
                        <form id="set_cookies">
                            <div id="input_cookies" class="set-box">
                                <label>[igneous]：</label><input class="set-list" type="text" name="igneous" placeholder="${lang.SM_10}"><br>
                                <label>[ipb_member_id]：</label><input class="set-list" type="text" name="ipb_member_id" placeholder="${lang.SM_11}" required><br>
                                <label>[ipb_pass_hash]：</label><input class="set-list" type="text" name="ipb_pass_hash" placeholder="${lang.SM_11}" required><hr>
                                <h3>${lang.SM_12}</h3>
                                <label>[sl]：</label><input class="set-list" type="text" name="sl" value="dm_2"><br>
                                <label>[sk]：</label><input class="set-list" type="text" name="sk"><br>
                            </div>
                            <button type="submit" class="modal-button" id="save">${lang.SM_02}</button>
                            <button class="modal-button" id="close">${lang.SM_04}</button>
                        </form>
                    </div>
                </div>
            `
            this.CreateMenu();

            let cookie;
            const textarea = $("<textarea>").attr({
                style: "margin: 1.15rem auto 0 auto",
                rows: 18,
                cols: 40,
                readonly: true

            }), self = this;

            self.on("#set_cookies", "submit", function(submit) {
                submit.preventDefault();
                submit.stopImmediatePropagation();
                const cookie_list = Array.from($("#set_cookies .set-list")).map(function(input) {
                    const value = $(input).val();
                    return value.trim() !== "" ? { name: $(input).attr("name"), value: value } : null;
                }).filter(Boolean);

                cookie = JSON.stringify(cookie_list, null, 4);
                textarea.val(cookie);
                $("#set_cookies div").append(textarea);
                self.Growl(lang.SM_13, "jGrowl", 3000);
            });

            self.on(".modal-background", "click", function(click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.className == "modal-background" || target.id == "close") {
                    click.preventDefault();
                    cookie && def.store("s", "E/Ex_Cookies", cookie);
                    self.DeleteMenu();
                }
            });
        }

        /* 查看保存的 Cookies */ //! 等待修改為 模板創建, 再添加
        async ViewSaveCookie() {
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${lang.SM_14}</h1>
                        <div id="view_cookies" style="margin: 0.6rem"></div>
                        <button class="modal-button" id="save">${lang.SM_06}</button>
                        <button class="modal-button" id="close">${lang.SM_04}</button>
                    </div>
                </div>
            `
            this.CreateMenu();
            const cookie = def.store("gj", "E/Ex_Cookies");
            const textarea = $("<textarea>").attr({
                rows: 20,
                cols: 50,
                id: "view_SC",
                style: "margin-top: 1.25rem;"

            }), self = this;
            textarea.val(JSON.stringify(cookie , null, 4));
            $("#view_cookies").append(textarea);

            self.on(".modal-background", "click", function(click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.id == "save") { // 保存改變
                    GM_notification({
                        title: lang.SM_07,
                        text: lang.SM_08,
                        image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                        timeout: 3000
                    });
                    def.store("sj", "E/Ex_Cookies", JSON.parse($("#view_SC").val()));
                    self.DeleteMenu();
                } else if (target.className == "modal-background" || target.id == "close") {
                    self.DeleteMenu();
                }
            });
        }

        /* 手動注入 Cookies 登入 */
        async CookieInjection() {
            try {
                this.DeleteCookie();
                this.AddCookie(def.store("gj", "E/Ex_Cookies"));
                def.Storage("DetectionTime", {type: localStorage, value: new Date().getTime()});
                location.reload();
            } catch (error) {
                alert(lang.SM_16);
            }
        }

        /* 清除登入狀態 */
        async ClearLogin() {
            this.DeleteCookie();
            location.reload();
        }
    }).Main();

    (new class Style {
        /* 導入 Style */
        async Import() {
            let show_style, button_style, button_hover, jGrowl_style, acc_style;
            if (domain == "e-hentai.org") {
                button_hover = "color: #8f4701;"
                jGrowl_style = "background-color: #5C0D12; color: #fefefe;"
                show_style = "background-color: #fefefe; border: 3px ridge #34353b;"
                acc_style = "color: #5C0D12; background-color: #fefefe; border: 2px solid #B5A4A4;"
                button_style = "color: #5C0D12; border: 2px solid #B5A4A4; background-color: #fefefe;"
            } else if (domain == "exhentai.org") {
                button_hover = "color: #989898;"
                jGrowl_style = "background-color: #fefefe; color: #5C0D12;"
                show_style = "background-color: #34353b; border: 2px ridge #5C0D12;"
                acc_style = "color: #f1f1f1; background-color: #34353b; border: 2px solid #8d8d8d;"
                button_style = "color: #fefefe; border: 2px solid #8d8d8d; background-color: #34353b;"
                def.AddStyle(`
                    body {
                        padding: 2px;
                        color: #f1f1f1;
                        text-align: center;
                        background: #34353b;
                    }
                `)
            }
            def.AddStyle(`
                ${GM_getResourceText("jgrowl-css")}
                .jGrowl {
                    ${jGrowl_style}
                    top: 0;
                    left: 50%;
                    width: auto;
                    z-index: 9999;
                    font-size: 1.3rem;
                    border-radius: 2px;
                    text-align: center;
                    white-space: nowrap;
                    transform: translateX(-50%);
                }
                .modal-background {
                    top: 50%;
                    left: 50%;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    overflow: auto;
                    position: fixed;
                    transition: 0.6s ease;
                    background-color: rgba(0,0,0,0);
                    transform: translate(-50%, -50%) scale(0.3);
                }
                .acc-modal {
                    ${show_style}
                    width: 20%;
                    overflow: auto;
                    margin: 10rem auto;
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
                    margin: 5rem auto;
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
                    width: 35rem;
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
                    margin: 0.4rem;
                    font-size: 0.9rem;
                }
            `);
        }
    }).Import();

    function language(lang) {
        const Display = {
            Traditional: {
                RM_00: "🍪 共享登入",
                RM_C0: "📂 展開菜單",
                RM_C1: "📁 摺疊菜單",
                RM_01: "📜 自動獲取",
                RM_02: "📝 手動輸入",
                RM_03: "🔍 查看保存",
                RM_04: "🔃 手動注入",
                RM_05: "🗑️ 清除登入",
                SM_01: "確認選擇的 Cookies",
                SM_02: "確認保存",
                SM_03: "取消退出",
                SM_04: "退出選單",
                SM_05: "保存成功!",
                SM_06: "更改保存",
                SM_07: "變更通知",
                SM_08: "已保存變更",
                SM_09: "設置 Cookies",
                SM_10: "要登入 Ex 才需要填寫",
                SM_11: "必填項目",
                SM_12: "下方選填 也可不修改",
                SM_13: "[確認輸入正確]按下退出選單保存",
                SM_14: "當前設置 Cookies",
                SM_15: "未獲取到 Cookies !!\n\n請先登入帳戶",
                SM_16: "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置",
                SM_17: "帳戶選擇",
                SM_18: "登入",
                SM_19: "帳號"
            },
            Simplified: {
                RM_00: "🍪 共享登录",
                RM_C0: "📂 展开菜单",
                RM_C1: "📁 折叠菜单",
                RM_01: "📜 自动获取",
                RM_02: "📝 手动输入",
                RM_03: "🔍 查看保存",
                RM_04: "🔃 手动注入",
                RM_05: "🗑️ 清除登录",
                SM_01: "确认选择的 Cookies",
                SM_02: "确认保存",
                SM_03: "取消退出",
                SM_04: "退出菜单",
                SM_05: "保存成功!",
                SM_06: "更改保存",
                SM_07: "变更通知",
                SM_08: "已保存变更",
                SM_09: "设置 Cookies",
                SM_10: "要登录 Ex 才需要填写",
                SM_11: "必填项目",
                SM_12: "下方选填 也可不修改",
                SM_13: "[确认输入正确]按下退出菜单保存",
                SM_14: "当前设置 Cookies",
                SM_15: "未获取到 Cookies !!\n\n请先登录账户",
                SM_16: "未检测到可注入的 Cookies !!\n\n请从菜单中进行设置",
                SM_17: "帐户选择",
                SM_18: "登录",
                SM_19: "帐号"
            },
            English: {
                RM_00: "🍪 Shared Login",
                RM_C0: "📂 Expand menu",
                RM_C1: "📁 Collapse menu",
                RM_01: "📜 Automatically get",
                RM_02: "📝 Manual input",
                RM_03: "🔍 View saved",
                RM_04: "🔃 Manual injection",
                RM_05: "🗑️ Clear Login",
                SM_01: "Confirm selected cookies",
                SM_02: "Confirm save",
                SM_03: "Cancel and exit",
                SM_04: "Exit menu",
                SM_05: "Saved successfully!",
                SM_06: "Change save",
                SM_07: "Change notification",
                SM_08: "Changes saved",
                SM_09: "Set cookies",
                SM_10: "Need to log in to Ex",
                SM_11: "Required fields",
                SM_12: "Optional below, can also not be modified",
                SM_13: "[Make sure the input is correct] Press to exit the menu and save",
                SM_14: "Current cookie settings",
                SM_15: "Failed to get Cookies !!\n\nPlease log in to your account first",
                SM_16: "No injectable cookies detected !!\n\nPlease set from the menu",
                SM_17: "Account Selection",
                SM_18: "Log In",
                SM_19: "Account"
            },
            Korea: {
                RM_00: "🍪 공유 로그인",
                RM_C0: "📂 메뉴 펼치기",
                RM_C1: "📁 메뉴 접기",
                RM_01: "📜 자동으로 가져오기",
                RM_02: "📝 수동 입력",
                RM_03: "🔍 저장된 것 보기",
                RM_04: "🔃 수동 주입",
                RM_05: "🗑️ 로그인 지우기",
                SM_01: "선택한 쿠키 확인",
                SM_02: "저장 확인",
                SM_03: "취소하고 종료",
                SM_04: "메뉴 종료",
                SM_05: "저장 성공!",
                SM_06: "변경 저장",
                SM_07: "변경 알림",
                SM_08: "변경 사항이 저장되었습니다",
                SM_09: "쿠키 설정",
                SM_10: "Ex에 로그인해야합니다",
                SM_11: "필수 항목",
                SM_12: "아래는 선택적으로 수정하지 않아도됩니다",
                SM_13: "[입력이 올바른지 확인하세요] 메뉴를 종료하고 저장하려면 누르세요",
                SM_14: "현재 쿠키 설정",
                SM_15: "Cookies를 가져오지 못했습니다 !!\n\n먼저 계정에 로그인하십시오",
                SM_16: "주입 가능한 쿠키가 감지되지 않았습니다 !!\n\n메뉴에서 설정하세요",
                SM_17: "계정 선택",
                SM_18: "로그인",
                SM_19: "계정"
            },
            Japan: {
                RM_00: "🍪 共有ログイン",
                RM_C0: "📂 メニューを展開する",
                RM_C1: "📁 メニューを折りたたむ",
                RM_01: "📜 自動取得",
                RM_02: "📝 手動入力",
                RM_03: "🔍 保存を見る",
                RM_04: "🔃 手動注入",
                RM_05: "🗑️ ログインをクリア",
                SM_01: "選択したクッキーを確認する",
                SM_02: "保存を確認する",
                SM_03: "キャンセルして終了する",
                SM_04: "メニューを終了する",
                SM_05: "保存に成功しました!",
                SM_06: "変更の保存",
                SM_07: "変更通知",
                SM_08: "変更が保存されました",
                SM_09: "クッキーの設定",
                SM_10: "Exにログインする必要があります",
                SM_11: "必須項目",
                SM_12: "下記は任意で、変更しなくても構いません",
                SM_13: "[正しく入力されていることを確認してください]メニューを終了して保存します",
                SM_14: "現在のクッキーの設定",
                SM_15: "Cookies を取得できませんでした !!\n\n最初にアカウントにログインしてください",
                SM_16: "注入可能なクッキーが検出されませんでした!!\n\nメニューから設定してください",
                SM_17: "アカウント选択",
                SM_18: "ログイン",
                SM_19: "アカウント"
            }
        }, Match = {
            "ko": Display.Korea,
            "ja": Display.Japan,
            "en-US": Display.English,
            "zh-CN": Display.Simplified,
            "zh-SG": Display.Simplified,
            "zh-TW": Display.Traditional,
            "zh-HK": Display.Traditional,
            "zh-MO": Display.Traditional,
        };
        return Match[lang] || Match["en-US"];
    }
})();
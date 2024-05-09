// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.28
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
(function () {
    const f = new Syntax, l = location.hostname, d = function (a) {
        var c = {
            RM_00: "\ud83c\udf6a \u5171\u4eab\u767b\u5165", RM_C0: "\ud83d\udcc2 \u5c55\u958b\u83dc\u55ae", RM_C1: "\ud83d\udcc1 \u647a\u758a\u83dc\u55ae", RM_01: "\ud83d\udcdc \u81ea\u52d5\u7372\u53d6", RM_02: "\ud83d\udcdd \u624b\u52d5\u8f38\u5165", RM_03: "\ud83d\udd0d \u67e5\u770b\u4fdd\u5b58", RM_04: "\ud83d\udd03 \u624b\u52d5\u6ce8\u5165", RM_05: "\ud83d\uddd1\ufe0f \u6e05\u9664\u767b\u5165", SM_01: "\u78ba\u8a8d\u9078\u64c7\u7684 Cookies", SM_02: "\u78ba\u8a8d\u4fdd\u5b58",
            SM_03: "\u53d6\u6d88\u9000\u51fa", SM_04: "\u9000\u51fa\u9078\u55ae", SM_05: "\u4fdd\u5b58\u6210\u529f!", SM_06: "\u66f4\u6539\u4fdd\u5b58", SM_07: "\u8b8a\u66f4\u901a\u77e5", SM_08: "\u5df2\u4fdd\u5b58\u8b8a\u66f4", SM_09: "\u8a2d\u7f6e Cookies", SM_10: "\u8981\u767b\u5165 Ex \u624d\u9700\u8981\u586b\u5beb", SM_11: "\u5fc5\u586b\u9805\u76ee", SM_12: "\u4e0b\u65b9\u9078\u586b \u4e5f\u53ef\u4e0d\u4fee\u6539", SM_13: "[\u78ba\u8a8d\u8f38\u5165\u6b63\u78ba]\u6309\u4e0b\u9000\u51fa\u9078\u55ae\u4fdd\u5b58", SM_14: "\u7576\u524d\u8a2d\u7f6e Cookies",
            SM_15: "\u672a\u7372\u53d6\u5230 Cookies !!\n\n\u8acb\u5148\u767b\u5165\u5e33\u6236", SM_16: "\u672a\u6aa2\u6e2c\u5230\u53ef\u6ce8\u5165\u7684 Cookies !!\n\n\u8acb\u5f9e\u9078\u55ae\u4e2d\u9032\u884c\u8a2d\u7f6e", SM_17: "\u5e33\u6236\u9078\u64c7", SM_18: "\u767b\u5165", SM_19: "\u5e33\u865f"
        }, b = {
            RM_00: "\ud83c\udf6a \u5171\u4eab\u767b\u5f55", RM_C0: "\ud83d\udcc2 \u5c55\u5f00\u83dc\u5355", RM_C1: "\ud83d\udcc1 \u6298\u53e0\u83dc\u5355", RM_01: "\ud83d\udcdc \u81ea\u52a8\u83b7\u53d6", RM_02: "\ud83d\udcdd \u624b\u52a8\u8f93\u5165",
            RM_03: "\ud83d\udd0d \u67e5\u770b\u4fdd\u5b58", RM_04: "\ud83d\udd03 \u624b\u52a8\u6ce8\u5165", RM_05: "\ud83d\uddd1\ufe0f \u6e05\u9664\u767b\u5f55", SM_01: "\u786e\u8ba4\u9009\u62e9\u7684 Cookies", SM_02: "\u786e\u8ba4\u4fdd\u5b58", SM_03: "\u53d6\u6d88\u9000\u51fa", SM_04: "\u9000\u51fa\u83dc\u5355", SM_05: "\u4fdd\u5b58\u6210\u529f!", SM_06: "\u66f4\u6539\u4fdd\u5b58", SM_07: "\u53d8\u66f4\u901a\u77e5", SM_08: "\u5df2\u4fdd\u5b58\u53d8\u66f4", SM_09: "\u8bbe\u7f6e Cookies", SM_10: "\u8981\u767b\u5f55 Ex \u624d\u9700\u8981\u586b\u5199",
            SM_11: "\u5fc5\u586b\u9879\u76ee", SM_12: "\u4e0b\u65b9\u9009\u586b \u4e5f\u53ef\u4e0d\u4fee\u6539", SM_13: "[\u786e\u8ba4\u8f93\u5165\u6b63\u786e]\u6309\u4e0b\u9000\u51fa\u83dc\u5355\u4fdd\u5b58", SM_14: "\u5f53\u524d\u8bbe\u7f6e Cookies", SM_15: "\u672a\u83b7\u53d6\u5230 Cookies !!\n\n\u8bf7\u5148\u767b\u5f55\u8d26\u6237", SM_16: "\u672a\u68c0\u6d4b\u5230\u53ef\u6ce8\u5165\u7684 Cookies !!\n\n\u8bf7\u4ece\u83dc\u5355\u4e2d\u8fdb\u884c\u8bbe\u7f6e", SM_17: "\u5e10\u6237\u9009\u62e9", SM_18: "\u767b\u5f55", SM_19: "\u5e10\u53f7"
        };
        c = {
            ko: {
                RM_00: "\ud83c\udf6a \uacf5\uc720 \ub85c\uadf8\uc778", RM_C0: "\ud83d\udcc2 \uba54\ub274 \ud3bc\uce58\uae30", RM_C1: "\ud83d\udcc1 \uba54\ub274 \uc811\uae30", RM_01: "\ud83d\udcdc \uc790\ub3d9\uc73c\ub85c \uac00\uc838\uc624\uae30", RM_02: "\ud83d\udcdd \uc218\ub3d9 \uc785\ub825", RM_03: "\ud83d\udd0d \uc800\uc7a5\ub41c \uac83 \ubcf4\uae30", RM_04: "\ud83d\udd03 \uc218\ub3d9 \uc8fc\uc785", RM_05: "\ud83d\uddd1\ufe0f \ub85c\uadf8\uc778 \uc9c0\uc6b0\uae30", SM_01: "\uc120\ud0dd\ud55c \ucfe0\ud0a4 \ud655\uc778",
                SM_02: "\uc800\uc7a5 \ud655\uc778", SM_03: "\ucde8\uc18c\ud558\uace0 \uc885\ub8cc", SM_04: "\uba54\ub274 \uc885\ub8cc", SM_05: "\uc800\uc7a5 \uc131\uacf5!", SM_06: "\ubcc0\uacbd \uc800\uc7a5", SM_07: "\ubcc0\uacbd \uc54c\ub9bc", SM_08: "\ubcc0\uacbd \uc0ac\ud56d\uc774 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4", SM_09: "\ucfe0\ud0a4 \uc124\uc815", SM_10: "Ex\uc5d0 \ub85c\uadf8\uc778\ud574\uc57c\ud569\ub2c8\ub2e4", SM_11: "\ud544\uc218 \ud56d\ubaa9", SM_12: "\uc544\ub798\ub294 \uc120\ud0dd\uc801\uc73c\ub85c \uc218\uc815\ud558\uc9c0 \uc54a\uc544\ub3c4\ub429\ub2c8\ub2e4",
                SM_13: "[\uc785\ub825\uc774 \uc62c\ubc14\ub978\uc9c0 \ud655\uc778\ud558\uc138\uc694] \uba54\ub274\ub97c \uc885\ub8cc\ud558\uace0 \uc800\uc7a5\ud558\ub824\uba74 \ub204\ub974\uc138\uc694", SM_14: "\ud604\uc7ac \ucfe0\ud0a4 \uc124\uc815", SM_15: "Cookies\ub97c \uac00\uc838\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4 !!\n\n\uba3c\uc800 \uacc4\uc815\uc5d0 \ub85c\uadf8\uc778\ud558\uc2ed\uc2dc\uc624", SM_16: "\uc8fc\uc785 \uac00\ub2a5\ud55c \ucfe0\ud0a4\uac00 \uac10\uc9c0\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4 !!\n\n\uba54\ub274\uc5d0\uc11c \uc124\uc815\ud558\uc138\uc694",
                SM_17: "\uacc4\uc815 \uc120\ud0dd", SM_18: "\ub85c\uadf8\uc778", SM_19: "\uacc4\uc815"
            }, ja: {
                RM_00: "\ud83c\udf6a \u5171\u6709\u30ed\u30b0\u30a4\u30f3", RM_C0: "\ud83d\udcc2 \u30e1\u30cb\u30e5\u30fc\u3092\u5c55\u958b\u3059\u308b", RM_C1: "\ud83d\udcc1 \u30e1\u30cb\u30e5\u30fc\u3092\u6298\u308a\u305f\u305f\u3080", RM_01: "\ud83d\udcdc \u81ea\u52d5\u53d6\u5f97", RM_02: "\ud83d\udcdd \u624b\u52d5\u5165\u529b", RM_03: "\ud83d\udd0d \u4fdd\u5b58\u3092\u898b\u308b", RM_04: "\ud83d\udd03 \u624b\u52d5\u6ce8\u5165", RM_05: "\ud83d\uddd1\ufe0f \u30ed\u30b0\u30a4\u30f3\u3092\u30af\u30ea\u30a2",
                SM_01: "\u9078\u629e\u3057\u305f\u30af\u30c3\u30ad\u30fc\u3092\u78ba\u8a8d\u3059\u308b", SM_02: "\u4fdd\u5b58\u3092\u78ba\u8a8d\u3059\u308b", SM_03: "\u30ad\u30e3\u30f3\u30bb\u30eb\u3057\u3066\u7d42\u4e86\u3059\u308b", SM_04: "\u30e1\u30cb\u30e5\u30fc\u3092\u7d42\u4e86\u3059\u308b", SM_05: "\u4fdd\u5b58\u306b\u6210\u529f\u3057\u307e\u3057\u305f!", SM_06: "\u5909\u66f4\u306e\u4fdd\u5b58", SM_07: "\u5909\u66f4\u901a\u77e5", SM_08: "\u5909\u66f4\u304c\u4fdd\u5b58\u3055\u308c\u307e\u3057\u305f", SM_09: "\u30af\u30c3\u30ad\u30fc\u306e\u8a2d\u5b9a",
                SM_10: "Ex\u306b\u30ed\u30b0\u30a4\u30f3\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059", SM_11: "\u5fc5\u9808\u9805\u76ee", SM_12: "\u4e0b\u8a18\u306f\u4efb\u610f\u3067\u3001\u5909\u66f4\u3057\u306a\u304f\u3066\u3082\u69cb\u3044\u307e\u305b\u3093", SM_13: "[\u6b63\u3057\u304f\u5165\u529b\u3055\u308c\u3066\u3044\u308b\u3053\u3068\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044]\u30e1\u30cb\u30e5\u30fc\u3092\u7d42\u4e86\u3057\u3066\u4fdd\u5b58\u3057\u307e\u3059", SM_14: "\u73fe\u5728\u306e\u30af\u30c3\u30ad\u30fc\u306e\u8a2d\u5b9a",
                SM_15: "Cookies \u3092\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f !!\n\n\u6700\u521d\u306b\u30a2\u30ab\u30a6\u30f3\u30c8\u306b\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u304f\u3060\u3055\u3044", SM_16: "\u6ce8\u5165\u53ef\u80fd\u306a\u30af\u30c3\u30ad\u30fc\u304c\u691c\u51fa\u3055\u308c\u307e\u305b\u3093\u3067\u3057\u305f!!\n\n\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u8a2d\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044", SM_17: "\u30a2\u30ab\u30a6\u30f3\u30c8\u9009\u629e", SM_18: "\u30ed\u30b0\u30a4\u30f3",
                SM_19: "\u30a2\u30ab\u30a6\u30f3\u30c8"
            }, "en-US": {
                RM_00: "\ud83c\udf6a Shared Login", RM_C0: "\ud83d\udcc2 Expand menu", RM_C1: "\ud83d\udcc1 Collapse menu", RM_01: "\ud83d\udcdc Automatically get", RM_02: "\ud83d\udcdd Manual input", RM_03: "\ud83d\udd0d View saved", RM_04: "\ud83d\udd03 Manual injection", RM_05: "\ud83d\uddd1\ufe0f Clear Login", SM_01: "Confirm selected cookies", SM_02: "Confirm save", SM_03: "Cancel and exit", SM_04: "Exit menu", SM_05: "Saved successfully!", SM_06: "Change save", SM_07: "Change notification",
                SM_08: "Changes saved", SM_09: "Set cookies", SM_10: "Need to log in to Ex", SM_11: "Required fields", SM_12: "Optional below, can also not be modified", SM_13: "[Make sure the input is correct] Press to exit the menu and save", SM_14: "Current cookie settings", SM_15: "Failed to get Cookies !!\n\nPlease log in to your account first", SM_16: "No injectable cookies detected !!\n\nPlease set from the menu", SM_17: "Account Selection", SM_18: "Log In", SM_19: "Account"
            }, "zh-CN": b, "zh-SG": b, "zh-TW": c, "zh-HK": c, "zh-MO": c
        }; return c[a] || c["en-US"]
    }(navigator.language); class m { constructor() { this.GetCookie = () => Cookies.get(); this.AddCookie = a => { let c, b = new Date; b.setFullYear(b.getFullYear() + 1); for (c of a) Cookies.set(c.name, c.value, { expires: b }) }; this.DeleteCookie = () => { for (const a of Object.keys(Cookies.get())) Cookies.remove(a, { path: "/" }), Cookies.remove(a, { path: "/", domain: `.${l}` }) } } } (new class extends m {
        constructor() {
            super(); this.modal = null; this.Share = () => ({
                1: [{ name: "igneous", value: "cjlxia7km3va6v1cbly" }, { name: "ipb_member_id", value: "8176350" }, { name: "ipb_pass_hash", value: "ff951af3fcfdf0d596e284bfc2fc8812" }, { name: "sl", value: "dm_2" }],
                2: [{ name: "igneous", value: "day3o30a0n6zig1cbm2" }, { name: "ipb_member_id", value: "8176372" }, { name: "ipb_pass_hash", value: "7838c2242a12a66e0ed4e0401f1c2a42" }, { name: "sl", value: "dm_2" }],
                3: [{ name: "igneous", value: "eebe6f1e6" }, { name: "ipb_member_id", value: "7498513" }, { name: "ipb_pass_hash", value: "e36bf990b97f805acb2dd5588440c203" }, { name: "sl", value: "dm_2" }],
                4: [{ name: "igneous", value: "3fef094b8" }, { name: "ipb_member_id", value: "5191636" }, { name: "ipb_pass_hash", value: "544b6a81f07d356f3753032183d1fdfb" }, { name: "sl", value: "dm_2" }],
                5: [{ name: "igneous", value: "a471a8815" }, { name: "ipb_member_id", value: "7317440" }, { name: "ipb_pass_hash", value: "dbba714316273efe9198992d40a20172" }, { name: "sl", value: "dm_2" }],
                6: [{ name: "igneous", value: "cf2fa3bca" }, { name: "ipb_member_id", value: "7711946" }, { name: "ipb_pass_hash", value: "15f08fb3ee7a311293b00d888c6889a7" }, { name: "sl", value: "dm_2" }]
            }); this.on = async (a, c, b) => { $(a).on(c, b) }; this.Growl = async (a, c, b) => {
                $.jGrowl(`&emsp;&emsp;${a}&emsp;&emsp;`,
                    { theme: c, life: b })
            }; this.CreateDetection = () => { const a = $(".modal-background"); a[0] && a.remove() }; this.CreateMenu = async () => { $(document.body).append(this.modal); requestAnimationFrame(() => { $(".modal-background").css({ opacity: "1", "background-color": "rgba(0,0,0,0.5)", transform: "translate(-50%, -50%) scale(1)" }) }) }; this.DeleteMenu = async () => {
                const a = $(".modal-background"); a.css({ opacity: "0", "pointer-events": "none", "background-color": "rgba(0,0,0,0)", transform: "translate(-50%, -50%) scale(0)" }); setTimeout(() => { a.remove() }, 1300)
            }; this.GlobalMenuToggle = async () => { f.storeListen(["Expand"], a => { a.far && this.MenuToggle() }) }; this.MenuToggle = async () => { const a = f.store("g", "Expand", !1); f.Menu({ [a ? d.RM_C1 : d.RM_C0]: { func: () => { a ? f.store("s", "Expand", !1) : f.store("s", "Expand", !0); this.MenuToggle() }, hotkey: "c", close: !1 } }, "Switch"); a ? this.Expand() : this.Collapse() }; this.Expand = async () => {
                f.Menu({
                    [d.RM_01]: { func: () => this.GetCookieAutomatically() }, [d.RM_02]: { func: () => this.ManualSetting() }, [d.RM_03]: { func: () => this.ViewSaveCookie() },
                    [d.RM_04]: { func: () => this.CookieInjection() }, [d.RM_05]: { func: () => this.ClearLogin() }
                }, "Expand")
            }; this.Collapse = async () => { for (let a = 1; 5 >= a; a++)GM_unregisterMenuCommand("Expand-" + a) }
        } async Main() {
            async function a(g) { let k = ["ipb_member_id", "ipb_pass_hash"]; "exhentai.org" == l && k.unshift("igneous"); const h = new Set(Object.keys(e.GetCookie())); k.every(n => h.has(n)) || (e.DeleteCookie(), e.AddCookie(g), location.reload()) } let c = new Date; var b = f.Storage("DetectionTime"); b = b ? new Date(b) : new Date(c.getTime() + 66E4);
            const e = this; 10 <= (b - c) / 6E4 && ((b = f.store("gj", "E/Ex_Cookies")) && a(b), f.Storage("DetectionTime", { value: c.getTime() })); f.Menu({ [d.RM_00]: { func: () => this.SharedLogin() } }); this.MenuToggle(); this.GlobalMenuToggle()
        } async SharedLogin() {
            this.CreateDetection(); const a = this.Share(), c = Object.keys(a).length, b = this.GetCookie().igneous; let e = $('<select id="account-select" class="acc-select"></select>'), g; for (let h = 1; h <= c; h++)a[h][0].value == b && (g = h), e.append($("<option>").attr({ value: h }).text(`${d.SM_19} ${h}`));
            this.modal = $(`
                <div class="modal-background">
                    <div class="acc-modal">
                        <h1>${d.SM_17}</h1>
                        <div class="acc-flex">
                            ${e.prop("outerHTML")}
                            <button class="modal-button" id="login">${d.SM_18}</button>
                        </div>
                    </div>
                </div>
            `); this.CreateMenu(); g && $("#account-select").val(g); const k = this; k.on(".modal-background", "click", function (h) { h.stopImmediatePropagation(); h = h.target; "login" == h.id ? (k.DeleteCookie(), f.Storage("DetectionTime", { value: (new Date).getTime() }), k.AddCookie(a[+$("#account-select").val()]), location.reload()) : "modal-background" == h.className && k.DeleteMenu() })
        } async GetCookieAutomatically() {
            let a = []; for (const [c, b] of Object.entries(this.GetCookie())) a.push({ name: c, value: b }); 1 < a.length ? this.Cookie_Show(JSON.stringify(a,
                null, 4)) : alert(d.SM_15)
        } async Cookie_Show(a) {
            this.CreateDetection(); this.modal = `
                <div class="modal-background">
                    <div class="show-modal">
                    <h1 style="text-align: center;">${d.SM_01}</h1>
                        <pre><b>${a}</b></pre>
                        <div style="text-align: right;">
                            <button class="modal-button" id="save">${d.SM_02}</button>
                            <button class="modal-button" id="close">${d.SM_03}</button>
                        </div>
                    </div>
                </div>
            `; this.CreateMenu(); const c = this; c.on(".modal-background", "click", function (b) { b.stopImmediatePropagation(); b = b.target; "save" == b.id ? (f.store("s", "E/Ex_Cookies", a), c.Growl(d.SM_05, "jGrowl", 1500), c.DeleteMenu()) : "modal-background" != b.className && "close" != b.id || c.DeleteMenu() })
        } async ManualSetting() {
            this.CreateDetection(); this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${d.SM_09}</h1>
                        <form id="set_cookies">
                            <div id="input_cookies" class="set-box">
                                <label>[igneous]\uff1a</label><input class="set-list" type="text" name="igneous" placeholder="${d.SM_10}"><br>
                                <label>[ipb_member_id]\uff1a</label><input class="set-list" type="text" name="ipb_member_id" placeholder="${d.SM_11}" required><br>
                                <label>[ipb_pass_hash]\uff1a</label><input class="set-list" type="text" name="ipb_pass_hash" placeholder="${d.SM_11}" required><hr>
                                <h3>${d.SM_12}</h3>
                                <label>[sl]\uff1a</label><input class="set-list" type="text" name="sl" value="dm_2"><br>
                                <label>[sk]\uff1a</label><input class="set-list" type="text" name="sk"><br>
                            </div>
                            <button type="submit" class="modal-button" id="save">${d.SM_02}</button>
                            <button class="modal-button" id="close">${d.SM_04}</button>
                        </form>
                    </div>
                </div>
            `; this.CreateMenu(); let a; const c = $("<textarea>").attr({ style: "margin: 1.15rem auto 0 auto", rows: 18, cols: 40, readonly: !0 }), b = this; b.on("#set_cookies", "submit", function (e) { e.preventDefault(); e.stopImmediatePropagation(); e = Array.from($("#set_cookies .set-list")).map(function (g) { const k = $(g).val(); return "" !== k.trim() ? { name: $(g).attr("name"), value: k } : null }).filter(Boolean); a = JSON.stringify(e, null, 4); c.val(a); $("#set_cookies div").append(c); b.Growl(d.SM_13, "jGrowl", 3E3) }); b.on(".modal-background",
                "click", function (e) { e.stopImmediatePropagation(); const g = e.target; if ("modal-background" == g.className || "close" == g.id) e.preventDefault(), a && f.store("s", "E/Ex_Cookies", a), b.DeleteMenu() })
        } async ViewSaveCookie() {
            this.CreateDetection(); this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${d.SM_14}</h1>
                        <div id="view_cookies" style="margin: 0.6rem"></div>
                        <button class="modal-button" id="save">${d.SM_06}</button>
                        <button class="modal-button" id="close">${d.SM_04}</button>
                    </div>
                </div>
            `; this.CreateMenu(); const a = f.store("gj", "E/Ex_Cookies"), c = $("<textarea>").attr({ rows: 20, cols: 50, id: "view_SC", style: "margin-top: 1.25rem;" }), b = this; c.val(JSON.stringify(a, null, 4)); $("#view_cookies").append(c); b.on(".modal-background", "click", function (e) {
                e.stopImmediatePropagation(); e = e.target; "save" == e.id ? (GM_notification({ title: d.SM_07, text: d.SM_08, image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png", timeout: 3E3 }), f.store("sj", "E/Ex_Cookies", JSON.parse($("#view_SC").val())),
                    b.DeleteMenu()) : "modal-background" != e.className && "close" != e.id || b.DeleteMenu()
            })
        } async CookieInjection() { try { this.DeleteCookie(), this.AddCookie(f.store("gj", "E/Ex_Cookies")), f.Storage("DetectionTime", { value: (new Date).getTime() }), location.reload() } catch (a) { alert(d.SM_16) } } async ClearLogin() { this.DeleteCookie(); location.reload() }
    }).Main(); (new class {
        async Import() {
            let a, c, b, e, g; "e-hentai.org" == l ? (b = "color: #8f4701;", e = "background-color: #5C0D12; color: #fefefe;", a = "background-color: #fefefe; border: 3px ridge #34353b;",
                g = "color: #5C0D12; background-color: #fefefe; border: 2px solid #B5A4A4;", c = "color: #5C0D12; border: 2px solid #B5A4A4; background-color: #fefefe;") : "exhentai.org" == l && (b = "color: #989898;", e = "background-color: #fefefe; color: #5C0D12;", a = "background-color: #34353b; border: 2px ridge #5C0D12;", g = "color: #f1f1f1; background-color: #34353b; border: 2px solid #8d8d8d;", c = "color: #fefefe; border: 2px solid #8d8d8d; background-color: #34353b;", f.AddStyle("body {padding: 2px;color: #f1f1f1;text-align: center;background: #34353b;}"));
            f.AddStyle(`
                ${GM_getResourceText("jgrowl-css")}
                .jGrowl {${e}top: 0;left: 50%;width: auto;z-index: 9999;font-size: 1.3rem;border-radius: 2px;text-align: center;white-space: nowrap;transform: translateX(-50%);}
                .modal-background {top: 50%;left: 50%;opacity: 0;width: 100%;height: 100%;z-index: 9999;overflow: auto;position: fixed;transition: 0.6s ease;background-color: rgba(0,0,0,0);transform: translate(-50%, -50%) scale(0.3);}
                .acc-modal {${a}width: 20%;overflow: auto;margin: 10rem auto;border-radius: 10px;}
                .acc-flex {display: flex;align-items: center;flex-direction: initial;justify-content: space-around;}
                .acc-select {${g}width: 10rem;padding: 4px;margin: 1.1rem 1.4rem 1.5rem 1.4rem;font-weight: bold;cursor: pointer;font-size: 1.2rem;text-align: center;border-radius: 5px;}
                .show-modal {${a}width: 25%;padding: 1.5rem;overflow: auto;margin: 5rem auto;text-align: left;border-radius: 10px;border-collapse: collapse;}
                .modal-button {${c}top: 0;margin: 3% 2%;font-size: 14px;font-weight: bold;border-radius: 3px;}
                .modal-button:hover, .modal-button:focus {${b}cursor: pointer;text-decoration: none;}
                .set-modal {${a}width: 35rem;padding: 0.3rem;overflow: auto;border-radius: 10px;text-align: center;border-collapse: collapse;margin: 2% auto 8px auto;}
                .set-box {display: flex;margin: 0.6rem;font-weight: bold;flex-direction: column;align-items: flex-start;}
                .set-list {width: 95%;font-weight: 550;font-size: 1.1rem;text-align: center;}
                hr {width: 98%;opacity: 0.2;border: 1px solid;margin-top: 1.3rem;}
                label {margin: 0.4rem;font-size: 0.9rem;}
            `)
        }
    }).Import()
})();
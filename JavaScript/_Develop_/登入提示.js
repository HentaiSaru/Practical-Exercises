// ==UserScript==
// @name        登入提示
// @name:zh-TW  登入提示
// @name:zh-CN  登入提示
// @name:ja     登入提示
// @name:ko     登入提示
// @name:en     登入提示
// @version      0.0.1
// @author       Canaan HS
// @description        登入提示
// @description:zh-TW  登入提示
// @description:zh-CN  登入提示
// @description:ja     登入提示
// @description:ko     登入提示
// @description:en     登入提示

// @match        *://hgamefree.info/wp-login.php
// @match        *://blackmod.net/login/
// @icon

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/487608/1374594/SyntaxSimplified.js
// ==/UserScript==

/**
 * 保存輸入帳號, 密碼
 * 密碼進行加密, 密碼添加顯示眼睛
 * 加密Key設置, 選擇是否加密
 * 調整選單設置, 背景色, 文字色, 透明度, 位置
 * PBKDF2 : 用於使用用戶密碼, 生成key值進行加密
 * OpenSSL : 生成 IV 值
 * AES : 進行加密
 * MD5 : 生成 Key
 * sjcl : 進行加密
 */

(function() {
    const def = new Syntax();
    class AutoLogin {
        constructor() {
            this.Url = def.Device.Url;
            this.Domain = def.Device.Host;
            this.LoginInfo = def.store("g", this.Domain, {});
        }

        async Save() {
            const save = prompt("輸入以下數據, 請確實按照順序輸入\n帳號, 密碼, 其餘操作");

            if (save && save != "") {
                const data = save.split(/\s*[,]\s*/), box = {Account: "", Password: "", Operate: ""};

                if (data.length > 1) {
                    Object.keys(box).forEach((key, index) => { // 遍歷 box 的 key, 並根據索引填入, data 的對應索引值
                        box[key] = data[index] || "";
                    });

                    // 保存最終數據
                    def.store("s", this.Domain, Object.assign({ Url: this.Url }, box));

                    GM_notification({
                        title: "保存成功",
                        text: "以存入登入資訊",
                        timeout: 1500
                    });
                } else {
                    alert("輸入錯誤");
                }
            }
        }

        async Main() {
            // 檢測登入資訊中, 是否含有當前網址
            const Info = this.LoginInfo;
            if (Info?.Url == this.Url) {
                const click = new MouseEvent("click", { // 創建點擊事件, 避免有被阻止的情況
                    bubbles: true,
                    cancelable: true
                });

                def.WaitElem("input[type='password']", password=> {
                    const login = [...def.$$("input[type='submit'], button[type='submit']", {all: true})].slice(1);

                    // 帳號輸入類型的可能有多個, 暴力解法全部都輸入
                    def.$$("input[type='text']", {all: true}).forEach(account => {
                        account.value = Info.Account;
                    });
                    // 輸入密碼
                    password.value = Info.Password;

                    // 先不進行自動登入
                    // setTimeout(()=> {
                        // login.length > 0 && login[0].dispatchEvent(click);
                    // }, 500);

                }, {raf: true, timeout: 15, timeoutResult: true});
            }

            def.Menu({
                "📝 輸入登入資訊": {func: ()=> this.Save()}
            })
        }
    }

    const Login = new AutoLogin();
    Login.Main();
})();
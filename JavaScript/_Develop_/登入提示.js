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
// @icon

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/487608/1365414/SyntaxSimplified.js
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

// 帳號 input type="text"
// 密碼 input type="password"

(function() {
    const def = new Syntax();
    class AutoLogin {
        constructor() {
            this.Url = location.href;
            this.Domain = location.hostname;
            this.LoginInfo = def.store("g", "LoginInfo", {});
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
                    def.store("s", "LoginInfo", {
                        [this.Domain]: Object.assign({ Url: this.Url }, box)
                    });

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
            const Info = this.LoginInfo?.[this.Domain];
            if (Info?.Url == this.Url) {
                def.WaitMap([
                    "input[type='text']",
                    "input[type='password']",
                    "input[type='checkbox'], button[type='checkbox']",
                    "input[type='submit'], button[type='submit']"
                ], found=> {
                    const [account, password, check, login] = found;

                    account.value = Info.Account;
                    password.value = Info.Password;

                    const click = new MouseEvent("click", { // 使用點擊事件, 避免有被阻止的狀態
                        bubbles: true,
                        cancelable: true
                    });

                    check.dispatchEvent(click);
                    login.dispatchEvent(click);

                }, {raf: true, timeout: 15, timeoutResult: true});
                // console.log(Info.Verify);
            }

            def.Menu({
                "📝 輸入登入資訊": {func: ()=> this.Save()}
            })
        }
    }

    const Login = new AutoLogin();
    Login.Main();
})();
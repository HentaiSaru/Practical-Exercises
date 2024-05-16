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

// @match        *://*/*login*
// @icon

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js
// @require      https://update.greasyfork.org/scripts/487608/1377784/SyntaxSimplified.js
// ==/UserScript==

/**
 * 保存輸入帳號, 密碼
 * 密碼進行加密, 密碼添加顯示眼睛
 * 
 * 加密Key設置, 選擇是否加密
 * 調整選單設置, 背景色, 文字色, 透明度, 位置
 * 
 * 範例明文: 12345678
 * 範例密碼: password
 */

(function() {
    const def = new Syntax();
    class AutoLogin {
        constructor() {
            this.Url = def.Device.Url;
            this.Domain = def.Device.Host;
            this.LoginInfo = def.Store("g", this.Domain, {});

            this.KEY1 = (str) => CryptoJS.SHA3(str).toString();
            this.KEY2 = (str) => CryptoJS.SHA512(str).toString();
            this.IV = (str) => CryptoJS.RIPEMD160(str).toString();
            this.LE = {
                parse: (str) => CryptoJS.enc.Utf16LE.parse(LZString.compress(str)),
                stringify: (str) => LZString.decompress(CryptoJS.enc.Utf16LE.stringify(str)),
            }
            this.OBL = (element, value) => {
                def.Observer(element, ()=> {
                    element.value != value && (element.value = value);
                }, {subtree: false, childList: false});
            }
        }

        async Test() {
            let text = JSON.stringify({
                "Account": "12345abcde",
                "Password": "abcde12345",
            }), pass = "password";

            // 第一次加密
            var encrypted_1 = CryptoJS.AES.encrypt(
                this.LE.parse(text),
                this.KEY1(pass),
            {
                iv: this.IV(pass),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Iso97971
            }).toString();

            // 第二次加密
            var encrypted_2 = CryptoJS.AES.encrypt(
                this.LE.parse(encrypted_1),
                this.KEY2(this.IV(pass)),
            {
                iv: this.IV(this.KEY1(pass)),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Iso97971
            }).toString();

            def.Log("加密數據", encrypted_2, {collapsed: false});

            // 第一次解密
            var decrypted_1 = this.LE.stringify(
                CryptoJS.AES.decrypt(
                    encrypted_2,
                    this.KEY2(this.IV(pass)),
                    {
                        iv: this.IV(this.KEY1(pass)),
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Iso97971
                    }
                )
            );

            // 第二次解密
            var decrypted_2 = this.LE.stringify(
                CryptoJS.AES.decrypt(
                    decrypted_1,
                    this.KEY1(pass),
                    {
                        iv: this.IV(pass),
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Iso97971
                    }
                )
            );

            def.Log("解密還原", JSON.parse(decrypted_2), {collapsed: false});
        }

        async Save() {
            const save = prompt("輸入以下數據, 請確實按照順序輸入\n帳號, 密碼, 其餘操作");

            if (save && save != "") {
                const data = save.split(/\s*[,/]\s*/), box = {Account: "", Password: "", Operate: ""};

                if (data.length > 1) {
                    Object.keys(box).forEach((key, index) => { // 遍歷 box 的 key, 並根據索引填入, data 的對應索引值
                        box[key] = data[index] || "";
                    });

                    // 保存最終數據
                    def.Store("s", this.Domain, Object.assign({ Url: this.Url }, box));

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

            if (Info?.Url && this.Url.startsWith(Info.Url)) {
                const click = new MouseEvent("click", { // 創建點擊事件, 避免有被阻止的情況
                    bubbles: true,
                    cancelable: true
                });

                def.WaitElem("input[type='password']", password=> {
                    const login = [...def.$$("input[type='submit'], button[type='submit']", {all: true})].slice(1);

                    // 帳號輸入類型的可能有多個, 暴力解法 全部都輸入
                    def.$$("input[type='text']", {all: true}).forEach(account => {
                        // 簡單判斷, 雖然也能用選擇器 [name*="acc"], 但他不能處理大小寫差異
                        if (/acc|log/i.test(account.getAttribute("name"))) {
                            this.OBL(account, Info.Account); // 動態監聽變化, 持續輸入
                            account.value = Info.Account;
                        }
                    });
                    // 輸入密碼
                    this.OBL(password, Info.Password);
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
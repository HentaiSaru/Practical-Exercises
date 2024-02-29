// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 瀏覽增強
// @name:en      ColaManga 瀏覽增強
// @version      0.0.1
// @author       HentaiSaru
// @description 正在開發中
// @description:zh-TW 正在開發中
// @description:zh-CN 正在開發中
// @description:en 正在開發中

// @match        *://www.colamanga.com/manga-*/*/*.html
// @icon         https://www.colamanga.com/favicon.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.2/jscolor.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==

(function() {
    /**
     * 開發功能
     * 
     * 選單設置
     * 背景色
     * 圖片基本寬度
     * 圖片最大寬度
     * 
     * 返回目錄按鈕 返回首頁按鈕
     * 
     * 開關功能
     * 
     * 隱藏廣告
     * 快捷翻頁
     * 自動翻頁
     * 自動滾動 => 速度設置
     */
    class Manga extends API {
        constructor() {
            super();
            this.DEV = true;

            this.ContentsPage = null;
            this.HomePage = null;

            this.PreviousPage = null;
            this.NextPage = null;

            this.BottomStrip = null;

            this.Interval = null;
            this.Rotation_Up = null;
            this.Rotation_Down = null;
            this.Observer_Next = null;

            /* 取得數據 */
            this.Get_Data = () => {
                const HomeLink = this.$$("a", true, this.$$("div.mh_readtitle"));
                const PageLink = this.$$("a.mh_prevbook", true, this.$$("div.mh_headpager"));
                this.BottomStrip = this.$$("div.mh_readend");
                this.ContentsPage = HomeLink[0].href; // 目錄連結
                this.HomePage = HomeLink[1].href; // 首頁連結
                this.PreviousPage = PageLink[0].href; // 上一頁連結
                this.NextPage = PageLink[1].href; // 下一頁連結
                return [this.ContentsPage, this.HomePage, this.PreviousPage, this.NextPage].every(Check => Check);
            }

            /* 註冊自動滾動 */
            this.RegisterRotation = (target, move, interval) => {
                target = setInterval(() => {
                    window.scrollBy(0, move);
                }, interval);
                return target;
            }

            /* 清除自動滾動 */
            this.CleanRotation = (target) => {
                clearInterval(target);
                return null;
            }

            /* 獲取樣式 */
            this.Get_Style = () => {
                const Style = this.store("get", "Style") ||
                [{
                    "BG_Color": "#595959",
                    "Img_Bw": "auto",
                    "Img_Mw": "100%"
                }]
                return Style[0];
            }

            this.ImgStyle = this.Get_Style();
        }

        /* 阻擋廣告 */
        async BlockAds() {
            // 雖然性能開銷比較高, 但不會跳一堆錯誤訊息
            this.Interval = setInterval(() => {
                const iframe = this.$$("iframe");
                iframe && iframe.remove();
            }, 1000);
            this.AddStyle(`
                body {pointer-events: none;}
                body img, .mh_wrap {pointer-events: auto;}
            `, "Inject-Blocking-Ads");

            this.DEV && this.log("廣告阻擋注入", true);
        }

        /* 背景樣式 */
        async BackgroundStyle() {
            $("body").css("background-color", this.ImgStyle.BG_Color);

            this.DEV && this.log("背景顏色注入", true);
        }

        /* 圖片樣式 */
        async PictureStyle() {
            this.WaitElem("#mangalist", false, 10, ()=> {
                this.AddStyle(`
                    .mh_comicpic img {
                        vertical-align: top;cursor: pointer;display: block;margin: auto;
                        width: ${this.ImgStyle.Img_Bw};
                        max-width: ${this.ImgStyle.Img_Mw};
                    }
                `, "Inject-Image-Style");

                this.DEV && this.log("圖片樣式注入", true);
            })
        }

        /* 快捷切換上下頁 */
        async Hotkey_Switch(state) {
            if (state) {
                this.AddListener(document, "keydown", event=> {
                    const key = event.key;
                    if (key == "ArrowLeft") {location.assign(this.PreviousPage)}
                    else if (key == "ArrowRight") {location.assign(this.NextPage)}
                    else if (key == "ArrowUp") {
                        this.Rotation_Down = this.Rotation_Down && this.CleanRotation(this.Rotation_Down);
                        this.Rotation_Up = !this.Rotation_Up ?
                        this.RegisterRotation(this.Rotation_Up, -3, 6) : this.CleanRotation(this.Rotation_Up);
                    }
                    else if (key == "ArrowDown") {
                        this.Rotation_Up = this.Rotation_Up && this.CleanRotation(this.Rotation_Up);
                        this.Rotation_Down = !this.Rotation_Down ?
                        this.RegisterRotation(this.Rotation_Down, 3, 6) : this.CleanRotation(this.Rotation_Down);
                    }
                }, {capture: true, passive: true});

                this.DEV && this.log("換頁快捷注入", true);
            } else {this.DEV && this.log("無取得換頁數據", false)}
        }

        /* 自動切換下一頁 */
        async Automatic_Next(state) {
            if (state) {
                const self = this;
                self.Observer_Next = new IntersectionObserver(observed => {
                    observed.forEach(entry => {entry.isIntersecting && location.assign(self.NextPage)});
                }, { threshold: 0.8 });
                self.Observer_Next.observe(self.BottomStrip); // 添加觀察者
                this.DEV && this.log("觀察換頁注入", true);
            } else {
                this.DEV && this.log("無取得換頁數據", false);
            }
        }

        /* 設定菜單 */
        async SettingMenu(state) {
            if (state) {

            } else {this.DEV && this.log("無取得換頁數據", false)}
        }

        /* 菜單樣式 */
        async MenuStyle() {
            this.AddStyle(`
            `, "Inject_MenuStyle");
        }

        /* 功能注入 */
        async Injection() {
            try {
                this.BlockAds();
                this.BackgroundStyle();
                this.PictureStyle();

                const GetStatus = this.Get_Data();
                this.Hotkey_Switch(GetStatus);
                setTimeout(()=> {this.Automatic_Next(GetStatus)}, 1000 * 5);
                //this.SettingMenu(GetStatus);
            } catch {location.reload()}
        }
    }

    const Cola = new Manga();
    Cola.Injection();
})();
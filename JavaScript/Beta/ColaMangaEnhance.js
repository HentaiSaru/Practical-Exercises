// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.5
// @author       HentaiSaru
// @description       隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-TW 隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-CN 隐藏广告内容，阻止广告点击，提昇浏览体验。自定义背景颜色，调整图片大小。当图片载入失败时，自动重新载入图片。提供快捷键功能：[← 上一页]、[下一页 →]、[↑ 自动上滚动]、[↓ 自动下滚动]。当用户滚动到页面底部时，自动跳转到下一页。
// @description:en    Hide advertisement content, block ad clicks, enhance browsing experience. Customize background color, adjust image size. Automatically reload images when they fail to load. Provide shortcut key functionalities: [← Previous Page], [Next Page →], [↑ Auto Scroll Up], [↓ Auto Scroll Down]. Automatically jump to the next page when users scroll to the bottom of the page.

// @match        *://www.colamanga.com/manga-*/*/*.html
// @icon         https://www.colamanga.com/favicon.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.2/jscolor.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==

(function () {
    /**
     * 選單設置
     * 
     * 背景色
     * 圖片基本寬度
     * 圖片最大寬度
     * 
     * 開關功能
     * 
     * 隱藏廣告
     * 快捷翻頁
     * 自動翻頁
     * 自動滾動 => 速度設置
     * 
     * 請求 document.querySelector(".all_data_list") 主頁數據
     * 
     * 返回目錄按鈕 返回首頁按鈕
     * 點選模態框關閉 並自動保存 (先隱藏 隔 1 秒刪除, 製作效果, 注意避免重複創建)
     * 模態需要設置特別的標籤 , 要避免被廣告阻擋函數的樣式擋住
     * 
     * 編譯 ColaMangaEnhance / 2 -> R:/U_Compiler / 1
     */
    (new class Manga extends API {
        constructor() {
            super();
            this.DEV = true;
            this.JumpTrigger = false;
            this.Interval = this.GetStatus = null;
            this.ContentsPage = this.HomePage = null;
            this.PreviousPage = this.NextPage = null;
            this.MangaList = this.BottomStrip = null;
            this.Up_scroll = this.Down_scroll = false;
            this.Observer_Next = null;

            // 延遲 ms
            this.ScrollSpeed = 5;

            /* 獲取驅動訊行 (不要直接調用 前面有 _ 的) */
            this.Device = {
                Width: window.innerWidth,
                Height: window.innerHeight,
                Agent: navigator.userAgent,
                _Type: undefined,
                Type: function() {
                    if (this._Type) {
                        return this._Type;
                    } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent) || this.Width < 768) {
                        this._Type = "Mobile";
                    } else {
                        this._Type = "Desktop";
                    }
                    return this._Type;
                }
            }

            /* 取得數據 */
            this.Get_Data = async () => {
                this.WaitMap(["div.mh_readtitle", "div.mh_headpager", "div.mh_readend a", "#mangalist"], 20, element => {
                    let [HomeLink, PageLink, BottomStrip, MangaList] = element;
                    HomeLink = this.$$("a", true, HomeLink);
                    this.ContentsPage = HomeLink[0].href; // 目錄連結
                    this.HomePage = HomeLink[1].href; // 首頁連結

                    PageLink = this.$$("a.mh_btn:not(.mh_bgcolor)", true, PageLink);
                    this.PreviousPage = PageLink[0].href; // 上一頁連結
                    this.NextPage = PageLink[1].href; // 下一頁連結

                    this.MangaList = MangaList; // 漫畫列表
                    this.BottomStrip = BottomStrip; // 以閱讀完畢的那條, 看到他跳轉

                    this.GetStatus = [
                        this.ContentsPage,
                        this.HomePage,
                        this.PreviousPage,
                        this.NextPage,
                        this.MangaList,
                        this.BottomStrip
                    ].every(Check => Check);
                })
            }

            /* 檢測跳轉連結 */
            this.DetectionJumpLink = (link) => {
                return !link.startsWith("javascript");
            }

            /* 節流函數 */
            this.throttle = (func, delay) => {
                let timer = null;
                return function() {
                    let context=this, args=arguments;
                    if (timer == null) {
                        timer = setTimeout(function() {
                            func.apply(context, args);
                            timer = null;
                        }, delay);
                    }
                };
            }

            /* 自動滾動 (邏輯修改) */
            this.scroll = async(move) => {
                if (this.Up_scroll && move < 0) {
                    requestAnimationFrame(() => {
                        window.scrollBy(0, move);
                        this.throttle(this.scroll(move), this.ScrollSpeed);
                    });
                } else if (this.Down_scroll && move > 0) {
                    requestAnimationFrame(() => {
                        window.scrollBy(0, move);
                        this.throttle(this.scroll(move), this.ScrollSpeed);
                    });
                }
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
            // 雖然性能開銷比較高, 但比較不會跳一堆錯誤訊息
            let iframe;
            this.Interval = setInterval(() => {iframe = this.$$("iframe"); iframe && iframe.remove()}, 600);
            if (this.Device.Type() == "Desktop") {

                this.AddStyle(`
                    body {pointer-events: none;}
                    body .mh_wrap, .modal-background {pointer-events: auto;}
                `, "Inject-Blocking-Ads");

                this.DEV && this.log("電腦廣告阻擋注入", true);
            } else if (this.Device.Type() == "Mobile") {

                this.AddListener(window, "pointerup", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.AddListener(document, "pointerup", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.AddListener(window, "click", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.AddListener(document, "click", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });

                this.DEV && this.log("手機廣告阻擋注入", true);
            }
        }

        /* 背景樣式 */
        async BackgroundStyle() {
            document.body.style.backgroundColor=this.ImgStyle.BG_Color;
            this.DEV && this.log("背景顏色注入", true);
        }

        /* 圖片樣式 */
        async PictureStyle() {
            if (this.Device.Type() == "Desktop") {
                this.AddStyle(`
                    .mh_comicpic img {
                        vertical-align: top;cursor: pointer;display: block;margin: auto;
                        width: ${this.ImgStyle.Img_Bw};
                        max-width: ${this.ImgStyle.Img_Mw};
                    }
                `, "Inject-Image-Style");
            }
            this.AutoReload();
            this.DEV && this.log("圖片樣式注入", true);
        }

        /* 自動重新載入 */
        async AutoReload() {
            try {
                let click = new MouseEvent("click", { bubbles: true, cancelable: true });
                const observer = new IntersectionObserver(observed => {
                    observed.forEach(entry => { entry.isIntersecting && entry.target.dispatchEvent(click) });
                }, { threshold: .3 });
                this.$$("span.mh_btn:not(.contact)", true, this.MangaList).forEach(b => { observer.observe(b) });
                this.DEV && this.log("自動重載注入", true);
            } catch {
                this.DEV && this.log("自動重載注入失敗", false);
            }
        }

        /* 快捷切換上下頁 */
        async Hotkey_Switch() {
            if (this.GetStatus) {
                if (this.Device.Type() == "Desktop") {
                    this.AddListener(document, "keydown", event => {
                        const key = event.key;
                        if (key == "ArrowLeft" && !this.JumpTrigger) {
                            this.JumpTrigger = this.DetectionJumpLink(this.PreviousPage) ? true : false;
                            location.assign(this.PreviousPage);
                        }
                        else if (key == "ArrowRight" && !this.JumpTrigger) {
                            this.JumpTrigger = this.DetectionJumpLink(this.NextPage) ? true : false;
                            location.assign(this.NextPage);
                        }
                        else if (key == "ArrowUp") {
                            event.preventDefault();
                            if (this.Up_scroll) {
                                this.Up_scroll = false;
                            } else if (!this.Up_scroll || this.Down_scroll) {
                                this.Down_scroll = false;
                                this.Up_scroll = true;
                                this.scroll(-1);
                            }
                        }
                        else if (key == "ArrowDown") {
                            event.preventDefault();
                            if (this.Down_scroll) {
                                this.Down_scroll = false;
                            } else if (this.Up_scroll || !this.Down_scroll) {
                                this.Up_scroll = false;
                                this.Down_scroll = true;
                                this.scroll(1);
                            }
                        }
                    }, { capture: true });

                    this.DEV && this.log("快捷換頁注入", true);
                } else if (this.Device.Type() == "Mobile") {

                    const sidelineX = .35 * this.Device.Width, sidelineY = (this.Device.Height / 4) * .2;
                    let startX, startY, moveX, moveY;

                    this.AddListener(this.MangaList, "touchstart", event => {
                        startX = event.touches[0].clientX;
                        startY = event.touches[0].clientY;
                    }, { passive: true });

                    this.AddListener(this.MangaList, "touchmove", this.throttle(event => {
                        requestAnimationFrame(() => {
                            moveX = event.touches[0].clientX - startX;
                            moveY = event.touches[0].clientY - startY;
                            if (Math.abs(moveY) < sidelineY) {
                                if (moveX > sidelineX && !this.JumpTrigger) {
                                    this.JumpTrigger = this.DetectionJumpLink(this.PreviousPage) ? true : false;
                                    location.assign(this.PreviousPage);
                                } else if (moveX < -sidelineX && !this.JumpTrigger) {
                                    this.JumpTrigger = this.DetectionJumpLink(this.NextPage) ? true : false;
                                    location.assign(this.NextPage);
                                }
                            }
                        });
                    }, 100), { passive: true });

                    this.DEV && this.log("手勢換頁注入", true);
                }
            } else { this.DEV && this.log("無取得換頁數據", false) }
        }

        /* 自動切換下一頁 */
        async Automatic_Next() {
            if (this.GetStatus) {
                const self = this, img = self.$$("img", true, self.MangaList), lest_img = img[Math.floor(img.length * .7)];
                self.Observer_Next = new IntersectionObserver(observed => {
                    observed.forEach(entry => {
                        if (entry.isIntersecting && lest_img.src) {
                            self.Observer_Next.disconnect();
                            self.DetectionJumpLink(self.NextPage) && location.assign(self.NextPage);
                        }
                    });
                }, { threshold: .5 });
                self.Observer_Next.observe(self.BottomStrip); // 添加觀察者
                this.DEV && this.log("觀察換頁注入", true);
            } else {
                this.DEV && this.log("無取得換頁數據", false);
            }
        }

        /* 設定菜單 */
        async SettingMenu() {
            if (this.GetStatus) {} else { this.DEV && this.log("無取得換頁數據", false) }
        }

        /* 菜單樣式 */
        async MenuStyle() {
            this.AddStyle(`
            `, "Inject_MenuStyle");
        }

        /* 功能注入 */
        async Injection() {
            try {
                this.BlockAds(); // 為了阻止手機版廣告, 要優先注入, 且腳本要 document-start, 所以下面不等 document.body 出現會有問題
                const DOMContentLoaded = new MutationObserver(() => { // 監聽 "DOMContentLoaded" 無法觸發是什麼鬼
                    const DOM = document.body;
                    if (DOM) {
                        DOMContentLoaded.disconnect();
                        this.Get_Data();
                        this.BackgroundStyle();
                        const waitResults = setInterval(() => {
                            if (this.GetStatus != null) {
                                clearInterval(waitResults);
                                this.PictureStyle();
                                this.Hotkey_Switch();
                                this.SettingMenu();
                                this.Automatic_Next();
                            }
                        }, 300);
                    }
                })
                DOMContentLoaded.observe(document, { childList: true, subtree: true });
            } catch (error) { this.DEV && this.log(null, error) }
        }
    }).Injection();
})();
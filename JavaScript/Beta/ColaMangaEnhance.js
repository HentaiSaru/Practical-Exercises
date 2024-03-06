// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.7
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
// @require      https://update.greasyfork.org/scripts/487608/1337297/GrammarSimplified.js
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
     * 自動翻頁 => 敏感 / 不敏感
     * 自動滾動 => 速度設置 / 換頁繼續滾動
     * 
     * 請求 document.querySelector(".all_data_list") 主頁數據
     * 製做一個 iframe 或其他 將主頁的選擇漫畫列表複製到菜單中
     * 
     * 返回目錄按鈕 返回首頁按鈕
     * 點選模態框關閉 並自動保存 (先隱藏 隔 1 秒刪除, 製作效果, 注意避免重複創建)
     * 模態需要設置特別的標籤 , 要避免被廣告阻擋函數的樣式擋住
     * 
     * 編譯 ColaMangaEnhance / 2 -> R:/U_Compiler / 1
     */

    /* 
        只有設置是否使用該功能, 沒有設定參數, 這只是臨時的寫法, 之後會刪除掉
        (0 = 不使用 | 1 = 使用 | mode = 有些有不同模式 2..3..n)
    */
    const Config = { 
        BlockAd: 1, // 阻擋廣告點擊
        BGColor: 1, // 背景換色 [目前還沒有自訂]
        RegisterHotkey: 3, // 快捷功能 mode: 1 = 翻頁, 2 = 翻頁+滾動, 3 翻頁+滾動+換頁繼續滾動
        AutoTurnPage: 4, // 自動換頁 mode: 1 = 快速, 2 = 普通, 3 = 緩慢 [1~3 數字越大需要滾動越下面, 也就是越慢觸發], 4 = 特殊 (實驗中的酷東西)
    };
    (new class Manga extends API {
        constructor() {
            super();
            this.DEV = true;
            this.ScrollSpeed = 1; // 像素, 越高越快
            this.JumpTrigger = false; // 判斷是否跳轉, 避免多次觸發
            this.AdCleanup = this.Body = null; // 清理廣告的函數, body 元素
            this.ContentsPage = this.HomePage = null; // 返回目錄, 返回首頁, 連結
            this.PreviousPage = this.NextPage = null; // 下一頁, 上一頁, 連結
            this.MangaList = this.BottomStrip = null; // 漫畫列表, 底下觸發換頁條
            this.Up_scroll = this.Down_scroll = false; // 向上滾動, 向下滾動
            this.Observer_Next = null; // 下一頁觀察器
            this.RecordName = location.pathname.split("/")[1];
            this.RecordURL = this.store("get", this.RecordName) || document.URL;

            /* 獲取驅動訊行 (不要直接調用 前面有 _ 的) */
            this.Device = {
                sY: ()=> window.scrollY,
                sX: ()=> window.scrollX,
                Width: ()=> window.innerWidth,
                Height: ()=> window.innerHeight,
                Agent: ()=> navigator.userAgent,
                _Type: undefined,
                Type: function() {
                    if (this._Type) {
                        return this._Type;
                    } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent()) || this.Width() < 768) {
                        this._Type = "Mobile";
                    } else {
                        this._Type = "Desktop";
                    }
                    return this._Type;
                }
            };

            /* 取得數據 */
            this.Get_Data = async (callback) => {
                this.WaitMap(["body", "div.mh_readtitle", "div.mh_headpager", "div.mh_readend a", "#mangalist"], 20, element => {
                    let [Body, HomeLink, PageLink, BottomStrip, MangaList] = element;
                    this.Body = Body;

                    HomeLink = this.$$("a", true, HomeLink);
                    this.ContentsPage = HomeLink[0].href; // 目錄連結
                    this.HomePage = HomeLink[1].href; // 首頁連結

                    PageLink = this.$$("a.mh_btn:not(.mh_bgcolor)", true, PageLink);
                    this.PreviousPage = PageLink[0].href; // 上一頁連結
                    this.NextPage = PageLink[1].href; // 下一頁連結

                    this.MangaList = MangaList; // 漫畫列表
                    this.BottomStrip = BottomStrip; // 以閱讀完畢的那條, 看到他跳轉

                    if([
                        this.Body,
                        this.ContentsPage,
                        this.HomePage,
                        this.PreviousPage,
                        this.NextPage,
                        this.MangaList,
                        this.BottomStrip
                    ].every(Check => Check))
                    {callback(true)}
                    else {callback(false)}
                }, document);
            };

            /* 檢測跳轉連結 */
            this.DetectionJumpLink = (link) => {
                return !link.startsWith("javascript");
            };

            /* 節流函數 (不會遺棄觸發) */
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
            };

            /* 節流函數 (會丟棄觸發) */
            this.throttle_discard = (func, delay) => {
                let lastTime = 0;
                return function() {
                    const context = this, args = arguments, now = Date.now();
                    if ((now - lastTime) >= delay) {
                        func.apply(context, args);
                        lastTime = now;
                    }
                };
            };

            /* 檢測到頂 */
            this.TopDetected = this.throttle_discard(()=>{
                this.Up_scroll = this.Device.sY() == 0 ? (this.store("set","scroll",false), false) : true;
            }, 1000);
            /* 檢測到底 */
            this.BottomDetected = this.throttle_discard(()=>{
                this.Down_scroll =
                this.Device.sY() + this.Device.Height() >= document.documentElement.scrollHeight ? (this.store("set","scroll",false), false) : true;
            }, 1000);

            /* 自動滾動 (邏輯修改) */
            this.scroll = (move) => {
                if (this.Up_scroll && move < 0) {
                    this.TopDetected();
                    requestAnimationFrame(() => {
                        window.scrollBy(0, move);
                        this.scroll(move);
                    });
                } else if (this.Down_scroll && move > 0) {
                    this.BottomDetected();
                    requestAnimationFrame(() => {
                        window.scrollBy(0, move);
                        this.scroll(move);
                    });
                }
            };

            /* 自動翻頁獲取檢測對象 */
            this.ObserveValue = (object) => {
                const L = object.length;
                return [
                    L*.95, L*.75,
                    L*(Math.random() * (0.7 - 0.1) + 0.1).toPrecision(2)
                ].map(I=> {return object[Math.floor(I)]});
            }

            /* 獲取樣式 */
            this.Get_Style = () => {
                const Style = this.store("get", "Style") ||
                    [{
                        "BG_Color": "#595959",
                        "Img_Bw": "auto",
                        "Img_Mw": "100%"
                    }];
                return Style[0];
            };

            this.ImgStyle = this.Get_Style();
        }

        /* 阻擋廣告 */
        async BlockAds() {
            // 雖然性能開銷比較高, 但比較不會跳一堆錯誤訊息
            let iframe;
            this.AdCleanup = setInterval(() => {iframe = this.$$("iframe:not(#Iframe-Comics)"); iframe && iframe.remove()}, 600);
            if (this.Device.Type() == "Desktop") {

                this.AddStyle(`
                    body {pointer-events: none;}
                    body iframe, .mh_wrap, .modal-background {pointer-events: auto;}
                `, "Inject-Blocking-Ads");

                this.DEV && this.log("電腦廣告阻擋注入", true);
            } else if (this.Device.Type() == "Mobile") {

                this.Listen(window, "pointerup", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.Listen(document, "pointerup", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.Listen(window, "click", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });
                this.Listen(document, "click", event => {
                    event.stopImmediatePropagation();
                }, { capture: true, passive: true });

                this.DEV && this.log("手機廣告阻擋注入", true);
            }
        }

        /* 背景樣式 */
        async BackgroundStyle() {
            this.Body.style.backgroundColor=this.ImgStyle.BG_Color;
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

        /* 快捷切換上下頁 和 自動滾動 */
        async Hotkey_Switch(mode) {
            if (this.Device.Type() == "Desktop") {
                if (mode == 3) {
                    this.Down_scroll = this.store("get", "scroll");
                    this.scroll(this.ScrollSpeed);
                }

                const UP_ScrollSpeed = this.ScrollSpeed * -1;
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
                    else if (key == "ArrowUp" && mode >= 2) {
                        event.preventDefault();
                        if (this.Up_scroll) {
                            this.Up_scroll = false;
                        } else if (!this.Up_scroll || this.Down_scroll) {
                            this.Down_scroll = false;
                            this.Up_scroll = true;
                            this.scroll(UP_ScrollSpeed);
                        }
                    }
                    else if (key == "ArrowDown" && mode >= 2) {
                        event.preventDefault();
                        if (this.Down_scroll) {
                            this.Down_scroll = false;
                            this.store("set","scroll",false);
                        } else if (this.Up_scroll || !this.Down_scroll) {
                            this.Up_scroll = false;
                            this.Down_scroll = true;
                            this.store("set","scroll",true);
                            this.scroll(this.ScrollSpeed);
                        }
                    }
                }, { capture: true });

                this.DEV && this.log("快捷換頁注入", true);
            } else if (this.Device.Type() == "Mobile") {

                const sidelineX = .35 * this.Device.Width(), sidelineY = (this.Device.Height() / 4) * .2;
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
                }, 200), { passive: true });

                this.DEV && this.log("手勢換頁注入", true);
            }
        }

        /* 自動切換下一頁 */
        async Automatic_Next(mode) {
            const self = this, [lest_img, img_2, img_3] = self.ObserveValue(self.$$("img", true, self.MangaList));

            let hold, object;
            self.Observer_Next = new IntersectionObserver(observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting && (lest_img.src || img_2.src || img_3.src)) {
                        self.Observer_Next.disconnect();
                        self.DetectionJumpLink(self.NextPage) && location.assign(self.NextPage);
                    }
                });
            }, { threshold: hold });
            switch (mode) {
                case 2:
                    hold = .5;
                    object = self.$$("li:nth-child(3) a.read_page_link");
                    break;
                case 3:
                    hold = 1;
                    object = self.$$("div.endtip2.clear");
                    break;
                case 4:
                    self.AddStyle(`
                        .mh_wrap, .mh_readend, .mh_footpager, .fed-foot-info {display: none;}
                        #Iframe-Comics {height:0px; border: none; width: 100%;}
                    `, "scroll-hidden")
                    this.SpecialPageTurning();
                    break;
                default:
                    hold = .1;
                    object = self.BottomStrip;
            }
            mode != 4 && self.Observer_Next.observe(object);
            this.DEV && this.log("觀察換頁注入", true);
        }

        /* 特殊翻頁邏輯 */
        async SpecialPageTurning() {
            const self = this, [lest_img, img_2, img_3] = self.ObserveValue(self.$$("img", true, self.MangaList)),
            iframe = document.createElement("iframe"); // 創建後先添加
            iframe.id = "Iframe-Comics";
            requestAnimationFrame(() => {document.body.appendChild(iframe)});

            async function trigger() {
                let StylelRules = self.$$("#scroll-hidden").sheet.cssRules[1].style;

                // 載入 src
                requestAnimationFrame(() => {iframe.src = self.NextPage});

                // 等待 iframe 載入完成
                let iframeContent
                iframe.onload = function() {
                    iframeContent = iframe.contentWindow.document;
                    iframeContent.body.style.overflow = "hidden";
                    setInterval(()=> {
                        StylelRules.height = `${iframeContent.body.scrollHeight}px`;
                    }, 2e3);
                };

                GM_setValue(self.RecordName, self.NextPage);
            }

            // 監聽翻頁
            self.Observer_Next = new IntersectionObserver(observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting && (lest_img.src || img_2.src || img_3.src)) {
                        self.Observer_Next.disconnect();
                        self.DetectionJumpLink(self.NextPage) && trigger();
                    }
                });
            }, { threshold: .1 });
            self.Observer_Next.observe(lest_img);
        }

        /* 設定菜單 */
        async SettingMenu() {
        }

        /* 菜單樣式 */
        async MenuStyle() {
            this.AddStyle(`
            `, "Inject_MenuStyle");
        }

        /* 功能注入 */
        async Injection() {
            try {
                if (this.RecordURL != document.URL) {
                    GM_setValue(this.RecordName, "");
                    location.assign(this.RecordURL);
                }
                Config.BlockAd > 0 && this.BlockAds();
                this.Get_Data(state=> {
                    if (state) {
                        Config.BGColor > 0 && this.BackgroundStyle();
                        this.PictureStyle();
                        Config.RegisterHotkey > 0 && this.Hotkey_Switch(Config.RegisterHotkey);
                        this.SettingMenu();
                        Config.AutoTurnPage > 0 && this.Automatic_Next(Config.AutoTurnPage);
                    } else {
                        this.DEV && this.log("取得數據失敗", false);
                    }
                });
            } catch (error) { this.DEV && this.log(null, error) }
        }
    }).Injection();
})();
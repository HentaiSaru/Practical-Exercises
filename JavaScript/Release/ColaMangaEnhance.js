// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.10-Beta
// @author       Canaan HS
// @description       隱藏廣告內容，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-TW 隱藏廣告內容，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-CN 隐藏广告内容，提昇浏览体验。自定义背景颜色，调整图片大小。当图片载入失败时，自动重新载入图片。提供快捷键功能：[← 上一页]、[下一页 →]、[↑ 自动上滚动]、[↓ 自动下滚动]。当用户滚动到页面底部时，自动跳转到下一页。
// @description:en    Hide advertisement content, enhance browsing experience. Customize background color, adjust image size. Automatically reload images when they fail to load. Provide shortcut key functionalities: [← Previous Page], [Next Page →], [↑ Auto Scroll Up], [↓ Auto Scroll Down]. Automatically jump to the next page when users scroll to the bottom of the page.

// @match        *://www.colamanga.com/manga-*/*/*.html
// @icon         https://www.colamanga.com/favicon.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue

// @require      https://update.greasyfork.org/scripts/487608/1413530/ClassSyntax_min.js
// ==/UserScript==

(async () => {
    /* 
        設置是否使用該功能, 沒有設定參數, 這只是臨時的寫法, 之後會刪除掉
        (0 = 不使用 | 1 = 使用 | mode = 有些有不同模式 2..3..n)
    */
    const Config = {
        BGColor: 1, // 背景換色 [目前還沒有自訂], 改代碼可搜索 #595959, 並修改該字串
        RegisterHotkey: 3, // 快捷功能 mode: 1 = 翻頁, 2 = 翻頁+滾動, 3 翻頁+滾動+換頁繼續滾動
        AutoTurnPage: 4, // 自動換頁 mode: 1 = 快速, 2 = 普通, 3 = 緩慢, 4 = 無盡 (實驗中的酷東西)
    };
    new class Manga extends Syntax {
        constructor() {
            super();
            this.ScrollPixels = 2;
            this.WaitPicture = 1e3;
            this.JumpTrigger = false;
            this.AdCleanup = this.Body = null;
            this.ContentsPage = this.HomePage = null;
            this.PreviousPage = this.NextPage = null;
            this.MangaList = this.BottomStrip = null;
            this.Up_scroll = this.Down_scroll = false;
            this.Observer_Next = null;
            this.IsMainPage = window.self === window.parent;
            this.BlockListener = new Set([ "pointerup", "pointerdown", "dState", "touchstart", "unhandledrejection" ]);
            this.Get_Data = async callback => {
                this.WaitMap([ "body", "div.mh_readtitle", "div.mh_headpager", "div.mh_readend", "#mangalist" ], element => {
                    const [ Body, Title, HeadPager, Readend, Manga ] = element;
                    this.Body = Body;
                    const HomeLink = this.$$("a", {
                        all: true,
                        root: Title
                    });
                    this.ContentsPage = HomeLink[0].href;
                    this.HomePage = HomeLink[1].href;
                    try {
                        const PageLink = this.$$("ul a", {
                            all: true,
                            root: Readend
                        });
                        this.PreviousPage = PageLink[0].href;
                        this.NextPage = PageLink[2].href;
                    } catch {
                        const PageLink = this.$$("a.mh_btn:not(.mh_bgcolor)", {
                            all: true,
                            root: HeadPager
                        });
                        this.PreviousPage = PageLink[0].href;
                        this.NextPage = PageLink[1].href;
                    }
                    this.MangaList = Manga;
                    this.BottomStrip = this.$$("a", {
                        root: Readend
                    });
                    if ([ this.Body, this.ContentsPage, this.HomePage, this.PreviousPage, this.NextPage, this.MangaList, this.BottomStrip ].every(Check => Check)) callback(true); else callback(false);
                }, {
                    timeout: 10,
                    timeoutResult: true,
                    object: document
                });
            };
            this.storage = (key, value = null) => {
                return value != null ? this.Storage(key, {
                    value: value
                }) : this.Storage(key);
            };
            this.TopDetected = this.Throttle(() => {
                this.Up_scroll = this.Device.sY() == 0 ? (this.storage("scroll", false), 
                false) : true;
            }, 1e3);
            this.BottomDetected = this.Throttle(() => {
                this.Down_scroll = this.Device.sY() + this.Device.iH() >= document.documentElement.scrollHeight ? (this.storage("scroll", false), 
                false) : true;
            }, 1e3);
            this.scroll = move => {
                requestAnimationFrame(() => {
                    if (this.Up_scroll && move < 0) {
                        window.scrollBy(0, move);
                        this.TopDetected();
                        this.scroll(move);
                    } else if (this.Down_scroll && move > 0) {
                        window.scrollBy(0, move);
                        this.BottomDetected();
                        this.scroll(move);
                    }
                });
            };
            this.FinalPage = link => link.startsWith("javascript");
            this.VisibleObjects = object => object.filter(img => img.height > 0 || img.src);
            this.ObserveObject = object => object[Math.max(object.length - 2, 0)];
            this.DetectionValue = object => this.VisibleObjects(object).length >= Math.floor(object.length * .5);
            this.Get_Style = () => {
                const Style = this.Store("g", "Style") || [ {
                    BG_Color: "#595959",
                    Img_Bw: "auto",
                    Img_Mw: "100%"
                } ];
                return Style[0];
            };
            this.ImgStyle = this.Get_Style();
        }
        async BlockAds() {
            const OriginListener = EventTarget.prototype.addEventListener, Block = this.BlockListener;
            const EventListeners = new Map();
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (Block.has(type)) return;
                if (!EventListeners.has(this)) EventListeners.set(this, []);
                EventListeners.get(this).push({
                    type: type,
                    listener: listener,
                    options: options
                });
                OriginListener.call(this, type, listener, options);
            };
            function removeBlockedListeners() {
                EventListeners.forEach((listeners, element) => {
                    listeners.forEach(({
                        type,
                        listener
                    }) => {
                        if (Block.has(type)) {
                            element.removeEventListener(type, listener);
                        }
                    });
                });
            }
            this.AddStyle(`
                html {pointer-events: none !important;}
                .mh_wrap, span.mh_btn:not(.contact), #Iframe-Comics {pointer-events: auto;}
            `, "Inject-Blocking-Ads");
            this.AdCleanup = setInterval(() => {
                this.$$("iframe:not(#Iframe-Comics)")?.remove();
                removeBlockedListeners();
            }, 500);
        }
        async BackgroundStyle() {
            this.Body.style.cssText = `
                background: ${this.ImgStyle.BG_Color} !important;
            `;
        }
        async AutoReload() {
            let click = new MouseEvent("click", {
                bubbles: true,
                cancelable: true
            });
            const observer = new IntersectionObserver(observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.dispatchEvent(click);
                    }
                });
            }, {
                threshold: .3
            });
            this.$$("span.mh_btn:not(.contact)", {
                all: true,
                root: this.MangaList
            }).forEach(b => {
                observer.observe(b);
            });
        }
        async PictureStyle() {
            if (this.Device.Type() == "Desktop") {
                this.AddStyle(`
                    .mh_comicpic img {
                        margin: auto;
                        display: block;
                        cursor: pointer;
                        vertical-align: top;
                        width: ${this.ImgStyle.Img_Bw};
                        max-width: ${this.ImgStyle.Img_Mw};
                    }
                `, "Inject-Image-Style");
            }
            setTimeout(() => {
                this.AutoReload();
            }, this.WaitPicture);
        }
        async HotkeySwitch(mode) {
            if (this.Device.Type() == "Desktop") {
                if (mode == 3 && this.IsMainPage) {
                    this.Down_scroll = this.storage("scroll");
                    this.Down_scroll && this.scroll(this.ScrollPixels);
                }
                const UP_ScrollSpeed = this.ScrollPixels * -1;
                this.Listen(window, "keydown", event => {
                    const key = event.key;
                    if (key == "ArrowLeft" && !this.JumpTrigger) {
                        event.stopImmediatePropagation();
                        this.JumpTrigger = !this.FinalPage(this.PreviousPage) ? true : false;
                        location.assign(this.PreviousPage);
                    } else if (key == "ArrowRight" && !this.JumpTrigger) {
                        event.stopImmediatePropagation();
                        this.JumpTrigger = !this.FinalPage(this.NextPage) ? true : false;
                        location.assign(this.NextPage);
                    } else if (key == "ArrowUp" && mode >= 2) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (this.Up_scroll) {
                            this.Up_scroll = false;
                        } else if (!this.Up_scroll || this.Down_scroll) {
                            this.Down_scroll = false;
                            this.Up_scroll = true;
                            this.scroll(UP_ScrollSpeed);
                        }
                    } else if (key == "ArrowDown" && mode >= 2) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (this.Down_scroll) {
                            this.Down_scroll = false;
                            this.storage("scroll", false);
                        } else if (this.Up_scroll || !this.Down_scroll) {
                            this.Up_scroll = false;
                            this.Down_scroll = true;
                            this.storage("scroll", true);
                            this.scroll(this.ScrollPixels);
                        }
                    }
                }, {
                    capture: true
                });
            } else if (this.Device.Type() == "Mobile") {
                const sidelineX = .35 * this.Device.iW(), sidelineY = this.Device.iH() / 4 * .2;
                let startX, startY, moveX, moveY;
                this.Listen(window, "touchstart", event => {
                    startX = event.touches[0].clientX;
                    startY = event.touches[0].clientY;
                }, {
                    passive: true
                });
                this.Listen(window, "touchmove", this.Throttle(event => {
                    requestAnimationFrame(() => {
                        moveX = event.touches[0].clientX - startX;
                        moveY = event.touches[0].clientY - startY;
                        if (Math.abs(moveY) < sidelineY) {
                            if (moveX > sidelineX && !this.JumpTrigger) {
                                this.JumpTrigger = !this.FinalPage(this.PreviousPage) ? true : false;
                                location.assign(this.PreviousPage);
                            } else if (moveX < -sidelineX && !this.JumpTrigger) {
                                this.JumpTrigger = !this.FinalPage(this.NextPage) ? true : false;
                                location.assign(this.NextPage);
                            }
                        }
                    });
                }, 200), {
                    passive: true
                });
            }
        }
        async AutoPageTurn(mode) {
            let self = this, hold, object, img;
            self.Observer_Next = new IntersectionObserver(observed => {
                observed.forEach(entry => {
                    if (entry.isIntersecting && self.DetectionValue(img)) {
                        self.Observer_Next.disconnect();
                        !self.FinalPage(self.NextPage) && location.assign(self.NextPage);
                    }
                });
            }, {
                threshold: hold
            });
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
                this.UnlimitedPageTurn();
                break;

              default:
                hold = .1;
                object = self.BottomStrip;
            }
            if (mode != 4) {
                setTimeout(() => {
                    img = self.$$("img", {
                        all: true,
                        root: self.MangaList
                    });
                    self.Observer_Next.observe(object);
                }, self.WaitPicture);
            }
        }
        async UnlimitedPageTurn() {
            const self = this;
            const iframe = document.createElement("iframe");
            iframe.id = "Iframe-Comics";
            iframe.src = self.NextPage;
            this.AddStyle(`
                .mh_wrap, .mh_readend, .mh_footpager, .fed-foot-info, #imgvalidation2022 {display: none;}
                #Iframe-Comics {
                    margin: 0;
                    padding: 0;
                    height: 50px;
                    width: 100%;
                    border: none;
                }
            `, "scroll-hidden");
            if (this.IsMainPage) {
                document.documentElement.style.cssText = `
                    overflow: visible !important;
                `;
                this.Listen(window, "message", event => {
                    const data = event.data;
                    document.title = data[0];
                    history.pushState(null, null, data[1]);
                });
            } else {
                this.AddStyle(`
                    html {
                        overflow: hidden !important;
                        overflow-x: hidden !important;
                        scrollbar-width: none !important;
                        -ms-overflow-style: none !important;
                    }
                    html::-webkit-scrollbar { 
                        display: none !important;
                    }
                `, "child-scroll-hidden");
                let MainWindow = window;
                this.Listen(window, "message", event => {
                    while (MainWindow.parent !== MainWindow) {
                        MainWindow = MainWindow.parent;
                    }
                    MainWindow.postMessage(event.data, self.Origin);
                });
            }
            TriggerNextPage();
            async function TriggerNextPage() {
                let Img, Observer, Quantity = 0;
                self.Observer_Next = new IntersectionObserver(observed => {
                    observed.forEach(entry => {
                        if (entry.isIntersecting && self.DetectionValue(Img)) {
                            self.Observer_Next.disconnect();
                            Observer.disconnect();
                            TurnPage();
                        }
                    });
                }, {
                    threshold: .1
                });
                setTimeout(() => {
                    Img = self.$$("img", {
                        all: true,
                        root: self.MangaList
                    });
                    if (Img.length <= 3) {
                        TurnPage();
                        return;
                    }
                    self.Observer_Next.observe(self.ObserveObject(self.VisibleObjects(Img)));
                    self.Observer(self.MangaList, () => {
                        const Visible = self.VisibleObjects(Img), VL = Visible.length;
                        if (VL > Quantity) {
                            Quantity = VL;
                            self.Observer_Next.disconnect();
                            self.Observer_Next.observe(self.ObserveObject(Visible));
                        }
                    }, {
                        throttle: 100
                    }, observer => {
                        Observer = observer.ob;
                    });
                }, self.WaitPicture);
            }
            async function TurnPage() {
                let URL, Content, StylelRules = self.$$("#scroll-hidden").sheet.cssRules;
                if (self.FinalPage(self.NextPage)) {
                    StylelRules[0].style.display = "block";
                    return;
                }
                document.body.appendChild(iframe);
                self.Log("無盡翻頁", self.NextPage);
                Waitload();
                function Waitload() {
                    iframe.onload = () => {
                        URL = iframe.contentWindow.location.href;
                        URL != self.NextPage && (iframe.src = self.NextPage, Waitload());
                        Content = iframe.contentWindow.document;
                        Content.body.style.overflow = "hidden";
                        setInterval(() => {
                            StylelRules[1].style.height = `${Content.body.scrollHeight}px`;
                        }, 1500);
                        const UrlUpdate = new IntersectionObserver(observed => {
                            observed.forEach(entry => {
                                if (entry.isIntersecting) {
                                    UrlUpdate.disconnect();
                                    window.parent.postMessage([ Content.title, URL ], self.Origin);
                                }
                            });
                        }, {
                            threshold: .1
                        });
                        UrlUpdate.observe(self.$$("#mangalist img", {
                            root: Content
                        }));
                    };
                    iframe.onerror = () => {
                        iframe.src = self.NextPage;
                        Waitload();
                    };
                }
            }
        }
        async SettingMenu() {}
        async MenuStyle() {
            this.AddStyle(``, "Inject_MenuStyle");
        }
        async Injection() {
            this.BlockAds();
            try {
                this.Get_Data(state => {
                    if (state) {
                        Config.BGColor > 0 && this.BackgroundStyle();
                        this.PictureStyle();
                        Config.RegisterHotkey > 0 && this.HotkeySwitch(Config.RegisterHotkey);
                        Config.AutoTurnPage > 0 && this.AutoPageTurn(Config.AutoTurnPage);
                    } else this.Log(null, "Error");
                });
            } catch (error) {
                this.Log(null, error);
            }
        }
    }().Injection();
})();
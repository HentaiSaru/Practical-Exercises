// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.46-Beta
// @author       Canaan HS
// @description        美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-TW  美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-CN  美化界面和重新排版，包括移除广告和多余的横幅，修正画师名称和编辑相关的资讯保存，自动载入原始图像，菜单设置图像大小间距，快捷键触发自动滚动，解析文本中的链接并转换为可点击的链接，快速的页面切换和跳转功能，并重新定向到新分頁
// @description:ja     インターフェイスの美化と再配置、広告や余分なバナーの削除、イラストレーター名の修正と関連情報の保存の編集、オリジナル画像の自動読み込み、メニューでの画像のサイズと間隔の設定、ショートカットキーによる自動スクロールのトリガー、テキスト内のリンクの解析とクリック可能なリンクへの変換、高速なページ切り替えとジャンプ機能、新しいタブへのリダイレクト
// @description:en     Beautify the interface and re-layout, including removing ads and redundant banners, correcting artist names and editing related information retention, automatically loading original images, setting image size and spacing in the menu, triggering automatic scrolling with hotkeys, parsing links in the text and converting them to clickable links, fast page switching and jumping functions, and redirecting to a new tab

// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*

// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1354861/SyntaxSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

(function() {
    /* (0 = false | 1 = true | 2~n = mode) */
    const Global={ /* 全域功能 */
        SidebarCollapse: 1, // 側邊攔摺疊
        DeleteNotice: 1,    // 刪除上方公告
        FixArtist: 1,       // 修復作者名稱
        BlockAds: 1,        // 封鎖廣告
        KeyScroll: 1,       // 上下鍵觸發自動滾動 [mode: 1 = 動畫偵滾動, mode: 2 = 間隔滾動] (選擇對於自己較順暢的, coomer 無效他被阻止了)
    }, Preview={ /* 預覽頁面 */
        QuickPostToggle: 1, // 快速切換帖子
        NewTabOpens: 1,     // 以新分頁開啟
        CardText: 1,        // 預覽卡文字效果 [mode: 1 = 隱藏文字 , 2 = 淡化文字]
        CardZoom: 3,        // 縮放預覽卡大小 [mode: 1 = 單純放大 , 2 = 懸浮放大 , 3 = (1+2)]
    }, Content={ /* 內容頁面 */
        TextToLink: 1,      // 連結文本, 轉換超連結
        LinkSimplified: 1,  // 將下載連結簡化
        VideoBeautify: 1,   // 影片美化 [mode: 1 = 複製節點 , 2 = 移動節點]
        OriginalImage: 1,   // 自動原圖 [mode: 1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察後觸發]
        CommentFormat: 1,   // 評論區樣式
        ExtraButton: 1,     // 額外的下方按鈕
    }, Special={ /* 預覽頁面的 announcements */
        TextToLink: 2,      // 連結文本, 轉換超連結 [0 = false, 2 = true] 輸入錯就沒效果而已

    }, def = new Syntax();
    let PM, GF, PF, CF, DM, Lang, url = document.URL;
    PM = new class Page_Match {
        constructor() {
            this.PostsPage = /^(https?:\/\/)?(www\.)?.+\/posts\/?.*$/;
            this.SearchPage = /^(https?:\/\/)?(www\.)?.+\/artists\/?.*?$/;
            this.UserPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
            this.LinksPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+\/links\/?.*?$/;
            this.ContentPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
            this.Announcement = /^(https?:\/\/)?(www\.)?.+\/(dms|(?:.+\/user\/[^\/]+\/announcements))(\?.*)?$/;
            this.Match = {
                Content: this.ContentPage.test(url),
                Announcement: this.Announcement.test(url),
                Search: this.SearchPage.test(url) || this.LinksPage.test(url),
                AllPreview: this.PostsPage.test(url) || this.UserPage.test(url),
                Color: location.hostname.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important"
            };
        }
    }();
    GF = new class Global_Function {
        constructor() {
            this.ScrollPixels = 2;
            this.ScrollInterval = 800;
            this.fix_data = null;
            this.new_data = () => def.Storage(localStorage, "fix_record") || {};
            this.fix_tag_support = {
                ID: /Patreon|Fantia|Pixiv|Fanbox/gi,
                Patreon: "https://www.patreon.com/user?u={id}",
                Fantia: "https://fantia.jp/fanclubs/{id}/posts",
                Pixiv: "https://www.pixiv.net/users/{id}/artworks",
                Fanbox: "https://www.pixiv.net/fanbox/creator/{id}",
                NAME: /Fansly|OnlyFans/gi,
                OnlyFans: "https://onlyfans.com/{name}",
                Fansly: "https://fansly.com/{name}/posts"
            };
            this.fix_name_support = {
                pixiv: "",
                fanbox: ""
            };
            this.save_record = async save => {
                def.Storage(localStorage, "fix_record", Object.assign(this.new_data(), save));
            };
            this.fix_update = async (href, id, name_onj, tag_obj, text) => {
                const edit = GM_addElement("fix_edit", {
                    id: id,
                    class: "edit_artist",
                    textContent: "Edit"
                });
                name_onj.parentNode.insertBefore(edit, name_onj);
                name_onj.outerHTML = `<fix_name jump="${href}">${text.trim()}</fix_name>`;
                const tag_text = tag_obj.textContent;
                const support_id = this.fix_tag_support.ID;
                const support_name = this.fix_tag_support.NAME;
                if (support_id.test(tag_text)) {
                    tag_obj.innerHTML = tag_text.replace(support_id, tag => {
                        return `<fix_tag jump="${this.fix_tag_support[tag].replace("{id}", id)}">${tag}</fix_tag>`;
                    });
                } else if (support_name.test(tag_text)) {
                    tag_obj.innerHTML = tag_text.replace(support_name, tag => {
                        return `<fix_tag jump="${this.fix_tag_support[tag].replace("{name}", id)}">${tag}</fix_tag>`;
                    });
                }
            };
            this.Get = async (url, headers = {}) => {
                return new Promise(resolve => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: url,
                        headers: headers,
                        onload: response => resolve(response),
                        onerror: () => resolve(),
                        ontimeout: () => resolve()
                    });
                });
            };
            this.get_pixiv_name = async id => {
                const response = await this.Get(`https://www.pixiv.net/ajax/user/${id}?full=1&lang=ja`, {
                    referer: "https://www.pixiv.net/"
                });
                if (response.status === 200) {
                    const user = JSON.parse(response.responseText);
                    let user_name = user.body.name;
                    user_name = user_name.replace(/(c\d+)?([日月火水木金土]曜日?|[123１２３一二三]日目?)[東南西北]..?\d+\w?/i, "");
                    user_name = user_name.replace(/[@＠]?(fanbox|fantia|skeb|ファンボ|リクエスト|お?仕事|新刊|単行本|同人誌)+(.*(更新|募集|公開|開設|開始|発売|販売|委託|休止|停止)+中?[!！]?$|$)/gi, "");
                    user_name = user_name.replace(/\(\)|（）|「」|【】|[@＠_＿]+$/g, "").trim();
                    return user_name;
                } else {
                    return undefined;
                }
            };
            this.fix = async object => {
                const {
                    Url,
                    TailId,
                    Website,
                    NameObject,
                    TagObject
                } = object;
                let Record = this.fix_data[TailId];
                if (Record) {
                    this.fix_update(Url, TailId, NameObject, TagObject, Record);
                } else {
                    if (this.fix_name_support.hasOwnProperty(Website)) {
                        Record = await this.get_pixiv_name(TailId) || NameObject.textContent;
                        this.fix_update(Url, TailId, NameObject, TagObject, Record);
                        this.save_record({
                            [TailId]: Record
                        });
                    } else {
                        Record = NameObject.textContent;
                        this.fix_update(Url, TailId, NameObject, TagObject, Record);
                    }
                }
            };
        }
        async SidebarCollapse() {
            def.AddStyle(`
                .global-sidebar {
                    opacity: 0;
                    height: 100%;
                    width: 10rem;
                    display: flex;
                    position: fixed;
                    padding: 0.5em 0;
                    transition: 0.8s;
                    background: #282a2e;
                    flex-direction: column;
                    transform: translateX(-9rem);
                }
                .global-sidebar:hover {opacity: 1; transform: translateX(0rem);}
                .content-wrapper.shifted {transition: 0.7s; margin-left: 0rem;}
                .global-sidebar:hover + .content-wrapper.shifted {margin-left: 10rem;}
            `, "Effects");
        }
        async DeleteNotice() {
            const Notice = def.$$("body > div.content-wrapper.shifted > a");
            Notice ? Notice.remove() : null;
        }
        async FixArtist() {
            const origin = `${location.origin}/`;
            GF.fix_data = GF.new_data();
            DM.Dependencies("Global");
            async function search_page_fix(items) {
                items.setAttribute("fix", true);
                const link = items.href;
                const img = def.$$("img", false, items);
                const parse = link.split(origin)[1].split("/");
                img.setAttribute("jump", link);
                img.removeAttribute("src");
                items.removeAttribute("href");
                GF.fix({
                    Url: link,
                    TailId: parse[2],
                    Website: parse[0],
                    NameObject: def.$$(".user-card__name", false, items),
                    TagObject: def.$$(".user-card__service", false, items)
                });
            }
            async function other_page_fix(artist, tag = "", href = null, reTag = "<fix_view>") {
                try {
                    const parent = artist.parentNode;
                    const url = href || parent.href;
                    const parse = url.split(`${new URL(url).origin}/`)[1].split("/");
                    await GF.fix({
                        Url: url,
                        TailId: parse[2],
                        Website: parse[0],
                        NameObject: artist,
                        TagObject: tag
                    });
                    $(parent).replaceWith(function() {
                        return $(reTag, {
                            html: $(this).html()
                        });
                    });
                } catch {}
            }
            async function DynamicFix(Listen, Operat, Mode = null) {
                const observer = new MutationObserver(() => {
                    GF.fix_data = GF.new_data();
                    const wait = setInterval(() => {
                        const operat = typeof Operat === "string" ? def.$$(Operat) : Operat;
                        if (operat) {
                            clearInterval(wait);
                            switch (Mode) {
                              case 1:
                                other_page_fix(operat);
                                setTimeout(() => {
                                    observer.disconnect();
                                    observer.observe(Listen.children[0], {
                                        childList: true,
                                        subtree: false
                                    });
                                }, 300);
                                break;

                              default:
                                def.$$("a", true, operat).forEach(items => {
                                    !items.getAttribute("fix") && search_page_fix(items);
                                });
                            }
                        }
                    });
                });
                observer.observe(Listen, {
                    childList: true,
                    subtree: false
                });
            }
            if (PM.Match.Search) {
                const card_items = def.$$(".card-list__items");
                if (PM.LinksPage.test(url)) {
                    const artist = def.$$("span[itemprop='name']");
                    artist && other_page_fix(artist);
                    def.$$("a", true, card_items).forEach(items => {
                        search_page_fix(items);
                    });
                    url.endsWith("new") && DynamicFix(card_items, card_items);
                } else {
                    DynamicFix(card_items, card_items);
                }
            } else if (PM.Match.Content) {
                const artist = def.$$(".post__user-name");
                const title = def.$$("h1 span:nth-child(2)");
                other_page_fix(artist, title, artist.href, "<fix_cont>");
            } else {
                const artist = def.$$("span[itemprop='name']");
                if (artist) {
                    other_page_fix(artist);
                    if (Preview.QuickPostToggle > 0) {
                        setTimeout(() => {
                            DynamicFix(def.$$("section"), "span[itemprop='name']", 1);
                        }, 300);
                    }
                }
            }
            def.AddListener(document.body, "pointerdown", event => {
                const target = event.target;
                if (target.matches("fix_edit")) {
                    const display = target.nextElementSibling;
                    const text = GM_addElement("textarea", {
                        class: "edit_textarea",
                        style: `height: ${display.scrollHeight + 10}px;`
                    });
                    const original_name = display.textContent;
                    text.value = original_name.trim();
                    display.parentNode.insertBefore(text, target);
                    text.scrollTop = 0;
                    setTimeout(() => {
                        text.focus();
                        setTimeout(() => {
                            def.Listen(text, "blur", () => {
                                const change_name = text.value.trim();
                                if (change_name != original_name) {
                                    display.textContent = change_name;
                                    GF.save_record({
                                        [target.id]: change_name
                                    });
                                }
                                text.remove();
                            }, {
                                once: true,
                                passive: true
                            });
                        }, 50);
                    }, 300);
                } else if (target.matches("fix_name") || target.matches("fix_tag") || target.matches("img")) {
                    const jump = target.getAttribute("jump");
                    if (!target.parentNode.matches("fix_cont")) {
                        jump && GM_openInTab(jump, {
                            active: false
                        });
                    } else {
                        jump && location.assign(jump);
                    }
                }
            }, {
                capture: true,
                passive: true
            });
        }
        async BlockAds() {
            def.AddStyle(`.ad-container, .root--ujvuu {display: none !important}`, "Ad-blocking-style");
            def.AddScript(`
                const XMLRequest = XMLHttpRequest.prototype.open;
                const Ad_observer = new MutationObserver(() => {
                    XMLHttpRequest.prototype.open = function(method, url) {
                        if (url.endsWith(".m3u8") || url === "https://s.magsrv.com/v1/def.php") {return}
                        XMLRequest.apply(this, arguments);
                    };
                    try {
                        document.querySelectorAll(".ad-container").forEach(ad => {ad.remove()});
                        document.querySelector(".root--ujvuu button").click();
                    } catch {}
                });
                Ad_observer.observe(document.head, {childList: true, subtree: true});
            `, "Ad-blocking-script");
        }
        async KeyScroll(Mode) {
            let Scroll, Up_scroll = false, Down_scroll = false;
            const TopDetected = def.Throttle_discard(() => {
                Up_scroll = window.scrollY == 0 ? false : true;
            }, 1e3);
            const BottomDetected = def.Throttle_discard(() => {
                Down_scroll = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight ? false : true;
            }, 1e3);
            switch (Mode) {
              case 2:
                Scroll = Move => {
                    const Interval = setInterval(() => {
                        if (!Up_scroll && !Down_scroll) {
                            clearInterval(Interval);
                        }
                        if (Up_scroll && Move < 0) {
                            window.scrollBy(0, Move);
                            TopDetected();
                        } else if (Down_scroll && Move > 0) {
                            window.scrollBy(0, Move);
                            BottomDetected();
                        }
                    }, GF.ScrollInterval);
                };

              default:
                Scroll = Move => {
                    if (Up_scroll && Move < 0) {
                        window.scrollBy(0, Move);
                        TopDetected();
                        requestAnimationFrame(() => Scroll(Move));
                    } else if (Down_scroll && Move > 0) {
                        window.scrollBy(0, Move);
                        BottomDetected();
                        requestAnimationFrame(() => Scroll(Move));
                    }
                };
            }
            const UP_ScrollSpeed = GF.ScrollPixels * -1;
            def.Listen(window, "keydown", def.Throttle_discard(event => {
                const key = event.key;
                if (key == "ArrowUp") {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    if (Up_scroll) {
                        Up_scroll = false;
                    } else if (!Up_scroll || Down_scroll) {
                        Down_scroll = false;
                        Up_scroll = true;
                        Scroll(UP_ScrollSpeed);
                    }
                } else if (key == "ArrowDown") {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    if (Down_scroll) {
                        Down_scroll = false;
                    } else if (Up_scroll || !Down_scroll) {
                        Up_scroll = false;
                        Down_scroll = true;
                        Scroll(GF.ScrollPixels);
                    }
                }
            }, 100), {
                capture: true
            });
        }
    }();
    class Preview_Function {
        async QuickPostToggle() {
            DM.Dependencies("Preview");
            let Old_data, New_data, item;
            async function Request(link) {
                Old_data = def.$$("section");
                item = def.$$(".card-list__items");
                requestAnimationFrame(() => {
                    GM_addElement(item, "img", {
                        class: "gif-overlay"
                    });
                });
                GM_xmlhttpRequest({
                    method: "GET",
                    url: link,
                    nocache: false,
                    onload: response => {
                        New_data = def.$$("section", false, def.DomParse(response.responseText));
                        ReactDOM.render(React.createElement(Rendering, {
                            content: New_data.innerHTML
                        }), Old_data);
                        history.pushState(null, null, link);
                    },
                    onerror: error => {
                        Request(link);
                    }
                });
            }
            def.Listen(document, "click", event => {
                const target = event.target.closest("menu a");
                if (target) {
                    event.preventDefault();
                    Request(target.href);
                }
            }, {
                capture: true
            });
        }
        async NewTabOpens() {
            def.Listen(document, "click", event => {
                const target = event.target.closest("article a");
                if (target) {
                    event.preventDefault();
                    GM_openInTab(target.href, {
                        active: false,
                        insert: true
                    });
                }
            }, {
                capture: true
            });
        }
        async CardText(Mode) {
            switch (Mode) {
              case 2:
                def.AddStyle(`
                        .post-card__header, .post-card__footer {
                            opacity: 0.4;
                            transition: opacity 0.3s;
                        }
                        a:hover .post-card__header,
                        a:hover .post-card__footer {
                            opacity: 1;
                        }
                    `, "Effects");
                break;

              default:
                def.AddStyle(`
                        .post-card__header {
                            opacity: 0;
                            z-index: 1;
                            padding: 5px;
                            pointer-events: none;
                            transform: translateY(-6vh);
                        }
                        .post-card__footer {
                            opacity: 0;
                            z-index: 1;
                            padding: 5px;
                            pointer-events: none;
                            transform: translateY(6vh);
                        }
                        a:hover .post-card__header,
                        a:hover .post-card__footer {
                            opacity: 1;
                            pointer-events: auto;
                            transform: translateY(0vh);
                            transition: transform 0.4s, opacity 0.6s;
                        }
                    `, "Effects");
            }
        }
        async CardZoom(Mode) {
            switch (Mode) {
              case 2:
              case 3:
                def.AddStyle(`
                        .post-card { margin: .3vw; }
                        .post-card a img { border-radius: 8px; }
                        .post-card a {
                            border-radius: 8px;
                            border: 3px solid #fff6;
                            transition: transform 0.4s;
                        }
                        .post-card a:hover {
                            overflow: auto;
                            z-index: 99999;
                            background: #000;
                            border: 1px solid #fff6;
                            transform: scale(1.6, 1.5);
                        }
                        .post-card a::-webkit-scrollbar {
                            width: 0;
                            height: 0;
                        }
                        .post-card a:hover .post-card__image-container {
                            position: relative;
                        }
                    `, "Effects");
                if (Mode == 2) {
                    break;
                }

              default:
                def.AddStyle(`
                        * { --card-size: 13vw; }
                    `, "Effects");
            }
        }
    }
    class Content_Function {
        async TextToLink(Mode) {
            let link, text;
            const URL_F = /(?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9]+\.)?(?:[a-zA-Z0-9]+)\.[^\s]+\/[^\s]+/g, Protocol_F = /^(?!https?:\/\/)/;
            async function Analysis(father, text) {
                father.innerHTML = text.replace(URL_F, url => {
                    return `<a href="${url.replace(Protocol_F, "https://")}" target="_blank">${decodeURIComponent(url).trim()}</a>`;
                });
            }
            async function A_Analysis(A) {
                A.setAttribute("target", "_blank");
            }
            switch (Mode) {
              case 2:
                def.WaitElem("div.card-list__items pre", true, 8, content => {
                    content.forEach(pre => {
                        if (pre.childNodes.length > 1) {
                            def.$$("p", true, pre).forEach(p => {
                                text = p.textContent;
                                URL_F.test(text) && Analysis(p, text);
                            });
                            def.$$("a", true, pre).forEach(a => {
                                link = a.href;
                                link ? A_Analysis(a) : Analysis(a, a.textContent);
                            });
                        } else {
                            text = pre.textContent;
                            URL_F.test(text) && Analysis(pre, text);
                        }
                    });
                }, document, 600);
                break;

              default:
                def.WaitElem("div.post__body", false, 8, body => {
                    const article = def.$$("article", false, body);
                    const content = def.$$("div.post__content", false, body);
                    if (article) {
                        def.$$("span.choice-text", true, article).forEach(span => {
                            Analysis(span, span.textContent);
                        });
                    } else if (content) {
                        const pre = def.$$("pre", false, content);
                        if (pre) {
                            text = pre.textContent;
                            URL_F.test(text) && Analysis(pre, text);
                        } else {
                            def.$$("p", true, content).forEach(p => {
                                text = p.textContent;
                                URL_F.test(text) && Analysis(p, text);
                            });
                            def.$$("a", true, content).forEach(a => {
                                link = a.href;
                                link ? A_Analysis(a) : Analysis(a, a.textContent);
                            });
                        }
                    }
                }, document.body, 600);
            }
        }
        async LinkSimplified() {
            def.WaitElem("a.post__attachment-link", true, 5, post => {
                post.forEach(link => {
                    link.setAttribute("download", "");
                    link.href = decodeURIComponent(link.href);
                    link.textContent = link.textContent.replace("Download", "").trim();
                });
            }, document.body, 600);
        }
        async VideoBeautify(Mode) {
            def.AddStyle(`
                .video-title {margin-top: 0.5rem;}
                .post-video {height: 50%; width: 60%;}
            `, "Effects");
            def.WaitElem("ul[style*='text-align: center;list-style-type: none;'] li", true, 5, parents => {
                def.WaitElem("a.post__attachment-link", true, 5, post => {
                    function VideoRendering({
                        stream
                    }) {
                        return React.createElement("summary", {
                            className: "video-title"
                        }, React.createElement("video", {
                            key: "video",
                            controls: true,
                            preload: "auto",
                            "data-setup": JSON.stringify({}),
                            className: "post-video"
                        }, React.createElement("source", {
                            key: "source",
                            src: stream.src,
                            type: stream.type
                        })));
                    }
                    parents.forEach(li => {
                        let title = def.$$("summary", false, li), stream = def.$$("source", false, li);
                        if (title && stream) {
                            post.forEach(link => {
                                if (link.textContent.includes(title.textContent)) {
                                    switch (Mode) {
                                      case 2:
                                        link.parentNode.remove();
                                        title = link;

                                      default:
                                        title = link.cloneNode(true);
                                        return;
                                    }
                                }
                            });
                            ReactDOM.render(React.createElement(VideoRendering, {
                                stream: stream
                            }), li);
                            li.insertBefore(title, def.$$("summary", false, li));
                        }
                    });
                }, document.body, 600);
            }, document.body, 600);
        }
        async OriginalImage(Mode) {
            let img, a;
            DM.Dependencies("Postview");
            def.WaitElem("div.post__thumbnail", true, 5, thumbnail => {
                function ImgRendering({
                    ID,
                    href
                }) {
                    return React.createElement("div", {
                        id: ID,
                        className: "Image-link"
                    }, React.createElement("img", {
                        key: "img",
                        src: href.href,
                        className: "Image-loading-indicator Image-style",
                        onLoad: function() {
                            def.$$(`#${ID} img`).classList.remove("Image-loading-indicator");
                        },
                        onError: function() {
                            Reload(def.$$(`#${ID} img`), 10);
                        }
                    }));
                }
                async function FastAuto() {
                    thumbnail.forEach((object, index) => {
                        setTimeout(() => {
                            object.removeAttribute("class");
                            a = def.$$("a", false, object);
                            ReactDOM.render(React.createElement(ImgRendering, {
                                ID: `IMG-${index}`,
                                href: a
                            }), object);
                        }, index * 300);
                    });
                    def.AddListener(document, "click", event => {
                        const target = event.target.matches(".Image-link img");
                        if (target && target.alt == "Loading Failed") {
                            const src = img.src;
                            img.src = "";
                            img.src = src;
                        }
                    }, {
                        capture: true,
                        passive: true
                    });
                }
                function Replace(index) {
                    if (index == thumbnail.length) {
                        return;
                    }
                    const object = thumbnail[index];
                    object.removeAttribute("class");
                    a = def.$$("a", false, object);
                    img = def.$$("img", false, a);
                    Object.assign(img, {
                        className: "Image-loading-indicator Image-style",
                        src: a.href
                    });
                    img.removeAttribute("data-src");
                    a.id = `IMG-${index}`;
                    a.removeAttribute("href");
                    a.removeAttribute("download");
                    img.onload = function() {
                        img.classList.remove("Image-loading-indicator");
                        Replace(++index);
                    };
                }
                const observer = new IntersectionObserver(observed => {
                    observed.forEach(entry => {
                        if (entry.isIntersecting) {
                            const object = entry.target;
                            observer.unobserve(object);
                            ReactDOM.render(React.createElement(ImgRendering, {
                                ID: object.alt,
                                href: def.$$("a", false, object)
                            }), object);
                            object.removeAttribute("class");
                        }
                    });
                }, {
                    threshold: .3
                });
                switch (Mode) {
                  case 2:
                    Replace(0);
                    break;

                  case 3:
                    thumbnail.forEach((object, index) => {
                        object.alt = `IMG-${index}`;
                        observer.observe(object);
                    });
                    break;

                  default:
                    if (document.visibilityState === "hidden") {
                        def.AddListener(document, "visibilitychange", () => {
                            if (document.visibilityState === "visible") {
                                def.RemovListener(document, "visibilitychange");
                                FastAuto();
                            }
                        });
                    } else {
                        FastAuto();
                    }
                }
            }, document.body, 600);
            async function Reload(Img, Retry) {
                if (Retry > 0) {
                    setTimeout(() => {
                        let src = Img.src;
                        Img.src = "";
                        Object.assign(Img, {
                            src: src,
                            alt: "Loading Failed"
                        });
                        Img.onload = function() {
                            Img.classList.remove("Image-loading-indicator");
                        };
                        Img.onerror = function() {
                            Reload(Img, Retry - 1);
                        };
                    }, 1e3);
                }
            }
        }
        async CommentFormat() {
            def.AddStyle(`
                .post__comments {display: flex; flex-wrap: wrap;}
                .post__comments>*:last-child {margin-bottom: 0.5rem;}
                .comment {
                    margin: 0.5rem;
                    max-width: 25rem;
                    border-radius: 10px;
                    flex-basis: calc(35%);
                    word-break: break-all;
                    border: 0.125em solid var(--colour1-secondary);
                }
            `, "Effects");
        }
        async ExtraButton() {
            DM.Dependencies("Awesome");
            async function Initialization() {
                const Call = {
                    USE: (Select, FuncName) => {
                        Select > 0 && FuncName(Select);
                    },
                    FixArtist: s => Call.USE(s, GF.FixArtist),
                    TextToLink: s => Call.USE(s, CF.TextToLink),
                    LinkSimplified: s => Call.USE(s, CF.LinkSimplified),
                    OriginalImage: s => Call.USE(s, CF.OriginalImage),
                    VideoBeautify: s => Call.USE(s, CF.VideoBeautify),
                    CommentFormat: s => Call.USE(s, CF.CommentFormat),
                    ExtraButton: s => Call.USE(s, CF.ExtraButton)
                }, Start = async Type => {
                    Object.entries(Type).forEach(([ func, set ]) => Call.hasOwnProperty(func) && Call[func](set));
                };
                Start(Global);
                Start(Content);
                def.$$("div.post__content p", true).forEach(p => {
                    p.childNodes.forEach(node => {
                        node.nodeName == "BR" && node.parentNode.remove();
                    });
                });
                def.$$("div.post__content a", true).forEach(a => {
                    /\.(jpg|jpeg|png|gif)$/i.test(a.href) && a.remove();
                });
                def.$$("h1.post__title").scrollIntoView();
            }
            async function AjexReplace(url, old_main) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    nocache: false,
                    onload: response => {
                        let New_main = def.$$("main", false, def.DomParse(response.responseText));
                        ReactDOM.render(React.createElement(Rendering, {
                            content: New_main.innerHTML
                        }), old_main);
                        history.pushState(null, null, url);
                        setTimeout(Initialization(), 500);
                    }
                });
            }
            def.WaitElem("h2.site-section__subheading", false, 8, comments => {
                const prev = def.$$("a.post__nav-link.prev");
                const next = def.$$("a.post__nav-link.next");
                const svg = document.createElement("svg");
                svg.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
                        <style>svg{fill: ${PM.Match.Color}}</style>
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
                    </svg>
                `;
                def.Buffer.appendChild(svg);
                def.Listen(svg, "click", () => {
                    def.$$("header").scrollIntoView();
                }, {
                    capture: true,
                    passive: true
                });
                try {
                    const span = document.createElement("span");
                    span.id = "next_box";
                    span.style = "float: right";
                    const next_btn = next.cloneNode(true);
                    next_btn.setAttribute("jump", next_btn.href);
                    next_btn.removeAttribute("href");
                    span.appendChild(next_btn);
                    def.Buffer.appendChild(span);
                    def.Listen(next_btn, "click", () => {
                        AjexReplace(next_btn.getAttribute("jump"), def.$$("main"));
                    }, {
                        capture: true,
                        once: true
                    });
                } catch {}
                comments.appendChild(def.Buffer);
            }, document.body, 600);
        }
    }
    DM = new class Dependencies_And_Menu {
        ImgRules = null;
        GetSet = null;
        Set = null;
        styleRules = {
            img_h: value => requestAnimationFrame(() => {
                DM.ImgRules[0].style.height = value;
            }),
            img_w: value => requestAnimationFrame(() => {
                DM.ImgRules[0].style.width = value;
            }),
            img_mw: value => requestAnimationFrame(() => {
                DM.ImgRules[0].style.maxWidth = value;
            }),
            img_gap: value => requestAnimationFrame(() => {
                DM.ImgRules[0].style.margin = `${value} auto`;
            }),
            MT: value => requestAnimationFrame(() => {
                DM.ImgRules[3].style.top = value;
            }),
            ML: value => requestAnimationFrame(() => {
                DM.ImgRules[3].style.left = value;
            })
        };
        Dependencies(type) {
            switch (type) {
              case "Global":
                const Color = PM.Match.Color;
                def.AddStyle(`
                        /* 搜尋頁面的樣式 */
                        fix_tag:hover { color: ${Color}; }
                        .fancy-image__image, fix_name, fix_tag, fix_edit {
                            cursor: pointer;
                        }
                        .user-card__info {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        fix_name {
                            color: #fff;
                            font-size: 28px;
                            font-weight: 500;
                            max-width: 320px;
                            overflow: hidden;
                            padding: .25rem .1rem;
                            border-radius: .25rem;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }
                        .edit_artist {
                            position: absolute;
                            top: 36%;
                            right: 8%;
                            color: #fff;
                            display: none;
                            font-size: 14px;
                            font-weight: 700;
                            background: #666;
                            white-space: nowrap;
                            padding: .25rem .5rem;
                            border-radius: .25rem;
                            transform: translateY(-100%);
                        }
                        .edit_textarea {
                            color: #fff;
                            display: block;
                            font-size: 30px;
                            padding: 6px 1px;
                            line-height: 5vh;
                            text-align: center;
                        }
                        .user-card:hover .edit_artist {
                            display: block;
                        }
                        .user-card:hover fix_name {
                            background-color: ${Color};
                        }
                        .edit_textarea ~ fix_name,
                        .edit_textarea ~ .edit_artist {
                            display: none !important;
                        }
                    
                        /* 預覽頁面的樣式 */
                        fix_view {
                            display: flex;
                            flex-flow: wrap;
                            align-items: center;
                        }
                        fix_view fix_name {
                            font-size: 2rem;
                            font-weight: 700;
                            padding: .25rem 3rem;
                            border-radius: .25rem;
                            transition: background-color 0.3s ease;
                        }
                        fix_view .edit_artist {
                            top: 40%;
                            right: 5%;
                            transform: translateY(-80%);
                        }
                        fix_view:hover fix_name {
                            background-color: ${Color};
                        }
                        fix_view:hover .edit_artist {
                            display: block;
                        }

                        /* 內容頁面的樣式 */
                        fix_cont {
                            display: flex;
                            justify-content: space-around;
                        }
                        fix_cont fix_name {
                            color: ${Color};
                            font-size: 1.25em;
                            display: inline-block;
                        }
                        fix_cont .edit_artist {
                            top: 95%;
                            right: -10%;
                        }
                        fix_cont:hover fix_name {
                            background-color: #fff;
                        }
                        fix_cont:hover .edit_artist {
                            display: block;
                        }
                    `, "Global-Effects");
                break;

              case "Preview":
                def.AddStyle(`
                        .gif-overlay {
                            top: 45%;
                            left: 50%;
                            width: 60%;
                            height: 60%;
                            opacity: 0.5;
                            z-index: 9999;
                            position: absolute;
                            border-radius: 50%;
                            background-size: contain;
                            background-position: center;
                            background-repeat: no-repeat;
                            transform: translate(-50%, -50%);
                            background-image: url("https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif");
                        }
                        .card-list__items {
                            gap: 0.5em;
                            display: flex;
                            grid-gap: 0.5em;
                            position: relative;
                            align-items: var(--local-align);
                            flex-flow: var(--local-flex-flow);
                            justify-content: var(--local-justify);
                        }
                    `, "Preview-Effects");
                break;

              case "Postview":
                DM.GetSet = {
                    MenuSet: () => {
                        const data = def.store("get", "MenuSet") || [ {
                            MT: "2vh",
                            ML: "50vw"
                        } ];
                        return data[0];
                    },
                    ImgSet: () => {
                        const data = def.store("get", "ImgSet") || [ {
                            img_h: "auto",
                            img_w: "auto",
                            img_mw: "100%",
                            img_gap: "0px"
                        } ];
                        return data[0];
                    }
                };
                DM.Set = DM.GetSet.ImgSet();
                def.AddStyle(`
                        .Image-style {
                            display: block;
                            width: ${DM.Set.img_w};
                            height: ${DM.Set.img_h};
                            margin: ${DM.Set.img_gap} auto;
                            max-width: ${DM.Set.img_mw};
                        }
                        .Image-loading-indicator {
                            min-height: 60vh;
                            min-width: 60vW;
                            border: 1px solid #fafafa;
                        }
                    `, "Custom-style");
                break;

              case "Awesome":
                def.AddStyle(`
                        ${GM_getResourceText("font-awesome")}
                        #next_box a {
                            cursor: pointer;
                        }
                        #next_box a:hover {
                            background-color: ${PM.Match.Color};
                        }
                    `, "font-awesome");
                break;

              case "Menu":
                DM.Set = DM.GetSet.MenuSet();
                def.AddScript(`
                        function check(value) {
                            if (value.toString().length > 4 || value > 1000) {
                                value = 1000;
                            } else if (value < 0) {
                                value = 0;
                            }
                            return value || 0;
                        }
                    `);
                def.AddStyle(`
                        .modal-background {
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            z-index: 9999;
                            overflow: auto;
                            position: fixed;
                            pointer-events: none;
                        }
                        /* 模態介面 */
                        .modal-interface {
                            top: ${DM.Set.MT};
                            left: ${DM.Set.ML};
                            margin: 0;
                            display: flex;
                            overflow: auto;
                            position: fixed;
                            border-radius: 5px;
                            pointer-events: auto;
                            background-color: #2C2E3E;
                            border: 3px solid #EE2B47;
                        }
                        /* 模態內容盒 */
                        .modal-box {
                            padding: 0.5rem;
                            height: 50vh;
                            width: 32vw;
                        }
                        /* 菜單框架 */
                        .menu {
                            width: 5.5vw;
                            overflow: auto;
                            text-align: center;
                            vertical-align: top;
                            border-radius: 2px;
                            border: 2px solid #F6F6F6;
                        }
                        /* 菜單文字標題 */
                        .menu-text {
                            color: #EE2B47;
                            cursor: default;
                            padding: 0.2rem;
                            margin: 0.3rem;
                            margin-bottom: 1.5rem;
                            white-space: nowrap;
                            border-radius: 10px;
                            border: 4px solid #f05d73;
                            background-color: #1f202c;
                        }
                        /* 菜單選項按鈕 */
                        .menu-options {
                            cursor: pointer;
                            font-size: 1.4rem;
                            color: #F6F6F6;
                            font-weight: bold;
                            border-radius: 5px;
                            margin-bottom: 1.2rem;
                            border: 5px inset #EE2B47;
                            background-color: #6e7292;
                            transition: color 0.8s, background-color 0.8s;
                        }
                        .menu-options:hover {
                            color: #EE2B47;
                            background-color: #F6F6F6;
                        }
                        .menu-options:disabled {
                            color: #6e7292;
                            cursor: default;
                            background-color: #c5c5c5;
                            border: 5px inset #faa5b2;
                        }
                        /* 設置內容框架 */
                        .content {
                            height: 48vh;
                            width: 28vw;
                            overflow: auto;
                            padding: 0px 1rem;
                            border-radius: 2px;
                            vertical-align: top;
                            border-top: 2px solid #F6F6F6;
                            border-right: 2px solid #F6F6F6;
                        }
                        .narrative { color: #EE2B47; }
                        .Image-input-settings {
                            width: 8rem;
                            color: #F6F6F6;
                            text-align: center;
                            font-size: 1.5rem;
                            border-radius: 15px;
                            border: 3px inset #EE2B47;
                            background-color: #202127;
                        }
                        .Image-input-settings:disabled {
                            border: 3px inset #faa5b2;
                            background-color: #5a5a5a;
                        }
                        /* 底部按鈕框架 */
                        .button-area {
                            display: flex;
                            padding: 0.3rem;
                            border-left: none;
                            border-radius: 2px;
                            border: 2px solid #F6F6F6;
                            justify-content: space-between;
                        }
                        .button-area select {
                            color: #F6F6F6;
                            margin-right: 1.5rem;
                            border: 3px inset #EE2B47;
                            background-color: #6e7292;
                        }
                        /* 底部選項 */
                        .button-options {
                            color: #F6F6F6;
                            cursor: pointer;
                            font-size: 0.8rem;
                            font-weight: bold;
                            border-radius: 10px;
                            white-space: nowrap;
                            background-color: #6e7292;
                            border: 3px inset #EE2B47;
                            transition: color 0.5s, background-color 0.5s;
                        }
                        .button-options:hover {
                            color: #EE2B47;
                            background-color: #F6F6F6;
                        }
                        .button-space { margin: 0 0.6rem; }
                        .form-hidden {
                            opacity: 0;
                            height: 0;
                            width: 0;
                            overflow: hidden;
                            transition: opacity 0.8s, height 0.8s, width 0.8s;
                        }
                        .toggle-menu {
                            height: 0;
                            width: 0;
                            padding: 0;
                            margin: 0;
                        }
                        /* 整體框線 */
                        table, td {
                            margin: 0px;
                            padding: 0px;
                            overflow: auto;
                            border-spacing: 0px;
                        }
                        .modal-background p { 
                            display: flex;
                            flex-wrap: nowrap;
                        }
                        option { color: #F6F6F6; }
                        ul {
                            list-style: none;
                            padding: 0px;
                            margin: 0px;
                        }
                    `, "Custom-style");
                break;
            }
        }
        async Menu() {
            if (!def.$$(".modal-background")) {
                DM.ImgRules = def.$$("#Custom-style").sheet.cssRules;
                DM.Set = DM.GetSet.ImgSet();
                let parent, child, img_input, img_select, img_set, analyze;
                const img_data = [ DM.Set.img_h, DM.Set.img_w, DM.Set.img_mw, DM.Set.img_gap ];
                const menu = `
                    <div class="modal-background">
                        <div class="modal-interface">
                            <table class="modal-box">
                                <tr>
                                    <td class="menu">
                                        <h2 class="menu-text">${Lang.MT_01}</h2>
                                        <ul>
                                            <li>
                                                <a class="toggle-menu" href="#image-settings-show">
                                                    <button class="menu-options" id="image-settings">${Lang.MO_01}</button>
                                                </a>
                                            <li>
                                            <li>
                                                <a class="toggle-menu" href="#">
                                                    <button class="menu-options" disabled>null</button>
                                                </a>
                                            <li>
                                        </ul>
                                    </td>
                                    <td>
                                        <table>
                                            <tr>
                                                <td class="content" id="set-content">
                                                    <div id="image-settings-show" class="form-hidden">
                                                        <div>
                                                            <h2 class="narrative">${Lang.MIS_01}：</h2>
                                                            <p><input type="number" id="img_h" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Lang.MIS_02}：</h2>
                                                            <p><input type="number" id="img_w" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Lang.MIS_03}：</h2>
                                                            <p><input type="number" id="img_mw" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Lang.MIS_04}：</h2>
                                                            <p><input type="number" id="img_gap" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="button-area">
                                                    <select id="language">
                                                        <option value="" disabled selected>${Lang.ML_01}</option>
                                                        <option value="en">${Lang.ML_02}</option>
                                                        <option value="zh-TW">${Lang.ML_03}</option>
                                                        <option value="zh-CN">${Lang.ML_04}</option>
                                                        <option value="ja">${Lang.ML_05}</option>
                                                    </select>
                                                    <button id="readsettings" class="button-options" disabled>${Lang.MB_01}</button>
                                                    <span class="button-space"></span>
                                                    <button id="closure" class="button-options">${Lang.MB_02}</button>
                                                    <span class="button-space"></span>
                                                    <button id="application" class="button-options">${Lang.MB_03}</button>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `;
                const UnitOptions = `
                    <select class="Image-input-settings" style="margin-left: 1rem;">
                        <option value="px" selected>px</option>
                        <option value="%">%</option>
                        <option value="rem">rem</option>
                        <option value="vh">vh</option>
                        <option value="vw">vw</option>
                        <option value="auto">auto</option>
                    </select>
                `;
                $(document.body).append(menu);
                $(".modal-interface").draggable({
                    cursor: "grabbing"
                });
                $(".modal-interface").tabs();
                function Menu_Close() {
                    $(".modal-background").remove();
                }
                async function PictureSettings() {
                    $on(".Image-input-settings", "input change", function(event) {
                        event.stopPropagation();
                        const target = $(this), value = target.val(), id = target.attr("id");
                        parent = target.closest("div");
                        if (isNaN(value)) {
                            child = parent.find("input");
                            if (value === "auto") {
                                child.prop("disabled", true);
                                DM.styleRules[child.attr("id")](value);
                            } else {
                                child.prop("disabled", false);
                                DM.styleRules[child.attr("id")](`${child.val()}${value}`);
                            }
                        } else {
                            child = parent.find("select");
                            DM.styleRules[id](`${value}${child.val()}`);
                        }
                    });
                }
                $("#language").val(def.store("get", "language") || "");
                $on("#language", "input change", function(event) {
                    event.stopPropagation();
                    const value = $(this).val();
                    Lang = DM.language(value);
                    GM_setValue("language", value);
                    $("#language").off("input change");
                    Menu_Close();
                    DM.Menu();
                });
                let save = {}, set_value;
                $on(".modal-interface", "click", function(event) {
                    const id = $(event.target).attr("id");
                    if (id == "image-settings") {
                        img_set = $("#image-settings-show");
                        if (img_set.css("opacity") === "0") {
                            img_set.find("p").each(function() {
                                $(this).append(UnitOptions);
                            });
                            img_set.css({
                                height: "auto",
                                width: "auto",
                                opacity: 1
                            });
                            $("#readsettings").prop("disabled", false);
                            PictureSettings();
                        }
                    } else if (id == "readsettings") {
                        img_set = $("#image-settings-show").find("p");
                        img_data.forEach((read, index) => {
                            img_input = img_set.eq(index).find("input");
                            img_select = img_set.eq(index).find("select");
                            if (read == "auto") {
                                img_input.prop("disabled", true);
                                img_select.val(read);
                            } else {
                                analyze = read.match(/^(\d+)(\D+)$/);
                                img_input.val(analyze[1]);
                                img_select.val(analyze[2]);
                            }
                        });
                    } else if (id == "application") {
                        img_set = $("#image-settings-show").find("p");
                        img_data.forEach((read, index) => {
                            img_input = img_set.eq(index).find("input");
                            img_select = img_set.eq(index).find("select");
                            if (img_select.val() == "auto") {
                                set_value = "auto";
                            } else if (img_input.val() == "") {
                                set_value = read;
                            } else {
                                set_value = `${img_input.val()}${img_select.val()}`;
                            }
                            save[img_input.attr("id")] = set_value;
                        });
                        GM_setValue("ImgSet", [ save ]);
                        save = {};
                        const menu_location = $(".modal-interface");
                        const top = menu_location.css("top");
                        const left = menu_location.css("left");
                        save["MT"] = top;
                        save["ML"] = left;
                        GM_setValue("MenuSet", [ save ]);
                        DM.styleRules["MT"](top);
                        DM.styleRules["ML"](left);
                        Menu_Close();
                    } else if (id == "closure") {
                        Menu_Close();
                    }
                });
            }
        }
        language(lang) {
            const Display = {
                Traditional: {
                    RM_01: "📝 設置選單",
                    MT_01: "設置菜單",
                    MO_01: "圖像設置",
                    MB_01: "讀取設定",
                    MB_02: "關閉離開",
                    MB_03: "保存應用",
                    ML_01: "語言",
                    ML_02: "英文",
                    ML_03: "繁體",
                    ML_04: "簡體",
                    ML_05: "日文",
                    MIS_01: "圖片高度",
                    MIS_02: "圖片寬度",
                    MIS_03: "圖片最大寬度",
                    MIS_04: "圖片間隔高度"
                },
                Simplified: {
                    RM_01: "📝 设置菜单",
                    MT_01: "设置菜单",
                    MO_01: "图像设置",
                    MB_01: "读取设置",
                    MB_02: "关闭退出",
                    MB_03: "保存应用",
                    ML_01: "语言",
                    ML_02: "英文",
                    ML_03: "繁体",
                    ML_04: "简体",
                    ML_05: "日文",
                    MIS_01: "图片高度",
                    MIS_02: "图片宽度",
                    MIS_03: "图片最大宽度",
                    MIS_04: "图片间隔高度"
                },
                Japan: {
                    RM_01: "📝 設定メニュー",
                    MT_01: "設定メニュー",
                    MO_01: "画像設定",
                    MB_01: "設定の読み込み",
                    MB_02: "閉じて終了する",
                    MB_03: "保存して適用する",
                    ML_01: "言語",
                    ML_02: "英語",
                    ML_03: "繁体字",
                    ML_04: "簡体字",
                    ML_05: "日本語",
                    MIS_01: "画像の高さ",
                    MIS_02: "画像の幅",
                    MIS_03: "画像の最大幅",
                    MIS_04: "画像の間隔の高さ"
                },
                English: {
                    RM_01: "📝 Settings Menu",
                    MT_01: "Settings Menu",
                    MO_01: "Image Settings",
                    MB_01: "Load Settings",
                    MB_02: "Close and Exit",
                    MB_03: "Save and Apply",
                    ML_01: "Language",
                    ML_02: "English",
                    ML_03: "Traditional Chinese",
                    ML_04: "Simplified Chinese",
                    ML_05: "Japanese",
                    MIS_01: "Image Height",
                    MIS_02: "Image Width",
                    MIS_03: "Maximum Image Width",
                    MIS_04: "Image Spacing Height"
                }
            }, Match = {
                "zh-TW": Display["Traditional"],
                "zh-HK": Display["Traditional"],
                "zh-MO": Display["Traditional"],
                "zh-CN": Display["Simplified"],
                "zh-SG": Display["Simplified"],
                "en-US": Display["English"],
                ja: Display["Japan"]
            };
            return Match[lang] || Match["en-US"];
        }
    }();
    new class Enhance {
        constructor() {
            this.Run();
        }
        async Run() {
            const Call = {
                USE: (Select, FuncName) => {
                    Select > 0 && FuncName(Select);
                },
                SidebarCollapse: s => Call.USE(s, GF.SidebarCollapse),
                DeleteNotice: s => Call.USE(s, GF.DeleteNotice),
                FixArtist: s => Call.USE(s, GF.FixArtist),
                BlockAds: s => Call.USE(s, GF.BlockAds),
                KeyScroll: s => Call.USE(s, GF.KeyScroll),
                QuickPostToggle: s => Call.USE(s, PF.QuickPostToggle),
                NewTabOpens: s => Call.USE(s, PF.NewTabOpens),
                CardText: s => Call.USE(s, PF.CardText),
                CardZoom: s => Call.USE(s, PF.CardZoom),
                TextToLink: s => Call.USE(s, CF.TextToLink),
                LinkSimplified: s => Call.USE(s, CF.LinkSimplified),
                OriginalImage: s => Call.USE(s, CF.OriginalImage),
                VideoBeautify: s => Call.USE(s, CF.VideoBeautify),
                CommentFormat: s => Call.USE(s, CF.CommentFormat),
                ExtraButton: s => Call.USE(s, CF.ExtraButton)
            }, Start = async Type => {
                Object.entries(Type).forEach(([ func, set ]) => Call.hasOwnProperty(func) && Call[func](set));
            };
            Start(Global);
            if (PM.Match.AllPreview) {
                PF = new Preview_Function();
                Start(Preview);
            } else if (PM.Match.Announcement) {
                CF = new Content_Function();
                Start(Special);
            } else if (PM.Match.Content) {
                CF = new Content_Function();
                Start(Content);
                DM.Dependencies("Menu");
                Lang = DM.language(def.store("get", "language"));
                def.Menu({
                    [Lang.RM_01]: {
                        func: () => DM.Menu()
                    }
                });
            }
        }
    }();
    function Rendering({
        content
    }) {
        return React.createElement("div", {
            dangerouslySetInnerHTML: {
                __html: content
            }
        });
    }
    async function $on(element, type, listener) {
        $(element).on(type, listener);
    }
})();
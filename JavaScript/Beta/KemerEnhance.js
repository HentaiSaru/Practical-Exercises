// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.45
// @author       HentaiSaru
// @description        側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-TW  側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-CN  侧边栏收缩美化界面 , 自动加载原图 , 简易隐藏广告 , 浏览翻页优化 , 自动开新分页 , 影片区块优化 , 底部添加下一页与回到顶部按钮
// @description:ja     サイドバーを縮小してインターフェースを美しくし、オリジナル画像を自動的に読み込み、広告を簡単に非表示にし、ページの閲覧とページめくりを最適化し、新しいページを自動的に開き、ビデオセクションを最適化し、下部に「次のページ」と「トップに戻る」ボタンを追加し。
// @description:en     Collapse the sidebar to beautify the interface, automatically load original images, easily hide ads, optimize page browsing and flipping, automatically open new pages, optimize the video section, add next page and back to top buttons at the bottom.

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
// @require      https://update.greasyfork.org/scripts/487608/1331914/GrammarSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

(function () {
    /* (0 = false | 1 = true) */
    const Global={ /* 全域功能 */
        SidebarCollapse: 1, // 側邊攔摺疊
        DeleteNotice: 1,    // 刪除上方公告
        BlockAds: 1,        // 封鎖廣告
    }, Preview={ /* 預覽帖子頁面 */
        QuickPostToggle: 1, // 快速切換帖子
        NewTabOpens: 1,     // 以新分頁開啟
        CardText: 1,        // 預覽卡文字效果 [1 = 隱藏文字 , 2 = 淡化文字]
        CardZoom: 1,        // 縮放預覽卡大小
    }, Content={ /* 帖子內容頁面 */
        TextToLink: 1,      // 將內容文字的, 連結文本轉換成超連結
        LinkSimplified: 1,  // 將下載連結簡化
        VideoBeautify: 1,   // 影片美化 [1 = 複製節點 , 2 = 移動節點]
        OriginalImage: 1,   // 自動原圖 [1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察後觸發]
        CommentFormat: 1,   // 評論區樣式
        ExtraButton: 1,     // 額外的下方按鈕

    }, api = new API();

    let PF, CF, Language; // 需要時才實例化

    /* ==================== 全域功能 ==================== */
    class Global_Function {
        /* 收縮側邊攔 */
        async SidebarCollapse() {
            api.AddStyle(`
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

        /* 刪除公告通知 */
        async DeleteNotice() {
            const Notice = api.$$("body > div.content-wrapper.shifted > a");
            Notice ? Notice.remove() : null;
        }

        /* (阻止/封鎖)廣告 */
        async BlockAds() {
            api.AddStyle(`.ad-container, .root--ujvuu {display: none !important}`, "Ad-blocking-style");
            api.AddScript(`
                const XMLRequest = XMLHttpRequest.prototype.open;
                const Ad_observer = new MutationObserver(() => {
                    XMLHttpRequest.prototype.open = function(method, url) {
                        if (url.endsWith(".m3u8") || url === "https://s.magsrv.com/v1/api.php") {return}
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
    }

    /* ==================== 預覽頁功能 ==================== */
    class Preview_Function {
        /* 預覽快速切換 */
        async QuickPostToggle() {
            DM.Dependencies("Preview");
            let Old_data, New_data, item;
            async function Request(link) { // 請求數據
                Old_data = api.$$("section");
                item = api.$$("div.card-list__items");
                GM_addElement(item, "img", {class: "gif-overlay"});
                GM_xmlhttpRequest({
                    method: "GET",
                    url: link,
                    nocache: false,
                    onload: response => {
                        New_data = api.$$("section", false, api.DomParse(response.responseText));
                        ReactDOM.render(React.createElement(Rendering, { content: New_data.innerHTML }), Old_data);
                        history.pushState(null, null, link);
                    },
                    onerror: error => {Request(link)}
                });
            }
            api.Listen(document, "click", event => {
                const target = event.target.closest("menu a");
                if (target) {
                    event.preventDefault();
                    Request(target.href);
                }
            }, {capture: true})
        }

        /* 將預覽頁面都變成開新分頁 */
        async NewTabOpens() {
            api.Listen(document, "click", event => {
                const target = event.target.closest("article a");
                if (target) {
                    event.preventDefault();
                    GM_openInTab(target.href, { active: false, insert: true });
                }
            }, {capture: true})
        }

        /* 帖子說明文字淡化 */
        async CardText(Mode) {
            switch (Mode) {
                case 2:
                    api.AddStyle(`
                        .post-card__header, .post-card__footer {
                            opacity: 0.4;
                            transition: opacity 0.3s;
                        }
                        a:hover .post-card__header,
                        a:hover .post-card__footer {
                            opacity: 1;
                        }
                    `, "Effects");break;
                default:
                    api.AddStyle(`
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

        /* 帖子預覽卡縮放 */
        async CardZoom() {
            api.AddStyle(`
                * { --card-size: 12vw; }
            `, "Effects");
        }
    }

    /* ==================== 內容頁功能 ==================== */
    class Content_Function {
        buffer = null;

        /* 連結文本轉換成超連結 */
        async TextToLink() {
            const URL_F = /(?:https?:\/\/[^\s]+|[a-zA-Z0-9]+\.com\/[^\s]+)/g, Protocol_F = /^(?!https?:\/\/).*/g;
            async function Analysis(father, text) {
                father.innerHTML = text.replace(URL_F, url => {
                    const link = Protocol_F.test(url) ? `https://${url}` : url;
                    return `<a href="${link}" target="_blank">${decodeURIComponent(url)}</a>`;
                });
            }
            // 進階檢測
            function Advanced(element) {
                const parent = element.parentNode;
                const clone = parent.cloneNode(true);
                clone.removeChild(api.$$("a", false, clone))
                return clone.textContent.trim();
            }
            api.WaitElem("div.post__body", false, 8, body => {
                const article = api.$$("article", false, body);
                const content = api.$$("div.post__content", false, body);
                if (article) {
                    api.$$("span.choice-text", true, article).forEach(span => {Analysis(span, span.textContent)});
                } else if (content) {
                    const pre = api.$$("pre", false, content);
                    if (pre) {Analysis(pre, pre.textContent)} // 單一個 Pre 標籤的狀態
                    else {
                        api.$$("p", true, content).forEach(p => {
                            const a = api.$$("a", false, p);
                            if (a) {
                                const href = a.href, text = Advanced(a); // (有 A 標籤 & 他的父元素 除去 A 還有其餘文字) | (只有 A 元素)
                                text != "" ? Analysis(a.parentNode, href + text) : Analysis(a, href);
                            } // 含有 a 標籤的狀態
                            else {Analysis(p, p.textContent)} // 只有 P 標籤的狀態
                        });
                    }
                }
            });
        }

        /* 下載連結簡化 */
        async LinkSimplified() {
            api.WaitElem("a.post__attachment-link", true, 8, post => {
                post.forEach(link => {
                    link.setAttribute("download", "");
                    link.href = decodeURIComponent(link.href);
                    link.textContent = link.textContent.replace("Download", "").trim();
                })
            });
        }

        /* 影片美化 */
        async VideoBeautify(Mode) {
            api.AddStyle(`
                .video-title {margin-top: 0.5rem;}
                .post-video {height: 50%; width: 60%;}
            `, "Effects");
            api.WaitElem("ul[style*='text-align: center;list-style-type: none;'] li", true, 5, parents => {
                api.WaitElem("a.post__attachment-link", true, 5, post => {
                    function VideoRendering({ stream }) {
                        return React.createElement("summary", {
                                className: "video-title"
                            } , React.createElement("video", {
                                key: "video",
                                controls: true,
                                preload: "auto",
                                "data-setup": JSON.stringify({}),
                                className: "post-video",
                            },
                            React.createElement("source", {
                                key: "source",
                                src: stream.src,
                                type: stream.type
                            })
                        ));
                    }
                    parents.forEach(li => {
                        let title = api.$$("summary", false, li),
                        stream = api.$$("source", false, li);
                        if (title && stream) {
                            post.forEach(link => {
                                if (link.textContent.includes(title.textContent)) {
                                    switch (Mode) {
                                        case 2: // 因為移動節點, 需要刪除再去複製, 因此不使用 break
                                            link.parentNode.remove();
                                            title = link;
                                        default:
                                            title = link.cloneNode(true);
                                            return;
                                    }
                                }
                            });
                            ReactDOM.render(React.createElement(VideoRendering, { stream: stream }), li);
                            li.insertBefore(title, api.$$("summary", false, li));
                        }
                    });
                });
            });
        }

        /* 載入原圖 */
        async OriginalImage(Mode) {
            let href, img, a;
            DM.Dependencies("Postview");
            api.WaitElem("div.post__thumbnail", true, 5, thumbnail => {
                function ImgRendering({ ID, href }) {
                    return React.createElement("a", {
                        id: ID,
                        className: "image-link"
                    }, React.createElement("img", {
                        key: "img",
                        src: href.href.split("?f=")[0],
                        className: "img-style",
                        onError: function () {Reload(ID, 10)}
                    })
                    )
                };
                // Case 2 邏輯
                function Replace(index) {
                    if (index == thumbnail.length) {return}
                    const object = thumbnail[index];
                    object.classList.remove("post__thumbnail");
                    a = api.$$("a", false, object);
                    img = api.$$("img", false, a);
                    Object.assign(img, {
                        className: "img-style",
                        src: a.href.split("?f=")[0],
                    });
                    img.removeAttribute("data-src");
                    a.id = `IMG-${index}`
                    a.removeAttribute("href");
                    a.removeAttribute("download");
                    img.onload = function() {Replace(++index)};
                };
                // Case 3 邏輯
                const observer = new IntersectionObserver(observed => {
                    observed.forEach(entry => {
                        if (entry.isIntersecting) {
                            const object = entry.target;
                            observer.unobserve(object);
                            ReactDOM.render(React.createElement(ImgRendering, { ID: object.alt, href: api.$$("a", false, object) }), object);
                            object.classList.remove("post__thumbnail");
                        }
                    });
                }, { threshold: 0.8 });
                switch (Mode) {
                    case 2:
                        Replace(0);
                        break;
                    case 3:
                        thumbnail.forEach((object, index) => {
                            object.alt = `IMG-${index}`;
                            observer.observe(object);
                        });break;

                    default:
                        thumbnail.forEach((object, index) => {
                            object.classList.remove("post__thumbnail");
                            href = api.$$("a", false, object);
                            ReactDOM.render(React.createElement(ImgRendering, { ID: `IMG-${index}`, href: href }), object);
                        });
                        // 監聽點擊事件 當點擊的是載入失敗的圖片才觸發
                        api.Listen(document, "click", event => {
                            const target = event.target.matches(".image-link img");
                            if (target && target.alt == "Loading Failed") {
                                img.src = img.src;
                            }
                        }, {capture: true, passive: true})
                }
            });

            /* 載入原圖 (死圖重試) */
            async function Reload(ID, retry) {
                if (retry > 0) {
                    setTimeout(() => {
                        let object = api.$$(`#${ID}`), old = api.$$("img", false, object), img = document.createElement("img");
                        Object.assign(img, {
                            src: old.src,
                            alt: "Loading Failed",
                            className: "img-style"
                        });
                        img.onerror = function () { Reload(ID, retry) };
                        old.remove();
                        object.appendChild(CF.buffer.appendChild(img));
                        retry--;
                    }, 1500);
                }
            }
        }

        /* 評論區樣式 */
        async CommentFormat() {
            api.AddStyle(`
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

        /* 底部按鈕創建, 監聽快捷Ajex換頁 */
        async ExtraButton() {
            DM.Dependencies("Awesome");
            /* Ajex換頁的初始化 */
            async function Initialization() {
                CF.TextToLink();
                CF.LinkSimplified();
                CF.VideoBeautify();
                CF.OriginalImage();
                CF.CommentFormat();
                CF.ExtraButton();
                if (api.$$(".post__content img", true).length > 2) {
                    api.$$(".post__content").remove();
                }
                api.$$("h1.post__title").scrollIntoView(); // 滾動到上方
            }
            /* 切換頁面 */
            async function AjexReplace(url, old_main) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    nocache: false,
                    onload: response => {
                        let New_main = api.$$("main", false, api.DomParse(response.responseText));
                        ReactDOM.render(React.createElement(Rendering, { content: New_main.innerHTML }), old_main);
                        history.pushState(null, null, url);
                        setTimeout(Initialization(), 500);
                    }
                });
            }
            api.WaitElem("h2.site-section__subheading", false, 8, comments => {
                const prev = api.$$("a.post__nav-link.prev");
                const next = api.$$("a.post__nav-link.next");
                const span = document.createElement("span");
                const svg = document.createElement("svg");
                const color = location.hostname.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important";
                span.id = "next_box";
                span.style = "float: right";
                span.appendChild(next.cloneNode(true));
                svg.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
                        <style>svg{fill: ${color}}</style>
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
                    </svg>
                `
                CF.buffer.appendChild(svg);
                CF.buffer.appendChild(span);

                api.Listen(svg, "click", () => {
                    api.$$("header").scrollIntoView();
                }, { capture: true, passive: true })
                comments.appendChild(CF.buffer);

                api.Listen(api.$$("#next_box a"), "click", event => {
                    event.preventDefault();
                    AjexReplace(next.href, api.$$("main"));
                }, { capture: true, once: true });
            });
        }

    }

    /* ==================== 依賴項目與菜單 ==================== */
    class Dependencies_And_Menu {
        ImgRules = null;
        GetSet = null;
        Set = null;
        /* 及時設置響應 */
        styleRules = {
            img_h: value => DM.ImgRules[0].style.height = value,
            img_w: value => DM.ImgRules[0].style.width = value,
            img_mw: value => DM.ImgRules[0].style.maxWidth = value,
            img_gap: value => DM.ImgRules[0].style.margin = `${value} auto`,
            MT: value => DM.ImgRules[2].style.top = value,
            ML: value => DM.ImgRules[2].style.left = value
        }

        /*
            "Preview" - 帖子預覽頁所需
            "Postview" - 觀看帖子頁所需
            "Awesome" - 觀看帖子頁圖示
            "Menu" - 創建菜單時所需
        */
        Dependencies(type) {
            switch (type) {
                case "Preview":
                    /* 快速預覽樣式添加 */
                    api.AddStyle(`
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
                            flex-flow: var(--local-flex-flow);
                            justify-content: var(--local-justify);
                            align-items: var(--local-align);
                        }
                    `, "Preview-Effects");break;

                case "Postview":
                    /* 創建DOM 緩衝區 (宣告) */
                    CF.buffer = document.createDocumentFragment();
                    /* 獲取設定 (宣告) */
                    DM.GetSet = {
                        MenuSet: () => {
                            const data = api.store("get", "MenuSet") || [{
                                "MT": "2vh",
                                "ML": "50vw",
                            }]; return data[0];
                        },
                        ImgSet: () => {
                            const data = api.store("get", "ImgSet") || [{
                                "img_h": "auto",
                                "img_w": "auto",
                                "img_mw": "100%",
                                "img_gap": "0px",
                            }]; return data[0];
                        },
                    }
                    /* 載入原圖樣式 */
                    DM.Set = DM.GetSet.ImgSet();
                    api.AddStyle(`
                        .img-style {
                            display: block;
                            width: ${DM.Set.img_w};
                            height: ${DM.Set.img_h};
                            margin: ${DM.Set.img_gap} auto;
                            max-width: ${DM.Set.img_mw};
                        }
                    `, "Custom-style");break;

                case "Awesome":
                    api.AddStyle(GM_getResourceText("font-awesome"), "font-awesome");break;

                case "Menu":
                    /* 載入菜單樣式 */
                    DM.Set = DM.GetSet.MenuSet();
                    api.AddScript(`
                        function check(value) {
                            if (value.toString().length > 4 || value > 1000) {
                                value = 1000;
                            } else if (value < 0) {
                                value = 0;
                            }
                            return value || 0;
                        }
                    `);
                    api.AddStyle(`
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
                        p { display: flex; flex-wrap: nowrap; }
                        option { color: #F6F6F6; }
                        ul {
                            list-style: none;
                            padding: 0px;
                            margin: 0px;
                        }
                    `, "Custom-style");break;
            }
        }

        /* 創建菜單 */
        async Menu() {
            if (!api.$$(".modal-background")) {
                DM.ImgRules = api.$$("#Custom-style").sheet.cssRules;
                DM.Set = DM.GetSet.ImgSet();
                let parent, child, img_input, img_select, img_set, analyze;
                const img_data = [DM.Set.img_h, DM.Set.img_w, DM.Set.img_mw, DM.Set.img_gap];

                const menu = `
                    <div class="modal-background">
                        <div class="modal-interface">
                            <table class="modal-box">
                                <tr>
                                    <td class="menu">
                                        <h2 class="menu-text">${Language.MT_01}</h2>
                                        <ul>
                                            <li>
                                                <a class="toggle-menu" href="#image-settings-show">
                                                    <button class="menu-options" id="image-settings">${Language.MO_01}</button>
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
                                                            <h2 class="narrative">${Language.MIS_01}：</h2>
                                                            <p><input type="number" id="img_h" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Language.MIS_02}：</h2>
                                                            <p><input type="number" id="img_w" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Language.MIS_03}：</h2>
                                                            <p><input type="number" id="img_mw" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                        <div>
                                                            <h2 class="narrative">${Language.MIS_04}：</h2>
                                                            <p><input type="number" id="img_gap" class="Image-input-settings" oninput="value = check(value)"></p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="button-area">
                                                    <select id="language">
                                                        <option value="" disabled selected>${Language.ML_01}</option>
                                                        <option value="en">${Language.ML_02}</option>
                                                        <option value="zh-TW">${Language.ML_03}</option>
                                                        <option value="zh-CN">${Language.ML_04}</option>
                                                        <option value="ja">${Language.ML_05}</option>
                                                    </select>
                                                    <button id="readsettings" class="button-options" disabled>${Language.MB_01}</button>
                                                    <span class="button-space"></span>
                                                    <button id="closure" class="button-options">${Language.MB_02}</button>
                                                    <span class="button-space"></span>
                                                    <button id="application" class="button-options">${Language.MB_03}</button>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `
                const UnitOptions = `
                    <select class="Image-input-settings" style="margin-left: 1rem;">
                        <option value="px" selected>px</option>
                        <option value="%">%</option>
                        <option value="rem">rem</option>
                        <option value="vh">vh</option>
                        <option value="vw">vw</option>
                        <option value="auto">auto</option>
                    </select>
                `
                $(document.body).append(menu);
                $(".modal-interface").draggable({ cursor: "grabbing" });
                $(".modal-interface").tabs();
                // 關閉菜單
                function Menu_Close() {$(".modal-background").remove()}
                // 圖片設置菜單
                async function PictureSettings() {
                    $on(".Image-input-settings", "input change", function (event) {
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
                // 語言選擇
                $("#language").val(api.store("get", "language") || "")
                $on("#language", "input change", function (event) {
                    event.stopPropagation();
                    const value = $(this).val();
                    Language = DM.language(value);
                    GM_setValue("language", value);
                    $("#language").off("input change");
                    Menu_Close();
                    DM.Menu();
                });
                // 監聽菜單的點擊事件
                let save = {}, set_value;
                $on(".modal-interface", "click", function (event) {
                    const id = $(event.target).attr("id");

                    // 菜單功能選擇
                    if (id == "image-settings") {
                        img_set = $("#image-settings-show");
                        if (img_set.css("opacity") === "0") {
                            img_set.find("p").each(function() {
                                $(this).append(UnitOptions);
                            });
                            img_set.css({
                                "height": "auto",
                                "width": "auto",
                                "opacity": 1
                            });
                            $("#readsettings").prop("disabled", false);
                            PictureSettings();
                        }

                    // 讀取保存設置
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
                        })
                    
                    // 應用保存
                    } else if (id == "application") {
                        img_set = $("#image-settings-show").find("p");
                        img_data.forEach((read, index) => {
                            img_input = img_set.eq(index).find("input");
                            img_select = img_set.eq(index).find("select");
                            if (img_select.val() == "auto") {set_value = "auto"}
                            else if (img_input.val() == "") {set_value = read}
                            else {set_value = `${img_input.val()}${img_select.val()}`}
                            save[img_input.attr("id")] = set_value;
                        })
                        GM_setValue("ImgSet", [save]);

                        // 保存菜單位置資訊
                        save = {};
                        const menu_location = $(".modal-interface");
                        const top = menu_location.css("top");
                        const left = menu_location.css("left");
                        save["MT"] = top; save["ML"] = left;
                        GM_setValue("MenuSet", [save]);
                        // 設置到樣式表內 不用重整可以直接改變
                        DM.styleRules["MT"](top);
                        DM.styleRules["ML"](left);
                        Menu_Close();

                    // 關閉菜單
                    } else if (id == "closure") {Menu_Close()}
                })
            }
        }

        /* 語言文本 */
        language(language) {
            let display = {
                "zh-TW": [{
                    "RM_01":"📝 設置選單",
                    "MT_01":"設置菜單", "MO_01":"圖像設置",
                    "MB_01":"讀取設定", "MB_02":"關閉離開", "MB_03":"保存應用",
                    "ML_01":"語言", "ML_02":"英文", "ML_03":"繁體", "ML_04":"簡體", "ML_05":"日文",
                    "MIS_01":"圖片高度", "MIS_02":"圖片寬度", "MIS_03":"圖片最大寬度", "MIS_04":"圖片間隔高度"
                }],
                "zh-CN": [{
                    "RM_01":"📝 设置菜单",
                    "MT_01":"设置菜单", "MO_01":"图像设置",
                    "MB_01":"读取设置", "MB_02":"关闭退出", "MB_03":"保存应用",
                    "ML_01":"语言", "ML_02":"英文", "ML_03":"繁体", "ML_04":"简体", "ML_05":"日文",
                    "MIS_01":"图片高度", "MIS_02":"图片宽度", "MIS_03":"图片最大宽度", "MIS_04":"图片间隔高度"
                }],
                "ja": [{
                    "RM_01":"📝 設定メニュー",
                    "MT_01":"設定メニュー", "MO_01":"画像設定",
                    "MB_01":"設定の読み込み", "MB_02":"閉じて終了する", "MB_03":"保存して適用する",
                    "ML_01":"言語", "ML_02":"英語", "ML_03":"繁体字", "ML_04":"簡体字", "ML_05":"日本語",
                    "MIS_01":"画像の高さ", "MIS_02":"画像の幅", "MIS_03":"画像の最大幅", "MIS_04":"画像の間隔の高さ"
                }],
                "en-US": [{
                    "RM_01":"📝 Settings Menu",
                    "MT_01":"Settings Menu", "MO_01":"Image Settings",
                    "MB_01":"Load Settings", "MB_02":"Close and Exit", "MB_03":"Save and Apply",
                    "ML_01":"Language", "ML_02":"English", "ML_03":"Traditional Chinese", "ML_04":"Simplified Chinese", "ML_05":"Japanese",
                    "MIS_01":"Image Height", "MIS_02":"Image Width", "MIS_03":"Maximum Image Width", "MIS_04":"Image Spacing Height"
                }],
            };
            return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
        }
    }

    /* ==================== 增強調用 ==================== */
    class Enhance {
        constructor(url) {
            this.url = url;
            this.DmsPage = /^(https?:\/\/)?(www\.)?.+\/dms\/?(\?.*)?$/;
            this.PostsPage = /^(https?:\/\/)?(www\.)?.+\/posts\/?(\?.*)?$/;
            this.UserPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
            this.ContentPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
            this.M1 = () => {return this.ContentPage.test(this.url)}
            this.M3 = () => {return this.PostsPage.test(this.url) || this.UserPage.test(this.url) || this.DmsPage.test(this.url)}
            this.USE = (Select, FuncName) => {Select > 0 ? FuncName(Select) : null}
        }

        async Run() {
            const Call = {
                SidebarCollapse: s=> this.USE(s, GF.SidebarCollapse),
                DeleteNotice: s=> this.USE(s, GF.DeleteNotice),
                BlockAds: s=> this.USE(s, GF.BlockAds),

                QuickPostToggle: s=> this.USE(s, PF.QuickPostToggle),
                NewTabOpens: s=> this.USE(s, PF.NewTabOpens),
                CardText: s=> this.USE(s, PF.CardText),
                CardZoom: s=> this.USE(s, PF.CardZoom),

                TextToLink: s=> this.USE(s, CF.TextToLink),
                LinkSimplified: s=> this.USE(s, CF.LinkSimplified),
                OriginalImage: s=> this.USE(s, CF.OriginalImage),
                VideoBeautify: s=> this.USE(s, CF.VideoBeautify),
                CommentFormat: s=> this.USE(s, CF.CommentFormat),
                ExtraButton: s=> this.USE(s, CF.ExtraButton)

            }, Start = async(Type) => {Object.entries(Type).forEach(([func, set]) => Call[func](set))}

            Start(Global);
            if (this.M3()) {PF = new Preview_Function(); Start(Preview)}
            else if (this.M1()) {
                CF = new Content_Function(); Start(Content);
                DM.Dependencies("Menu");
                Language = DM.language(api.store("get", "language"));
                api.Menu({[Language.RM_01]: ()=> DM.Menu()})
            }
        }
    }

    const
    GF = new Global_Function(),
    DM = new Dependencies_And_Menu(),
    EC = new Enhance(document.URL); EC.Run();

    /* ==================== 通用 API ==================== */

    /* 渲染 */
    function Rendering({ content }) {
        return React.createElement("div", { dangerouslySetInnerHTML: { __html: content } });
    }

    /* 添加監聽 (jquery) */
    async function $on(element, type, listener) {$(element).on(type, listener)}
})();
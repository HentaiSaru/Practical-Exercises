// ==UserScript==
// @name         Kemono 使用增強
// @name:zh-TW   Kemono 使用增強
// @name:zh-CN   Kemono 使用增强
// @name:ja      Kemono 使用を強化
// @name:en      Kemono Usage Enhancement
// @version      0.0.19
// @author       HentiSaru
// @description        側邊欄收縮美化界面 , 自動加載大圖 , 簡易隱藏廣告 , 翻頁優化 , 自動開新分頁
// @description:zh-TW  側邊欄收縮美化界面 , 自動加載大圖 , 簡易隱藏廣告 , 翻頁優化 , 自動開新分頁
// @description:zh-CN  侧边栏收缩美化界面 , 自动加载大图 , 简易隐藏广告 , 翻页优化 , 自动开新分页
// @description:ja     サイドバーの収縮によるインターフェースの美化、大画像の自動読み込み、広告の簡易非表示、ページめくりの最適化、新しいページの自動開封
// @description:en     Sidebar contraction beautifies interface, automatically loads large images, easily hides ads, optimizes paging, and automatically opens new tabs.

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText

// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

var xhr = new XMLHttpRequest(),
Url = window.location.href,
parser = new DOMParser(),
limit=45;

(function() {
    let interval, tryerror = 0, dellay = 300;
    const pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/,
    UserPage = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/[^\/]+(\?.*)?$/,
    PostsPage = /^(https?:\/\/)?(www\.)?kemono\..+\/posts\/?(\?.*)?$/,
    DmsPage = /^(https?:\/\/)?(www\.)?kemono\..+\/dms\/?(\?.*)?$/;
    async function Main() {
        const [list, box, comments, announce] = [ // comments(評論區標題), announce(公告條)
            "div.global-sidebar", "div.content-wrapper.shifted", "h2.site-section__subheading", "body > div.content-wrapper.shifted > a"
        ].map(selector => document.querySelector(selector));
        if ((box && list && comments) || (box && list)) {
            Beautify(box, list, announce); // 側邊欄收縮
            if (pattern.test(Url)) {Additional(comments)}// (帖子內) Ajex 快捷換頁
            clearInterval(interval);
        } else {
            tryerror++;
            if (tryerror > 10) {clearInterval(interval)}
        }
    }
    interval = setInterval(() => {Main()}, dellay);
    setTimeout(() => {
        AdHiding(); // 隱藏廣告
        if (pattern.test(Url)) {
            OriginalImage(); // 自動大圖
            LinkOriented(); // 連結轉換
            VideoBeautify(); // 影片美化
        }
        if (UserPage.test(Url) || PostsPage.test(Url) || DmsPage.test(Url)) {
            AjexPostToggle(); // Ajex 換頁
            NewTabOpens(); // 自動新分頁
        }
    }, dellay);
})();

/* ==================== */

/* 美化介面 */
async function Beautify(box, list, announce) {
    GM_addStyle(`
        .list_column {
            opacity: 0;
            width: 10rem !important;
            transform: translateX(-9rem);
            transition: 0.8s;
        }
        .list_column:hover {
            opacity: 1;
            transform: translateX(0rem);
        }
        .main_box {
            transition: 0.7s;
        }
    `);
    try {
        announce.remove();
        box.classList.add("main_box");
        box.style.marginLeft = "0rem";
        list.classList.add("list_column");
        list.addEventListener('mouseenter', function() {
            box.style.marginLeft = "10rem";
        });
        list.addEventListener('mouseleave', function() {
            box.style.marginLeft = "0rem";
        });
    } catch {}
}

async function VideoBeautify() {
    let stream, parents;
    parents = document.querySelectorAll('ul[style*="text-align: center;list-style-type: none;"] li');
    if (parents.length > 0) {
        function ReactBeautify({stream}) {
            return React.createElement("video", {
                key: "video",
                controls: true,
                preload: "auto",
                style: { width: "80%", height: "80%" },
            }, React.createElement("source", {
                key: "source",
                src: stream.src,
                type: stream.type
            }));
        }
        parents.forEach(li => {
            stream = li.querySelector("source");
            if (stream) {
                ReactDOM.render(React.createElement(ReactBeautify, { stream: stream }), li);
            } else {
                console.log("Debug: Could not find source, please refresh");
            }
        })
    }
}

/* 載入原始圖像 */
async function OriginalImage() {
    let thumbnail, link, img;
    thumbnail = document.querySelectorAll("div.post__thumbnail");
    if (thumbnail.length > 0) {
        try {
            thumbnail.forEach(image => {
                image.classList.remove("post__thumbnail");
                link = image.querySelector("a");
                img = document.createElement("img");
                img.src = link.href;
                img.alt = "Click Reload";
                img.loading = "auto";
                img.setAttribute("data-src", link.href);
                img.setAttribute("style", "max-width: 100%;");
                img.onerror = function() {
                    Reload(link, this, 1)
                };
                !link.classList.contains("image-link") ? link.classList.add("image-link") : null;
                link.querySelector("img").remove();
                link.appendChild(img);
            })
        } catch (error) {
            console.log(error);
        }
    }
}

async function Reload(location, old_img, retry) {
    let New_img;
    ReTry();
    async function ReTry() {
        setTimeout(() => {
            if (retry <= limit) {
                New_img = document.createElement("img");
                New_img.src = location.href;
                New_img.alt = "Click Reload";
                New_img.loading = "auto";
                New_img.setAttribute("data-src", location.href);
                New_img.setAttribute("style", "max-width: 100%;");
                New_img.onerror = function() {ReTry()};
                old_img.remove();
                location.appendChild(New_img);
                retry++;
            }
        }, 1500);
    }
}

/* ==================== */

/* 簡易隱藏廣告 */
async function AdHiding() {
    document.querySelectorAll(".ad-container").forEach(function(element) {
        try {element.style.display = "none"} catch {element.style.visibility = "hidden"}
    })
    let attempts = 0, interval = setInterval(function() {
        if (attempts < 3) {
            document.querySelectorAll(".root--ujvuu").forEach((element) => {
                try {
                    element.style.opacity = 0;
                    element.style.visibility = "hidden";
                } catch {
                    element.style.visibility = "hidden";
                }
            });
            attempts++;
        } else {clearInterval(interval);}
    }, 500);
}

/* 轉換下載連結參數 */
async function LinkOriented() {
    document.querySelectorAll("a.post__attachment-link").forEach(link => {
        link.setAttribute("download", "");
    })
}

/* 底部按鈕創建, 監聽快捷Ajex換頁 */
async function Additional(comments) {
    GM_addStyle(GM_getResourceText("font-awesome"));
    const prev = document.querySelector("a.post__nav-link.prev");
    const next = document.querySelector("a.post__nav-link.next");
    const span = document.createElement("span");
    const svg = document.createElement("svg");
    span.style = "float: right";
    span.appendChild(next.cloneNode(true));
    svg.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
            <style>svg{fill:#e8a17d}</style>
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
        </svg>
    `
    comments.appendChild(span);
    comments.appendChild(svg);
    svg.addEventListener("click", () => { // 回到頁面頂部
        document.querySelector("header").scrollIntoView();
    })
    // 監聽按鍵切換
    const main = document.querySelector("main");
    document.addEventListener("keydown", function(event) {
        try {
            if (event.key === "4") {
                event.preventDefault();
                AjexReplace(prev.href, main);
            } else if (event.key === "6") {
                event.preventDefault();
                AjexReplace(next.href, main);
            }
        } catch {}
        //跳轉 window.location.href = prev.href;
    });
}

/* 將瀏覽帖子頁面都變成開新分頁 */
async function NewTabOpens() {
    const card = document.querySelectorAll("div.card-list__items article a");
    card.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            GM_openInTab(link.href, { active: false, insert: true });
        });
    });
}

/* ==================== */

/* Ajex 替換頁面的初始化 */
async function Initialization() {
    let interval = setInterval(function() {
        const comments = document.querySelector("h2.site-section__subheading");
        if (comments) {
            Additional(comments);
            clearInterval(interval);
        }
    }, 300);
    setTimeout(OriginalImage, 500);
    setTimeout(VideoBeautify, 500);
    document.querySelector("h1.post__title").scrollIntoView(); // 滾動到上方
}

/* React 渲染優化 */
function ReactRendering({content}) {
    return React.createElement("div", {dangerouslySetInnerHTML: { __html: content }});
}
async function AjexReplace(url, old_main) {
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let New_data = parser.parseFromString(xhr.responseText, 'text/html');
        let New_main = New_data.querySelector('main');
        ReactDOM.render(React.createElement(ReactRendering, { content: New_main.innerHTML }), old_main);
        history.pushState(null, null, url);
        setTimeout(Initialization(), 500);
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}

GM_addStyle(`
    .gif-overlay {
        position: absolute;
        opacity: 0.4;
        top: 50%;
        left: 50%;
        width: 70%;
        height: 70%;
        z-index: 9999;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
`);
async function AjexPostToggle() {
    let Old_data, New_data, item;
    async function Request(link) {
        item = document.querySelector("div.card-list__items");
        item.style.position = "relative";
        GM_addElement(item, "img", {
            src: "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif",
            class: "gif-overlay"
        });
        GM_xmlhttpRequest({
            method: "GET",
            url: link,
            nocache: false,
            onload: response => {
                Old_data = document.querySelector("section");
                New_data = parser.parseFromString(response.responseText, "text/html").querySelector("section");
                ReactDOM.render(React.createElement(ReactRendering, { content: New_data.innerHTML }), Old_data);
                history.pushState(null, null, link);
                AjexPostToggle();
                NewTabOpens();
                AdHiding();
            }
        });
    }
    try {
        document.querySelectorAll("menu a").forEach(a => {
            a.addEventListener("click", (event) => {
                event.preventDefault();
                Request(a.href);
            });
        });
    } catch {}
}

/* ==================== */
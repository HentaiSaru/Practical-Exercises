// ==UserScript==
// @name         Kemono Beautify
// @version      0.0.7
// @author       HentiSaru
// @description  圖像自動加載大圖 , 簡易美化觀看介面

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://kemono.party/static/favicon.ico

// @license      MIT
// @run-at       document-start

// @grant        GM_addStyle
// ==/UserScript==

var xhr = new XMLHttpRequest(), parser = new DOMParser(), pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/, limit=5, retry;

(function() {
    let interval = setInterval(function() {
        const list = document.querySelector("div.global-sidebar");
        const box = document.querySelector("div.content-wrapper.shifted");
        const comments = document.querySelector("h2.site-section__subheading"); // 評論區標題
        const announce = document.querySelector("body > div.content-wrapper.shifted > a"); // 公告條
        if (box && list || comments || announce) {
            Beautify(box, list, announce);
            if (pattern.test(window.location.href)) {Additional(comments)}
            clearInterval(interval);
        }
    }, 300);
    if (pattern.test(window.location.href)) {
        setTimeout(OriginalImage, 500);
    }
})();

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
            transition: 0.8s;
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

async function OriginalImage() {
    try {
        let link, img;
        document.querySelectorAll("div.post__thumbnail").forEach(image => {
            image.classList.remove("post__thumbnail");
            link = image.querySelector("a");
            link.querySelector("img").remove();
            img = document.createElement("img");
            img.loading = "lazy";
            img.src = link.href;
            img.srcset = link.href;
            img.style = "width:100%;";
            img.onerror = function() {
                AjexReload(link, this, 0);
            };
            link.appendChild(img);
            link.classList.add("image-link");
        });
    } catch (error) {
        console.log(error);
    }
}

// 修改後已經不需要 Ajex了 , 但我懶得改
async function AjexReload(location, img, retry) {
    xhr.onreadystatechange = function () {
        setTimeout(function() {
            img.remove();
            if (xhr.readyState === 4 && xhr.status === 200 && retry < limit) {
                let New_img = document.createElement("img");
                New_img.src = xhr.responseURL;
                New_img.srcset = xhr.responseURL;
                New_img.style = "width:100%;"
                New_img.onerror = function() {AjexReload(location, New_img, retry)};
                retry++;
                location.appendChild(New_img);
            } else if (retry < limit) {
                xhr.open("GET", img.src, true);
                xhr.send();
                retry++;
            }
        }, 1000);
    }
    xhr.open("GET", img.src, true);
    xhr.send();
}

/* 額外添加功能 */
async function Additional(comments) {
    const prev = document.querySelector("a.post__nav-link.prev");
    const next = document.querySelector("a.post__nav-link.next");
    const split = document.createElement("span");
    split.style = "float: right;"
    split.appendChild(next.cloneNode(true));
    comments.appendChild(split);
    // 監聽按鍵
    const main = document.querySelector("main");
    document.addEventListener("keydown", function(event) {
        if (event.key === "4") {
            event.preventDefault();
            AjexReplace(prev.href, main);
        } else if (event.key === "6") {
            event.preventDefault();
            AjexReplace(next.href, main);
        }
        // 跳轉
        //window.location.href = prev.href;
    });
}

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
    document.querySelector("h1.post__title").scrollIntoView();
}

async function AjexReplace(url , old_main) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let New_data = parser.parseFromString(xhr.responseText, "text/html");
            let New_main = New_data.querySelector("main");
            old_main.innerHTML = New_main.innerHTML;
            Initialization();
            history.pushState(null, null, url);
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}
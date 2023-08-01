// ==UserScript==
// @name         Kemono Beautify
// @version      0.0.10
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

var xhr = new XMLHttpRequest(),
parser = new DOMParser(),
pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/,
limit=5,
retry;

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
    setTimeout(AdHiding, 500);
})();

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

/* 載入原始圖像 (測試死圖是否發生) */
async function OriginalImage() {
    try {
        let link, img;
        document.querySelectorAll("div.post__thumbnail").forEach(image => {
            link = image.querySelector("a");
            img = document.createElement("img");
            img.setAttribute("data-src", link.href);
            img.src = link.href;
            img.loading = "lazy";
            img.style = "width:100%;";
            img.onerror = function() {
                AjexReload(link, 0);
            };
            image.classList.remove("post__thumbnail");
            link.querySelector("img").remove();
            link.appendChild(img);
            link.classList.add("image-link");
        })
    } catch (error) {
        console.log(error);
    } finally {
        const images = document.querySelectorAll('div.post__files div a img');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
                }
            });
        });
        images.forEach(image => {
            observer.observe(image);
        });
    }
}

async function AjexReload(location, retry) {
    let New_img;
    xhr.onreadystatechange = function () {
        setTimeout(function() {
            console.log(`debug ${retry} : 圖片載入失敗 , url : ${location.href}\n`);
            location.querySelector("img").remove();
            if (xhr.readyState === 4 && xhr.status === 200 && retry < limit) {
                New_img = document.createElement("img");
                New_img.setAttribute("data-src", link.href);
                New_img.src = link.href;
                New_img.loading = "lazy";
                New_img.style = "width:100%;";
                New_img.onerror = function() {
                    xhr.open("GET", location.href, true);
                    xhr.send();
                };
                location.appendChild(New_img);
                retry++;
            } else if (retry < limit) {
                xhr.open("GET", location.href, true);
                xhr.send();
                retry++;
            }
        }, 2500);
    }
    xhr.open("GET", location.href, true);
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
            history.pushState(null, null, url);
            setTimeout(Initialization(), 500);
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}
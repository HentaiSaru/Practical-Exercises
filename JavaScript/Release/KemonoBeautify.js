// ==UserScript==
// @name         Kemono Beautify
// @version      0.0.5
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

(function() {
    var pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/, interval;
    interval = setInterval(function() {
        const list = document.querySelector("div.global-sidebar");
        const box = document.querySelector("div.content-wrapper.shifted");
        const announce = document.querySelector("body > div.content-wrapper.shifted > a");
        if (box && list || announce) {Beautify(box, list, announce);clearInterval(interval);}
    }, 300);
    if (pattern.test(window.location.href)) {
        setTimeout(OriginalImage, 200);
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
                AjexReload(link, this);
            };
            link.appendChild(img);
        });
    } catch (error) {
        console.log(error);
    }
}

var xhr = new XMLHttpRequest(), retry;
// 修改後已經不需要 Ajex了 , 但我懶得改
async function AjexReload(location, img) {
    retry = 0;
    xhr.onreadystatechange = function () {
        img.remove();
        if (xhr.readyState === 4 && xhr.status === 200) {
            let New_img = document.createElement("img");
            New_img.src = xhr.responseURL;
            New_img.srcset = xhr.responseURL;
            New_img.style = "width:100%;"
            location.appendChild(New_img);
        } else if (retry < 5) {
            setTimeout(function() {
                xhr.send();
                retry++;
            }, 1500);
        }
    }
    xhr.open("GET", img.src, true);
    xhr.send();
}
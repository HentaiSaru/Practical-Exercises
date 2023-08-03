// ==UserScript==
// @name         Kemono 下載工具
// @name:zh-TW   Kemono 下載工具
// @name:zh-CN   Kemono 下载工具
// @name:ja      Kemono ダウンロードツール
// @name:en      Kemono DownloadTool
// @description:        一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-TW   一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-CN   一键下载图片 (压缩下载/单图下载) , 页面数据创建 json 下载 , 一键开启当前所有帖子
// @description:ja      画像をワンクリックでダウンロード（圧縮ダウンロード/単一画像ダウンロード）、ページデータを作成してjsonでダウンロード、現在のすべての投稿をワンクリックで開く
// @description:en      One-click download of images (compressed download/single image download), create page data for json download, one-click open all current posts

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://cdn-icons-png.flaticon.com/512/2381/2381981.png

// @license      MIT
// @author       HentiSaru
// @version      0.0.4
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

const regex = /^https:\/\/[^/]+/;
var CompressMode = GM_getValue("壓縮下載", []), parser = new DOMParser(), url = window.location.href.match(regex), dict = {}, ModeDisplay, Pages=0;
(function() {
    const pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/;
    if (pattern.test(window.location.href)) {setTimeout(ButtonCreation, 300)}
    GM_registerMenuCommand("🔁 切換下載模式", function() {DownloadModeSwitch()}, "C")
    GM_registerMenuCommand("📑 獲取所有帖子 Json 數據", function() {
        const section = document.querySelector("section");
        if (section) {
            GetPageData(section);
        }
    }, "J")
    GM_registerMenuCommand("📃 開啟當前頁面所有帖子", function() {OpenData()}, "O")
})();

async function DownloadModeSwitch() {
    if (GM_getValue("壓縮下載", [])){
        GM_setValue("壓縮下載", false);
        GM_notification({
            title: "模式切換",
            text: "單圖下載模式",
            timeout: 2500
        });
    } else {
        GM_setValue("壓縮下載", true);
        GM_notification({
            title: "模式切換",
            text: "壓縮下載模式",
            timeout: 2500
        });
    }
    location.reload();
}

async function ButtonCreation() {
    GM_addStyle(`
        .File_Span {
            padding: 1rem;
            font-size: 20% !important;
        }
        .Download_Button {
            color: hsl(0, 0%, 45%);
            padding: 6px;
            border-radius: 8px;
            border: 2px solid rgba(59, 62, 68, 0.7);
            background-color: rgba(29, 31, 32, 0.8);
            font-family: Arial, sans-serif;
        }
        .Download_Button:hover {
            color: hsl(0, 0%, 95%);
            background-color: hsl(0, 0%, 45%);
            font-family: Arial, sans-serif;
        }
    `);
    let download_button;
    try {
        const Files = document.querySelectorAll("div.post__body h2")
        const spanElement = GM_addElement(Files[Files.length - 1], "span", {class: "File_Span"});
        download_button = GM_addElement(spanElement, "button", {
            class: "Download_Button",
        });
        if (CompressMode) {
            ModeDisplay = "壓縮下載";
        } else {
            ModeDisplay = "單圖下載";
        }
        download_button.textContent = ModeDisplay;
        download_button.addEventListener("click", function() {
            DownloadTrigger(download_button);
        });
    } catch {
        download_button.textContent = "無法下載";
        download_button.disabled = true;
    }
}

function IllegalFilter(Name) {
    return Name.replace(/[\/\?<>\\:\*\|":]/g, '');
}
function Conversion(Name) {
    return Name.replace(/[\[\]]/g, '');
}

async function DownloadTrigger(button) {
    let interval = setInterval(function() {
        let imgdata = document.querySelectorAll("a.fileThumb.image-link");
        let title = document.querySelector("h1.post__title").textContent.trim();
        let user = document.querySelector("a.post__user-name").textContent.trim();
        if (imgdata && title && user) {
            button.textContent = "開始下載";
            if (CompressMode) {
                ZipDownload(`[${user}] ${title}`, imgdata, button);
            } else {
                ImageDownload(`[${user}] ${title}`, imgdata, button)
            }
            clearInterval(interval);
        }
    }, 500);
}

async function ZipDownload(Folder, ImgData, Button) {
    const zip = new JSZip(),
    Data = Object.values(ImgData),
    File = Conversion(Folder),
    Total = Data.length,
    name = IllegalFilter(Folder.split(" ")[1]);
    let pool = [], poolSize = 5, progress = 1, mantissa;
    function createPromise(i) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: Data[i].href.split("?f=")[0],
                responseType: "blob",
                onload: response => {
                    if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                        mantissa = progress.toString().padStart(3, '0');
                        zip.file(`${File}/${name}_${mantissa}.png`, response.response);
                        Button.textContent = `下載進度 [${progress}/${Total}]`;
                        progress++;
                    } else {
                        i--;
                    }
                    resolve();
                }
            });

        });
    }
    for (let i = 0; i < Total; i++) {
        let promise = createPromise(i);
        pool.push(promise);
        if (pool.length >= poolSize) {
            await Promise.all(pool);
            pool = [];
        }
    }
    if (pool.length > 0) {await Promise.all(pool)}
    Compression();
    function Compression() {
        Button.textContent = "壓縮封裝中[請稍後]";
        zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 5 // 壓縮級別，範圍從 0（無壓縮）到 9（最大壓縮）
            }
        }).then(zip => {
            Button.textContent = "下載完成";
            saveAs(zip, `${Folder}.zip`);
            setTimeout(() => {Button.textContent = ModeDisplay}, 4000);
        }).catch( result => {
            Button.textContent = "壓縮封裝失敗";
            setTimeout(() => {Button.textContent = ModeDisplay}, 6000);
        });
    }
}

async function ImageDownload(Folder, ImgData, Button) {
    const name = IllegalFilter(Folder.split(" ")[1]),
    Data = Object.values(ImgData),
    Total = Data.length;
    let progress = 1;
    for (let i = 0; i < Total; i++) {
        GM_download({
            url: Data[i].href.split("?f=")[0],
            name: `${name}_${(progress+i).toString().padStart(3, '0')}.png`,
            ontimeout: 5000,
            onload: () => {
                Button.textContent = `下載進度 [${progress}/${Total}]`;
                progress++;
            },
            onerror: () => {
                i--;
            }
        });
    }
    Button.textContent = "下載完成";
    setTimeout(() => {Button.textContent = ModeDisplay}, 4000);
}

async function GetPageData(section) {
    const menu = section.querySelector("a.pagination-button-after-current");
    const item = section.querySelectorAll(".card-list__items article");
    let title, link;
    item.forEach(card => {
        title = card.querySelector(".post-card__header").textContent.trim()
        link = card.querySelector("a").href
        dict[`${link}`] = title;
    })
    try { // 當沒有下一頁連結就會發生例外
        let NextPage = menu.href;
        if (NextPage) {
            Pages++;
            GM_notification({
                title: "數據處理中",
                text: `當前處理頁數 : ${Pages}`,
                image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                timeout: 800
            });
            GM_xmlhttpRequest({
                method: "GET",
                url: NextPage,
                nocache: false,
                ontimeout: 8000,
                onload: response => {
                    const DOM = parser.parseFromString(response.responseText, "text/html");
                    GetPageData(DOM.querySelector("section"));
                }
            });
        }
    } catch {
        try {
            // 進行簡單排序
            Object.keys(dict).sort();
            const author = document.querySelector('span[itemprop="name"]').textContent;
            const json = document.createElement("a");
            json.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dict, null, 4));
            json.download = `${author}.json`;
            json.click();
            json.remove();
            GM_notification({
                title: "數據處理完成",
                text: "Json 數據下載",
                image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                timeout: 2000
            });
        } catch {
            alert("錯誤的請求頁面");
        }
    }
}

function OpenData() {
    try {
        let content = document.querySelector('.card-list__items').querySelectorAll('article.post-card');
        content.forEach(function(content) {
            let link = content.querySelector('a').getAttribute('href');
            setTimeout(() => {
                window.open("https://kemono.party" + link , "_blank");
            }, 300);
        });
    } catch {
        alert("這裡沒帖子給你開");
    }
}
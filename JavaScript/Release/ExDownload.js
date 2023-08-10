// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.13
// @author       HentiSaru
// @description         暫時無說明
// @description:zh-TW   暫時無說明
// @description:zh-CN   暫時無說明
// @description:ja      暫時無說明
// @description:ko      暫時無說明
// @description:en      暫時無說明

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

var parser = new DOMParser(),
OriginalTitle = document.title,
url = window.location.href.split("?p=")[0],
count = 0;

(function() {
    const Ex_HManga = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    const E_HManga = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    if (Ex_HManga.test(url) || E_HManga.test(url)) {
        ButtonCreation();
    }
})();


/* 按鈕創建 */
async function ButtonCreation() {
    GM_addStyle(`
        .Download_Button {
            color: #5C0D12;
            float: right;
            width: 9rem;
            cursor: pointer;
            font-weight: bold;
            padding: 1px 5px 2px;
            line-height: 20px;
            border: 2px solid #9a7c7e;
            border-radius: 5px;
            position: relative;
            background-color: #EDEADA;
            font-family: arial,helvetica,sans-serif;
        }
        .Download_Button:hover {
            color: rgb(143, 71, 1);
            border: 2px dashed #B5A4A4;
            background-color: #EDEADA;
        }
        .Download_Button:disabled {
            color: #B5A4A4;
            cursor: default;
        }
    `);
    let download_button;
    try {
        download_button = GM_addElement(document.querySelector("div#gd2"), "button", {
            class: "Download_Button"
        });
        download_button.textContent = "壓縮下載";
        download_button.addEventListener("click", function() {
            download_button.textContent = "開始下載";
            download_button.disabled = true;
            HomeDataProcessing(download_button);
        });
    } catch {}
}

/* 非法字元排除 */
function IllegalFilter(Name) {
    return Name.replace(/[\/\?<>\\:\*\|":]/g, '');
}
/* 取得總頁數 */
function GetTotal(page) {
    return parseInt(page[page.length - 2].textContent.replace(/\D/g, ''));
}
/* 取得漫畫擴展名 */
function GetExtension(link) {
    try {
        const match = link.match(/\.([^.]+)$/);
        if (match) {return match[1].toLowerCase()}
        return "png";
    } catch {return "png"}
}

/* 主頁數據處理 */
async function HomeDataProcessing(button) {
    let title,
    homebox = [],
    pages = GetTotal(document.querySelector("div#gdd").querySelectorAll("td.gdt2"));
    try {
        title = document.getElementById("gj").textContent.trim();
        if (title === "") {throw new Error()}
    } catch {
        title = document.getElementById("gn").textContent.trim();
        if (title === "") {title = "未找到名稱"}
    }
    title = IllegalFilter(title);

    const calculate = pages / 20; // 計算總共頁數
    if (pages % 20 > 0) {
        pages = Math.floor(calculate + 1);
    } else {
        pages = Math.floor(calculate);
    }

    async function GetLink(data) { // 獲取頁面所有連結
        data.querySelector("#gdt").querySelectorAll("a").forEach(link => {
            homebox.push(link.href);
        });
    }

    async function FetchRequest(url) { // 數據請求
        const response = await fetch(url);
        const html = await response.text();
        GetLink(parser.parseFromString(html, "text/html"));
    }
    
    //GetLink(document);
    const promises = [];
    for (let i = 0; i < pages; i++) {
        promises.push(FetchRequest(`${url}?p=${i}`));
        button.textContent = `獲取頁面: [${i+1}/${pages}]`;
        count++;
        if (count === 7) {
            count = 0;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    await Promise.all(promises);
    ImageLinkProcessing(button, title, homebox);
}

/* 漫畫連結處理 */
async function ImageLinkProcessing(button, title, link) {
    let imgbox = new Map(), pages = link.length;
    async function GetLink(index, data) {
        try {
            imgbox.set(index, data.src);
        } catch {
            try {
                imgbox.set(index, data.href);
            } catch {}
        }
    }

    async function FetchRequest(index, url) {
        const response = await fetch(url);
        const html = await response.text();
        GetLink(index, parser.parseFromString(html, "text/html").querySelector("img#img"));
        button.textContent = `獲取連結: [${index}/${pages}]`;
    }

    const promises = [];
    link.forEach(async (url, i) => {
        promises.push(FetchRequest(i, url));
        count++;
        if (count === 150) {
            count = 0;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });

    await Promise.all(promises);
    DownloadTrigger(button, title, imgbox);
}

/* 下載觸發器 */
async function DownloadTrigger(button, title, link) {
    ZipDownload(button, title, link);
}

/* 壓縮下載 */
async function ZipDownload(Button, Folder, ImgData) {
    const zip = new JSZip(),
    Total = ImgData.size;
    let promises = [], progress = 1, link, mantissa, extension, BackgroundWork;
    async function Request(index) {
        return new Promise((resolve) => {
            link = ImgData.get(index);
            extension = GetExtension(link);
            downloadImage();
            function downloadImage() {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: link,
                    responseType: "blob",
                    headers : {"user-agent": navigator.userAgent},
                    onload: response => {
                        if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                            mantissa = (index + 1).toString().padStart(4, '0');
                            zip.file(`${Folder}/${mantissa}.${extension}`, response.response);
                            document.title = `[${progress}/${Total}]`;
                            Button.textContent = `下載進度: [${progress}/${Total}]`;
                            progress++;
                        } else {
                            downloadImage();
                        }
                        resolve();
                    },
                    onerror: error => {
                        console.error(error);
                        downloadImage();
                    }
                });
            }
        });
    }
    for (let i = 0; i < Total; i++) {
        promises.push(Request(i));
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    await Promise.all(promises);    
    Compression();
    async function Compression() {
        if (typeof(Worker) !== "undefined" && typeof(BackgroundWork) === "undefined") {
            BackgroundWork = new Worker(BackgroundCreation());
            BackgroundWork.postMessage([
                await zip.generateAsync({
                    type: "blob",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 5
                    }
                }, (progress) => {
                    document.title = `${progress.percent.toFixed(1)} %`;
                    Button.textContent = `壓縮封裝: ${progress.percent.toFixed(1)} %`;
                }).then(zip => {
                    saveAs(zip, `${Folder}.zip`);
                    Button.textContent = "壓縮完成";
                    document.title = OriginalTitle;
                    setTimeout(() => {Button.textContent = "壓縮下載"}, 4000);
                    Button.disabled = false;
                }).catch(result => {
                    Button.textContent = "壓縮失敗";
                    document.title = OriginalTitle;
                    setTimeout(() => {Button.textContent = "壓縮下載"}, 6000);
                    Button.disabled = false;
                })
            ]);
        }
    }
}

function BackgroundCreation() {
    let blob = new Blob([""], {type: "application/javascript"});
    return URL.createObjectURL(blob);
}
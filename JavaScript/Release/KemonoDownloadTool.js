// ==UserScript==
// @name         Kemono Download Tool
// @version      0.0.2
// @author       HentiSaru
// @description  一鍵下載圖片以壓縮檔下載 , json 數據創建 (還沒添加)

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://cdn-icons-png.flaticon.com/512/2381/2381981.png

// @license      MIT
// @run-at       document-end

// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    const pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/;
    if (pattern.test(window.location.href)) {setTimeout(ButtonCreation, 300)}
    const OpenPage = GM_registerMenuCommand(
        "📃 開啟當前頁面所有帖子",
        function() {
            OpenData();
        }
    )
})();

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
        download_button.textContent = "下載圖片";
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
            Download(`[${user}] ${title}`, imgdata, button);
            clearInterval(interval);
        }
    }, 500);
}

async function Download(Folder, ImgData, Button) {
    const zip = new JSZip(),
    Data = Object.values(ImgData),
    File = Conversion(Folder),
    name = IllegalFilter(Folder.split(" ")[1]);

    let pool = [], poolSize = 5, progress = 1, mantissa;
    const Total = Data.length;

    for (let i = 0; i < Total; i++) {
        let promise = new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: Data[i].href.split("?f=")[0],
                responseType: "blob",
                onload: response => {
                    mantissa = progress.toString().padStart(3, '0');
                    zip.file(`${File}/${name}_${mantissa}.png`, response.response);
                    Button.textContent = `下載進度 [${progress}/${Total}]`;
                    progress++;
                    resolve();
                },
                onprogress: data => {
                    console.log(data);
                }
            });
        });
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
            setTimeout(() => {Button.textContent = "下載圖片"}, 4000);
        }).catch(error => {
            Button.textContent = "壓縮封裝失敗";
            setTimeout(() => {Button.textContent = "下載圖片"}, 6000);
        });
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
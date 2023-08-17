// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.3
// @author       HentiSaru
// @description         在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-TW   在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-CN   在 E 和 Ex 的漫画页面, 创建下载按钮, 可使用[压缩下载/单图下载], 自动获取图片下载
// @description:ja      EとExの漫画ページで、ダウンロードボタンを作成し、[圧縮ダウンロード/単一画像ダウンロード]を使用して、自動的に画像をダウンロードします。
// @description:ko      E 및 Ex의 만화 페이지에서 다운로드 버튼을 만들고, [압축 다운로드/단일 이미지 다운로드]를 사용하여 이미지를 자동으로 다운로드합니다.
// @description:en      On the comic pages of E and Ex, create a download button that can use [compressed download/single image download] to automatically download images.

// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

var count = 0,
ModeDisplay,
parser = new DOMParser(),
OriginalTitle = document.title,
url = window.location.href.split("?p=")[0],
CompressMode = GM_getValue("CompressedMode", []),
language = display_language(navigator.language);

(function() {
    const Ex_HManga = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    const E_HManga = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    if (Ex_HManga.test(url) || E_HManga.test(url)) {
        ButtonCreation();
    }
    GM_registerMenuCommand(language[0], function() {DownloadModeSwitch()}, "C");
})();

/* 按鈕創建 */
async function ButtonCreation() {
    GM_addStyle(`
        .Download_Button {
            float: right;
            width: 9rem;
            cursor: pointer;
            font-weight: bold;
            line-height: 20px;
            border-radius: 5px;
            position: relative;
            padding: 1px 5px 2px;
            font-family: arial,helvetica,sans-serif;
        }
    `);
    AdaptiveCSS(`
        .Download_Button {
            color: #5C0D12;
            border: 2px solid #9a7c7e;
            background-color: #EDEADA;
        }
        .Download_Button:hover {
            color: #8f4701;
            border: 2px dashed #B5A4A4;
        }
        .Download_Button:disabled {
            color: #B5A4A4;
            border: 2px dashed #B5A4A4;
            cursor: default;
        }
        `,`
        .Download_Button {
            color: #b3b3b3;
            border: 2px solid #34353b;
            background-color: #2c2b2b;
        }
        .Download_Button:hover {
            color: #f1f1f1;
            border: 2px dashed #4f535b;
        }
        .Download_Button:disabled {
            color: #4f535b;
            border: 2px dashed #4f535b;
            cursor: default;
        }
    `);
    let download_button;
    try {
        download_button = GM_addElement(document.querySelector("div#gd2"), "button", {
            class: "Download_Button"
        });
        if (CompressMode) {
            ModeDisplay = language[1];
        } else {
            ModeDisplay = language[2];
        }
        download_button.textContent = ModeDisplay;
        download_button.addEventListener("click", function() {
            download_button.textContent = language[3];
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
        if (title === "") {title = language[4]}
    }
    title = IllegalFilter(title);
    pages = Math.ceil(pages / 20);

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

    const promises = [FetchRequest(url)];
    for (let i = 1; i < pages; i++) {
        promises.push(FetchRequest(`${url}?p=${i}`));
        button.textContent = `${language[5]}: [${i+1}/${pages}]`;
        count++;
        if (count === 10) {
            count = 0;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    await Promise.allSettled(promises);
    ImageLinkProcessing(button, title, homebox);
}

/* 漫畫連結處理 */
async function ImageLinkProcessing(button, title, link) {
    let imgbox = new Map(), pages = link.length;
    async function GetLink(index, data) {
        try {
            imgbox.set(index, data.src);
            button.textContent = `${language[6]}: [${index + 1}/${pages}]`;
        } catch {
            try {
                imgbox.set(index, data.href);
                button.textContent = `${language[6]}: [${index + 1}/${pages}]`;
            } catch {}
        }
    }

    async function FetchRequest(index, url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            GetLink(index, parser.parseFromString(html, "text/html").querySelector("img#img"));
        } catch (error) {
            await FetchRequest(index, url);
        }
    }

    const promises = [];
    for (let index = 0; index < pages; index++) {
        promises.push(FetchRequest(index, link[index]));
        count++;
        if (count === 100) {
            count = 0;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    await Promise.allSettled(promises);
    DownloadTrigger(button, title, imgbox);
}

/* 下載觸發器 */
async function DownloadTrigger(button, title, link) {
    if (CompressMode) {ZipDownload(button, title, link)}
    else {ImageDownload(button, title, link)}
}

/* 壓縮下載 */
async function ZipDownload(Button, Folder, ImgData) {
    const zip = new JSZip(), Total = ImgData.size, promises = [];
    let progress = 1, link, mantissa, extension, BackgroundWork, retry=0;
    async function Request(index) {
        link = ImgData.get(index);
        extension = GetExtension(link);
        return new Promise((resolve) => {
            if (link !== undefined) {
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
                            Button.textContent = `${language[7]}: [${progress}/${Total}]`;
                            progress++;
                            resolve();
                        } else {
                            retry++;
                            if (retry < 10) {Request(index)}
                        }
                    },
                    onerror: error => {
                        console.log(error);
                        resolve();
                    }
                });
            } else {
                document.title = `[${progress}/${Total}]`;
                Button.textContent = `${language[7]}: [${progress}/${Total}]`;
                progress++;
                resolve();
            }
        });
    }
    for (let i = 0; i < Total; i++) {
        promises.push(Request(i));
        count++;
        if (count === 20) {
            count = 0;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    await Promise.allSettled(promises);
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
                    Button.textContent = `${language[8]}: ${progress.percent.toFixed(1)} %`;
                }).then(zip => {
                    saveAs(zip, `${Folder}.zip`);
                    Button.textContent = language[9];
                    document.title = OriginalTitle;
                    setTimeout(() => {
                        Button.textContent = ModeDisplay;
                        Button.disabled = false;
                    }, 3000);
                }).catch(result => {
                    Button.textContent = language[10];
                    document.title = OriginalTitle;
                    setTimeout(() => {
                        Button.textContent = ModeDisplay;
                        Button.disabled = false;
                    }, 6000);
                })
            ])
        }
    }
}

/* 單圖下載 */
async function ImageDownload(Button, Folder, ImgData) {
    const Total = ImgData.size, promises = [];
    let progress = 1, link, extension, retry=0;
    async function Request(index) {
        link = ImgData.get(index);
        extension = GetExtension(link);
        return new Promise((resolve) => {
            if (link !== undefined) {
                GM_download({
                    url: link,
                    name: `${Folder}_${(index + 1).toString().padStart(4, '0')}.${extension}`,
                    headers : {"user-agent": navigator.userAgent},
                    onload: () => {
                        document.title = `[${progress}/${Total}]`;
                        Button.textContent = `${language[7]}: [${progress}/${Total}]`;
                        progress++;
                        resolve();
                    },
                    onerror: () => {
                        retry++;
                        if (retry < 10) {
                            Request(index);
                        } else {resolve()}
                    }
                });
            } else {
                document.title = `[${progress}/${Total}]`;
                Button.textContent = `${language[7]} [${progress}/${Total}]`;
                progress++;
                resolve();
            }
        });
    }
    for (let i = 0; i < Total; i++) {
        promises.push(Request(i));
    }
    await Promise.allSettled(promises);
    Button.textContent = language[11];
    setTimeout(() => {
        Button.textContent = ModeDisplay;
        Button.disabled = false;
    }, 3000);
}

/* 下載模式切換 */
async function DownloadModeSwitch() {
    if (CompressMode){
        GM_setValue("CompressedMode", false);
    } else {
        GM_setValue("CompressedMode", true);
    }
    location.reload();
}

/* 自適應css */
function AdaptiveCSS(e, ex) {
    const Domain = window.location.hostname;
    if (Domain === "e-hentai.org") {
        GM_addStyle(`${e}`);
    } else if (Domain === "exhentai.org") {
        GM_addStyle(`${ex}`);
    }
}

/* work創建 */
function BackgroundCreation() {
    let blob = new Blob([""], {type: "application/javascript"});
    return URL.createObjectURL(blob);
}

/* 顯示語言 */
function display_language(language) {
    let display = {
        "zh-TW": [
            "🔁 切換下載模式",
            "壓縮下載",
            "單圖下載",
            "開始下載",
            "未找到標題",
            "獲取頁面",
            "獲取連結",
            "下載進度",
            "壓縮封裝",
            "壓縮完成",
            "壓縮失敗",
            "下載完成"
        ],
        "zh-CN": [
            "🔁 切换下载模式",
            "压缩下载",
            "单图下载",
            "开始下载",
            "未找到标题",
            "获取页面",
            "获取链接",
            "下载进度",
            "压缩封装",
            "压缩完成",
            "压缩失败",
            "下载完成"
        ],
        "ja": [
            "🔁 ダウンロードモードの切り替え",
            "圧縮ダウンロード",
            "単一画像ダウンロード",
            "ダウンロード開始",
            "タイトルが見つかりませんでした",
            "ページを取得する",
            "リンクを取得する",
            "ダウンロードの進捗状況",
            "圧縮パッケージング",
            "圧縮完了",
            "圧縮に失敗しました",
            "ダウンロードが完了しました"
        ],
        "en": [
            "🔁 Switch download mode",
            "Compressed download",
            "Single image download",
            "Start download",
            "Title not found",
            "Get page",
            "Get link",
            "Download progress",
            "Compressed packaging",
            "Compression complete",
            "Compression failed",
            "Download complete"
        ],
        "ko": [
            "🔁 다운로드 모드 전환",
            "압축 다운로드",
            "단일 이미지 다운로드",
            "다운로드 시작",
            "제목을 찾을 수 없습니다",
            "페이지 가져오기",
            "링크 가져오기",
            "다운로드 진행 상황",
            "압축 포장",
            "압축 완료",
            "압축 실패",
            "다운로드 완료"
        ]
    };
    return display[language] || display["en"];
}
// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.6
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

// @require      https://greasyfork.org/scripts/473358-jszip/code/JSZip.js?version=1237031
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    const Ex_HManga = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    const E_HManga = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
    var count = 0, ModeDisplay,
    parser = new DOMParser(),
    OriginalTitle = document.title,
    url = window.location.href.split("?p=")[0],
    CompressMode = GM_getValue("CompressedMode", []),
    language = display_language(navigator.language);

    /* @===== 可調設置 =====@ */

    let debug = false, experiment = false;
    let Delay = {
        "Home" : 100, // 主頁數據獲取延遲
        "Image" : 30, // 圖片連結獲取延遲
        "Download": 500, // 下載速度延遲
    }

    /* @===== 運行入口 =====@ */

    /* 判斷創建的網址格式 */
    if (Ex_HManga.test(url) || E_HManga.test(url)) {
        ButtonCreation();
    }
    /* 創建菜單 */
    GM_registerMenuCommand(language.MN_01, function() {DownloadModeSwitch()}, "C");

    /* @===== 按鈕創建 =====@ */

    async function ButtonCreation() {
        let download_button;
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
        // 自適應樣式
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
        try {
            download_button = GM_addElement(document.querySelector("div#gd2"), "button", {class: "Download_Button"});
            if (CompressMode) {
                ModeDisplay = language.DM_01;
            } else {
                ModeDisplay = language.DM_02;
            }
            download_button.textContent = ModeDisplay;
            download_button.addEventListener("click", function() {
                download_button.textContent = language.DS_01;
                download_button.disabled = true;
                HomeDataProcessing(download_button);
            });
        } catch {}
    }

    /* @===== 數據處理 =====@ */

    /* 非法字元排除 */
    function IllegalFilter(Name) {
        return Name.replace(/[\/\?<>\\:\*\|":]/g, '');
    }

    /* 取得總頁數 */
    function GetTotal(page) {
        return parseInt(page[page.length - 2].textContent.replace(/\D/g, ''));
    }

    /* 圖片擴展名 */
    function GetExtension(link) {
        try {
            const match = link.match(/\.([^.]+)$/);
            return match[1].toLowerCase() || "png";
        } catch {return "png"}
    }

    /* 主頁數據處理 */
    async function HomeDataProcessing(button) {
        let title, homepage = new Map(),
        pages = GetTotal(document.querySelector("div#gdd").querySelectorAll("td.gdt2"));
        title = document.getElementById("gj").textContent.trim() || document.getElementById("gn").textContent.trim();
        title = IllegalFilter(title);
        pages = Math.ceil(pages / 20);
     
        if (experiment) {
            const worker = BackWorkerCreation(`
                const queue = [];
                onmessage = function(e) {
                    const {index, url} = e.data;
                    queue.push({index, url});
                    processQueue();
                }
                function processQueue() {
                    if (queue.length > 0) {
                        const {index, url} = queue.shift();
                        setTimeout(function() {
                            FetchRequest(index, url);
                            processQueue();
                        }, ${Delay["Home"]});
                    }
                }
                async function FetchRequest(index, url) {
                    const response = await fetch(url);
                    const html = await response.text();
                    postMessage({index, html});
                }
            `)

            // 傳遞訊息
            worker.postMessage({index: 0, url: url});
            for (let index = 1; index < pages; index++) {
                worker.postMessage({index, url: `${url}?p=${index}`});
            }

            // 接受訊息
            worker.onmessage = function(e) {
                const {index, html} = e.data;
                GetLink(index, parser.parseFromString(html, "text/html"));
            }

            async function GetLink(index, data) {
                const homebox = [];
                data.querySelector("#gdt").querySelectorAll("a").forEach(link => {
                    homebox.push(link.href)
                });
                homepage.set(index, homebox);
                button.textContent = `${language.DS_02}: [${index+1}/${pages}]`;

                if (homepage.size === pages) { // 全部處理完成
                    worker.terminate();
                    const homebox = [];
                    for (let i = 0; i < homepage.size; i++) {
                        homebox.push(...homepage.get(i));
                    }
                
                    if (debug) {
                        console.groupCollapsed("Home Page Data");
                        console.log(`[Title] : ${title}`);
                        console.log(homebox);
                        console.groupEnd();
                    }
                    ImageLinkProcessing(button, title, homebox);
                }
            }

        } else {
            async function GetLink(index, data) { // 獲取頁面所有連結
                const homebox = [];
                data.querySelector("#gdt").querySelectorAll("a").forEach(link => {
                    homebox.push(link.href)
                });
                homepage.set(index, homebox); // 確保索引順序
            }
        
            async function FetchRequest(index, url) { // 數據請求
                const response = await fetch(url);
                const html = await response.text();
                await GetLink(index, parser.parseFromString(html, "text/html"));
            }
        
            const promises = [FetchRequest(0, url)];
            for (let index = 1; index < pages; index++) {
                promises.push(FetchRequest(index, `${url}?p=${index}`));
                button.textContent = `${language.DS_02}: [${index+1}/${pages}]`;
                await new Promise(resolve => setTimeout(resolve, Delay["Home"]));
            }
            await Promise.allSettled(promises);
        
            const homebox = [];
            for (let i = 0; i < homepage.size; i++) {
                homebox.push(...homepage.get(i));
            }
        
            if (debug) {
                console.groupCollapsed("Home Page Data");
                console.log(`[Title] : ${title}`);
                console.log(homebox);
                console.groupEnd();
            }
            ImageLinkProcessing(button, title, homebox);
        }
    }

    /* 漫畫連結處理 */
    async function ImageLinkProcessing(button, title, link) {
        let imgbox = new Map(), pages = link.length;

        if (experiment) {
            const worker = BackWorkerCreation(`
                const queue = [];
                onmessage = function(e) {
                    const {index, url} = e.data;
                    queue.push({index, url});
                    processQueue();
                }
                function processQueue() {
                    if (queue.length > 0) {
                        const {index, url} = queue.shift();
                        setTimeout(function() {
                            FetchRequest(index, url);
                            processQueue();
                        }, ${Delay["Image"]});
                    }
                }
                async function FetchRequest(index, url) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, html});
                    } catch (error) {
                        await FetchRequest(index, url);
                    }
                }
            `)

            // 傳遞訊息
            for (let index = 0; index < pages; index++) {
                worker.postMessage({index, url: link[index]});
            }

            // 接收回傳
            worker.onmessage = function(e) {
                const {index, html} = e.data;
                GetLink(index, parser.parseFromString(html, "text/html").querySelector("img#img"));
            }

            async function GetLink(index, data) {
                try {
                    imgbox.set(index, data.src);
                    button.textContent = `${language.DS_03}: [${index + 1}/${pages}]`;
                } catch {
                    try {
                        imgbox.set(index, data.href);
                        button.textContent = `${language.DS_03}: [${index + 1}/${pages}]`;
                    } catch {}
                }
                if (imgbox.size === pages) {
                    worker.terminate();
                    if (debug) {
                        console.groupCollapsed("Img Link Data");
                        console.log(imgbox);
                        console.groupEnd();
                    }
                    DownloadTrigger(button, title, imgbox);
                }
            }

        } else {
            async function GetLink(index, data) {
                try {
                    imgbox.set(index, data.src);
                    button.textContent = `${language.DS_03}: [${index + 1}/${pages}]`;
                } catch {
                    try {
                        imgbox.set(index, data.href);
                        button.textContent = `${language.DS_03}: [${index + 1}/${pages}]`;
                    } catch {}
                }
            }
        
            async function FetchRequest(index, url) {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    await GetLink(index, parser.parseFromString(html, "text/html").querySelector("img#img"));
                } catch (error) {
                    await FetchRequest(index, url);
                }
            }
        
            const promises = [];
            for (let index = 0; index < pages; index++) {
                promises.push(FetchRequest(index, link[index]));
                await new Promise(resolve => setTimeout(resolve, Delay["Image"]));
            }
        
            await Promise.allSettled(promises);
            if (debug) {
                console.groupCollapsed("Img Link Data");
                console.log(imgbox);
                console.groupEnd();
            }
            DownloadTrigger(button, title, imgbox);
        }
    }

    /* @===== 下載處理 =====@ */

    /* 下載觸發器 */
    async function DownloadTrigger(button, title, link) {
        if (CompressMode) {ZipDownload(button, title, link)}
        else {ImageDownload(button, title, link)}
    }

    /* 壓縮下載 */
    async function ZipDownload(Button, Folder, ImgData) {
        const zip = new JSZip(), Total = ImgData.size, promises = [];
        let progress = 1, link, mantissa, extension;
        async function Request(index, retry) {
            link = ImgData.get(index);
            extension = GetExtension(link);
            return new Promise((resolve, reject) => {
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
                            Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                            progress++;
                            resolve();
                        } else {
                            if (retry > 0) {
                                if (debug) {console.log(`Request Retry : [${retry}]`)}
                                Request(index, retry-1);
                                resolve();
                            } else {
                                reject(new Error("Request error"));
                            }
                        }
                    },
                    onerror: error => {
                        if (retry > 0) {
                            if (debug) {console.log(`Request Retry : [${retry}]`)}
                            Request(index, retry-1);
                            resolve();
                        } else {
                            console.groupCollapsed("Request Error");
                            console.log(`[Request Error] : ${link}`);
                            console.groupEnd();
                            reject(error);
                        }
                    }
                })
            });
        }
        for (let i = 0; i < Total; i++) {
            promises.push(Request(i, 10));
            count++;
            if (count === 5) {
                count = 0;
                await new Promise(resolve => setTimeout(resolve, Delay["Download"]));
            }
        }
        await Promise.allSettled(promises);
        Compression();
        async function Compression() {
            zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 5
                }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                Button.textContent = `${language.DS_05}: ${progress.percent.toFixed(1)} %`;
            }).then(zip => {
                saveAs(zip, `${Folder}.zip`);
                Button.textContent = language.DS_06;
                document.title = OriginalTitle;
                setTimeout(() => {
                    Button.textContent = ModeDisplay;
                    Button.disabled = false;
                }, 3000);
            }).catch(result => {
                Button.textContent = language.DS_07;
                document.title = OriginalTitle;
                setTimeout(() => {
                    Button.textContent = ModeDisplay;
                    Button.disabled = false;
                }, 6000);
            })
        }
    }

    /* 單圖下載 */
    async function ImageDownload(Button, Folder, ImgData) {
        const Total = ImgData.size, promises = [];
        let progress = 1, link, extension;
        async function Request(index, retry) {
            link = ImgData.get(index);
            extension = GetExtension(link);
            return new Promise((resolve, reject) => {
                GM_download({
                    url: link,
                    name: `${Folder}_${(index + 1).toString().padStart(4, '0')}.${extension}`,
                    headers : {"user-agent": navigator.userAgent},
                    onload: () => {
                        document.title = `[${progress}/${Total}]`;
                        Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                        progress++;
                        resolve();
                    },
                    onerror: () => {
                        if (retry > 0) {
                            if (debug) {console.log(`Request Retry : [${retry}]`)}
                            Request(index, retry-1);
                            resolve();
                        } else {
                            reject(new Error("Request error"));
                        }
                    }
                });
            });
        }
        for (let i = 0; i < Total; i++) {
            promises.push(Request(i));
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        await Promise.allSettled(promises);
        Button.textContent = language.DS_08;
        setTimeout(() => {
            Button.textContent = ModeDisplay;
            Button.disabled = false;
        }, 3000);
    }

    /* @===== 附加功能函數 =====@ */

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
    function BackWorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
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

    /* 顯示語言 */
    function display_language(language) {
        let display = {
            "zh-TW": [{
                "MN_01" : "🔁 切換下載模式",
                "DM_01" : "壓縮下載",
                "DM_02" : "單圖下載",
                "DS_01" : "開始下載",
                "DS_02" : "獲取頁面",
                "DS_03" : "獲取連結",
                "DS_04" : "下載進度",
                "DS_05" : "壓縮封裝",
                "DS_06" : "壓縮完成",
                "DS_07" : "壓縮失敗",
                "DS_08" : "下載完成"
            }],
            "zh-CN": [{
                "MN_01" : "🔁 切换下载模式",
                "DM_01" : "压缩下载",
                "DM_02" : "单图下载",
                "DS_01" : "开始下载",
                "DS_02" : "获取页面",
                "DS_03" : "获取链接",
                "DS_04" : "下载进度",
                "DS_05" : "压缩封装",
                "DS_06" : "压缩完成",
                "DS_07" : "压缩失败",
                "DS_08" : "下载完成"
            }],
            "ja": [{
                "MN_01" : "🔁 ダウンロードモードの切り替え",
                "DM_01" : "圧縮ダウンロード",
                "DM_02" : "単一画像ダウンロード",
                "DS_01" : "ダウンロード開始",
                "DS_02" : "ページを取得する",
                "DS_03" : "リンクを取得する",
                "DS_04" : "ダウンロードの進捗状況",
                "DS_05" : "圧縮パッケージング",
                "DS_06" : "圧縮完了",
                "DS_07" : "圧縮に失敗しました",
                "DS_08" : "ダウンロードが完了しました"
            }],
            "en": [{
                "MN_01" : "🔁 Switch download mode",
                "DM_01" : "Compressed download",
                "DM_02" : "Single image download",
                "DS_01" : "Start download",
                "DS_02" : "Get page",
                "DS_03" : "Get link",
                "DS_04" : "Download progress",
                "DS_05" : "Compressed packaging",
                "DS_06" : "Compression complete",
                "DS_07" : "Compression failed",
                "DS_08" : "Download complete"
            }],
            "ko": [{
                "MN_01" : "🔁 다운로드 모드 전환",
                "DM_01" : "압축 다운로드",
                "DM_02" : "단일 이미지 다운로드",
                "DS_01" : "다운로드 시작",
                "DS_02" : "페이지 가져오기",
                "DS_03" : "링크 가져오기",
                "DS_04" : "다운로드 진행 상황",
                "DS_05" : "압축 포장",
                "DS_06" : "압축 완료",
                "DS_07" : "압축 실패",
                "DS_08" : "다운로드 완료"
            }]
        };
        return display[language][0] || display["en"][0];
    }
})();
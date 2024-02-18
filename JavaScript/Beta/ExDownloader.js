// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.14
// @author       HentaiSaru
// @description         在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-TW   在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-CN   在 E 和 Ex 的漫画页面, 创建下载按钮, 可使用[压缩下载/单图下载], 自动获取图片下载
// @description:ja      EとExの漫画ページで、ダウンロードボタンを作成し、[圧縮ダウンロード/単一画像ダウンロード]を使用して、自動的に画像をダウンロードします。
// @description:ko      E 및 Ex의 만화 페이지에서 다운로드 버튼을 만들고, [압축 다운로드/단일 이미지 다운로드]를 사용하여 이미지를 자동으로 다운로드합니다.
// @description:en      On the comic pages of E and Ex, create a download button that can use [compressed download/single image download] to automatically download images.

// @connect      *
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/487608/1329278/GrammarSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

/* 需新開發功能

設置菜單

設置下載線程數
設置檔名格式
設置壓縮級別
設置圖片名格式
切換壓縮下載模式
*/

(function() {
    var language, OriginalTitle, CompressMode, ModeDisplay,
    lock = false, api = new API(), url = document.URL.split("?p=")[0];

    const Config = {
        ReTry: 15, // 下載錯誤重試次數, 超過這個次數該圖片會被跳過
        DeBug: false,
    }

    class Main {
        constructor() {
            this.E = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Ex = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Ran = (u) => {return this.E.test(u) || this.Ex.test(u)}
            this.Css = (a, e, ex) => {
                let css = location.hostname != "exhentai.org" ? e : ex;
                api.AddStyle(`${a}${css}`, "button-style");
            }
        }

        /* 啟動匹配 */
        async Match() {
            if (this.Ran(url)) {
                language = display_language(navigator.language);
                OriginalTitle = document.title;
                this.ButtonCreation();
                api.Menu({[language.MN_01]: ()=> this.__DownloadModeSwitch()})
            }
        }

        /* 按鈕創建 */
        async ButtonCreation() {
            CompressMode = api.store("get", "CompressedMode", []);
            ModeDisplay = CompressMode ? language.DM_01 : language.DM_02;
            this.Css(`
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
                `,`
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
                let download_button = GM_addElement(api.$$("#gd2"), "button", {
                    id: "ExDB",
                    class: "Download_Button"
                });
                download_button.textContent = lock ? language.DM_03 : ModeDisplay;
                download_button.disabled = lock ? true : false;
                api.AddListener(download_button, "click", () => {
                    lock = true;
                    download_button.disabled = true;
                    download_button.textContent = language.DS_01;
                    download.HomeData(download_button);
                }, {capture: true, passive: true});
            } catch {}
        }

        /* 下載模式切換 */
        async __DownloadModeSwitch() {
            CompressMode?
            api.store("set", "CompressedMode", false):
            api.store("set", "CompressedMode", true);
            api.$$("#ExDB").remove();
            this.ButtonCreation();
        }
    }

    class Settings {
        constructor() {
            this.MAX_CONCURRENCY = 12; // 最大併發數
            this.MIN_CONCURRENCY = 4;  // 最小併發數
            this.TIME_THRESHOLD = 350; // 響應時間閥值
    
            this.MAX_Delay = 3500;     // 最大延遲
            this.Home_ID = 100;        // 主頁初始延遲
            this.Home_ND = 80;         // 主頁最小延遲
            this.Image_ID = 30;        // 圖頁初始延遲
            this.Image_ND = 24;        // 圖頁最小延遲
            this.Download_IT = 5;      // 下載初始線程
            this.Download_ID = 300;    // 下載初始延遲
            this.Download_ND = 240;    // 下載最小延遲
    
            /* 壓縮下載的等級 */
            this.Compr_Level = 5;
            /* 用於下載時 不被變更下載模式 */
            this.DownloadMode;
        }
    
        /* 動態調整 */
        Dynamic(Time, Delay, Thread=null, MIN_Delay) {
            let ResponseTime = (Date.now() - Time), delay, thread;
            if (ResponseTime > this.TIME_THRESHOLD) {
                delay = Math.floor(Math.min(Delay * 1.1, this.MAX_Delay));
                if (Thread != null) {
                    thread = Math.floor(Math.max(Thread * (this.TIME_THRESHOLD / ResponseTime), this.MIN_CONCURRENCY));
                    return [delay, thread];
                } else {return delay}
            } else {
                delay = Math.ceil(Math.max(Delay * 0.9, MIN_Delay));
                if (Thread != null) {
                    thread = Math.ceil(Math.min(Thread * 1.2, this.MAX_CONCURRENCY));
                    return [delay, thread];
                } else {return delay}
            }
        }
    }

    class Download extends Settings {
        constructor() {
            super();
            this.parser = new DOMParser();
            /* 取得總頁數 */
            this.Total = (page) => {return Math.ceil(+page[page.length - 2].textContent.replace(/\D/g, '') / 20)}
            /* 取得填充值(最少填充 2 個 0) */
            this.FillValue = (page) => {
                return Math.max(2, `${page}`.length);
            }
            /* 取得尾數(使用 0 填充) */
            this.Mantissa = (str, fill) => {
                return `${++str}`.padStart(fill, "0");
            }
        }

        /* 主頁數據處理 */
        async HomeData(button) {
            // 當異步函數內又有異步函數, 且他需要調用, 構建函數時不能直接使用 this 正確指向, 因此需要 self = this
            let homepage = new Map(), task = 0, DC = 1, HomeD = this.Home_ID, pages = this.Total(api.$$("#gdd td.gdt2", true)),
            title = api.IllegalCharacters(api.$$("#gj").textContent.trim() || api.$$("#gn").textContent.trim()); //! 由這邊寫修改檔名邏輯
            this.DownloadMode = CompressMode;

            const worker = api.WorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    const {index, url, time, delay} = e.data;
                    queue.push({index, url, time, delay});
                    if (!processing) {
                        processQueue();
                        processing = true;
                    }
                }
                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, time, delay} = queue.shift();
                        FetchRequest(index, url, time, delay);
                        setTimeout(processQueue, delay);
                    }
                }
                async function FetchRequest(index, url, time, delay) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, html, time, delay, error: false});
                    } catch {
                        postMessage({index, url, time, delay, error: true});
                    }
                }
            `)

            // 傳遞訊息
            worker.postMessage({index: 0, url: url, time: Date.now(), delay: HomeD});
            for (let index = 1; index < pages; index++) {
                worker.postMessage({index, url: `${url}?p=${index}`, time: Date.now(), delay: HomeD});
            }

            // 接受訊息
            worker.onmessage = (e) => {
                const {index, html, time, delay, error} = e.data;
                HomeD = this.Dynamic(time, delay, null, this.Home_ND);
                error ? FetchRequest(index, html, 10):
                GetLink(index, api.DomParse(html));
            }

            // 數據試錯請求
            async function FetchRequest(index, url, retry) {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    await GetLink(index, api.DomParse(html));
                } catch {
                    if (retry > 0) {
                        await FetchRequest(index, url, retry-1);
                    } else {
                        task++;
                    }
                }
            }

            // 獲取連結
            async function GetLink(index, data) {
                const homebox = [];
                try {
                    api.$$("#gdt a", true, data).forEach(link => {
                        homebox.push(link.href)
                    });
                    homepage.set(index, homebox);
                    document.title = `[${DC}/${pages}]`;
                    button.textContent = `${language.DS_02}: [${DC}/${pages}]`;
                    DC++; // 顯示效正
                    task++; // 任務進度
                } catch {
                    alert("Your IP is temporarily banned");
                    location.reload();
                }
            }

            // 等待全部處理完成 (雖然會吃資源, 但是比較能避免例外)
            let interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    worker.terminate();
                    const homebox = [];
                    for (let i = 0; i < homepage.size; i++) {
                        homebox.push(...homepage.get(i));
                    }
                    if (Config.DeBug) {
                        api.log("Home Page Data", `[Title] : ${title}\n${homebox}`);
                    }
                    this.__ImageData(button, title, homebox);
                }
            }, 500);
        }

        /* 漫畫連結處理 */
        async __ImageData(button, title, link) {
            let imgbox = new Map(), pages = link.length, DC = 1, task = 0, ImageD = this.Image_ID;

            const worker = api.WorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    const {index, url, time, delay} = e.data;
                    queue.push({index, url, time, delay});
                    if (!processing) {
                        processQueue();
                        processing = true;
                    }
                }
                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, time, delay} = queue.shift();
                        FetchRequest(index, url, time, delay);
                        setTimeout(processQueue, delay);
                    }
                }
                async function FetchRequest(index, url, time, delay) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, html, time, delay, error: false});
                    } catch {
                        postMessage({index, html, time, delay, error: true});
                    }
                }
            `)

            // 傳遞訊息
            for (let index = 0; index < pages; index++) {
                worker.postMessage({index, url: link[index], time: Date.now(), delay: ImageD});
            }

            // 接收回傳
            worker.onmessage = (e) => {
                const {index, html, time, delay, error} = e.data;
                ImageD = this.Dynamic(time, delay, null, this.Image_ND);
                error ? FetchRequest(index, html, 10) :
                GetLink(index, api.$$("#img", false, api.DomParse(html)));
            }

            // 數據試錯請求
            async function FetchRequest(index, url, retry) {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    await GetLink(index, api.$$("#img", false, api.DomParse(html)));
                } catch {
                    if (retry > 0) {
                        await FetchRequest(index, url, retry-1);
                    } else {
                        task++;
                    }
                }
            }

            // 獲取連結
            async function GetLink(index, data) {
                try {
                    imgbox.set(index, data.src || data.href);
                    document.title = `[${DC}/${pages}]`;
                    button.textContent = `${language.DS_03}: [${DC}/${pages}]`;
                    DC++; // 顯示效正
                    task++; // 任務進度
                } catch {
                    alert("Your IP is temporarily banned");
                    location.reload();
                }
            }

            // 等待完成
            let interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    worker.terminate();
                    if (Config.DeBug) {
                        api.log("Img Link Data", imgbox);
                    }
                    this.__DownloadTrigger(button, title, imgbox);
                }
            }, 500);
        }

        /* 下載觸發器 */
        async __DownloadTrigger(button, title, link) {
            this.DownloadMode?
            this.__ZipDownload(button, title, link):
            this.__ImageDownload(button, title, link);
        }

        /* 壓縮下載 */
        async __ZipDownload(Button, Folder, ImgData) {
            const Data = new JSZip(), self = this, Total = ImgData.size;
            let time, link, progress = 1, thread = self.Download_IT, delay = self.Download_ID, Fill = self.FillValue(Total);
            async function Request(index, retry) {
                time = Date.now();
                link = ImgData.get(index);
                return new Promise((resolve, reject) => {
                    if (typeof link !== "undefined") {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: link,
                            responseType: "blob",
                            onload: response => {
                                if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                                    [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                                    Data.file(`${Folder}/${self.Mantissa(index, Fill)}.${api.ExtensionName(link)}`, response.response);
                                    document.title = `[${progress}/${Total}]`;
                                    Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                                    progress++;
                                    resolve();
                                } else {
                                    if (retry > 0) {
                                        [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                                        Config.DeBug ? api.log(null, `[Delay:${delay}|Thread:${thread}|Retry:${retry}] : [${link}]`, "error") : null;
                                        setTimeout(() => {
                                            Request(index, retry-1);
                                            resolve();
                                        }, delay * 2);
                                    } else {
                                        reject(new Error("Request error"));
                                    }
                                }
                            },
                            onerror: error => {
                                if (retry > 0) {
                                    [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                                    Config.DeBug ? api.log(null, `[Delay:${delay}|Thread:${thread}|Retry:${retry}] : [${link}]`, "error") : null;
                                    setTimeout(() => {
                                        Request(index, retry-1);
                                        resolve();
                                    }, delay * 2);
                                } else {
                                    api.log("Request Error", `(Error Link) : [${link}]`, "error");
                                    reject(error);
                                }
                            }
                        })
                    } else {reject(new Error("undefined url"))}
                });
            }
            let count = 0, promises = [];
            for (let i = 0; i < Total; i++) {
                promises.push(Request(i, Config.ReTry));
                count++;
                if (count === thread) {
                    count = 0;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            await Promise.allSettled(promises);
            this.__Compression(Data, Folder, Button);
        }

        /* 單圖下載 */
        async __ImageDownload(Button, Folder, ImgData) {
            const Total = ImgData.size, self = this;
            let time, link, progress = 1, thread = self.Download_IT, delay = self.Download_ID, Fill = self.FillValue(Total);
            async function Request(index, retry) {
                time = Date.now();
                link = ImgData.get(index);
                return new Promise((resolve, reject) => {
                    if (typeof link !== "undefined") {
                        GM_download({
                            url: link,
                            name: `${Folder}-${self.Mantissa(index, Fill)}.${api.ExtensionName(link)}`,
                            onload: () => {
                                [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                                document.title = `[${progress}/${Total}]`;
                                Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                                progress++;
                                resolve();
                            },
                            onerror: () => {
                                if (retry > 0) {
                                    [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                                    Config.DeBug ? api.log(null, `[Delay:${delay}|Thread:${thread}|Retry:${retry}] : [${link}]`, "error") : null;
                                    setTimeout(() => {
                                        Request(index, retry-1);
                                        resolve();
                                    }, delay * 2);
                                } else {
                                    reject(new Error("Request error"));
                                }
                            }
                        })
                    } else {reject(new Error("undefined url"))}
                });
            }
            let count = 0, promises = [];
            for (let i = 0; i < Total; i++) {
                promises.push(Request(i, Config.ReTry));
                count++;
                if (count === thread) {
                    count = 0;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            await Promise.allSettled(promises);
            Button.textContent = language.DS_08;
            setTimeout(() => {
                document.title = `✓ ${OriginalTitle}`;
                ResetButton();
            }, 3000);
        }

        /* 壓縮處理 */
        async __Compression(Data, Folder, Button) {
            Data.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: this.Compr_Level
                }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                Button.textContent = `${language.DS_05}: ${progress.percent.toFixed(1)} %`;
            }).then(zip => {
                saveAs(zip, `${Folder}.zip`);
                Button.textContent = language.DS_06;
                document.title = `✓ ${OriginalTitle}`;
                setTimeout(() => {
                    ResetButton();
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

    /* ============ 實例運行 ============ */

    const download = new Download();
    const main = new Main();
    main.Match();

    /* ============ 全域 API ============ */

    /* 按鈕重置 */
    async function ResetButton() {
        lock = false;
        let Button = api.$$("#ExDB");
        Button.disabled = false;
        Button.textContent = `✓ ${ModeDisplay}`;
    }

    function display_language(language) {
        let display = {
            "zh-TW": [{
                "MN_01" : "🔁 切換下載模式",
                "DM_01" : "壓縮下載", "DM_02" : "單圖下載", "DM_03" : "下載中鎖定",
                "DS_01" : "開始下載", "DS_02" : "獲取頁面", "DS_03" : "獲取連結", "DS_04" : "下載進度",
                "DS_05" : "壓縮封裝", "DS_06" : "壓縮完成", "DS_07" : "壓縮失敗", "DS_08" : "下載完成"
            }],
            "zh-CN": [{
                "MN_01" : "🔁 切换下载模式",
                "DM_01" : "压缩下载", "DM_02" : "单图下载", "DM_03" : "下载中锁定",
                "DS_01" : "开始下载", "DS_02" : "获取页面", "DS_03" : "获取链接", "DS_04" : "下载进度",
                "DS_05" : "压缩封装", "DS_06" : "压缩完成", "DS_07" : "压缩失败", "DS_08" : "下载完成"
            }],
            "ja": [{
                "MN_01" : "🔁 ダウンロードモードの切り替え",
                "DM_01" : "圧縮ダウンロード", "DM_02" : "単一画像ダウンロード", "DM_03" : "ダウンロード中にロックされました",
                "DS_01" : "ダウンロード開始", "DS_02" : "ページを取得する", "DS_03" : "リンクを取得する", "DS_04" : "ダウンロードの進捗状況",
                "DS_05" : "圧縮パッケージング", "DS_06" : "圧縮完了", "DS_07" : "圧縮に失敗しました", "DS_08" : "ダウンロードが完了しました"
            }],
            "en-US": [{
                "MN_01" : "🔁 Switch download mode",
                "DM_01" : "Compressed download", "DM_02" : "Single image download", "DM_03" : "Downloading Locked",
                "DS_01" : "Start download", "DS_02" : "Get page", "DS_03" : "Get link", "DS_04" : "Download progress",
                "DS_05" : "Compressed packaging", "DS_06" : "Compression complete", "DS_07" : "Compression failed", "DS_08" : "Download complete"
            }],
            "ko": [{
                "MN_01" : "🔁 다운로드 모드 전환",
                "DM_01" : "압축 다운로드", "DM_02" : "단일 이미지 다운로드", "DM_03" : "다운로드 중 잠김",
                "DS_01" : "다운로드 시작", "DS_02" : "페이지 가져오기", "DS_03" : "링크 가져오기", "DS_04" : "다운로드 진행 상황",
                "DS_05" : "압축 포장", "DS_06" : "압축 완료", "DS_07" : "압축 실패", "DS_08" : "다운로드 완료"
            }]
        };

        return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
    }
})();
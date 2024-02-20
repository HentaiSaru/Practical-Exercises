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
// @grant        GM_unregisterMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/487608/1330066/GrammarSimplified.js
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
    var Language, OriginalTitle, CompressMode, ModeDisplay,
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
        static async Match() {
            const self = new Main();
            if (self.Ran(url)) {
                Language = display_language(navigator.language);
                OriginalTitle = document.title;
                self.ButtonCreation();
                api.Menu({[Language.MN_01]: ()=> self.DownloadModeSwitch()})
            }
        }

        /* 按鈕創建 */
        async ButtonCreation() {
            CompressMode = api.store("get", "CompressedMode", []);
            ModeDisplay = CompressMode ? Language.DM_01 : Language.DM_02;
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
                    id: "ExDB", class: "Download_Button"
                });
                download_button.textContent = lock ? Language.DM_03 : ModeDisplay;
                download_button.disabled = lock ? true : false;
                api.AddListener(download_button, "click", () => {
                    lock = true;
                    download_button.disabled = true;
                    download_button.textContent = Language.DS_01;
                    download.HomeData(download_button);
                }, {capture: true, passive: true});
            } catch {}
        }

        /* 下載模式切換 */
        async DownloadModeSwitch() {
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
            /* 判斷強制下載狀態 */
            this.Enforce = false;
            /* 用於下載時 不被變更下載模式 */
            this.DownloadMode;
            /* 下載時的展示字串 */
            this.Show = "";
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
            /* 存取 Session 數據 */
            this.Storage = (key, value=null) => {
                let data, result;
                if (value) { // 存數據
                    sessionStorage.setItem(key, JSON.stringify(Array.from(value.entries())));
                    result = true;
                } else { // 取數據
                    data = sessionStorage.getItem(key);
                    result = data ? new Map(JSON.parse(data)) : false;
                }
                return result;
            }
            /* 異步函數暫停 */
            this.sleep = (delay) => {
                return new Promise(resolve => setTimeout(resolve, delay));
            }
            /* 後台請求工作 */
            this.worker = api.WorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    queue.push(e.data);
                    !processing ? (processing = true, processQueue()) : null;
                }
                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, time, delay} = queue.shift();
                        FetchRequest(index, url, time, delay);
                        setTimeout(processQueue, delay);
                    } else {processing = false}
                }
                async function FetchRequest(index, url, time, delay) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, url, html, time, delay, error: false});
                    } catch {
                        postMessage({index, url, html, time, delay, error: true});
                    }
                }
            `)
        }

        /* 主頁數據處理 */
        async HomeData(button) {
            const self = this, homepage = new Map();
            let task = 0, DC = 0, HomeD = self.Home_ID, pages = self.Total(api.$$("#gdd td.gdt2", true)),
            title = api.IllegalCharacters(api.$$("#gj").textContent.trim() || api.$$("#gn").textContent.trim()); //! 由這邊寫修改檔名邏輯
            self.DownloadMode = CompressMode;

            const olddata = self.Storage(`[${title} - Download Cache]`);

            if (olddata) { // 當存在緩存時不用重新請求
                self.DownloadTrigger(button, title, olddata);
                return;
            }

            // 獲取連結
            async function GetLink(index, data) {
                const homebox = [];
                try {
                    api.$$("#gdt a", true, data).forEach(link => {homebox.push(link.href)});
                    homepage.set(index, homebox);

                    self.Show = `[${++DC}/${pages}]`;
                    document.title = self.Show;
                    button.textContent = `${Language.DS_02}: ${self.Show}`;

                    task++; // 任務進度
                } catch (error) {
                    alert("Request Error Reload");
                    location.reload();
                }
            }

            // 傳遞訊息
            self.worker.postMessage({index: 0, url: url, time: Date.now(), delay: HomeD});
            for (let index = 1; index < pages; index++) {
                self.worker.postMessage({index, url: `${url}?p=${index}`, time: Date.now(), delay: HomeD});
            }

            // 接受訊息
            self.worker.onmessage = (e) => {
                const {index, url, html, time, delay, error} = e.data;
                HomeD = self.Dynamic(time, delay, null, self.Home_ND);
                error ? self.worker.postMessage({index: index, url: url, time: time, delay: delay}) : GetLink(index, api.DomParse(html));
            }

            // 等待全部處理完成 (雖然會吃資源, 但是比較能避免例外)
            const interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    const homebox = [];
                    for (let i = 0; i < homepage.size; i++) {homebox.push(...homepage.get(i))}
                    Config.DeBug ? api.log("Home Page Data", `[Title] : ${title}\n${homebox}`) : null;
                    self.ImageData(button, title, homebox);
                }
            }, 500);
        }

        /* 漫畫連結處理 */
        async ImageData(button, title, link) {
            const self = this, imgbox = new Map();
            let pages = link.length, ImageD = self.Image_ID, DC = 0, task = 0;

            // 獲取連結
            async function GetLink(index, img) {
                try {
                    if (img) {
                        imgbox.set(index, img.src || img.href);
                        self.Show = `[${++DC}/${pages}]`;
                        document.title = self.Show;
                        button.textContent = `${Language.DS_03}: ${self.Show}`;
                        task++; // 任務進度
                    } else {
                        throw "No Picture Element";
                    }
                } catch (error) {
                    api.log("Request Error", error);
                    task++;
                }
            }

            // 傳遞訊息
            for (let index = 0; index < pages; index++) {
                self.worker.postMessage({index, url: link[index], time: Date.now(), delay: ImageD});
            }

            // 接收回傳
            self.worker.onmessage = (e) => {
                const {index, url, html, time, delay, error} = e.data;
                ImageD = self.Dynamic(time, delay, null, self.Image_ND);
                error ? self.worker.postMessage({index: index, url: url, time: time, delay: delay}) : GetLink(index, api.$$("#img", false, api.DomParse(html)));
            }

            // 等待完成
            let interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    Config.DeBug ? api.log("Img Link Data", imgbox) : null;
                    self.DownloadTrigger(button, title, imgbox);
                    self.Storage(`[${title} - Download Cache]`, imgbox);
                }
            }, 500);
        }

        /* 下載觸發器 */
        async DownloadTrigger(button, title, link) {
            this.DownloadMode?
            this.ZipDownload(button, title, link):
            this.ImageDownload(button, title, link);
        }

        /* 壓縮下載 */
        async ZipDownload(Button, Folder, ImgData) {
            const self=this, Data=new JSZip(), force = GM_registerMenuCommand("📥強制壓縮", ()=> ForceDownload());
            let time, blob, count=0, progress=0, clean=false,
            ReTry=Config.ReTry,
            Total=ImgData.size,
            delay=self.Download_ID,
            thread=self.Download_IT,
            Fill=self.FillValue(Total);

            // 強制下載
            async function ForceDownload() {
                self.Enforce = true;
                self.Compression(Data, Folder, Button, force);
            }

            // 分析請求狀態
            async function Request_Analysis(index, link, blob, retry=false) {
                if (self.Enforce) {return}
                ImgData.delete(index);
                self.Show = `[${++progress}/${Total}]`;
                [ delay, thread ] = self.Dynamic(time, delay, thread, self.Download_ND);
                retry ? ImgData.set(index, link) : Data.file(`${Folder}/${self.Mantissa(index, Fill)}.${api.ExtensionName(link)}`, blob);

                document.title = self.Show;
                Button.textContent = `${Language.DS_04}: ${self.Show}`;

                if (progress == Total) {
                    Total = ImgData.size;
                    if (Total == 0) {self.Compression(Data, Folder, Button, force)}
                    else {
                        ReTry -= 1; // 超過重試次數就直接壓縮
                        if (ReTry != 0) {
                            progress = 0;
                            self.Show = "等待失敗重載...";
                            document.title = self.Show;
                            Button.textContent = self.Show;
                            await self.sleep(3000);
                            await StartDownload(true);
                        } else {self.Compression(Data, Folder, Button, force)}
                    }
                }
            }

            // 請求數據
            async function Request(index, link, analysis) {
                time = Date.now();
                if (self.Enforce) {return}
                else if (typeof link !== "undefined") {
                    GM_xmlhttpRequest({
                        url: link,
                        method: "GET",
                        responseType: "blob",
                        onload: response => {
                            blob = response.response;
                            if (blob instanceof Blob && blob.size > 0) {analysis(index, link, blob)}
                            else {
                                Config.DeBug ? api.log(null, `[Delay:${delay}|Thread:${thread}]\nLink:${link}]`, "error") : null;
                                analysis(index, link, null, true);
                            }
                        },
                        onerror: error => {
                            Config.DeBug ? api.log(null, `[Delay:${delay}|Thread:${thread}]`, "error") : null;
                            analysis(index, link, null, true);
                        }
                    })
                } else {
                    if (!clean) {
                        clean = true;
                        sessionStorage.clear();
                        api.log("清理警告", "下載數據不完整將清除緩存, 建議刷新頁面後重載", "warn");
                    }
                    progress++;
                }
            }

            // 啟動下載
            StartDownload();
            async function StartDownload(restart=false) {
                for (const [index, link] of ImgData.entries()) {
                    if (self.Enforce) {break}
                    else if (restart) {
                        Request(index, link, Request_Analysis);
                        await self.sleep(1500);
                    }
                    else {
                        Request(index, link, Request_Analysis);
                        if (++count === thread) {
                            count = 0;
                            await self.sleep(delay);
                        }
                    }
                }
            }
        }

        /* 單圖下載 */
        async ImageDownload(Button, Folder, ImgData) {
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
                                self.Show = `[${progress}/${Total}]`
                                document.title = self.Show;
                                Button.textContent = `${Language.DS_04}: ${self.Show}`;
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
            Button.textContent = Language.DS_08;
            setTimeout(() => {
                document.title = `✓ ${OriginalTitle}`;
                ResetButton();
            }, 3000);
        }

        /* 壓縮處理 */
        async Compression(Data, Folder, Button, Menu) {
            GM_unregisterMenuCommand(Menu); // 註銷強制下載按鈕
            Data.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: this.Compr_Level }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                Button.textContent = `${Language.DS_05}: ${progress.percent.toFixed(1)} %`;
            }).then(zip => {
                saveAs(zip, `${Folder}.zip`);
                self.Enforce = false;
                Button.textContent = Language.DS_06;
                document.title = `✓ ${OriginalTitle}`;
                setTimeout(() => {
                    ResetButton();
                }, 3000);
            }).catch(result => {
                Button.textContent = Language.DS_07;
                document.title = OriginalTitle;
                setTimeout(() => {
                    ResetButton();
                }, 6000);
            })
        }
    }

    /* ============ 實例運行 ============ */

    const download = new Download();
    Main.Match();

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
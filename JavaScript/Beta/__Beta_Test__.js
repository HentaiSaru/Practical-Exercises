// ==UserScript==
// @name         Kemer 下載器
// @name:zh-TW   Kemer 下載器
// @name:zh-CN   Kemer 下载器
// @name:ja      Kemer ダウンローダー
// @name:en      Kemer Downloader
// @version      0.0.17
// @author       HentaiSaru
// @description         一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-TW   一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-CN   一键下载图片 (压缩下载/单图下载) , 页面数据创建 json 下载 , 一键开启当前所有帖子
// @description:ja      画像をワンクリックでダウンロード（圧縮ダウンロード/単一画像ダウンロード）、ページデータを作成してjsonでダウンロード、現在のすべての投稿をワンクリックで開く
// @description:en      One-click download of images (compressed download/single image download), create page data for json download, one-click open all current posts

// @connect      *
// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*
// @icon         https://cdn-icons-png.flaticon.com/512/2381/2381981.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/487608/1342021/GrammarSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

/**
* 修改思路 (什麼時候有空不知道)
* 
* 功能設置: 操作系統通知(開關按鈕)/ 下載完成後自動關閉(開關按鈕)/ 實驗功能(開關按鈕)
* 一鍵開帖延遲(輸入框/毫秒)/ 實驗下載延遲(輸入框/毫秒)
* 
* 功能選擇:
* 下載模式選擇(按鈕)
* Json 實驗下載功能(按鈕)
* 開啟當前所有頁面(按鈕)
* 進階 Json 輸出格式設置
* 
* 添加功能:
* 影片與圖片一同下載
* 下載時檔名格式選擇
* 壓縮下載時選擇是否需多一個資料夾
* 上傳導出的 Json 一鍵下載所有內容(圖片/影片|雲端應該無法)
*/

(function() {
    const func = new API(), language = Language(navigator.language);

    const Config = {
        DeBug: true,                    // 顯示請求資訊, 與錯誤資訊
        NotiFication: true,             // 操作時 系統通知
        CompleteClose: false,           // 完成後關閉 [需要用另一個腳本的 "自動開新分頁" 或是此腳本的一鍵開啟, 要使用js開啟的分頁才能被關閉, 純js腳本被限制很多] {https://ppt.cc/fpQHSx}
        ExperimentalDownload: true,     // 實驗功能 [json 下載]
        BatchOpenDelay: 500,            // 一鍵開啟帖子的延遲 (ms)
        ExperimentalDownloadDelay: 300, // 實驗下載請求延遲 (ms)
    }
    class Download {
        constructor(CM, MD, BT) {
            this.ForceDownload = false;
            this.CompressMode = CM;
            this.ModeDisplay = MD;
            this.Button = BT;

            /* 獲取原始標題 */
            this.OriginalTitle = () => {
                const cache = document.title;
                return cache.startsWith("✓ ") ? cache.slice(2) : cache;
            }
        }

        /* 下載觸發 [ 查找下載數據, 解析下載資訊, 呼叫下載函數 ] */
        async DownloadTrigger() {
            this.Button.disabled = true;
            let DownloadData = new Map(), files, title, artist,
            interval = setInterval(() => {
                files = func.$$("div.post__files");
                title = func.$$("h1.post__title");
                artist = func.$$("a.post__user-name");

                if (files && title && artist) {
                    clearInterval(interval);
                    title = func.IllegalCharacters(title.textContent).trim();
                    artist = func.IllegalCharacters(artist.textContent).trim();

                    const
                        a = func.$$("a", true, files),
                        img = func.$$("img", true, files),
                        folder = `(${artist}) ${title}`,
                        data = a.length > 0 ? a : img;

                    data.forEach((file, index) => {
                        DownloadData.set(index, (file.href || file.src));
                    });

                    Config.DeBug && func.log("Get Data", [folder, DownloadData]);
                    this.CompressMode
                    ? this.PackDownload(folder, title, DownloadData)
                    : this.SeparDownload(folder, DownloadData);
                }
            }, 300);
        }

        /* 打包壓縮下載 */
        async PackDownload(Folder, File, Data) {
            let
                show,
                progress = 0,
                Total = Data.size;
            const
                Self = this,
                Zip = new JSZip(),
                TitleCache = this.OriginalTitle(),
                worker = func.WorkerCreation(`
                    /* 使用 worker 是希望切換焦點後, 下載不受瀏覽器影響 */
                    let queue = [], processing=false;
                    onmessage = function(e) {
                        queue.push(e.data);
                        !processing && (processing=true, processQueue());
                    }
                    async function processQueue() {
                        if (queue.length > 0) {
                            const {index, url} = queue.shift();
                            XmlRequest(index, url);
                            setTimeout(processQueue, ${Config.ExperimentalDownloadDelay});
                        }
                    }

                    async function XmlRequest(index, url) {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = "blob";
                        xhr.open("GET", url, true);
                        xhr.onload = function() {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                postMessage({ index, url: url, blob: xhr.response, error: false });
                            } else {
                                FetchRequest(index, url);
                            }
                        }
                        xhr.onerror = function() {
                            FetchRequest(index, url);
                        }
                        xhr.send();
                    }

                    /* 試錯一次就回傳 */
                    async function FetchRequest(index, url) {
                        try {
                            const response = await fetch(url);
                            if (response.readyState === 4 && response.status === 200) {
                                const blob = await response.blob();
                                postMessage({ index, url: url, blob, error: false });
                            } else {
                                postMessage({ index, url: url, blob: "", error: true });
                            }
                        } catch {
                            postMessage({ index, url: url, blob: "", error: true });
                        }
                    }
                `),
                Enforce = GM_registerMenuCommand(language.RM_04, ()=> ForceDownload());

            //! 等待添加到 語法簡化
            const GetFill = (page) => {
                return Math.max(2, `${page}`.length);
            }
            const Mantissa = (index, fill) => {
                return `${++index}`.padStart(fill, "0");
            }

            const Fill = GetFill(Total);

            // 強制下載
            async function ForceDownload() {
                worker.terminate();
                Self.Compression(Folder, Zip, TitleCache, Enforce);
            }

            // 更新請求狀態
            function Request_update(index, url, blob, retry=false) {
                if (Self.ForceDownload) {return}
                requestAnimationFrame(()=> {
                    Data.delete(index);
                    retry
                    ? Data.set(index, url)
                    : Zip.file(`${Folder}/(${File})_${Mantissa(index, Fill)}.${func.ExtensionName(url)}`, blob);

                    show = `[${++progress}/${Total}]`;
                    document.title = show;
                    Self.Button.textContent = `${language.DS_05} ${show}`;

                    if (progress == Total) {
                        Total = Data.size;
                        if (Total == 0) {
                            worker.terminate();
                            Self.Compression(Folder, Zip, TitleCache, Enforce);
                        } else {
                            show = "Wait for failed re download";
                            document.title = show;
                            Self.Button.textContent = show;
                            setTimeout(()=> {
                                for (const [index, url] of Data.entries()) {
                                    Request(index, url);
                                }
                            }, 1500);
                        }
                    }
                });
            }

            // 不使用 worker 的請求, 切換窗口時, 這裡的請求就會變慢
            let Error_display = false;
            async function Request(index, url) {
                if (Self.ForceDownload) {return}
                GM_xmlhttpRequest({
                    url: url,
                    method: "GET",
                    responseType: "blob",
                    onload: response => {
                        if (response.status === 429 && !Error_display) {
                            Error_display = true;
                            worker.terminate();
                            Self.ForceDownload = true;
                            alert("Too Many Requests");
                        }
                        const blob = response.response;
                        blob instanceof Blob && blob.size > 0
                        ? Request_update(index, url, blob)
                        : Request_update(index, url, blob, true);
                    },
                    onerror: error => {
                        Request_update(index, url, "", true);
                    }
                })
            }

            // 傳遞訊息
            for (let index = 0; index < Total; index++) {
                worker.postMessage({ index: index, url: Data.get(index) });
                Self.Button.textContent = `${language.DS_09} [${index + 1}/${Total}]`;
            }

            // 接收訊息
            worker.onmessage = (e) => {
                const { index, url, blob, error } = e.data;
                error
                ? (Request(index, url), (Config.DeBug && func.log("Download Failed", url)))
                : (Request_update(index, url, blob), (Config.DeBug && func.log("Download Successful", url)));
            }
        }

        /* 壓縮檔案 */
        async Compression(Folder, Data, Title, Menu) {
            this.ForceDownload = true;
            GM_unregisterMenuCommand(Menu);
            Data.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 5 }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                this.Button.textContent = `${language.DS_06}: ${progress.percent.toFixed(1)} %`;
            }).then(zip => {
                saveAs(zip, `${Folder}.zip`);
                document.title = `✓ ${Title}`;
                this.Button.textContent = language.DS_08;
                setTimeout(() => {
                    Config.CompleteClose && window.close();
                    this.Button.disabled = false;
                    this.Button.textContent = `✓ ${this.ModeDisplay}`;
                }, 3000);
            }).catch(result => {
                document.title = Title;
                this.Button.textContent = language.DS_07;
                setTimeout(() => {
                    this.Button.disabled = false;
                    this.Button.textContent = this.ModeDisplay;
                }, 6000);
            })
        }

        /* 單圖下載 */
        async SeparDownload(Folder, Data) {
            
        }

    }

    class DataToJson {

    }

    (new class Main {
        constructor() {
            this.Target = /^(https?:\/\/)?(www\.)?.+\..+\/.+\/user\/.+\/post\/.+$/.test(document.URL);
            this.AddStyle = async () => {
                if (!func.$$("#Download-button-style")) {
                    func.AddStyle(`
                        ${GM_getResourceText("font-awesome")}
                        .File_Span {
                            padding: 1rem;
                            font-size: 20% !important;
                        }
                        .Setting_Button {
                            cursor: pointer;
                        }
                        .Download_Button {
                            color: hsl(0, 0%, 45%);
                            padding: 6px;
                            margin: 10px;
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
                        .Download_Button:disabled {
                            color: hsl(0, 0%, 95%);
                            background-color: hsl(0, 0%, 45%);
                            cursor: default;
                        }
                    `, "Download-button-style");
                }
            };
        }

        /* 按鈕創建 */
        async ButtonCreation() {
            func.$$("section").setAttribute("Download-Button-Created", true);
            this.AddStyle();
            let Button, Files, Load;
            const IntervalFind = setInterval(()=> {
                Files = func.$$("div.post__body h2", true);
                if (Files.length > 0) {
                    clearInterval(IntervalFind);
                    try {
                        const CompressMode = func.store("get", "Compression", []);
                        const ModeDisplay = CompressMode ? language.DS_01 : language.DS_02;
                        // 創建 Span
                        const spanElement = GM_addElement(Files[Files.length - 1], "span", {
                            class: "File_Span", id: "DBExist"
                        });
                        // 創建 Svg
                        const setting = GM_addElement(spanElement, "svg", { class: "Setting_Button" });
                        setting.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1.3rem" viewBox="0 0 512 512"><style>svg {fill: hsl(0, 0%, 45%);}</style>
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>`
                        func.Listen(setting, "click", ()=> {alert("後續開發")}, {capture: true, passive: true});
                        // 創建 Button
                        Button = GM_addElement(spanElement, "button", {class: "Download_Button"});
                        Button.textContent = ModeDisplay;
                        func.Listen(Button, "click", ()=> {
                            Load = new Download(CompressMode, ModeDisplay, Button);
                            Load.DownloadTrigger();
                        }, {capture: true, passive: true});
                    } catch {
                        Button.disabled = true;
                        Button.textContent = language.DS_04;
                    }
                }
            });
        }

        //! 等待開發可指定開啟
        /* 一鍵開啟當前所有帖子 */
        async OpenAllPages() {
            try {
                const card = func.$$("article.post-card a", true);
                if (card.length == 0) {throw new Error("No links found")}
                for (const link of card) {
                    GM_openInTab(link.href, {
                        active: false,
                        insert: false,
                        setParent: false
                    });
                    await new Promise(resolve => setTimeout(resolve, Config.BatchOpenDelay));
                }
            } catch {
                alert(language.NF_07);
            }
        }

        /* 下載模式切換 */
        async DownloadModeSwitch() {
            if (func.store("get", "Compression", [])){
                func.store("set", "Compression", false);
                if (Config.NotiFication) {
                    GM_notification({
                        title: language.NF_01,
                        text: language.DM_02,
                        timeout: 1500
                    });
                }
            } else {
                func.store("set", "Compression", true);
                if (Config.NotiFication) {
                    GM_notification({
                        title: language.NF_01,
                        text: language.DM_01,
                        timeout: 1500
                    });
                }
            }
            func.$$("#DBExist").remove();
            this.ButtonCreation();
        }

        /* 注入檢測創建 [ 檢測頁面創建按鈕, 創建菜單 ] */
        async Injection() {
            const observer = new MutationObserver(func.Throttle_discard(() => {
                (this.Target && !func.$$("section").hasAttribute("Download-Button-Created")) && this.ButtonCreation();
            }, 300));
            observer.observe(document, {childList: true, subtree: true});

            func.Menu({
                [language.RM_01]: ()=> this.DownloadModeSwitch(),
                [language.RM_02]: ()=> {
                    /*
                    const section = func.$$("section");
                    if (section) {
                        JsonDict = {};
                        for (const page of func.$$(".pagination-button-disabled b", true)) {
                            const number = Number(page.textContent);
                            if (number) {Pages = number; break;}
                            else {Pages = 1;}
                        }
                        GetPageData(section);
                    }*/
                },
                [language.RM_03]: ()=> this.OpenAllPages()
            });
        }
    }).Injection();

    function Language(language) {
        let display = {
            "zh-TW": [{
                "RM_01" : "🔁 切換下載模式",
                "RM_02" : "📑 獲取 Json 數據",
                "RM_03" : "📃 開啟當前頁面帖子",
                "RM_04" : "📥 強制壓縮下載",
                "DM_01" : "壓縮下載模式",
                "DM_02" : "單圖下載模式",
                "DS_01" : "壓縮下載",
                "DS_02" : "單圖下載",
                "DS_03" : "開始下載",
                "DS_04" : "無法下載",
                "DS_05" : "下載進度",
                "DS_06" : "封裝進度",
                "DS_07" : "壓縮封裝失敗",
                "DS_08" : "下載完成",
                "DS_09" : "請求進度",
                "CD_01" : "原始連結",
                "CD_02" : "圖片數量",
                "CD_03" : "影片數量",
                "CD_04" : "下載連結",
                "NF_01" : "模式切換",
                "NF_02" : "數據處理中",
                "NF_03" : "當前處理頁數",
                "NF_04" : "數據處理完成",
                "NF_05" : "Json 數據下載",
                "NF_06" : "錯誤的請求頁面",
                "NF_07" : "錯誤的開啟頁面"
            }],
            "zh-CN": [{
                "RM_01" : "🔁 切换下载模式",
                "RM_02" : "📑 获取所有帖子 Json 数据",
                "RM_03" : "📃 打开当前页面所有帖子",
                "DM_01" : "压缩下载模式",
                "DM_02" : "单图下载模式",
                "DS_01" : "压缩下载",
                "DS_02" : "单图下载",
                "DS_03" : "开始下载",
                "DS_04" : "无法下载",
                "DS_05" : "下载进度",
                "DS_06" : "封装进度",
                "DS_07" : "压缩封装失败",
                "DS_08" : "下载完成",
                "DS_09" : "请求进度",
                "CD_01" : "原始链接",
                "CD_02" : "图片数量",
                "CD_03" : "视频数量",
                "CD_04" : "下载链接",
                "NF_01" : "模式切换",
                "NF_02" : "数据处理中",
                "NF_03" : "当前处理页数",
                "NF_04" : "数据处理完成",
                "NF_05" : "Json 数据下载",
                "NF_06" : "错误的请求页面",
                "NF_07" : "错误的打开页面"
            }],
            "ja": [{
                "RM_01" : "🔁 ダウンロードモードの切り替え",
                "RM_02" : "📑 すべての投稿のJsonデータを取得する",
                "RM_03" : "📃 現在のページのすべての投稿を開く",
                "DM_01" : "圧縮ダウンロードモード",
                "DM_02" : "シングル画像ダウンロードモード",
                "DS_01" : "圧縮ダウンロード",
                "DS_02" : "シングル画像ダウンロード",
                "DS_03" : "ダウンロードを開始する",
                "DS_04" : "ダウンロードできません",
                "DS_05" : "ダウンロードの進行状況",
                "DS_06" : "パッケージング中",
                "DS_07" : "圧縮パッケージングに失敗しました",
                "DS_08" : "ダウンロードが完了しました",
                "DS_09" : "リクエストの進捗",
                "CD_01" : "元のリンク",
                "CD_02" : "画像の数",
                "CD_03" : "ビデオの数",
                "CD_04" : "ダウンロードリンク",
                "NF_01" : "モード切り替え",
                "NF_02" : "データ処理中",
                "NF_03" : "現在の処理ページ数",
                "NF_04" : "データ処理が完了しました",
                "NF_05" : "Jsonデータのダウンロード",
                "NF_06" : "間違ったリクエストページ",
                "NF_07" : "間違ったページを開く"
            }],
            "en-US": [{
                "RM_01" : "🔁 Switch download mode",
                "RM_02" : "📑 Get all post Json data",
                "RM_03" : "📃 Open all posts on the current page",
                "DM_01" : "Compressed download mode",
                "DM_02" : "Single image download mode",
                "DS_01" : "Compressed download",
                "DS_02" : "Single image download",
                "DS_03" : "Start downloading",
                "DS_04" : "Unable to download",
                "DS_05" : "Download progress",
                "DS_06" : "Packaging",
                "DS_07" : "Compression packaging failed",
                "DS_08" : "Download completed",
                "DS_09" : "Request progress",
                "CD_01" : "Original link",
                "CD_02" : "Number of images",
                "CD_03" : "Number of videos",
                "CD_04" : "Download link",
                "NF_01" : "Mode switch",
                "NF_02" : "Data processing",
                "NF_03" : "Current processing page number",
                "NF_04" : "Data processing completed",
                "NF_05" : "Json data download",
                "NF_06" : "Wrong request page",
                "NF_07" : "Wrong page to open"
            }]
        };
        return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
    }
})();
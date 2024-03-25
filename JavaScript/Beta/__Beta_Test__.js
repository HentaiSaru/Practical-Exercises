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
// @grant        window.close
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
// @require      https://update.greasyfork.org/scripts/487608/1347864/GrammarSimplified.js
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
        ContainsVideo: false,           // 下載時包含影片
        CompleteClose: false,           // 下載完成後關閉
        ExperimentalDownload: true,     // 實驗功能 [json 下載]
        BatchOpenDelay: 500,            // 一鍵開啟帖子的延遲 (ms)
        ExperimentalDownloadDelay: 300, // 實驗下載請求延遲 (ms)
    }

    let lock = false;
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
            };

            this.isVideo = (str) => ["MP4", "MOV", "AVI", "WMV", "FLV"].includes(str.toUpperCase());

            this.worker = func.WorkerCreation(`
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
                    } else {processing = false}
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
            `);
        }

        /* 下載觸發 [ 查找下載數據, 解析下載資訊, 呼叫下載函數 ] */
        async DownloadTrigger() {
            this.Button.disabled = lock = true;
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
                        video = func.$$(".post__attachment a", true),
                        folder = `${artist} ${title}`,
                        data = a.length > 0 ? a : img,
                        final_data = Config.ContainsVideo ? [...data, ...video] : data;

                    final_data.forEach((file, index) => {
                        DownloadData.set(index, (file.href || file.src));
                    });

                    Config.DeBug && func.log("Get Data", [folder, DownloadData]);
                    this.CompressMode
                    ? this.PackDownload(folder, title, DownloadData)
                    : this.SeparDownload(title, DownloadData);
                }
            }, 300);
            setTimeout(()=> {clearInterval(interval)}, 1e4);
        }

        /* 打包壓縮下載 */
        async PackDownload(Folder, File, Data) {
            let
                show,
                extension,
                progress = 0,
                Total = Data.size;
            const
                Self = this,
                Zip = new JSZip(),
                Fill = func.GetFill(Total),
                TitleCache = this.OriginalTitle();

            // 強制下載
            async function ForceDownload() {
                Self.worker.terminate();
                Self.Compression(Folder, Zip, TitleCache);
            }

            func.Menu({
                [language.RM_04]: {func: ()=> ForceDownload(), hotkey: "d"}
            }, "Enforce");

            // 更新請求狀態
            function Request_update(index, url, blob, retry=false) {
                if (Self.ForceDownload) {return}
                requestAnimationFrame(()=> {
                    Data.delete(index);
                    if (retry) {
                        Data.set(index, url);
                    } else {
                        extension = func.ExtensionName(url);
                        Self.isVideo(extension)
                        ? Zip.file(`${Folder}/${decodeURIComponent(url.split("?f=")[1])}`, blob)
                        : Zip.file(`${Folder}/${File}_${func.Mantissa(index, Fill)}.${extension}`, blob);
                    }

                    show = `[${++progress}/${Total}]`;
                    document.title = show;
                    Self.Button.textContent = `${language.DS_05} ${show}`;

                    if (progress == Total) {
                        Total = Data.size;
                        if (Total == 0) {
                            Self.worker.terminate();
                            Self.Compression(Folder, Zip, TitleCache);
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
                            Self.worker.terminate();
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
                this.worker.postMessage({ index: index, url: Data.get(index) });
                Self.Button.textContent = `${language.DS_09} [${index + 1}/${Total}]`;
            }

            // 接收訊息
            this.worker.onmessage = (e) => {
                const { index, url, blob, error } = e.data;
                error
                ? (Request(index, url), (Config.DeBug && func.log("Download Failed", url)))
                : (Request_update(index, url, blob), (Config.DeBug && func.log("Download Successful", url)));
            }
        }

        /* 壓縮檔案 */
        async Compression(Folder, Data, Title) {
            this.ForceDownload = true;
            GM_unregisterMenuCommand("Enforce-1");
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
                    this.ResetButton();
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
        async SeparDownload(File, Data) {
            let
                show,
                link,
                filename,
                extension,
                stop = false,
                progress = 0;
            const
                Self = this,
                Process = [],
                Promises = [],
                Total = Data.size,
                Fill = func.GetFill(Total),
                TitleCache = this.OriginalTitle();

            // 停止下載的線程
            async function Stop() {
                stop = true;
                Process.forEach(process => process.abort())
            }

            func.Menu({
                ["⛔️ 終止下載"]: {func: ()=> Stop(), hotkey: "s"}
            }, "Abort");

            async function Request(index) {
                if (stop) {return}
                link = Data.get(index);
                extension = func.ExtensionName(link);
                filename = Self.isVideo(extension)
                ? decodeURIComponent(link.split("?f=")[1])
                : `${File}_${func.Mantissa(index, Fill)}.${extension}`;
                return new Promise((resolve, reject) => {
                    const download = GM_download({
                        url: link,
                        name: filename,
                        onload: () => {
                            Config.DeBug && func.log("Download Successful", link);
                            show = `[${++progress}/${Total}]`;
                            document.title = show;
                            Self.Button.textContent = `${language.DS_05} ${show}`;
                            resolve();
                        },
                        onerror: () => {
                            Config.DeBug && func.log("Download Failed", link);
                            setTimeout(()=> {
                                reject();
                                Request(index);
                            }, 1500);
                        }
                    });
                    Process.push(download);
                });
            }

            for (let i = 0; i < Total; i++) {
                Promises.push(Request(i));
                await func.sleep(Config.ExperimentalDownloadDelay);
            }

            await Promise.allSettled(Promises);
            GM_unregisterMenuCommand("Abort-1");

            document.title = `✓ ${TitleCache}`;
            this.Button.textContent = language.DS_08;
            setTimeout(() => {
                this.ResetButton();
            }, 3000);
        }

        /* 按鈕重置 */
        async ResetButton() {
            Config.CompleteClose && window.close();
            lock = false;
            const Button = func.$$("#ExDB button");
            Button.disabled = false;
            Button.textContent = `✓ ${this.ModeDisplay}`;
        }
    }

    class DataToJson {
        constructor() {
            this.JsonDict = {};
            this.Genmode = true;
            this.TitleCache = document.title;
            this.Section = func.$$("section");
            this.Pages = this.progress =  this.filtercache = null;
            this.JsonMode = {"orlink" : "set_1", "imgnb" : "set_2", "videonb" : "set_3", "dllink": "set_4"}

            /**
             * 傳入數據生成列表物件
             * 
             * @param {string} ol - 原始連結
             * @param {string} pn - 圖片數量
             * @param {string} vn - 影片數量
             * @param {string} lb - 下載連結
             */
            this.GenerateBox = (ol, pn, vn, lb) => {
                if (this.Genmode) {
                    return {
                        ...(this.JsonMode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                        ...(this.JsonMode.hasOwnProperty("imgnb") ? { [language.CD_02]: pn } : {}),
                        ...(this.JsonMode.hasOwnProperty("videonb") ? { [language.CD_03]: vn } : {}),
                        ...(this.JsonMode.hasOwnProperty("dllink") ? { [language.CD_04]: lb || {} } : {}),
                    }
                } else {
                    return {
                        ...(this.JsonMode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                        ...(this.JsonMode.hasOwnProperty("imgnb") && pn > 0 && vn == 0 ? { [language.CD_02]: pn } : {}),
                        ...(this.JsonMode.hasOwnProperty("videonb") && vn > 0 && pn <= 10 ? { [language.CD_03]: vn } : {}),
                        ...(this.JsonMode.hasOwnProperty("dllink") && Object.keys(lb).length > 0 ? { [language.CD_04]: lb } : {}),
                    }
                }
            }

            /* 獲取當前時間 (西元年-月-日 時:分:秒) */
            this.GetTime = () => {
                const date = new Date(),
                year = date.getFullYear(),
                month = String(date.getMonth() + 1).padStart(2, "0"),
                day = String(date.getDate()).padStart(2, "0"),
                hour = String(date.getHours()).padStart(2, "0"),
                minute = String(date.getMinutes()).padStart(2, "0"),
                second = String(date.getSeconds()).padStart(2, "0");
                return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
            }

            /* Mega 連結解析 (測試中 有些Bug) */
            this.MegaAnalysis = (data) => {
                let title_box = [], link_box = [], result = {}, pass;
                for (let i=0; i<data.length; i++) {
                    const str = data[i].textContent.trim();
                    if (str.startsWith("Pass")) { // 解析密碼字串
                        const ps = data[i].innerHTML.match(/Pass:([^<]*)/);
                        try {pass = `Pass : ${ps[1].trim()}`} catch {pass = str}
                    } else if (str.toUpperCase() == "MEGA") {
                        link_box.push(data[i].parentElement.href);
                    } else {
                        title_box.push(str.replace(":", "").trim());
                    }
                }
                // 合併數據
                for (let i=0; i<title_box.length; i++) {
                    result[title_box[i]] = link_box[i]
                }
                return { pass, result };
            }

            /* 輸出Json */
            this.ToJson = async () => {
                Object.keys(this.JsonDict).sort(); // 進行簡單排序
                const author = func.$$("span[itemprop='name']").textContent;
                const json = document.createElement("a");
                json.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.JsonDict, null, 4));
                json.download = `${author}.json`;
                json.click();
                json.remove();
                if (Config.NotiFication) {
                    GM_notification({
                        title: language.NF_04,
                        text: language.NF_05,
                        image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                        timeout: 2000
                    });
                }
                document.title = this.TitleCache;
            }
        }

        /* 初始化獲取數據 */
        async GetData() {
            if (this.Section) {
                for (const page of func.$$(".pagination-button-disabled b", true)) {
                    const number = Number(page.textContent);
                    if (number) {this.Pages = number; break;}
                    else {this.Pages = 1;}
                }
                this.JsonDict["獲取時間"] = this.GetTime();
                this.GetPageData(this.Section);
            } else {
                console.log("未取得數據");
            }
        }

        /* 獲取主頁元素 */
        async GetPageData(section) {
            let title, link, promises = [];
            const
            item = func.$$(".card-list__items article", true, section),
            menu = func.$$("a.pagination-button-after-current", false, section);

            this.progress = 0;
            if (Config.NotiFication) {
                GM_notification({
                    title: language.NF_02,
                    text: `${language.NF_03} : ${this.Pages}`,
                    image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                    timeout: 800
                });
            }

            // 遍歷數據
            for (const card of item) {
                title = func.$$(".post-card__header", false, card).textContent.trim() || `Untitled_${String(this.progress+1).padStart(2, "0")}`;
                link = func.$$("a", false, card).href;

                if (Config.ExperimentalDownload) { // 呼叫數據解析
                    promises.push(this.DataAnalysis(title, link));
                    await func.sleep(Config.ExperimentalDownloadDelay);
                } else {
                    this.JsonDict[`${link}`] = title;
                }
            }
            // 等待所有請求完成
            await Promise.allSettled(promises);
            this.Pages++;
            menu ? this.GetNextPage(menu.href) : this.ToJson();
        }

        /* 獲取下一頁數據 */
        async GetNextPage(NextPage) {
            GM_xmlhttpRequest({
                method: "GET",
                url: NextPage,
                nocache: false,
                ontimeout: 8000,
                onload: response => {
                    const DOM = func.DomParse(response.responseText);
                    this.GetPageData(func.$$("section", false, DOM));
                }
            })
        }

        /**
         * Json 數據分類
         * 
         * @param {string} title - 帖子名稱 標題
         * @param {string} url - 連結索引
         */
        async DataAnalysis(title, url) {
            const link_box = {};
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    nocache: true,
                    onload: response => {
                        const DOM = func.DomParse(response.responseText);

                        const original_link = url;
                        const pictures_number = func.$$("div.post__thumbnail", true, DOM).length;
                        const video_number = func.$$('ul[style*="text-align: center;list-style-type: none;"] li', true, DOM).length;
                        const mega_link = func.$$("div.post__content strong", true, DOM);

                        func.$$("a.post__attachment-link", true, DOM).forEach(link => {
                            const analyze = decodeURIComponent(link.href).split("?f=");
                            const download_link = analyze[0];
                            const download_name = analyze[1];
                            link_box[download_name] = download_link;
                        })

                        if (mega_link.length > 0) {
                            try {
                                const {pass, result} = this.MegaAnalysis(mega_link);
                                pass != undefined ? link_box[pass] = result : null;
                            } catch {}
                        }

                        const Box = this.GenerateBox(original_link, pictures_number, video_number, link_box);
                        if (Object.keys(Box).length !== 0) {
                            this.JsonDict[title] = Box;
                        }

                        if (Config.DeBug) {console.log(this.JsonDict)}
                        document.title = `（${this.Pages} - ${++this.progress}）`;
                        resolve();
                    },
                    onerror: error => {
                        reject(error);
                    }
                })
            });
        }

    }

    (new class Main {
        constructor() {
            this.URL = document.URL;
            this.Page = {
                Content: /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/.test(this.URL),
                Preview: /^(https?:\/\/)?(www\.)?.+\/posts\/?(\?.*)?$/.test(this.URL)
                || /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/.test(this.URL)
                || /^(https?:\/\/)?(www\.)?.+\/dms\/?(\?.*)?$/.test(this.URL)
            }
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
                            class: "File_Span", id: "ExDB"
                        });
                        // 創建 Svg
                        const setting = GM_addElement(spanElement, "svg", { class: "Setting_Button" });
                        setting.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1.3rem" viewBox="0 0 512 512"><style>svg {fill: hsl(0, 0%, 45%);}</style>
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>`
                        func.Listen(setting, "click", ()=> {alert("後續開發")}, {capture: true, passive: true});
                        // 創建 Button
                        Button = GM_addElement(spanElement, "button", {class: "Download_Button"});
                        Button.disabled = lock;
                        Button.textContent = lock ? "下載中鎖定" : ModeDisplay;
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
            const card = func.$$("article.post-card a", true);
            if (card.length == 0) {throw new Error("No links found")}
            for (const link of card) {
                GM_openInTab(link.href, {
                    active: false,
                    insert: false,
                    setParent: false
                });
                await func.sleep(Config.BatchOpenDelay);
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
            func.$$("#ExDB").remove();
            this.ButtonCreation();
        }

        /* 注入檢測創建 [ 檢測頁面創建按鈕, 創建菜單 ] */
        async Injection() {
            const observer = new MutationObserver(func.Throttle_discard(() => {
                try {
                    (this.Page.Content && !func.$$("section").hasAttribute("Download-Button-Created")) && this.ButtonCreation();
                } catch {}
            }, 300));
            observer.observe(document, {childList: true, subtree: true});

            if (this.Page.Content) {
                func.Menu({
                    [language.RM_01]: {func: ()=> this.DownloadModeSwitch(), close: false, hotkey: "c"}
                });

            } else if (this.Page.Preview) {
                func.Menu({
                    [language.RM_02]: {func: ()=> (new DataToJson()).GetData() },
                    [language.RM_03]: {func: ()=> this.OpenAllPages() }
                });
            }
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
                "NF_05" : "Json 數據下載"
            }],
            "zh-CN": [{
                "RM_01" : "🔁 切换下载模式",
                "RM_02" : "📑 获取 Json 数据",
                "RM_03" : "📃 打开当前页面帖子",
                "RM_04" : "📥 强制压缩下载",
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
                "NF_05" : "Json 数据下载"
            }],
            "ja": [{
                "RM_01" : "🔁 ダウンロードモードの切り替え",
                "RM_02" : "📑 JSON データを取得",
                "RM_03" : "📃 現在のページの投稿を開く",
                "RM_04" : "📥 強製的に圧縮してダウンロード",
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
                "NF_05" : "Jsonデータのダウンロード"
            }],
            "en-US": [{
                "RM_01" : "🔁 Switch download mode",
                "RM_02" : "📑 Get Json data",
                "RM_03" : "📃 Open current page post",
                "RM_04" : "📥 Force compression download",
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
                "NF_05" : "Json data download"
            }]
        };
        return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
    }
})();
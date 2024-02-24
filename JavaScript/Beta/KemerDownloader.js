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

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/487608/1331914/GrammarSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

(function() {
    var parser = new DOMParser(), CompressMode, ModeDisplay, JsonDict, Pages;
    let jsonmode = {"orlink" : "set_1", "imgnb" : "set_2", "videonb" : "set_3", "dllink": "set_4"}, genmode = true;
    const pattern = /^(https?:\/\/)?(www\.)?.+\..+\/.+\/user\/.+\/post\/.+$/, language = display_language(navigator.language);

    const Config = {
        DeBug: false,                   // 顯示請求資訊, 與錯誤資訊
        NotiFication: true,             // 操作時 系統通知
        CompleteClose: false,           // 完成後關閉 [需要用另一個腳本的 "自動開新分頁" 或是此腳本的一鍵開啟, 要使用js開啟的分頁才能被關閉, 純js腳本被限制很多] {https://ppt.cc/fpQHSx}
        ExperimentalDownload: true,     // 實驗功能 [json 下載]
        BatchOpenDelay: 500,            // 一鍵開啟帖子的延遲 (ms)
        ExperimentalDownloadDelay: 300, // 實驗下載請求延遲 (ms)
    }

    /** ---------------------/
    * 設置實驗 json 分類輸出格式
    * 原始連結: "orlink"
    * 圖片數量: "imgnb"
    * 影片數量: "videonb"
    * 連結數量: "dllink"
    * 排除模式: "FilterMode"
    * 唯一模式: "OnlyMode"
    */
    // ToJsonSet(["orlink", "dllink"], "OnlyMode");

    /* ==================== 按鈕創建 (入口點) ==================== */

    const observer = new MutationObserver(() => {
        pattern.test(document.URL) && !$$("#DBExist") ? ButtonCreation() : null;
    });
    pattern.test(document.URL) ? observer.observe(document.head, {childList: true, subtree: true}) : null;

    /* ==================== 選項菜單 ==================== */

    Menu({
        [language.RM_01]: ()=> DownloadModeSwitch(),
        [language.RM_02]: ()=> {
            const section = $$("section");
            if (section) {
                JsonDict = {};
                // 避免出現意外, 遍歷所有的找到可以轉成數字的值
                for (const p of $$(".pagination-button-disabled b", true)) {
                    const number = Number(p.textContent);
                    if (number) {Pages = number; break;}
                    else {Pages = 1;}
                }
                GetPageData(section);
            }
        },
        [language.RM_03]: ()=> OpenData()
    });

    /* ==================== 下載處理 ==================== */

    /* 添加樣式 */
    GM_addStyle(`
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
    `);

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

    /* 按鈕創建 */
    async function ButtonCreation() {
        let img_button;
        const Files = $$("div.post__body h2", true);
        CompressMode = GM_getValue("Compression", []);
        ModeDisplay = CompressMode ? language.DS_01 : language.DS_02;

        try {
            // 創建 Span
            const spanElement = GM_addElement(Files[Files.length - 1], "span", {
                class: "File_Span",
                id: "DBExist"
            });
            // 創建 Svg
            const setting = GM_addElement(spanElement, "svg", {
                class: "Setting_Button"
            });
            setting.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1.3rem" viewBox="0 0 512 512"><style>svg {fill: hsl(0, 0%, 45%);}</style>
            <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>`
            addlistener(setting, "click", ()=> {SettingMenu()}, {capture: true, passive: true});
            // 創建 Button
            img_button = GM_addElement(spanElement, "button", {
                class: "Download_Button"
            });
            img_button.textContent = ModeDisplay;
            addlistener(img_button, "click", ()=> {DownloadTrigger(img_button)}, {capture: true, passive: true});
        } catch {
            img_button.textContent = language.DS_04;
            img_button.disabled = true;
        }
    }

    /* 下載觸發 */
    function DownloadTrigger(button) {
        let data = new Map(), link;
        let interval = setInterval(() => {
            let imgdata = $$("div.post__files a", true);
            let title = $$("h1.post__title").textContent.trim();
            let user = $$("a.post__user-name").textContent.trim();
            if (imgdata.length > 0 && title && user) {
                clearInterval(interval); // 等到找到所有下載元素後觸發下載
                button.textContent = language.DS_03;
                button.disabled = true;
                imgdata.forEach((files, index) => {
                    link = files.href || $$("img", false, files).src;
                    data.set(index, link.split("?f=")[0]);
                });
                if (Config.DeBug) {
                    console.groupCollapsed("Get Data");
                    console.log(`[${user}] ${title}`);
                    console.log(data);
                    console.groupEnd();
                }
                CompressMode ?
                ZipDownload(`[${user}] ${title}`, data, button) :
                ImageDownload(`[${user}] ${title}`, data, button);
            }
        }, 300);
    }

    /* 壓縮下載 */
    async function ZipDownload(Folder, ImgData, Button) {
        const Data = new JSZip(),
        Total = ImgData.size,
        File = Conversion(Folder),
        TitleCache = OriginalTitle(),
        name = IllegalFilter(Folder.split(" ")[1]);
        let progress = 1, task = 0, mantissa, link;

        const worker = WorkerCreation(`
            let queue = [], processing = false;
            onmessage = function(e) {
                const {index, url, retry} = e.data;
                queue.push({index, url, retry});
                if (!processing) {
                    processQueue();
                    processing = true;
                }
            }
            async function processQueue() {
                if (queue.length > 0) {
                    const {index, url, retry} = queue.shift();
                    xmlRequest(index, url, retry);
                    setTimeout(processQueue, ${Config.ExperimentalDownloadDelay});
                }
            }

            async function xmlRequest(index, url, retry) {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "blob";
                xhr.onload = function() {
                    if (xhr.status === 200) {postMessage({ blob: xhr.response, index, url: url, error: false})
                    } else {fetchRequest(index, url, retry)}
                };
                xhr.onerror = function() {
                    fetchRequest(index, url, retry);
                };
                xhr.send();
            }

            async function fetchRequest(index, url, retry) {
                try {
                    const response = await fetch(url, {method: 'GET'});
                    if (response.status === 200) {
                        const blob = await response.blob();
                        postMessage({ blob, index, url: url, error: false });
                    } else {
                        if (retry > 0) {fetchRequest(index, url, retry - 1)}
                        else {postMessage({ blob: "", index, url: url, error: true })}
                    }
                } catch (error) {
                    if (retry > 0) {fetchRequest(index, url, retry - 1)}
                    else {postMessage({ blob: "", index, url: url, error: true })}
                }
            }
        `);

        // 發送訊息
        for (let i = 0; i < Total; i++) {
            link = ImgData.get(i);
            worker.postMessage({ index: i, url: link, retry: 10 });
            Button.textContent = `${language.DS_09} [${i + 1}/${Total}]`;
        }

        // 接收訊息
        worker.onmessage = function (e) {
            const { blob, index, url, error } = e.data;
            if (!error) {
                if (Config.DeBug) {console.log("Download Successful")}
                mantissa = (index + 1).toString().padStart(3, "0");
                Data.file(`${File}/${name}_${mantissa}.${GetExtension(url)}`, blob);
                Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                document.title = `[${progress}/${Total}]`;
                progress++;
                task++;
            } else {
                if (Config.DeBug) {console.log(`Request Failed Link : [${url}]`)}
                /* 最後的下載 */
                async function Request(url, retry) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: url,
                        responseType: "blob",
                        onload: response => {
                            if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                                mantissa = (index + 1).toString().padStart(3, '0');
                                Data.file(`${File}/${name}_${mantissa}.${GetExtension(url)}`, response.response);
                                Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                                document.title = `[${progress}/${Total}]`;
                                progress++;
                                task++;
                            } else {
                                if (retry > 0) {
                                    Request(url, retry-1);
                                } else {
                                    task++;
                                }
                            }
                        }
                    })
                }
                Request(url, 10);
            }
        };

        // 錯誤訊息
        worker.onerror = function (e) {
            console.error(`Worker error: ${e.message}`);
        }

        // 等待下載完成
        let interval = setInterval(() => {
            if (task === Total) {
                clearInterval(interval);
                worker.terminate();
                Compression(Data, Folder, Button, TitleCache);
            }
        }, 500);
    }

    /* 單圖下載 */
    async function ImageDownload(Folder, ImgData, Button) {
        const name = IllegalFilter(Folder.split(" ")[1]), Total = ImgData.size, TitleCache = OriginalTitle();
        let progress = 1, task = 0, link, extension;
        for (let i = 0; i < Total; i++) {
            link = ImgData.get(i);
            extension = GetExtension(link);
            Button.textContent = `${language.DS_09} [${i + 1}/${Total}]`;
            GM_download({
                url: link,
                name: `${name}_${(progress+i).toString().padStart(3, '0')}.${extension}`,
                onload: () => {
                    document.title = `[${progress}/${Total}]`;
                    Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                    progress++;
                    task++;
                },
                onerror: () => {
                    i--;
                }
            });
        }

        let interval = setInterval(() => {
            if (task === Total) {
                clearInterval(interval);
                document.title = `✓ ${TitleCache}`;
                Button.textContent = language.DS_08;
                setTimeout(() => {
                    Button.disabled = false;
                    Button.textContent = `✓ ${ModeDisplay}`;
                    if (Config.CompleteClose) {window.close()}
                }, 3000);
            }
        }, 1000);
    }

    /**
    * 壓縮處理
    * 
    * @param {*} Data  - 需壓縮的數據文件
    * @param {String} Folder - 壓縮檔名
    * @param {Element} Button - 按鈕元素
    * @param {String} OriginalTitle - 原始標題
    */
    async function Compression(Data, Folder, Button, OriginalTitle) {
        Data.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 5
            }
        }, (progress) => {
            document.title = `${progress.percent.toFixed(1)} %`;
            Button.textContent = `${language.DS_06}: ${progress.percent.toFixed(1)} %`;
        }).then(async zip => {
            document.title = `✓ ${OriginalTitle}`;
            await saveAs(zip, `${Folder}.zip`);
            Button.textContent = language.DS_08;
            setTimeout(() => {
                if (Config.CompleteClose) {window.close()}
                Button.textContent = `✓ ${ModeDisplay}`;
                Button.disabled = false;
            }, 3000);
        }).catch(result => {
            Button.textContent = language.DS_07;
            document.title = OriginalTitle;
            setTimeout(() => {
                Button.textContent = ModeDisplay;
                Button.disabled = false;
            }, 5000);
        })
    }

    /* 下載模式切換 */
    async function DownloadModeSwitch() {
        if (GM_getValue("Compression", [])){
            GM_setValue("Compression", false);
            if (Config.NotiFication) {
                GM_notification({
                    title: language.NF_01,
                    text: language.DM_02,
                    timeout: 1500
                });
            }
        } else {
            GM_setValue("Compression", true);
            if (Config.NotiFication) {
                GM_notification({
                    title: language.NF_01,
                    text: language.DM_01,
                    timeout: 1500
                });
            }
        }
        $("#DBExist").remove();
        ButtonCreation();
    }

    /* ==================== Json 數據處理 ==================== */
    var progress, filtercache, TitleCache = document.title; // 進度顯示

    /* 獲取主頁元素 */
    async function GetPageData(section) {
        let title, link, promises = [];
        const menu = $$("a.pagination-button-after-current", false, section);
        const item = $$(".card-list__items article", true, section);

        progress = 0;
        if (Config.NotiFication) {
            GM_notification({
                title: language.NF_02,
                text: `${language.NF_03} : ${Pages}`,
                image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                timeout: 800
            });
        }

        // 遍歷數據
        for (const card of item) {
            title = $$(".post-card__header", false, card).textContent.trim();
            link = $$("a", false, card).href;

            if (Config.ExperimentalDownload) {
                promises.push(DataClassification(title, link, Pages));
                await new Promise(resolve => setTimeout(resolve, Config.ExperimentalDownloadDelay));
            } else {
                JsonDict[`${link}`] = title;
            }
        }
        // 等待所有請求完成
        await Promise.allSettled(promises);
        Pages++;
        menu ? GetNextPage(menu.href) : ToJson();
    }

    /* 獲取下一頁數據 */
    async function GetNextPage(NextPage) {
        GM_xmlhttpRequest({
            method: "GET",
            url: NextPage,
            nocache: false,
            ontimeout: 8000,
            onload: response => {
                const DOM = parser.parseFromString(response.responseText, "text/html");
                GetPageData($$("section", false, DOM));
            }
        });
    }

    /**
     * 傳入數據生成列表物件
     * 
     * @param {string} ol - 原始連結
     * @param {string} pn - 圖片數量
     * @param {string} vn - 影片數量
     * @param {string} lb - 下載連結
     */
    function GenerateBox(ol, pn, vn, lb) {
        if (genmode) {
            return {
                ...(jsonmode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                ...(jsonmode.hasOwnProperty("imgnb") ? { [language.CD_02]: pn } : {}),
                ...(jsonmode.hasOwnProperty("videonb") ? { [language.CD_03]: vn } : {}),
                ...(jsonmode.hasOwnProperty("dllink") ? { [language.CD_04]: lb || {} } : {}),
            }
        } else {
            return {
                ...(jsonmode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                ...(jsonmode.hasOwnProperty("imgnb") && pn > 0 && vn == 0 ? { [language.CD_02]: pn } : {}),
                ...(jsonmode.hasOwnProperty("videonb") && vn > 0 && pn <= 10 ? { [language.CD_03]: vn } : {}),
                ...(jsonmode.hasOwnProperty("dllink") && Object.keys(lb).length > 0 ? { [language.CD_04]: lb } : {}),
            }
        }
    }

    /**
     * Json 數據分類
     * 
     * @param {string} title - 帖子名稱 標題
     * @param {string} url - 連結索引
     * @param {int} page - 頁數計數
     */
    async function DataClassification(title, url, page) {
        const link_box = {};
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                nocache: true,
                onload: response => {
                    const DOM = parser.parseFromString(response.responseText, "text/html");

                    const original_link = url;
                    const pictures_number = $$("div.post__thumbnail", true, DOM).length;
                    const video_number = $$('ul[style*="text-align: center;list-style-type: none;"] li', true, DOM).length;
                    const mega_link = $$("div.post__content strong", true, DOM);
                    $$("a.post__attachment-link", true, DOM).forEach(link => {
                        const analyze = decodeURIComponent(link.href).split("?f=");
                        const download_link = analyze[0];
                        const download_name = analyze[1];
                        link_box[download_name] = download_link;
                    })

                    if (mega_link.length > 0) {
                        try {
                            const {pass, result} = MegaAnalysis(mega_link);
                            pass != undefined ? link_box[pass] = result : null;
                        } catch {}
                    }

                    const Box = GenerateBox(original_link, pictures_number, video_number, link_box);
                    if (Object.keys(Box).length !== 0) {
                        JsonDict[title] = Box;
                    }

                    if (Config.DeBug) {console.log(JsonDict)}
                    document.title = `（${page} - ${++progress}）`;
                    resolve();
                },
                onerror: error => {
                    reject(error);
                }
            })
        });
    }

    /* 輸出Json */
    async function ToJson() {
        try {
            Object.keys(JsonDict).sort(); // 進行簡單排序
            const author = document.querySelector('span[itemprop="name"]').textContent;
            const json = document.createElement("a");
            json.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JsonDict, null, 4));
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
            document.title = TitleCache;
        } catch {alert(language.NF_06)}
    }

    /* 獲取當前時間 (西元年-月-日-時-分) */
    function GetTime() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}-${hour}-${minute}`;
    }

    /**
    * 設置分類輸出 Json時的格式
    *
    * @param {Array} set    - 要進行的設置 [預設: []]
    * @param {string} mode  - 設定的模式 [預設: "FilterMode"]
    *
    * @example
    * 基本設置: ToJsonSet(["orlink", "imgnb", "videonb", "dllink"]) 可選項目
    * mode = "FilterMode", 根據傳入的值, 將 {原始連結, 圖片數, 影片數, 下載連結} (過濾掉/刪除該項目)
    * mode = "OnlyMode", 根據傳入的值, 例如 {set = ["imgnb"]}, 那就只會顯示有圖片的
    * "OnlyMode" 的 "imgnb", "videonb" 會有額外特別處理, {imgnb: 排除有影片的, videonb: 圖片多餘10張的被排除}
    */
    async function ToJsonSet(set = [], mode = "FilterMode") {
        try {
            switch (mode) {
                case "FilterMode":
                    genmode = true;
                    set.forEach(key => {delete jsonmode[key]});
                    break;
                case "OnlyMode":
                    genmode = false;
                    filtercache = Object.keys(jsonmode).reduce((obj, key) => {
                        if (set.includes(key)) {obj[key] = jsonmode[key]}
                        return obj;
                    }, {});
                    jsonmode = filtercache;
                    break;
            }
        } catch (error) {console.error(error)}
    }

    /* 一鍵開啟當前所有帖子 */
    async function OpenData() {
        try {
            const card = $$("article.post-card a", true);
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

    /* 設置菜單 */
    async function SettingMenu() {
        alert("後續開發");
    }

    /* ==================== 語法簡化 API ==================== */

    /* 菜單註冊 */
    async function Menu(item) {
        for (const [name, call] of Object.entries(item)) {
            GM_registerMenuCommand(name, ()=> {call()});
        }
    }

    /* 簡化元素查找 */
    function $$(Selector, All=false, Source=document) {
        if (All) {return Source.querySelectorAll(Selector)}
        else {
            const slice = Selector.slice(1);
            const analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : Selector[0];
            switch (analyze) {
                case "#": return Source.getElementById(slice);
                case " ": return Source.querySelector(Selector);
                case ".": return Source.getElementsByClassName(slice)[0];
                default: return Source.getElementsByTagName(Selector)[0];
            }
        }
    }

    /* (簡化版) 監聽器添加 */
    async function addlistener(element, type, listener, add={}) {
        element.addEventListener(type, listener, add);
    }

    /* ==================== 數據處理 API ==================== */

    /* 排除非法字元 */
    function IllegalFilter(Name) {
        return Name.replace(/[\/\?<>\\:\*\|":]/g, '');
    }

    /* 檔名轉換 */
    function Conversion(Name) {
        return Name.replace(/[\[\]]/g, '');
    }

    /* 獲得擴展名 */
    function GetExtension(link) {
        try {
            const match = link.match(/\.([^.]+)$/);
            return match[1].toLowerCase() || "png";
        } catch {return "png"}
    }

    /* 獲取原始標題 */
    function OriginalTitle() {
        const cache = document.title;
        return cache.startsWith("✓ ") ? cache.slice(2) : cache;
    }

    /* Mega 連結解析 (測試中 有些Bug) */
    function MegaAnalysis(data) {
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

    /* Worker 創建 */
    function WorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }

    function display_language(language) {
        let display = {
            "zh-TW": [{
                "RM_01" : "🔁 切換下載模式",
                "RM_02" : "📑 獲取所有帖子 Json 數據",
                "RM_03" : "📃 開啟當前頁面所有帖子",
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
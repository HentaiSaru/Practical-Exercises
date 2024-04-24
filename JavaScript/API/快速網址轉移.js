// ==UserScript==
// @name         __簡易書籤__
// @version      0.0.1
// @author       HentaiSaru
// @description  將網頁添加至書籤中保存, 一鍵快速導入導出, 一鍵快速開啟所有書籤

// @noframes
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon64       https://cdn-icons-png.flaticon.com/512/13984/13984370.png

// @run-at       document-start
// @grant        window.close
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js
// @require      https://update.greasyfork.org/scripts/487608/1365414/SyntaxSimplified.js
// ==/UserScript==

(function() {
    (new class Bookmark extends Syntax {
        constructor() {
            super();
            this.AddClose = true; // 添加網址後關閉窗口
            this.OpenClear = true; // 開啟後清除
            this.ExportClear = true; // 導出後清除保存數據
            this.Url_Exclude = /^(?:https?:\/\/)?(?:www\.)?/i;
            this.Url_Parse = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img;

            // 網址解碼
            this.decode = (str) => decodeURIComponent(str);

            // 解析域名
            this.DomainName = (url) => {
                return url.match(this.Url_Parse)[0].replace(this.Url_Exclude, "");
            }

            // 導入數據
            this.Import = (data) => {
                try {
                    for (const [key, value] of Object.entries(JSON.parse(data))) {
                        this.store("s", key, value);
                    }
                    GM_notification({
                        title: "導入完畢",
                        text: "已導入數據",
                        timeout: 1500
                    })
                } catch {
                    alert("導入錯誤");
                }
            }

            this.GetBookmarks = () => {
                let read,
                options = 0,
                display = "",
                read_data = new Map(),
                all_data = this.store("a");

                const process = (key, value) => {// 將相同 key 的值進行分組, 傳入 read_data
                    read_data.has(key) ? read_data.get(key).push(value) : read_data.set(key, [value]); // 他是以列表保存子項目
                }

                if (all_data.length > 0) {
                    all_data.forEach(key => {// 讀取後分類
                        read = this.store("g", key); // key 值分別取得對應數據
                        process(this.DomainName(read.url), {[key]: read});
                    });

                    // 對數據進行排序
                    read_data = new Map([...read_data.entries()].sort((a, b) => a[1].length - b[1].length));
                    // 解析數據顯示
                    read_data.forEach((value, domain)=> {
                        display += `[${++options}] ( ${domain} | ${value.length} )\n`;
                    });

                    // 將 map 數據轉成 array
                    const data_values = [...read_data.values()];

                    while (true) {
                        let choose = prompt(`直接確認為全部開啟\n輸入開啟範圍(說明) =>\n單個: 1, 2, 3\n範圍: 1~5, 6-10\n排除: !5, -10\n\n輸入代號:\n${display}\n`);
                        if (choose != null) {
                            choose = choose == "" ? "all" : choose;

                            if (choose == "all") { // 0 開啟全部
                                return data_values.flat();
                            } else {
                                const scope = this.ScopeParsing(choose, data_values); // 接收範圍參數
                                if (scope.length > 0) {
                                    return scope.flat();
                                } else {
                                    alert("錯誤的代號");
                                }
                            }
                        } else {
                            return false; // 空的代表都沒有輸入
                        }
                    }
                } else {
                    alert("無保存的書籤");
                }
            }

            // 導出數據
            this.Export = () => {
                const bookmarks = this.GetBookmarks(), export_data = {};
                if (bookmarks) {
                    // Object.assign({}, ...bookmarks) 可以直接轉換, 但為何刪除導出數據, 用以下寫法
                    bookmarks.forEach(data => {
                        const [key, value] = Object.entries(data)[0]; // 解構數據
                        export_data[key] = value;
                        this.ExportClear && this.store("d", key); // 導出刪除
                    });
                    return JSON.stringify(export_data, null, 4);
                } else {
                    return false;
                }
            }
        }

        /* 添加書籤 */
        Add() {
            try {
                const url = this.decode(document.URL);
                const title = document.title || `Source_${url}`;
                const icon = this.$$("link[rel~='icon']");
                const icon_link = icon ? this.decode(icon.href) : "None";

                // 組成數據
                const save_data = {
                    title: title,
                    icon: icon_link,
                    url: url
                }

                // 用 MD5 的哈西值作為 Key
                this.store("s", CryptoJS.MD5(JSON.stringify(save_data)).toString(), save_data);

                GM_notification({
                    title: "添加完成",
                    text: "已保存網址",
                    timeout: 1500
                })

                this.AddClose && setTimeout(()=> window.close(), 500);
            } catch (error) {
                alert(error);
            }
        }

        /* 讀取書籤 */
        Read() {
            const bookmarks = this.GetBookmarks();
            if (bookmarks) {
                bookmarks.forEach((data, index)=> {
                    const [key, value] = Object.entries(data)[0];
                    setTimeout(()=> {
                        GM_openInTab(value.url);
                        this.OpenClear && this.store("d", key); // 刪除開啟的數據
                    }, 500 * index);
                })
            }
        }

        /* 導入 Json */
        Import_Json() {
            const input = document.createElement("input");
            input.type = "file";

            GM_notification({
                title: "點擊頁面",
                text: "點擊頁面任意一處, 開啟導入文件窗口",
                timeout: 2500
            })

            this.Listen(document, "click", (event)=> {
                event.preventDefault();
                input.click();
                input.remove();
            }, {once: true});

            this.Listen(input, "change", (event)=> {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = (event) => {
                        this.Import(event.target.result);
                    }
                }
            }, {once: true, passive: true});
        }

        /* 導入 剪貼簿 */
        Import_Clipboard() {
            const data = prompt("貼上導入的數據: ");
            data && this.Import(data);
        }

        /* 導出 Json */
        Export_Json() {
            const Export_Data = this.Export();
            if (Export_Data) {
                const json = document.createElement("a");
                json.href = "data:application/json;charset=utf-8," + encodeURIComponent(Export_Data);
                json.download = "Bookmark.json";
                json.click();
                json.remove();
                GM_notification({
                    title: "導出完畢",
                    text: "已下載 Json",
                    timeout: 1500
                })
            }
        }

        /* 導出 剪貼簿 */
        Export_Clipboard() {
            const Export_Data = this.Export();
            if (Export_Data) {
                GM_setClipboard(Export_Data);
                GM_notification({
                    title: "導出完畢",
                    text: "已複製到剪貼簿",
                    timeout: 1500
                })
            }
        }

        /* 菜單創建 */
        async Create() {
            this.Menu({
                "🔖 添加書籤": {func: ()=> this.Add()},
                "📖 開啟書籤": {func: ()=> this.Read()},
                "📤️ 導入 [Json]": {func: ()=> this.Import_Json()},
                "📤️ 導入 [剪貼簿]": {func: ()=> this.Import_Clipboard()},
                "📥️ 導出 [Json]": {func: ()=> this.Export_Json()},
                "📥️ 導出 [剪貼簿]": {func: ()=> this.Export_Clipboard()},
            });
        }
    }).Create();

})();
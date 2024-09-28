// ==UserScript==
// @name         __簡易書籤__
// @version      0.0.1
// @author       Canaan HS
// @description  將網頁添加至書籤中保存, 一鍵快速導入導出, 一鍵快速開啟所有書籤

// @noframes
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon64       https://cdn-icons-png.flaticon.com/512/13984/13984370.png

// @run-at       document-start
// @grant        unsafeWindow
// @grant        window.close
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js
// @require      https://update.greasyfork.org/scripts/495339/1413531/ObjectSyntax_min.js
// ==/UserScript==

(async () => {
    (new class Bookmark {
        constructor() {
            this.AddClose = true; // 添加網址後關閉窗口
            this.OpenClear = true; // 開啟後清除
            this.ExportClear = true; // 導出後清除保存數據
            this.Url_Exclude = /^(?:https?:\/\/)?(?:www\.)?/i;
            this.Url_Parse = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img;

            // 解碼
            this.decode = (str) => decodeURIComponent(str);

            // 解析域名
            this.DomainName = (url) => {
                return url.match(this.Url_Parse)[0].replace(this.Url_Exclude, "");
            };

            // 數據轉 pako 的數組
            this.DataToPako = (str) => pako.deflateRaw(str).toString();

            // pako 數組轉數據
            this.Decoder = new TextDecoder();
            this.PakoToData = (str) => JSON.parse(this.Decoder.decode(
                    pako.inflateRaw(
                        new Uint8Array(str.split(",").map(Number))
                    )
                )
            );

            // 讀取書籤數據
            this.GetBookmarks = () => {
                let options = 0,
                display = "",
                read_data = new Map(),
                all_data = Syn.Store("a");

                const process = (key, value) => {// 將相同 key 的值進行分組, 傳入 read_data
                    read_data.has(key) ? read_data.get(key).push(value) : read_data.set(key, [value]); // 他是以列表保存子項目
                }

                if (all_data.length > 0) {
                    all_data.forEach(key => {// 讀取後分類
                        const recover = this.PakoToData(Syn.Store("g", key));
                        recover && process(this.DomainName(recover.url), {[key]: recover});
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
                        if (display == "") {
                            return false;
                        }

                        let choose = prompt(`直接確認為全部開啟\n輸入開啟範圍(說明) =>\n單個: 1, 2, 3\n範圍: 1~5, 6-10\n排除: !5, -10\n\n輸入代號:\n${display}\n`);
                        if (choose != null) {
                            choose = choose == "" ? "all" : choose;

                            if (choose == "all") { // 0 開啟全部
                                return data_values.flat();
                            } else {
                                const scope = Syn.ScopeParsing(choose, data_values); // 接收範圍參數
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
            };

            // 導入數據
            this.Import = (data) => {
                try {
                    for (const [key, value] of Object.entries(JSON.parse(data))) {
                        Syn.Store("s", key, this.DataToPako(JSON.stringify(value)));
                    };
                    GM_notification({
                        title: "導入完畢",
                        text: "已導入數據",
                        timeout: 1500
                    });
                } catch {
                    alert("導入錯誤");
                }
            };

            // 導出數據
            this.Export = () => {
                const bookmarks = this.GetBookmarks(), export_data = {};
                if (bookmarks) {
                    bookmarks.forEach(data => {
                        const [key, value] = Object.entries(data)[0]; // 解構數據
                        export_data[key] = value;
                        this.ExportClear && Syn.Store("d", key); // 導出刪除
                    });
                    return JSON.stringify(export_data, null, 4);
                } else {
                    return false;
                }
            };
        }

        /* 添加書籤 */
        Add() {
            try {
                const
                    url = this.decode(Syn.Device.Url),
                    title = document.title || `Source_${url}`,
                    icon = Syn.$$("link[rel~='icon']"),
                    icon_link = icon ? this.decode(icon.href) : "None";

                // 組成數據
                const data = JSON.stringify({
                    Icon: icon_link, Url: url, Title: title,
                })
                , save = this.DataToPako(data)
                , hash = md5(data, md5(save));

                // 使用哈希值為 key, 壓縮字串為 value
                Syn.Store("s", hash, save);

                GM_notification({
                    title: "添加完成",
                    text: "已保存網址",
                    timeout: 1500
                })

                this.AddClose && setTimeout(()=> window.close(), 500);
            } catch (error) {
                alert(error);
            }
        };

        /* 觀察批次訊號 */
        async BatchAddObser() {
            Syn.StoreListen(["BatchTrigger"], call=> {
                if (call.far && call.nv == Syn.Device.Host) { // 同樣域名的觸發
                    this.Add();
                }
            })
        };

        /* 觸發批次添加 */
        BatchAddTrigger() {
            Syn.Store("s", "BatchTrigger", Syn.Device.Host);
            setTimeout(()=> {
                Syn.Store("d", "BatchTrigger"); // 一秒後刪除觸發標記
                this.Add(); // 添加自己
            }, 1e3);
        };

        /* 讀取書籤 */
        Read() {
            const bookmarks = this.GetBookmarks();
            if (bookmarks) {
                bookmarks.forEach((data, index)=> {
                    const [key, value] = Object.entries(data)[0];
                    setTimeout(()=> {
                        GM_openInTab(value.url);
                        this.OpenClear && Syn.Store("d", key); // 刪除開啟的數據
                    }, 500 * index);
                })
            }
        };

        /* 導入 Json */
        Import_Json() {
            GM_notification({
                title: "點擊頁面",
                text: "點擊頁面任意一處, 開啟導入文件窗口",
                timeout: 2500
            });

            if (Syn.Device.Type() == "Desktop") { // 實驗性方式
                Syn.Listen(document, "click", async (event) => {
                    event.preventDefault();
                    const [fileHandle] = await unsafeWindow.showOpenFilePicker();
                    const file = await fileHandle.getFile();
                    const data = await file.text();
                    data && this.Import(data);
                }, {once: true});

            } else if (Syn.Device.Type() == "Mobile") { // 該方法支援不同平台
                const input = document.createElement("input");
                input.type = "file";

                Syn.Listen(document, "click", (event)=> {
                    event.preventDefault();
                    input.click();
                    input.remove();
                }, {once: true});

                Syn.Listen(input, "change", (event)=> {
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
        };

        /* 導入 剪貼簿 */
        Import_Clipboard() {
            const data = prompt("貼上導入的數據: ");
            data && this.Import(data);
        };

        /* 導出 Json */
        Export_Json() {
            const Export_Data = this.Export();
            if (Export_Data) {
                Syn.OutputJson(Export_Data, "Bookmark", Success=> {
                    Success && GM_notification({
                        title: "導出完畢",
                        text: "已下載 Json",
                        timeout: 1500
                    })
                });
            }
        };

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
        };

        /* 菜單工廠 */
        MenuFactory() {
            let SwitchStatus = false;

            const self = this;
            const ExpandText = "展開菜單";
            const CollapseText = "收合菜單";

            function Collapse() { // 移除收合菜單
                for (let i=1; i <= 4; i++) {
                    GM_unregisterMenuCommand("Expand-" + i)
                }
            };

            function Expand() { // 展開添加菜單
                Syn.Menu({
                    "📥️ 導出 [Json]": {func: ()=> self.Export_Json()},
                    "📥️ 導出 [剪貼簿]": {func: ()=> self.Export_Clipboard()},
                    "📤️ 導入 [Json]": {func: ()=> self.Import_Json()},
                    "📤️ 導入 [剪貼簿]": {func: ()=> self.Import_Clipboard()},
                }, "Expand");
            };

            function MenuToggle() { // 觸發器
                const DisplayText = SwitchStatus ? CollapseText : ExpandText;

                Syn.Menu({ // 預設都是關閉狀態 (不會紀錄設置)
                    [`➖➖➖${DisplayText}➖➖➖`]: {func: ()=> {
                        SwitchStatus = SwitchStatus ? false : true; // 先更新狀態
                        MenuToggle(); // 根據狀態刷新自己顯示

                        // 最後呼叫開合 (順序改了可能導致排版亂掉)
                        !SwitchStatus ? Collapse() : Expand(); // 因為狀態先被更新 (所以判斷要用反)
                    }, close: false}
                }, "Toggle");
            };

            return {
                Expand,
                MenuToggle
            }
        };

        /* 菜單創建 */
        async Create() {
            this.BatchAddObser();

            Syn.Menu({
                "🔖 添加書籤": {func: ()=> this.Add()},
                "🔖 批量添加": {func: ()=> this.BatchAddTrigger()},
                "📖 開啟書籤": {func: ()=> this.Read()}
            });

            const Factory = this.MenuFactory();

            if (Syn.Device.Type() == "Desktop") {
                setTimeout(()=> { // 創建收合菜單
                    Factory.MenuToggle();
                }, 1e3);
            } else {
                Factory.Expand();
            }

        };
    }).Create();

})();
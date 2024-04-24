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
            this.ExportClear = false; // 導出後清除保存數據
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
                        this.store("s", key, {
                            title: value.title,
                            icon: value.icon,
                            url: value.url
                        });
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

            // 導出數據
            this.Export = () => {
                let box = {};
                this.store("a").forEach(key => {
                    const data = this.store("g", key);
                    box[key] = {
                        title: data.title,
                        icon: data.icon,
                        url: data.url
                    };
                    this.ExportClear && this.store("d", key);
                });
                if (Object.keys(box).length > 0) {
                    return JSON.stringify(box, null, 0);
                } else {
                    alert("無可用的導出數據");
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
            let display_text = "[0] 全部開啟\n", options = 0, open;
            const read_data = new Map(), add_data = (key, value) => { // 將擁有相同 key 的值, 進行分類, 傳入 read_data
                read_data.has(key) ? read_data.get(key).push(value) : read_data.set(key, [value]);
            }

            // 讀取後分類
            this.store("a").forEach(key => {
                const read = this.store("g", key); // 使用 key 值分別取得數據
                add_data(this.DomainName(read.url), {key: key, url: read.url}); // 解析 url 的網域, 保存 key, 與 跳轉連結
            });

            // 解析數據顯示
            read_data.forEach((value, domain)=> {
                display_text += `[${++options}] ( ${domain} | ${value.length} )\n`;
            });

            // 將 map 數據轉成 array
            const data_values = [...read_data.values()];

            if (data_values.length > 0) {

                while (true) {
                    let choose = prompt(`輸入代號指定開啟:\n\n${display_text}`);
                    choose = choose ? +choose : "";

                    if (typeof choose == "string") { // 是字串就是什麼都沒輸入
                        return;
                    } else if (choose == 0) { // 選擇 0 開啟全部
                        open = data_values.flat(); break;
                    } else if (choose > 0 && choose <= data.size) { // 選擇 > 0 且小於數據的長度
                        open = data_values[choose-1]; break;
                    } else {
                        alert("不存在的代號");
                    }
                }

                // 將選擇好的數據索引, 添加到 open 變數, 作為開啟連結
                open.forEach((data, index)=> {
                    setTimeout(()=> {
                        GM_openInTab(data.url);
                        this.store("d", data.key); // 刪除開啟的數據
                    }, 500 * index);
                })

            } else {
                alert("無可開啟的網址");
            }
        }

        /* 導入 Json */
        Import_Json() {
            const input = document.createElement("input");
            input.type = "file";

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
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

// @require      https://update.greasyfork.org/scripts/487608/1342021/GrammarSimplified.js
// ==/UserScript==

(function() {
    (new class Bookmark extends API {
        constructor() {
            super();
            this.Url_Exclude = /^(?:https?:\/\/)?(?:www\.)?/i;
            this.Url_Parse = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img;

            this.DomainName = (url) => {
                return url.match(this.Url_Parse)[0].replace(this.Url_Exclude, "");
            }

            this.Import = (data) => {
                try {
                    for (const [title, value] of Object.entries(JSON.parse(data))) {
                        this.store("set", title, {icon: value[0], url: value[1]});
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

            this.Export = () => {
                let box = {};
                this.store("all").forEach(title => {
                    const data = this.store("get", title);
                    box[title] = [data.icon, data.url];
                    this.store("del", title);
                });
                if (Object.keys(box).length > 0) {
                    return JSON.stringify(box, null, 0);
                } else {
                    alert("無可用的導出數據");
                }
            }
        }

        async Write() {
            try {
                const url = document.URL;
                const title = document.title || location.host;
                const icon = this.$$("link[rel~='icon']");
                const icon_link = icon ? icon.href : "None";
                this.store("set", title, {icon: icon_link, url: url});

                GM_notification({
                    title: "添加完成",
                    text: "已保存網址",
                    timeout: 1500
                })
                setTimeout(()=> window.close(), 500);
            } catch (error) {
                alert(error);
            }
        }

        Read() {
            let display_text = "[0] 全部開啟\n", options = 0, open;
            const data = new Map(), add_data = (key, value) => {
                data.has(key) ? data.get(key).push(value) : data.set(key, [value]);
            }

            // 讀取後分類
            this.store("all").forEach(title => {
                const read = this.store("get", title);
                add_data(this.DomainName(read.url), [read, title]);
            });

            // 解析數據顯示
            data.forEach((value, domain)=> {
                display_text += `[${++options}] ( ${domain} | ${value.length} )\n`;
            });

            // 將 map 數據轉成 array
            const data_values = [...data.values()];

            if (data_values.length > 0) {

                while (true) {
                    let choose = prompt(`輸入代號指定開啟:\n\n${display_text}`);
                    choose = choose ? +choose : "";

                    if (typeof choose == "string") {
                        return;
                    } else if (choose == 0) {
                        open = data_values.flat(); break;
                    } else if (choose > 0 && choose <= data.size) {
                        open = data_values[choose-1]; break;
                    } else {
                        alert("不存在的代號");
                    }
                }

                // 開啟連結
                open.forEach((data, index)=> {
                    setTimeout(()=> {
                        GM_openInTab(data[0].url);
                        this.store("del", data[1]); // 刪除開啟的數據
                    }, 500 * index);
                })

            } else {
                alert("無可開啟的網址");
            }
        }

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

        Import_Clipboard() {
            const data = prompt("貼上導入的數據: ");
            data && this.Import(data);
        }

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

        async Create() {
            this.Menu({
                "🔖 添加書籤": ()=> this.Write(),
                "📖 開啟書籤": ()=> this.Read(),
                "📤️ 導入 [Json]": ()=> this.Import_Json(),
                "📤️ 導入 [剪貼簿]": ()=> this.Import_Clipboard(),
                "📥️ 導出 [Json]": ()=> this.Export_Json(),
                "📥️ 導出 [剪貼簿]": ()=> this.Export_Clipboard(),
            });
        }

    }).Create();
})();
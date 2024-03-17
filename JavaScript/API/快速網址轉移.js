// ==UserScript==
// @name         快速網址轉移
// @version      0.0.1
// @author       HentaiSaru
// @description  用於保存網址 與 一鍵快速轉移網址

// @noframes
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon64       https://cdn-icons-png.flaticon.com/512/13984/13984370.png

// @run-at       document-start
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
            } catch (error) {
                alert(error);
            }
        }

        /* 後續功能
        
        顯示當前總數據數量
        顯示各網域數量 與編號
        輸入編號選擇開啟的網域數據
        */
        async Read() {
            this.store("all").forEach((title, index) => {
                setTimeout(()=> {
                    GM_openInTab(this.store("get", title).url, {
                        active: false,
                        setParent: false
                    });
                    this.store("del", title);
                }, 300 * index);
            });
        }

        async Import() {
            const data = prompt("貼上導入的數據: ");
            if (data) {
                for (const [title, value] of Object.entries(JSON.parse(data))) {
                    this.store("set", title, {icon: value[0], url: value[1]});
                }

                GM_notification({
                    title: "導入完畢",
                    text: "已導入數據",
                    timeout: 1500
                })
            }
        }

        async Export() {
            let box = {};
            this.store("all").forEach(title => {
                const data = this.store("get", title);
                box[title] = [data.icon, data.url];
                this.store("del", title);
            });
            if (Object.keys(box).length > 0) {
                GM_setClipboard(JSON.stringify(box, null, 0));
                GM_notification({
                    title: "導出完畢",
                    text: "已複製到剪貼簿",
                    timeout: 1500
                })
            } else {
                GM_notification({
                    title: "導出失敗",
                    text: "無可用的導出數據",
                    timeout: 1500
                })
            }
        }

        async Create() {
            this.Menu({
                "🔖 保存網址": ()=> this.Write(),
                "📖 開啟網址": ()=> this.Read(),
                "📤️ 導入數據": ()=> this.Import(),
                "📥️ 導出數據": ()=> this.Export(),
            });
        }

    }).Create();
})();
// ==UserScript==
// @name         簡易下載器
// @version      0.0.1
// @description  下載測試
// @author       Canaan HS

// @connect      *
// @match        https://hotgirl.asia/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/487608/1382007/ClassSyntax_min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {

    // 不同網站的規則
    const Operate = {
        "hotgirl.asia": {
            Title: "h3",
            Element: ".galeria_img img",
            NextPage: ".pagination",
        }
    }

    class Download extends Syntax {
        constructor() {
            super();
            this.ImgLink = [];
            this.NextLink = [];
            this.Zip = new JSZip();
        }

        // 取得圖片數據
        async GetIMG(elements) {
            elements.forEach(img => {
                const url = img?.src;
                url && this.ImgLink.push(url);
            });
        }

        // 取得 a 連結
        async GetNext(element) {
            this.$$(`${element} a`, { all: true }).forEach(a => {
                const href = a?.href;
                href && this.NextLink.push(href);
            });
        }

        // 簡單取得其他頁面數據
        async fetchPage(Url, Element) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url: Url,
                    method: "GET",
                    onload: response => {
                        if (response.status === 200) {
                            this.GetIMG(this.$$(Element, { all: true, root: response.responseXML }));
                            resolve();
                        } else reject();
                    }
                });
            });
        }

        async download(Url, Name) {
            return new Promise((resolve, reject) => {
                const name = Url.split("/");
                GM_xmlhttpRequest({
                    url: Url,
                    method: "GET",
                    responseType: "blob",
                    onload: response => {
                        const blob = response.response;
                        if (blob instanceof Blob && blob.size > 0) {
                            this.Zip.file(`${Name}/${name[name.length - 1]}`, blob);
                            resolve();
                        } else {
                            reject();
                        }
                    },
                    onerror: () => {reject();}
                });
            });
        }

        async Trigger() {
            const operate = Operate[this.Device.Host];

            if (!operate) return;

            console.log("等待數據處理");

            // 先取得當前頁面圖片
            this.GetIMG(this.$$(operate.Element, { all: true }));

            // 獲取其他頁連結
            await this.GetNext(operate.NextPage);

            // 取得其他頁的圖片
            const fetchPromises = this.NextLink.map(link => this.fetchPage(link, operate.Element));
            await Promise.all(fetchPromises);

            console.log("準備開始下載");

            const filename = this.$$(operate.Title).textContent;
            const downloadPromises = this.ImgLink.map(link => this.download(link, filename));
            await Promise.all(downloadPromises);

            this.Zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 5 }
            }).then(zip => {
                saveAs(zip, `${filename}.zip`);
                console.log("下載完成");
            })
        }
    }

    GM_registerMenuCommand("圖片下載", ()=> {
        const download = new Download();
        download.Trigger();
    });

})();
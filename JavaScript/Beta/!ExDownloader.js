// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.16-Beta
// @author       Canaan HS
// @description         漫畫頁面創建下載按鈕, 可切換 (壓縮下載 | 單圖下載), 無須複雜設置一鍵點擊下載, 自動獲取(非原圖)進行下載
// @description:zh-TW   漫畫頁面創建下載按鈕, 可切換 (壓縮下載 | 單圖下載), 無須複雜設置一鍵點擊下載, 自動獲取(非原圖)進行下載
// @description:zh-CN   漫画页面创建下载按钮, 可切换 (压缩下载 | 单图下载), 无须复杂设置一键点击下载, 自动获取(非原图)进行下载
// @description:ja      マンガページにダウンロードボタンを作成し、（圧缩ダウンロード | シングルイメージダウンロード）を切り替えることができ、复雑な设定は必要なく、ワンクリックでダウンロードできます。自动的に（オリジナルではない）画像を取得してダウンロードします
// @description:ko      만화 페이지에 다운로드 버튼을 만들어 (압축 다운로드 | 단일 이미지 다운로드)를 전환할 수 있으며, 복잡한 설정이 필요하지 않고, 원클릭 다운로드 기능으로 (원본이 아닌) 이미지를 자동으로 가져와 다운로드합니다
// @description:en      Create download buttons on manga pages, switchable between (compressed download | single image download), without the need for complex settings, one-click download capability, automatically fetches (non-original) images for downloading

// @connect      *
// @match        *://e-hentai.org/g/*
// @match        *://exhentai.org/g/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand

// @require      https://update.greasyfork.org/scripts/473358/1237031/JSZip.js
// @require      https://update.greasyfork.org/scripts/495339/1413531/ObjectSyntax_min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

/* 需新開發功能

設置菜單

設置下載線程數
設置檔名格式
設置壓縮級別
設置圖片名格式
切換壓縮下載模式

重構添加
~ 名稱: 日文, 英文
~ 下載頁數設置
*/

(async () => {
    /* 使用者配置 */
    const Config = {
        Dev: true,
        ReTry: 15 // 下載錯誤重試次數, 超過這個次數該圖片會被跳過
    };

    /* 下載配置 */
    const DownloadConfig = {
        MAX_CONCURRENCY: 15, // 最大併發數
        MIN_CONCURRENCY: 5,  // 最小併發數
        TIME_THRESHOLD: 350, // 響應時間閥值

        MAX_Delay: 3500,     // 最大延遲
        Home_ID: 100,        // 主頁初始延遲
        Home_ND: 80,         // 主頁最小延遲
        Image_ID: 30,        // 圖頁初始延遲
        Image_ND: 24,        // 圖頁最小延遲
        Download_IT: 5,      // 下載初始線程
        Download_ID: 300,    // 下載初始延遲
        Download_ND: 240,    // 下載最小延遲

        Compr_Level: 5, // 壓縮的等級
        Lock: false, // 鎖定模式
        Enforce: false, // 判斷強制下載狀態
        Show: undefined, // 下載時的展示字串
        DownloadMode: undefined, // 用於下載時 不被變更下載模式

        Dynamic: function(Time, Delay, Thread=null, MIN_Delay) {
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
    };

    const Url = Syn.Device.Url.split("?p=")[0];
    let Lang, OriginalTitle, CompressMode, ModeDisplay;

    class ButtonCore {
        constructor() {
            this.E = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Ex = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Allow = (Uri = Url) => this.E.test(Uri) || this.Ex.test(Uri);
            this.InitStyle = () => {
                const Position = `
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
                `;

                const E_Style = `
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
                `;

                const Ex_Style = `
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
                `;

                const Style = Syn.Device.Host === "e-hentai.org" ? E_Style : Ex_Style;
                Syn.AddStyle(`${Position}${Style}`, "Button-style", false);
            };
        };

        /* 下載模式切換 */
        async DownloadModeSwitch() {
            CompressMode
                ? Syn.Store("s", "CompressedMode", false)
                : Syn.Store("s", "CompressedMode", true);

            Syn.$$("#ExDB").remove();
            this.ButtonCreation();
        };

        /* 按鈕創建 */
        async ButtonCreation() {
            CompressMode = Syn.Store("g", "CompressedMode", []);
            ModeDisplay = CompressMode ? Lang.Transl("壓縮下載") : Lang.Transl("單圖下載");
            const download_button = GM_addElement(Syn.$$("#gd2"), "button", {
                id: "ExDB", class: "Download_Button"
            });
            download_button.disabled = DownloadConfig.Lock ? true : false;
            download_button.textContent = DownloadConfig.Lock ? Lang.Transl("下載中鎖定") : ModeDisplay;
            Syn.AddListener(download_button, "click", () => {
                DownloadConfig.Lock = true;
                download_button.disabled = true;
                download_button.textContent = Lang.Transl("開始下載");
                //! 下載觸發
            }, {capture: true, passive: true});
        };

        /* 初始化創建 */
        static async Init() {
            const Core = new ButtonCore();
            if (Core.Allow()) {
                Core.InitStyle();
                OriginalTitle = document.title;
                Lang = Language(Syn.Device.Lang);
                Core.ButtonCreation();
                Syn.Menu({
                    [Lang.Transl("🔁 切換下載模式")]: {
                        func: ()=> Core.DownloadModeSwitch(),
                        close: false,
                    }
                });
            }
        };
    };

    function Language(lang) {
        const Word = {
            Traditional: {},
            Simplified: {
                "🔁 切換下載模式": "",
                "📥 強制壓縮下載": "",
                "壓縮下載": "",
                "單圖下載": "",
                "下載中鎖定": "",
                "開始下載": "",
                "獲取頁面": "",
                "獲取連結": "",
                "下載進度": "",
                "壓縮封裝": "",
                "壓縮完成": "",
                "壓縮失敗": "",
                "下載完成": "",
                "清理警告": "",
                "剩餘重載次數": "",
                "下載失敗數據": "",
                "內頁跳轉數據": "",
                "圖片連結數據": "",
                "等待失敗重試...": "",
                "請求錯誤重新加載頁面": "",
                "下載數據不完整將清除緩存, 建議刷新頁面後重載": "",
                "找不到圖片元素, 你的 IP 可能被禁止了, 請刷新頁面重試": "",
            },
            English: {
                "🔁 切換下載模式": "",
                "📥 強制壓縮下載": "",
                "壓縮下載": "",
                "單圖下載": "",
                "下載中鎖定": "",
                "開始下載": "",
                "獲取頁面": "",
                "獲取連結": "",
                "下載進度": "",
                "壓縮封裝": "",
                "壓縮完成": "",
                "壓縮失敗": "",
                "下載完成": "",
                "清理警告": "",
                "剩餘重載次數": "",
                "下載失敗數據": "",
                "內頁跳轉數據": "",
                "圖片連結數據": "",
                "等待失敗重試...": "",
                "請求錯誤重新加載頁面": "",
                "下載數據不完整將清除緩存, 建議刷新頁面後重載": "",
                "找不到圖片元素, 你的 IP 可能被禁止了, 請刷新頁面重試": "",
            },
            Korea: {
                "🔁 切換下載模式": "",
                "📥 強制壓縮下載": "",
                "壓縮下載": "",
                "單圖下載": "",
                "下載中鎖定": "",
                "開始下載": "",
                "獲取頁面": "",
                "獲取連結": "",
                "下載進度": "",
                "壓縮封裝": "",
                "壓縮完成": "",
                "壓縮失敗": "",
                "下載完成": "",
                "清理警告": "",
                "剩餘重載次數": "",
                "下載失敗數據": "",
                "內頁跳轉數據": "",
                "圖片連結數據": "",
                "等待失敗重試...": "",
                "請求錯誤重新加載頁面": "",
                "下載數據不完整將清除緩存, 建議刷新頁面後重載": "",
                "找不到圖片元素, 你的 IP 可能被禁止了, 請刷新頁面重試": "",
            },
            Japan: {
                "🔁 切換下載模式": "",
                "📥 強制壓縮下載": "",
                "壓縮下載": "",
                "單圖下載": "",
                "下載中鎖定": "",
                "開始下載": "",
                "獲取頁面": "",
                "獲取連結": "",
                "下載進度": "",
                "壓縮封裝": "",
                "壓縮完成": "",
                "壓縮失敗": "",
                "下載完成": "",
                "清理警告": "",
                "剩餘重載次數": "",
                "下載失敗數據": "",
                "內頁跳轉數據": "",
                "圖片連結數據": "",
                "等待失敗重試...": "",
                "請求錯誤重新加載頁面": "",
                "下載數據不完整將清除緩存, 建議刷新頁面後重載": "",
                "找不到圖片元素, 你的 IP 可能被禁止了, 請刷新頁面重試": "",
            }
        }, Match = {
            ko: Word.Korea,
            ja: Word.Japan,
            "en-US": Word.English,
            "zh-CN": Word.Simplified,
            "zh-SG": Word.Simplified,
            "zh-TW": Word.Traditional,
            "zh-HK": Word.Traditional,
            "zh-MO": Word.Traditional,
        }, ML = Match[lang] ?? Match["en-US"];
        return {
            Transl: (Str) => ML[Str] ?? Str
        };
    };

    ButtonCore.Init();
})();
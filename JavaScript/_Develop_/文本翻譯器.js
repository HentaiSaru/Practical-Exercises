// ==UserScript==
// @name         簡易文本轉換器
// @version      0.0.1
// @author       Canaan HS
// @description  高效將 指定文本 轉換為 自定文本

// @connect      *
// @match        *://yande.re/*
// @match        *://rule34.xxx/*
// @match        *://nhentai.net/*
// @match        *://konachan.com/*
// @match        *://danbooru.donmai.us/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// @icon         https://cdn-icons-png.flaticon.com/512/9616/9616859.png

// @noframes
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==

/**
 * Data Reference Sources:
 * https://github.com/EhTagTranslation/Database
 * https://github.com/DominikDoom/a1111-sd-webui-tagcomplete
 * https://github.com/scooderic/exhentai-tags-chinese-translation
 * https://greasyfork.org/zh-TW/scripts/20312-e-hentai-tag-list-for-chinese
 */

(async function() {
    const Config = {
        DictionaryType: {
            Type: ["All_Words"],
            /**
             * 載入數據庫類型 (要載入全部, 就輸入一個 "All_Words", 打更多只會讓處理變慢)
             * 範例: ["Short", "Long", "Tags"]
             * 
             * All_Words: 全部
             * Tags: 標籤
             * Short: 短語
             * Long: 長語
             * Language: 語言
             * Character: 角色
             * Parody: 原作
             * Artist: 繪師
             * Group: 社團
             * Beautify: 美化用的
             */
        },
        TranslationReversal: {
            HotKey: true, // 啟用快捷反轉 (alt + b)
            FocusOnRecovery: true, // 以下說明
            /**
             * 專注於反轉 (也不是 100% 反轉成功, 只是成功率較高)
             *
             * 1. 轉換時型能開銷較高
             * 2. 轉換時有時會有疊加錯誤 (數據越多可能性越高)
             *
             * 不專注於反轉
             *
             * 1. 性能開銷較低處理的更快
             * 2. 反轉時常常會有許多無法反轉的狀況
             */
        },
    };

    // 自定轉換字典  { "要轉換的字串": "轉換成的字串" }, 要轉換字串中, 如果包含英文, 全部都要小寫
    const Customize = {
        "apple": "蘋果", // 範例
        /* Beautify */
        "": "",
        /* Language */
        "": "",
        /* Character */
        "": "",
        /* Parody */
        "": "",
        /* Artist */
        "": "",
        /* Long */
        "": "",
        /* Short */
        "": "",
        /* Tags */
        "": "",
    };

    /* =========================================== */

    let [Translated, Factory, Time, Dict, Timestamp] = [ // 翻譯判斷, 翻譯工廠, 當前時間, 本地數據, 上次更新時間戳
        true,
        TranslationFactory(),
        new Date().getTime(),
        GM_getValue("LocalWords", null),
        GM_getValue("UpdateTimestamp", null),
    ];

    if (!Dict || (Time - Timestamp) > (36e5 * 12)) { // 檢測更新 (自動更新 12 小時)
        Dict = await UpdateWordsDict();
    };

    // 解構設置 (不做數據判斷, 亂給就壞給你看)
    const [DictType, Translation] = [Config.DictionaryType, Config.TranslationReversal];

    // 字典操作
    const Dictionary = {
        NormalDict: undefined,
        ReverseDict: undefined,
        RefreshNormal: function() { // 正常字典的緩存
            this.NormalDict = Dict;
        },
        RefreshReverse: function() { // 刷新反向字典
            this.ReverseDict = Object.entries(this.NormalDict).reduce((acc, [key, value]) => {
                acc[value] = key;
                return acc;
            }, {});
        },
        RefreshDict: function() { // 刷新翻譯狀態
            Dict = Translated
                ? (
                    Translated=false,
                    this.ReverseDict
                ) : (
                    Translated=true,
                    this.NormalDict
                );
        },
        Init: function() { // 初始化 (重新獲取完整字典, 並刷新兩種不同狀態的緩存)
            Object.assign(Dict, Customize);
            this.RefreshNormal();
            this.RefreshReverse();
        }
    };

    Dictionary.Init();
    WaitElem("body", body => { // 等待頁面載入
        const RunFactory = () => Factory.Trigger(body, Translation.FocusOnRecovery);

        let mutation; // 監聽後續變化
        const options = {
            subtree: true,
            childList: true,
        };
        const observer = new MutationObserver(Debounce((mutationsList, observer) => {
            for (mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    RunFactory();
                    break;
                }
            }
        }, 200));

        // 啟動觀察
        const StartOb = () => {
            RunFactory();
            observer.observe(body, options);
        };
        // 斷開觀察
        const DisOB = () => observer.disconnect();
        StartOb(); //首次運行

        /* ----- 創建按鈕 ----- */

        GM_registerMenuCommand("🆕 更新字典", async ()=> {
            DisOB();
            Translated = true;
            Dict = await UpdateWordsDict();

            // 更新字典時, 需要先反向一次, 在將其轉換 (避免不完全的刷新)
            Dictionary.Init();
            Dictionary.RefreshDict();
            RunFactory();

            Dictionary.RefreshDict();
            StartOb();
        });

        function ThePolesAreReversed() {
            DisOB();
            Dictionary.RefreshDict();
            StartOb();
        };

        GM_registerMenuCommand("⚛️ 兩極反轉", ThePolesAreReversed, {
            accessKey: "c",
            autoClose: false,
        });

        if (Translation.HotKey) {
            document.addEventListener("keydown", event=> {
                if (event.altKey && event.key.toLowerCase() == "b") {
                    event.preventDefault();
                    ThePolesAreReversed();
                }
            });
        }
    });

    /* =========================================== */

    function TranslationFactory() {
        function getTextNodes(root) {
            const tree = document.createTreeWalker( // 過濾出所有可用文字節點
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const content = node.textContent.trim();
                        if (content == '') return NodeFilter.FILTER_REJECT;
                        if (!/[\w\p{L}]/u.test(content) || /^\d+$/.test(content)) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );
        
            const nodes = [];
            while (tree.nextNode()) {
                nodes.push(tree.currentNode);
            }
            return nodes;
        };

        const ShortWordRegular = /[\d\p{L}]+/gu;
        const LongWordRegular = /[\d\p{L}]+(?:[^()\[\]{}\t])+[\d\p{L}]\.*/gu;
        const FactoryCore = {
            FocusRecovery: async (textNode)=> {
                textNode.textContent = textNode.textContent.replace(LongWordRegular, Long => Dict[Long.toLowerCase()] ?? Long);
                textNode.textContent = textNode.textContent.replace(ShortWordRegular, Short => Dict[Short.toLowerCase()] ?? Short);
            },
            FocusTranslate: async (textNode)=> {
                textNode.textContent = textNode.textContent.replace(LongWordRegular, Long =>
                    Dict[Long.toLowerCase()] ?? Long.replace(ShortWordRegular, Short => Dict[Short.toLowerCase()] ?? Short)
                );
            }
        };

        const FocusType = {
            followed: undefined,
            Get: function(focus) {
                if (!this.followed) this.followed = focus ? FactoryCore["FocusRecovery"] : FactoryCore["FocusTranslate"];
                return this.followed;
            }
        };

        return {
            Trigger: async (root, focus) => {
                const Core = FocusType.Get(focus);
                getTextNodes(root).forEach(textNode => Core(textNode));
                // 轉換 input 內的提示文本
                // document.querySelectorAll("input[placeholder]").forEach(input => {
                    // input.getAttribute("placeholder")
                    // input.setAttribute("placeholder", "測試");
                // });
            },
        }
    };

    // 取得單字表
    async function GetWordsDict(type) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                responseType: "json",
                url: `https://raw.githubusercontent.com/Canaan-HS/Script-DataBase/main/JSDB/${type}.json`,
                onload: response => {
                    if (response.status === 200) {
                        const data = response.response;
                        if (typeof data === "object" && Object.keys(data).length > 0) {
                            resolve(data);
                        } else {
                            console.error("請求為空數據");
                            resolve({});
                        }
                    } else {
                        console.error("連線異常, 更新地址可能是錯的");
                        resolve({});
                    }
                },
                onerror: error => {
                    console.error("連線異常");
                    resolve({});
                }
            })
        })
    };

    /* 更新數據 */
    async function UpdateWordsDict() {
        let WordsDict = {};

        for (const type of DictType.Type) {
            Object.assign(WordsDict, await GetWordsDict(type));
        };

        if (Object.keys(WordsDict).length > 0) {
            GM_setValue("LocalWords", WordsDict);
            GM_setValue("UpdateTimestamp", new Date().getTime());

            console.log("%c數據更新成功", `
                padding: 5px;
                color: #9BEC00;
                font-weight: bold;
                border-radius: 10px;
                background-color: #597445;
                border: 2px solid #597445;
            `);

            return Object.assign(WordsDict, Customize);
        } else {
            console.log("%c數據更新失敗", `
                padding: 5px;
                color: #FF0000;
                font-weight: bold;
                border-radius: 10px;
                background-color: #A91D3A;
                border: 2px solid #A91D3A;
            `);

            return Object.assign(GM_getValue("LocalWords", {}), Customize);
        }
    };

    function Debounce(func, delay=100) {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(function() {
                func(...args);
            }, delay);
        }
    };

    // 等待元素
    async function WaitElem(selector, found) {
        const observer = new MutationObserver(Debounce(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                found(element);
            }
        }));

        observer.observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true
        });
    };
})();
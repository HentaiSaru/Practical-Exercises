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
            Type: ["All_Words"], // 不需要導入留空 []
            /**
             * 載入數據庫類型 (要載入全部, 就輸入一個 "All_Words", 打更多只會讓處理變慢, 不做數據判斷, 亂給就壞給你看)
             *
             * ! 如果許多單字翻譯的很怪, 可以不要導入 "Short"
             * 範例: ["Short", "Long", "Tags"]
             *
             * All_Words: 全部
             * Tags: 標籤
             * Language: 語言
             * Character: 角色
             * Parody: 原作
             * Artist: 繪師
             * Group: 社團
             * Short: 短單詞
             * Long: 長單詞
             * Beautify: 美化用的
             */
        },
        TranslationReversal: {
            HotKey: true, // 啟用快捷反轉 (alt + b)
            FocusOnRecovery: true, // 以下說明
            /**
             * 專注於反轉 (也不是 100% 反轉成功, 只是成功率較高)
             *
             * 1. 轉換時性能開銷較高
             * 2. 轉換時有時會有疊加錯誤 (數據越多可能性越高)
             *
             * 不專注於反轉
             *
             * 1. 性能開銷較低處理的更快
             * 2. 反轉時常常會有許多無法反轉的狀況 (通常是短句)
             */
        },
    };

    /**
     * 自定轉換字典  { "要轉換的字串": "轉換成的字串" }, 要轉換字串中, 如果包含英文, 全部都要小寫
     *
     * 自定字典的優先級更高, 他會覆蓋掉導入的字典
     */
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
        /* Group */
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

    /* ====================== 不瞭解不要修改下方參數 ===================== */

    // 解構設置
    const [DictType, Translation] = [Config.DictionaryType, Config.TranslationReversal];
    // 這邊分開解構, 是因為 Factory 會掉用 Translation 的數據, 如果晚宣告或是一起解構, 會找不到
    let [Dev, Translated, Factory, Time, Dict, Timestamp] = [ // 開發者模式, 翻譯判斷 (不要修改), 翻譯工廠, 當前時間, 本地數據, 上次更新時間戳
        false, true,
        TranslationFactory(), new Date().getTime(),
        GM_getValue("LocalWords", null), GM_getValue("UpdateTimestamp", null),
    ];

    if (!Dict || (Time - Timestamp) > (36e5 * 12)) { // 檢測更新 (自動更新 12 小時)
        Dict = await UpdateWordsDict();
    };

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
        const RunFactory = () => Factory.Trigger(body);

        const options = {
            subtree: true,
            childList: true,
        };
        let mutation; // 監聽後續變化
        const observer = new MutationObserver(Debounce((mutationsList, observer) => {
            for (mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    RunFactory();
                    break;
                }
            }
        }, 500));

        // 啟動觀察
        const StartOb = () => {
            RunFactory();
            observer.observe(body, options);
        };

        // 斷開觀察
        const DisOB = () => observer.disconnect();
        !Dev && StartOb(); //首次運行 (開發者模式下不會自動運行, 因為有可能轉換不回來)

        function ThePolesAreReversed() {
            DisOB();
            Dictionary.RefreshDict();
            StartOb();
        };

        /* ----- 創建按鈕 ----- */

        if (Dev) {
            Translated = false;
            GM_registerMenuCommand("💬 展示匹配文本", ()=> {
                Factory.Dev(body)
            }, {
                autoClose: false,
                title: "在控制台打印匹配的文本, 建議先開啟控制台在運行",
            });
            GM_registerMenuCommand("🖨️ 打印匹配文本", ()=> {
                Factory.Dev(body, false)
            }, {
                title: "以 Json 格式輸出, 頁面上被匹配到的所有文本",
            });
        };

        GM_registerMenuCommand("🆕 更新字典", async ()=> {
            DisOB();
            Translated = true;
            GM_setValue("Clear", false);
            Dict = await UpdateWordsDict();

            // 更新字典時, 需要先反向一次, 在將其轉換 (避免不完全的刷新)
            Dictionary.Init();
            Dictionary.RefreshDict();
            RunFactory();

            Dictionary.RefreshDict();
            StartOb();
        }, {
            title: "獲取伺服器字典, 更新本地數據庫, 並在控制台打印狀態",
        });

        GM_registerMenuCommand("🚮 清空字典", ()=> {
            GM_setValue("LocalWords", {});
            GM_setValue("Clear", true);
            location.reload();
        }, {
            title: "清除本地緩存的字典",
        });

        GM_registerMenuCommand("⚛️ 兩極反轉", ThePolesAreReversed, {
            accessKey: "c",
            autoClose: false,
            title: "互相反轉變更後的文本",
        });

        if (Dev || Translation.HotKey) {
            document.addEventListener("keydown", event=> {
                if (event.altKey && event.key.toLowerCase() == "b") {
                    event.preventDefault();
                    ThePolesAreReversed();
                }
            })
        };
    });

    /* =========================================== */

    function TranslationFactory() {
        function getTextNodes(root) {
            const tree = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const content = node.textContent.trim();
                        if (content == '') return NodeFilter.FILTER_REJECT;
                        if (!/[\w\p{L}]/u.test(content) || /^\d+$/.test(content)) { // 過濾部份不需要數據
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

        const TCore = { // 翻譯核心
            __ShortWordRegular: /[\d\p{L}]+/gu,
            __LongWordRegular: /[\d\p{L}]+(?:[^()\[\]{}{[(\t\n])+[\d\p{L}]\.*/gu,
            __Clean: (text) => text.trim().toLowerCase(),
            Dev_MatchObj: function(text) {
                const Sresult = text?.match(this.__ShortWordRegular)?.map(Short => {
                    const Clean = this.__Clean(Short);
                    return [Clean, Dict[Clean] ?? ""];
                }) ?? [];

                const Lresult = text?.match(this.__LongWordRegular)?.map(Long => {
                    const Clean = this.__Clean(Long);
                    return [Clean, Dict[Clean] ?? ""];
                }) ?? [];

                return [Sresult, Lresult]
                    .flat().filter(([Key, Value]) => Key && !/^\d+$/.test(Key)) // 過濾全都是數字 和 空的 key
                    .reduce((acc, [Key, Value]) => {
                        acc[Key] = Value;
                        return acc;
                    }, {});
            },
            OnlyLong: function(text) {
                return text?.replace(this.__LongWordRegular, Long => Dict[this.__Clean(Long)] ?? Long);
            },
            OnlyShort: function(text) {
                return text?.replace(this.__ShortWordRegular, Short => Dict[this.__Clean(Short)] ?? Short);
            },
            LongShort: function(text) {
                return text?.replace(this.__LongWordRegular, Long => Dict[this.__Clean(Long)] ?? this.OnlyShort(Long));
            }
        };

        const RefreshUICore = {
            FocusTextRecovery: async (textNode) => {
                textNode.textContent = TCore.OnlyLong(textNode.textContent);
                textNode.textContent = TCore.OnlyShort(textNode.textContent);
            },
            FocusTextTranslate: async (textNode) => {
                textNode.textContent = TCore.LongShort(textNode.textContent);
            },
            FocusInputRecovery: async (inputNode) => {
                inputNode.value = TCore.OnlyLong(inputNode.value);
                inputNode.value = TCore.OnlyShort(inputNode.value);
                inputNode.setAttribute("placeholder", TCore.OnlyLong(inputNode.getAttribute("placeholder")));
                inputNode.setAttribute("placeholder", TCore.OnlyShort(inputNode.getAttribute("placeholder")));
            },
            FocusInputTranslate: async (inputNode) => {
                inputNode.value = TCore.LongShort(inputNode.value);
                inputNode.setAttribute("placeholder", TCore.LongShort(inputNode.getAttribute("placeholder")));
            },
        };

        const ProcessingDataCore = {
            __FocusTextCore: Translation.FocusOnRecovery ? RefreshUICore.FocusTextRecovery : RefreshUICore.FocusTextTranslate,
            __FocusInputCore: Translation.FocusOnRecovery ? RefreshUICore.FocusInputRecovery : RefreshUICore.FocusInputTranslate,
            Dev_Operation: function(root, print) {
                const results = {};
                [
                    ...getTextNodes(root).map(textNode => textNode.textContent),
                    ...[...root.querySelectorAll("input[placeholder], input[value]")].map(inputNode =>
                    [inputNode.value, inputNode.getAttribute("placeholder")]).flat().filter(value=> value && value != '')
                ].map(text=> Object.assign(results, TCore.Dev_MatchObj(text)));

                if (print) console.table(results);
                else {
                    const Json = document.createElement("a");
                    Json.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(results, null, 4))}`;
                    Json.download = "MatchWords.json";
                    Json.click();
                    setTimeout(()=>{Json.remove()}, 500);
                };
            },
            OperationText: async function(root) {
                return Promise.all(getTextNodes(root).map(textNode => this.__FocusTextCore(textNode)));
            },
            OperationInput: async function(root) {
                return Promise.all([...root.querySelectorAll("input[placeholder]")].map(inputNode=> this.__FocusInputCore(inputNode)));
            },
        };

        return {
            Dev: (root, print=true) => {
                ProcessingDataCore.Dev_Operation(root, print);
            },
            Trigger: async (root) => {
                await Promise.all([
                    ProcessingDataCore.OperationText(root),
                    ProcessingDataCore.OperationInput(root)
                ]);
            }
        };
    };

    // 取得單字表
    async function GetWordsDict(type) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                responseType: "json",
                url: `https://raw.githubusercontent.com/Canaan-HS/Script-DataBase/main/Words/${type}.json`,
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
                        console.error("連線異常, 地址類型可能是錯的");
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
        let WordsDict = {}, Dtype = DictType.Type ?? [];

        if (Dtype.length <= 0 || GM_getValue("Clear")) return {};

        for (const type of Dtype) {
            if (type === "") continue;

            Object.assign(WordsDict, await GetWordsDict(type));
        };

        if (Object.keys(WordsDict).length > 0) {
            Object.assign(WordsDict, Customize);

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

            return WordsDict;
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
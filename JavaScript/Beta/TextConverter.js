// ==UserScript==
// @name         簡易文本轉換器
// @version      0.0.1
// @author       Canaan HS
// @description  高效將 指定文本 轉換為 自定文本

// @connect      *
// @match        *://yande.re/*
// @match        *://rule34.xxx/*
// @match        *://nhentai.net/*
// @match        *://imhentai.xxx/*
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

(async () => {
    const Config = {
        LoadDictionary: {
            /**
             * 載入數據庫類型 (要載入全部, 就輸入一個 "All_Words")
             *
             * 範例:
             * 單導入: "Short"
             * 無導入: [] or ""
             * 多導入: ["Short", "Long", "Tags"]
             * 自定導入: "自己的數據庫 Url" (建議網址是一個 Json, 導入的數據必須是 JavaScript 物件)
             *
             * 可導入字典
             *
             * ! 如果許多單字翻譯的很怪, 可以不要導入 "Short"
             *
             * 全部: "All_Words"
             * 標籤: "Tags"
             * 語言: "Language"
             * 角色: "Character"
             * 作品: "Parody"
             * 繪師: "Artist"
             * 社團: "Group"
             * 短單詞: "Short"
             * 長單詞: "Long"
             * 美化用: "Beautify"
             *
             * 參數 =>
             */
            Data: "All_Words"
        },
        TranslationReversal: {
            /**
             * !! 專注於反轉 (也不是 100% 反轉成功, 只是成功率較高)
             *
             * 1. 轉換時性能開銷較高
             * 2. 轉換時可能會有重複疊加錯誤
             *
             * !! 不專注於反轉
             *
             * 1. 性能開銷較低處理的更快
             * 2. 反轉時常常會有許多無法反轉的狀況 (通常是短句)
             */
            HotKey: true, // 啟用快捷反轉 (alt + b)
            FocusOnRecovery: true // 是否專注於反轉
        },
    };

    /**
     * 自定轉換字典  { "要轉換的字串": "轉換成的字串" }, 要轉換字串中, 如果包含英文, 全部都要小寫
     *
     * 自定字典的優先級更高, 他會覆蓋掉導入的字典
     */
    const Customize = {
        "apple": "蘋果", // 範例
    };

    /* ====================== 不瞭解不要修改下方參數 ===================== */

    // 解構設置
    const [LoadDict, Translation] = [Config.LoadDictionary, Config.TranslationReversal];

    // Transl 會調用 Translation 的數據, 如果晚宣告會找不到
    const Dev = false; // 開發者模式
    const Update = UpdateWordsDict(); // 更新函數
    const Transl = TranslationFactory(); // 翻譯函數
    const Time = new Date().getTime(); // 當前時間戳
    const Timestamp = GM_getValue("UpdateTimestamp", null); // 紀錄時間戳

    let Translated = true; // 判斷翻譯狀態 (不要修改)
    let TranslatedRecord = new Set(); // 紀錄翻譯紀錄, 避免疊加轉換問題
    let Dict = GM_getValue("LocalWords", null) ?? await Update.Reques(); // 本地翻譯字典 (無字典立即請求, 通常只會在第一次運行)

    const Dictionary = { // 字典操作
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
            TranslatedRecord = new Set(); // 刷新翻譯紀錄
            Dict = Translated
                ? (
                    Translated=false,
                    this.ReverseDict
                ) : (
                    Translated=true,
                    this.NormalDict
                );
        },
        ReleaseMemory: function() { // 釋放翻譯字典緩存 (不包含自定)
            Dict = this.NormalDict = this.ReverseDict = {};
        },
        Init: function() { // 初始化 (重新獲取完整字典, 並刷新兩種不同狀態的緩存)
            Object.assign(Dict, Customize);
            this.RefreshNormal();
            this.RefreshReverse();
        }
    };
    Dictionary.Init();

    WaitElem("body", body => { // 等待頁面載入
        const RunFactory = () => Transl.Trigger(body);

        const options = {
            subtree: true,
            childList: true,
            characterData: true,
        };
        let mutation; // 監聽後續變化
        const observer = new MutationObserver(Debounce((mutationsList, observer) => {
            for (mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    RunFactory();
                    break;
                }
            }
        }, 300));

        // 啟動觀察 (啟動時會觸發轉換)
        const StartOb = () => {
            RunFactory();
            observer.observe(body, options);
        };

        // 斷開觀察
        const DisOB = () => observer.disconnect();
        !Dev && StartOb(); // 首次運行 (開發者模式下不會自動運行, 因為有可能轉換不回來)

        // 反轉 參數: (是否恢復監聽)
        function ThePolesAreReversed(RecoverOB=true) {
            DisOB();
            Dictionary.RefreshDict();

            // 不恢復觀察, 就由該函數直接觸發轉換
            RecoverOB ? StartOb() : RunFactory();
        };

        /* ----- 創建按鈕 ----- */

        if (Dev) {
            Translated = false;
            GM_registerMenuCommand("🎞️ 展示匹配文本", ()=> {
                Transl.Dev(body);
            }, {
                autoClose: false,
                title: "在控制台打印匹配的文本, 建議先開啟控制台在運行",
            });
            GM_registerMenuCommand("📰 輸出匹配文檔", ()=> {
                Transl.Dev(body, false);
            }, {
                title: "以 Json 格式輸出, 頁面上被匹配到的所有文本",
            });
            GM_registerMenuCommand("♻️ 釋放字典緩存", ()=> {
                Dictionary.ReleaseMemory();
            }, {
                title: "將緩存於 JavaScript 記憶體內的字典數據釋放掉",
            });
            GM_registerMenuCommand("➖➖➖➖➖➖", ()=> {}, {
                autoClose: false,
                title: "開發者模式分隔線",
            });
        };

        GM_registerMenuCommand("🆕 更新字典", async ()=> {
            Translated = true;
            GM_setValue("Clear", false);

            ThePolesAreReversed(false); // 反轉一次, 並且不恢復觀察 (在更新前直接恢復一次, 是因為更新後 Dict 會被覆蓋, 可能會轉不回來)

            Dict = await Update.Reques(); // 請求新的字典
            Dictionary.Init(); // 更新後重新初始化 緩存

            ThePolesAreReversed(); // 再次觸發反轉, 並恢復觀察
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

        if ((Time - Timestamp) > (36e5 * 24)) { // 24 小時更新
            Update.Reques().then(data=> { // 不 await 的更新
                Dict = data;
                Dictionary.Init(); // 初始化
                ThePolesAreReversed(false); // 反轉兩次
                ThePolesAreReversed();
            });
        }
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
            __ShortWordRegex: /[\d\p{L}]+/gu,
            __LongWordRegex: /[\d\p{L}]+(?:[^()\[\]{}{[(\t\n])+[\d\p{L}]\.*/gu,
            __Clean: (text) => text.trim().toLowerCase(),
            Dev_MatchObj: function(text) {
                const Sresult = text?.match(this.__ShortWordRegex)?.map(Short => {
                    const Clean = this.__Clean(Short);
                    return [Clean, Dict[Clean] ?? ""];
                }) ?? [];

                const Lresult = text?.match(this.__LongWordRegex)?.map(Long => {
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
                return text?.replace(this.__LongWordRegex, Long => Dict[this.__Clean(Long)] ?? Long);
            },
            OnlyShort: function(text) {
                return text?.replace(this.__ShortWordRegex, Short => Dict[this.__Clean(Short)] ?? Short);
            },
            LongShort: function(text) { // 已長單詞為主, 不存在才去找短單詞
                return text?.replace(this.__LongWordRegex, Long => Dict[this.__Clean(Long)] ?? this.OnlyShort(Long));
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
                return Promise.all(getTextNodes(root).map(textNode => {
                    if (TranslatedRecord.has(textNode)) return Promise.resolve(); // 無腦制止翻譯無限疊加狀況 (當然會導致記憶體使用更多) (會有疊加是因為監聽動態變化 反覆觸發)
                    TranslatedRecord.add(textNode);
                    return this.__FocusTextCore(textNode)
                }));
            },
            OperationInput: async function(root) {
                return Promise.all([...root.querySelectorAll("input[placeholder]")].map(inputNode=> {
                    if (TranslatedRecord.has(inputNode)) return Promise.resolve();
                    TranslatedRecord.add(inputNode);
                    return this.__FocusInputCore(inputNode)
                }));
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

    /* 更新數據 */
    function UpdateWordsDict() {
        const ObjType = (object) => Object.prototype.toString.call(object).slice(8, -1);
        const Parse = { // 解析數據
            Url: (str) => {
                try {
                    new URL(str); return true;
                } catch {return false}
            },
            ExtenName: (link)=> {
                try {
                    return link.match(/\.([^.]+)$/)[1].toLowerCase() || "json";
                } catch {return "json"}
            },
            Array: (data)=> {
                data = data.filter(d => d.trim() !== ""); // 過濾空字串
                return {State: data.length > 0, Type: "arr", Data: data}
            },
            String: (data)=> {return {State: data != "", Type: "str", Data: data} },
            Undefined: ()=> {return {State: false} },
        };

        // 請求字典
        const RequestDict = (data) => {
            // 解析請求的 Url 是完整的連結, 還是單個字串
            const URL = Parse.Url(data) ? data : `https://raw.githubusercontent.com/Canaan-HS/Script-DataBase/main/Words/${data}.json`;

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    responseType: Parse.ExtenName(URL), // 自動解析類型
                    url: URL,
                    onload: response => {
                        if (response.status === 200) {
                            const data = response.response; // 只能獲取物件類型
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

        return {
            Reques: async () => {
                const {State, Type, Data} = Parse[ObjType(LoadDict?.Data)](LoadDict?.Data); // 解構數據 (避免可能的例外)
                const DefaultDict = Object.assign(GM_getValue("LocalWords", {}), Customize);

                // 當解構狀態為 false, 或有清理標記, 直接回傳預設字典
                if (!State || GM_getValue("Clear")) return DefaultDict;

                const CacheDict = {};
                if (Type == "str") Object.assign(CacheDict, await RequestDict(Data)); // 是字串直接傳遞
                else if (Type == "arr") { // 是列表的傳遞
                    for (const data of Data) {
                        Object.assign(CacheDict, await RequestDict(data));
                    }
                };

                if (Object.keys(CacheDict).length > 0) {
                    Object.assign(CacheDict, Customize); // 只保留新的字典

                    GM_setValue("LocalWords", CacheDict);
                    GM_setValue("UpdateTimestamp", new Date().getTime());

                    console.log("%c數據更新成功", `
                        padding: 5px;
                        color: #9BEC00;
                        font-weight: bold;
                        border-radius: 10px;
                        background-color: #597445;
                        border: 2px solid #597445;
                    `);

                    return CacheDict;
                } else {
                    console.log("%c數據更新失敗", `
                        padding: 5px;
                        color: #FF0000;
                        font-weight: bold;
                        border-radius: 10px;
                        background-color: #A91D3A;
                        border: 2px solid #A91D3A;
                    `);

                    return DefaultDict;
                };
            }
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
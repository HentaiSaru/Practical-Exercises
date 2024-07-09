// ==UserScript==
// @name         簡易翻譯器
// @version      0.0.1
// @author       Canaan HS
// @description  高效將英文翻譯成繁體中文 (實驗項目)

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
 * https://github.com/scooderic/exhentai-tags-chinese-translation
 * https://greasyfork.org/zh-TW/scripts/20312-e-hentai-tag-list-for-chinese
 */

(async function() {
    // 自定字典  (key 值必須全部都是小寫)
    const Customize = {
        "apple": "蘋果", // 範例
        /* Beautify */
        "": "",
        /* Language */
        "": "",
        /* Character */
        "": "",
        /* Title */
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

    let [Dev, Time, Words, Timestamp] = [ // 取得字典數據, 和時間戳
        false,
        new Date().getTime(),
        GM_getValue("LocalWords", null),
        GM_getValue("UpdateTimestamp", null)
    ];

    if (Dev || !Words || !Timestamp || (Time - Timestamp) > (36e5 * 12)) { // 檢測更新
        Words = await GetWords();

        if (Object.keys(Words).length > 0) {
            GM_setValue("LocalWords", Words);
            GM_setValue("UpdateTimestamp", new Date().getTime());

            console.log("%c數據更新成功", `
                padding: 5px;
                color: #9BEC00;
                font-weight: bold;
                border-radius: 10px;
                background-color: #597445;
                border: 2px solid #597445;
            `);
        } else {
            console.log("%c數據更新失敗", `
                padding: 5px;
                color: #FF0000;
                font-weight: bold;
                border-radius: 10px;
                background-color: #A91D3A;
                border: 2px solid #A91D3A;
            `);
        }
    };

    const Factory = TranslationFactory(); // 調用工廠
    let Dict = Object.assign(Words, Customize); // 生成數據

    WaitElem("body", body => { // 等待頁面載入
        Factory.Translator(body); // 開始立即觸發

        let mutation; // 監聽後續變化
        const options = {
            subtree: true,
            childList: true,
        };
        const observer = new MutationObserver(Debounce((mutationsList, observer) => {
            for (mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    Factory.Translator(body);
                    break;
                }
            }
        }, 200));
        observer.observe(body, options);

        GM_registerMenuCommand("⚛️ 兩極反轉", ()=> {
            observer.disconnect();

            Dict = Object.entries(Dict).reduce((acc, [key, value]) => {
                acc[value] = key;
                return acc;
            }, {});

            Factory.Translator(body);
            observer.observe(body, options);
        }, {
            accessKey: "c",
            autoClose: false,
        });
    });

    /* =========================================== */

    function TranslationFactory() {
        function getTextNodes(root) {
            const tree = document.createTreeWalker( // 過濾出所有可用 文字節點
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const content = node.nodeValue.trim();
                        return content == '' || !/[\w\p{L}]/u.test(content)
                        ? NodeFilter.FILTER_REJECT
                        : NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let node;
            const nodes = [];
            while (node = tree.nextNode()) {
                nodes.push(node);
            }
            return nodes;
        };
        async function Transform(textNode) {
            textNode.textContent =
            textNode.textContent.replace(/[\d\p{L}]+(?:[^()\[\]{}\t])+[\d\p{L}]\.*/gu,
            content => Dict[content.toLowerCase()] ?? content);
            textNode.textContent =
            textNode.textContent.replace(/[\d\p{L}]+/gu,
            content => Dict[content.toLowerCase()] ?? content); // 翻譯個別單字 (例外狀況)
        };

        return {
            Translator: async (root) => { // 當需要遍歷多個節點
                getTextNodes(root).forEach(textNode => Transform(textNode));
            },
        }
    };

    // 取得單字表
    async function GetWords() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                responseType: "json",
                url: "https://raw.githubusercontent.com/Canaan-HS/Script-DataBase/main/JSDB/Dict.json",
                onload: response => {
                    if (response.status === 200) {
                        const data = response.response;
                        if (typeof data === "object" && Object.keys(data).length > 0) {
                            resolve(data);
                        } else reject({});
                    } else reject({});
                },
                onerror: error => reject({})
            })
        })
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
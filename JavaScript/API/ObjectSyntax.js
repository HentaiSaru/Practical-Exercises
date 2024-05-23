// ==UserScript==
// @name         ObjectSyntax
// @version      2024/05/23
// @author       Canaan HS
// @description  Library for simplifying code logic and syntax (Object Type)
// @namespace    https://greasyfork.org/users/989635
// @match        *://*/*
// @license      MIT
// ==/UserScript==

/**
 * * { 物件版 語法簡化 API }
 * 
 * @example
 * Syn.func()
 */
const Syn = (()=> {
    const
        Mark = {}, // Observer() & StoreListen()
        Parser = new DOMParser(), // DomParse()
        ListenerRecord = new Map(), // AddListener() & RemovListener()
        Print = { // Log()
            log: label=> console.log(label),
            warn: label=> console.warn(label),
            trace: label=> console.trace(label),
            error: label=> console.error(label),
            count: label=> console.count(label),
        },
        Query = { // $$()
            Match: (Str)=> /[ .#=:]/.test(Str),
            "#": (source, select) => source.getElementById(select.slice(1)),
            ".": (source, select, all) => {
                const query = source.getElementsByClassName(select.slice(1));
                return all ? [...query] : query[0];
            },
            "tag": (source, select, all) => {
                const query = source.getElementsByTagName(select);
                return all ? [...query] : query[0];
            },
            "default": (source, select, all) => {
                return all ? source.querySelectorAll(select) : source.querySelector(select);
            }
        },
        TemplateMatch = { // FormatTemplate()
            Type: (object)=> Object.prototype.toString.call(object).slice(8, -1),
            Process: function(template, key, value=null) {
                const temp = template[key.toLowerCase()];
                return this.Type(temp) === "Function"
                    ? temp(value)
                    : (temp !== undefined ? temp : "None");
            }
        },
        StoreMatch = { // Store()
            verify: val => val !== void 0 ? val : false,
            d: key => GM_deleteValue(key),
            a: () => StoreMatch.verify(GM_listValues()),
            s: (key, value) => GM_setValue(key, value),
            g: (key, value) => StoreMatch.verify(GM_getValue(key, value)),
            sj: (key, value) => GM_setValue(key, JSON.stringify(value, null, 4)),
            gj: (key, value) => JSON.parse(StoreMatch.verify(GM_getValue(key, value)))
        },
        StorageMatch = { // Storage()
            Type: (parse) => Object.prototype.toString.call(parse).slice(8, -1),
            String: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true) : JSON.parse(key),
            Number: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true) : Number(key),
            Array: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true)
                    : (key = JSON.parse(key), Array.isArray(key[0]) ? new Map(key) : key),
            Object: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true) : JSON.parse(key),
            Boolean: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true) : JSON.parse(key),
            Date: (storage, key, value) =>
                value != null ? (storage.setItem(key, JSON.stringify(value)), true) : new Date(key),
            Map: (storage, key, value) =>
                (storage.setItem(key, JSON.stringify([...value])), true)
        };

    return {
        /* ========== 通用常用函數 ========== */

        Device: {
            sX: ()=> window.scrollX,
            sY: ()=> window.scrollY,
            iW: ()=> window.innerWidth,
            iH: ()=> window.innerHeight,
            _Type: undefined,
            Url: location.href,
            Orig: location.origin,
            Host: location.hostname,
            Path: location.pathname,
            Lang: navigator.language,
            Agen: navigator.userAgent,
            Type: function() {
                return this._Type = this._Type ? this._Type
                    : (this._Type = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agen) || this.iW < 768
                    ? "Mobile" : "Desktop");
            }
        },

        /**
         * * { 簡化查找語法 }
         * @param {string} selector - 查找元素
         * @param {boolean} {all}   - 是否查找全部
         * @param {element} {root}  - 查找來源
         * @returns {element}       - DOM 元素
         *
         * @example
         * $$("查找元素", {all: true, root: 查找來源})
         */
        $$: (selector, {
            all=false,
            root=document
        }={})=> {
            const type = !Query.Match(selector)
            ? "tag" : Query.Match(selector.slice(1))
            ? "default" : selector[0];
            return Query[type](root, selector, all);
        },

        /**
         * * { 暫停異步函數 }
         * @param {Integer} delay - 延遲毫秒
         * @returns { Promise }
         */
        Sleep: (delay)=> new Promise(resolve => setTimeout(resolve, delay)),

        /**
         * * { 打印元素 }
         * @param {*} group - 打印元素標籤盒
         * @param {*} label - 打印的元素
         * @param {string} type - 要打印的類型 ("log", "warn", "error", "count")
         */
        Log: async(group=null, label="print", {
            type="log",
            collapsed=true
        }={})=> {
            type = typeof type === "string" && Print[type] ? type : type = "log";
            if (group == null) {Print[type](label)}
            else {
                collapsed ? console.groupCollapsed(group) : console.group(group);
                Print[type](label);
                console.groupEnd();
            }
        },

        /**
         * * { 添加樣式表到 head }
         * @param {string} Rule - 樣式表
         * @param {string} ID   - 創建 ID
         */
        AddStyle: async(Rule, ID="New-Style")=> {
            let new_style = document.getElementById(ID);
            if (!new_style) {
                new_style = document.createElement("style");
                new_style.id = ID;
                document.head.appendChild(new_style);
            }
            new_style.textContent += Rule;
        },

        /**
         * * { 添加腳本到 head }
         * @param {string} Rule - Js 腳本
         * @param {string} ID   - 創建 ID
         */
        AddScript: async(Rule, ID="New-Script")=> {
            let new_script = document.getElementById(ID);
            if (!new_script) {
                new_script = document.createElement("script");
                new_script.id = ID;
                document.head.appendChild(new_script);
            }
            new_script.textContent += Rule;
        },

        /**
         * * { 簡化版監聽器 (不可刪除, 且不檢測是否重複添加, 但會回傳註冊狀態) }
         * @param {string} element - 添加元素
         * @param {string} type    - 監聽器類型
         * @param {*} listener     - 監聽後操作
         * @param {object} add     - 附加功能
         * @returns {boolean}      - 回傳添加狀態
         *
         * @example
         * Listen("監聽元素", "監聽類型", 觸發 => {
         *      觸發... 其他操作
         * }, {once: true, capture: true, passive: true}, 接收註冊狀態 => {
         *      console.log(註冊狀態)
         * })
         */
        Listen: async(
            element,
            type,
            listener,
            add={},
            resolve=null
        )=> {
            try {
                element.addEventListener(type, listener, add);
                resolve && resolve(true);
            } catch {resolve && resolve(false)}
        },

        /**
         * * { 添加監聽器 (可刪除, 且會檢測是否重複添加) }
         * @param {string} element - 添加元素
         * @param {string} type    - 監聽器類型
         * @param {*} listener     - 監聽後操作
         * @param {object} add     - 附加功能
         */
        AddListener: async(
            element,
            type,
            listener,
            add={}
        )=> {
            const Listener = ListenerRecord.get(element);
            if (!Listener || !Listener?.has(type)) {
                element.addEventListener(type, listener, add);
                if (!Listener) {
                    ListenerRecord.set(element, new Map());
                }
                ListenerRecord.get(element).set(type, listener);
            }
        },

        /**
         * * { 刪除 監聽器 }
         * @param {string} element - 添加元素
         * @param {string} type    - 監聽器類型
         */
        RemovListener: (element, type)=> {
            const Listen = ListenerRecord.get(element)?.get(type);
            if (Listen) {
                element.removeEventListener(type, Listen);
                ListenerRecord.get(element).delete(type);
            }
        },

        /**
         * ! 使用 this 勿修改為匿名函數
         * * { 持續監聽對象, 並運行函數 (用於持續監聽) }
         * @param {element} object          - 觀察對象
         * @param {function} trigger        - 觸發函數
         * @param {string} {mark}           - 創建標記, 用於避免重複創建
         * @param {boolean} {subtree}       - 觀察 目標節點及其所有後代節點的變化
         * @param {boolean} {childList}     - 觀察 目標節點的子節點數量的
         * @param {boolean} {attributes}    - 觀察 目標的元素屬性變化
         * @param {boolean} {characterData} - 觀察 目標文本節點的變化
         * @paeam {*} {callback} - 觀察對象, 觀察參數
         *
         * @example
         * Observer("觀察對象", ()=> {
         *      運行邏輯...
         * }, {mark: "標記", childList: false}, back=> {
         *      如果需要進行額外操作
         *      const observer = back.ob;
         *      const options = back.op;
         * })
         */
        Observer: async function (object, trigger, {
            mark=false,
            throttle=0,
            subtree=true,
            childList=true,
            attributes=true,
            characterData=false,
        }={},
            callback=null
        ) {
            if (mark) {
                if (Mark[mark]) {return}
                else {Mark[mark] = true}
            }
            const op = {
                subtree: subtree,
                childList: childList,
                attributes: attributes,
                characterData: characterData
            }, ob = new MutationObserver(this.Throttle(() => {trigger()}, throttle));
            ob.observe(object, op);
            callback && callback({ob, op});
        },

        /**
         * ! 使用 this 勿修改為匿名函數
         * * { 等待元素出現 }
         * @param {string} selector - 查找的物件
         * @param {function} found  - 找到後的回條
         *
         * 選項設置 (以下為預設值)
         * {
         *     raf: false, - 是否使用 requestAnimationFrame 查找
         *     all: false, - 使否使用多查找
         *     timeout: 8, - 查找的超時時間
         *     throttle: 50, - 針對 MutationObserver 的節流
         *     subtree: true, - MutationObserver 觀察 目標節點及其所有後代節點的變化
         *     childList: true, - MutationObserver 觀察 目標節點的子節點數量的變化
         *     attributes: true, - MutationObserver 觀察 目標節點的屬性變化
         *     characterData: false, - MutationObserver 觀察 目標文本節點的變化
         *     timeoutResult: false, - 超時是否回傳找到的結果
         *     object: document.body, - MutationObserver 的觀察對象
         * }
         *
         * @example
         * WaitElem("元素", found=> {
         *      console.log(found); 找到的元素
         * }, {設置參數});
         */
        WaitElem: async function(selector, found, {
            raf=false,
            all=false,
            timeout=8,
            throttle=50,
            subtree=true,
            childList=true,
            attributes=false,
            characterData=false,
            timeoutResult=false,
            object=document.body,
        }={}) {
            let timer, element, result;

            if (raf) {
                let AnimationFrame;

                const query = () => {
                    element = all ? document.querySelectorAll(selector) : document.querySelector(selector);
                    result = all ? element.length > 0 : element;
                    if (result) {
                        cancelAnimationFrame(AnimationFrame);
                        clearTimeout(timer);
                        found(element);
                    } else {
                        AnimationFrame = requestAnimationFrame(query);
                    }
                };

                AnimationFrame = requestAnimationFrame(query);

                timer = setTimeout(() => {
                    cancelAnimationFrame(AnimationFrame);
                    timeoutResult && found(element);
                }, (1000 * timeout));

            } else {
                const observer = new MutationObserver(this.Throttle(() => {
                    element = all ? document.querySelectorAll(selector) : document.querySelector(selector);
                    result = all ? element.length > 0 : element;
                    if (result) {
                        observer.disconnect();
                        clearTimeout(timer);
                        found(element);
                    }
                }, throttle));

                observer.observe(object, {
                    subtree: subtree,
                    childList: childList,
                    attributes: attributes,
                    characterData: characterData
                });

                timer = setTimeout(() => {
                    observer.disconnect();
                    timeoutResult && found(element);
                }, (1000 * timeout));
            }
        },

        /**
         * ! 使用 this 勿修改為匿名函數
         * * { 等待元素出現 (Map 物件版) }
         * @param {string} selectors - 查找的物件
         * @param {function} found  - 找到後的回條
         *
         * 選項設置 (以下為預設值)
         * {
         *     raf: false, - 是否使用 requestAnimationFrame 查找
         *     timeout: 8, - 查找的超時時間
         *     throttle: 50, - 針對 MutationObserver 的節流
         *     subtree: true, - MutationObserver 觀察 目標節點及其所有後代節點的變化
         *     childList: true, - MutationObserver 觀察 目標節點的子節點數量的變化
         *     attributes: true, - MutationObserver 觀察 目標節點的屬性變化
         *     characterData: false, - MutationObserver 觀察 目標文本節點的變化
         *     timeoutResult: false, - 超時是否回傳找到的結果
         *     object: document.body, - MutationObserver 的觀察對象
         * }
         *
         * @example
         * WaitMap(["元素1", "元素2", "元素3"], found=> {
         *      const [e1, e2, e3] = found;
         * }, {設置參數});
         */
        async WaitMap(selectors, found, {
            raf=false,
            timeout=8,
            throttle=50,
            subtree=true,
            childList=true,
            attributes=false,
            characterData=false,
            timeoutResult=false,
            object=document.body,
        }={}) {
            let timer, elements;

            if (raf) {
                let AnimationFrame;

                const query = () => {
                    elements = selectors.map(selector => document.querySelector(selector));
                    if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                        cancelAnimationFrame(AnimationFrame);
                        clearTimeout(timer);
                        found(elements);
                    } else {
                        AnimationFrame = requestAnimationFrame(query);
                    }
                };

                AnimationFrame = requestAnimationFrame(query);

                timer = setTimeout(() => {
                    cancelAnimationFrame(AnimationFrame);
                    timeoutResult && found(elements);
                }, (1000 * timeout));

            } else {
                const observer = new MutationObserver(this.Throttle(() => {
                    elements = selectors.map(selector => document.querySelector(selector));
                    if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                        observer.disconnect();
                        clearTimeout(timer);
                        found(elements);
                    }
                }, throttle));

                observer.observe(object, {
                    subtree: subtree,
                    childList: childList,
                    attributes: attributes,
                    characterData: characterData
                });

                timer = setTimeout(() => {
                    observer.disconnect();
                    timeoutResult && found(elements);
                }, (1000 * timeout));
            }
        },

        /**
         * * { 瀏覽器 Storage 操作 }
         * @param {string} key - 存儲的 key 值
         * @param {sessionStorage | localStorage} {type} - 存儲的類型 (預設 sessionStorage)
         * @param {*} {value}  - 存儲的 value 值
         * @param {*} {error}  - 當不存在此值是要回傳的
         * @returns {*}        - 回傳保存的值
         *
         * @example
         * 支援的類型 (String, Number, Array, Object, Boolean, Date, Map)
         *
         * Storage("數據", {value: 123, error: false})
         * Storage("數據")
         *
         * Storage("數據", {value: 123, type: localStorage})
         * Storage("數據", {type: localStorage})
         */
        Storage(key, {type=sessionStorage, value=null, error=undefined}={}) {
            let data;
            return value != null
                ? StorageMatch[StorageMatch.Type(value)](type, key, value)
                : (data = type.getItem(key), data != undefined ? StorageMatch[StorageMatch.Type(JSON.parse(data))](type, data) : error);
        },

        /* ========== 請求數據處理 ========== */

        /**
         * * { 解析請求後的頁面, 成可查詢的 html 文檔 }
         * @param {htnl} html - 要解析成 html 的文檔
         * @returns {htnl}    - html 文檔
         */
        DomParse: (html)=> Parser.parseFromString(html, "text/html"),

        /**
         * * { 排除不能用做檔名的字串 }
         * @param {string} name - 要修正的字串
         * @returns {string}    - 排除後的字串
         */
        NameFilter: (name)=> name.replace(/[\/\?<>\\:\*\|":]/g, ""),

        /**
         * * { 取得下載圖片時的填充量 }
         * @param {object} pages - 下載的圖片連結物件
         * @returns {number}     - 返回填充的值
         *
         * @example
         * const box = [下載圖片的連結]
         * const Fill = GetFill(box);
         */
        GetFill: (pages)=> Math.max(2, `${pages}`.length),

        /**
         * * { 解析網址字串的副檔名 }
         * @param {string} link - 含有副檔名的連結
         * @returns {string}    - 回傳副檔名字串
         */
        ExtensionName: (link)=> {
            try {
                return link.match(/\.([^.]+)$/)[1].toLowerCase() || "png";
            } catch {
                return "png";
            }
        },

        /**
         * ! 使用 this 勿修改為匿名函數
         * * { 回傳下載圖片的尾數 }
         * @param {number} index   - 圖片的頁數
         * @param {number} padding - 填充量 [由 GetFill() 取得填充量]
         * @param {string} filler  - 用於填充的字串
         * @param {string} type    - 圖片的副檔名, 輸入圖片的連結
         * @returns {string}       - 經填充後的尾數
         */
        Mantissa: function(index, padding, filler="0", type=null) {
            return type
                ? `${++index}`.padStart(padding, filler) + `.${this.ExtensionName(type)}`
                : `${++index}`.padStart(padding, filler);
        },

        /**
         * * 解析範圍進行設置 (索引從 1 開始)
         *
         * @param {string} scope  - 設置的索引範圍 [1, 2, 3-5, 6~10, -4, !8]
         * @param {array} object  - 需要設置範圍的物件
         * @returns {object}      - 回傳設置完成的物件
         *
         * @example
         * object = ScopeParsing("", object);
         */
        ScopeParsing: (scope, object)=> {
            const // 使用 set 避免重複索引
                result = new Set(),
                exclude = new Set(),
                len = object.length;
            for (const str of scope.split(/\s*[,\./]\s*/)) { // 使用 , . / 進行分割
                // 取索引值 -1 是為了得到真正的索引值
                if (/^\d+$/.test(str)) { // 單數字
                    result.add(Number(str)-1);
                } else if (/^\d+(?:~\d+|-\d+)$/.test(str)) {
                    const
                        range = str.split(/-|~/), // 數字 + (- | ~) + 數字, 並拆分出 前後數字
                        start = Number(range[0]-1),
                        end = Number(range[1]-1),
                        judge = start <= end;
                    for ( // 根據範圍生成索引值, 判斷大小是避免有機掰人寫反的
                        let i = start;
                        judge ? i <= end : i >= end;
                        judge ? i++ : i--
                    ) {result.add(i)}
                } else if (/(!|-)+\d+/.test(str)) { // 單數字前面是 - 或 ! 代表排除 (與上方判斷順序不能改)
                    exclude.add(Number(str.slice(1)-1));
                }
            }

            // 使用排除過濾出剩下的索引, 並按照順序進行排序
            const final_obj = [...result].filter(index => !exclude.has(index) && index < len && index >= 0).sort((a, b) => a - b);
            // 回傳最終的索引物件
            return final_obj.map(index => object[index]);
        },

        /**
         * * { 用於解析格式, 回傳匹配模板的結果 }
         * @param {object} template - 可被匹配的模板
         * @param {string|object} format - 匹配的格式字串, 要匹配模板的對應 key, 使用 {key} 來標記
         * @returns {string}
         *
         * @example
         * format 是字串, template 不傳參
         * format 是物件, template 可自由設置, 傳參或是不傳參
         *
         * const template {
         *      Title: "一個標題",
         *      Name: ()=> 處理邏輯 
         * };
         *
         * const format = "{Title} {Name} {Title}";
         * const result = FormatTemplate(template, format);
         * console.log(result);
         */
        FormatTemplate: (template, format)=> {

            if (TemplateMatch.Type(template) !== "Object") {
                return "Template must be an object";
            }

            // 將 template 的 keys 轉換成小寫
            template = Object.fromEntries(
                Object.entries(template).map(([key, value]) => [key.toLowerCase(), value])
            );

            if (TemplateMatch.Type(format) === "String") {
                return format.replace(/\{\s*([^}\s]+)\s*\}/g, (match, key)=> TemplateMatch.Process(template, key));

            } else if (TemplateMatch.Type(format) === "Object") {
                return Object.entries(format).map(([key, value]) => TemplateMatch.Process(template, key, value));

            } else {
                return {"Unsupported format": format};

            }
        },

        /**
         * * { 輸出 Json 檔案 }
         *
         * @param {*} Data      - 可轉成 Json 格式的數據
         * @param {string} Name - 輸出的檔名 (不用打副檔名)
         * @param {function} Success   - 選擇是否回傳輸出狀態
         * 
         * @example
         * OutputJson({key: value}, "Json", Success=> {
         *      console.log(Success);
         * })
         */
        OutputJson: async(Data, Name, Success=null)=> {
            try {
                Data = typeof Data !== "string" ? JSON.stringify(Data, null, 4) : Data;
                Name = typeof Name !== "string" ? "Anonymous" : Name.replace(".json", "");

                const Json = document.createElement("a");
                Json.href = `data:application/json;charset=utf-8,${encodeURIComponent(Data)}`;
                Json.download = `${Name}.json`;
                Json.click();

                await new Promise(resolve => setTimeout(resolve, 100));
                Json.remove();
                Success && Success({State: true});
            } catch (error) {Success && Success({State: false, Info: error})}
        },

        /* ========== 特別用途函數 ========== */

        /**
         * * { 創建 Worker 工作文件 }
         * @param {string} code - 運行代碼
         * @returns {Worker}    - 創建的 Worker 連結
         */
        WorkerCreation: (code)=> {
            const blob = new Blob([code], {type: "application/javascript"});
            return new Worker(URL.createObjectURL(blob));
        },

        /**
         * * { 獲取運行經過時間 }
         * @param {Date.now()} time - 傳入 Date.now()
         * @param {string} show - 顯示的說明文字
         * @param {string} {style} - 展示的風格
         * @param {boolean} {log} - 是否直接打印
         *
         * @returns {Date.now()}
         *
         * @example
         * let start = Runtime();
         * let end = Runtime(start);
         * console.log(end);
         *
         * let start = Runtime();
         * Runtime(start, true);
         */
        Runtime: (time=null, show="Elapsed Time:", {
            style="\x1b[1m\x1b[36m%s\x1b[0m",
            log=true
        }={})=> {
            return !time
            ? Date.now()
            : log 
            ? console.log(style, `${show} ${((Date.now()-time)/1e3)}s`)
            : (Date.now() - time);
        },

        /**
         * * { 獲取當前時間格式 }
         * @param {string} format - 選擇輸出的格式 : {year}{month}{date}{hour}{minute}{second}
         * @returns {string} - 設置的時間格式, 或是預設值
         * 
         * @example
         * GetDate("{year}/{month}/{date} {hour}:{minute}")
         */
        GetDate: (format=null)=> {
            const date = new Date();
            const defaultFormat = "{year}-{month}-{date} {hour}:{minute}:{second}";

            const formatMap = {
                year: date.getFullYear(),
                month: (date.getMonth() + 1).toString().padStart(2, "0"),
                date: date.getDate().toString().padStart(2, "0"),
                hour: date.getHours().toString().padStart(2, "0"),
                minute: date.getMinutes().toString().padStart(2, "0"),
                second: date.getSeconds().toString().padStart(2, "0")
            };

            const generate = (temp) => temp.replace(/{([^}]+)}/g, (match, key) => formatMap[key] || "Error");
            return generate(typeof format === "string" ? format : defaultFormat);
        },

        /**
         * * { 節流函數, 立即觸發, 後續按照指定的速率運行, 期間多餘的觸發將會被忽略 }
         * @param {function} func - 要觸發的函數
         * @param {number} delay - 延遲的時間ms
         * @returns {function}
         *
         * @example
         * a = Throttle(()=> {}, 100);
         * a();
         * 
         * function b(n) {
         *      Throttle(b(n), 100);
         * }
         * 
         * document.addEventListener("pointermove", Throttle(()=> {
         * }), 100)
         */
        Throttle: (func, delay)=> {
            let lastTime = 0;
            return (...args) => {
                const now = Date.now();
                if ((now - lastTime) >= delay) {
                    lastTime = now;
                    func(...args);
                }
            }
        },

        /**
         ** { 防抖函數 Debounce, 只會在停止呼叫後觸發, 持續呼叫就會一直重置 }
         * @param {function} func - 要觸發的函數
         * @param {number} delay - 延遲的時間ms
         * @returns {function}
         *
         * @example
         * 使用方法同上, 改成 Debounce() 即可
         */
        Debounce: (func, delay=500)=> {
            let timer = null;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    func(...args);
                }, delay);
            }
        },

        /* ========== 油猴 API ========== */

        /**
         * * { 菜單註冊 API }
         *
         * @grant GM_registerMenuCommand
         * 
         * @param {object} Item  - 創建菜單的物件
         * @param {string} ID    - 創建菜單的 ID
         * @param {number} Index - 創建菜單的 ID 的 編號 (設置從多少開始)
         * @example
         * 
         * Menu({
         * "菜單1": {
         *     desc: "菜單描述",
         *     func: ()=> { 方法1() },
         *     hotkey: "a",
         *     close: true,
         * },
         * "菜單2": ()=> { 方法2(參數) }
         *}, "ID");
         */
        Menu: async(Item, ID="Menu", Index=1)=> {
            for (const [Name, options] of Object.entries(Item)) {
                GM_registerMenuCommand(Name, ()=> {options.func()}, {
                    title: options.desc,
                    id: `${ID}-${Index++}`,
                    autoClose: options.close,
                    accessKey: options.hotkey,
                });
            }
        },

        /**
         ** { 操作存储空間 (精簡版) }
         *
         * @grant GM_setValue
         * @grant GM_getValue
         * @grant GM_listValues
         * @grant GM_deleteValue
         * 
         * @param {string} operate - 操作類型 ("s", "g", "sj", "gj", "d", "a")
         * @param {string} key     - 操作數據索引 Key
         * @param {*} value        - 要保存的值, 如果是取得操作, 就是空值時的回傳
         * @returns {data}         - 獲取的數據值
         *
         * @example
         * 
         * 數據A = store("g", "資料A", null)
         * store("sj", "資料B", "數據B")
         */
        Store: (operat, key=null, value=null)=> StoreMatch[operat](key, value),

        /**
         ** { 監聽保存值的變化 }
         *
         * @grant GM_addValueChangeListener
         * 
         * @param {array} object    - 一個可遍歷的, 標籤對象物件
         * @param {object} callback - 回條函數
         *
         * @example
         * 回條對象
         * key - 觸發的對象 key
         * ov - 對象舊值
         * nv - 對象新值
         * far - 是否是其他窗口觸發
         *
         * storeListen(["key1", "key2"], call=> {
         *      console.log(call.key, call.nv);
         * })
         */
        StoreListen: async(object, callback)=> {
            object.forEach(label => {
                if (!this.Mark[label]) {
                    this.Mark[label] = true;
                    GM_addValueChangeListener(label, function(key, old_value, new_value, remote) {
                        callback({key, ov: old_value, nv: new_value, far: remote});
                    })
                }
            })
        }
    }
})();
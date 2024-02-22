// ==UserScript==
// @name         GrammarSimplified
// @version      2024/02/23
// @author       HentaiSaru
// @description  Simple syntax simplification function
// @namespace    https://greasyfork.org/users/989635
// @match        *://*/*
// ==/UserScript==

/**
 * * { 簡化語法的類別 }
 * 
 * @example
 * 1.
 *  class main extends API {
 *       繼承此類...
 *       this.func(方法調用)
 *  }
 * 
 * 2.
 *  實利化調用
 *  const api = new API()
 *  api.func()
 */
class API {
    constructor() {
        this.ListenerRecord = new Map();
        this.Parser = new DOMParser();
        this.GM = {
            __verify: val => val !== undefined ? val : null,
            set: function(val, put) {GM_setValue(val, put)},
            get: function(val, call) {return this.__verify(GM_getValue(val, call))},
            setjs: function(val, put) {GM_setValue(val, JSON.stringify(put, null, 4))},
            getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
        };
        this.Template = {
            log: label=> console.log(label),
            warn: label=> console.warn(label),
            error: label=> console.error(label),
            count: label=> console.count(label),
        }
    }

    /**
     * * { 簡化查找語法 }
     * @param {string} Selector - 查找元素
     * @param {boolean} All     - 是否查找全部
     * @param {element} Source  - 查找來源
     * @returns {element}       - DOM 元素
     */
    $$(Selector, All=false, Source=document) {
        const slice = Selector.slice(1), analyze = [".", "#", " ", "="].some(m => {return slice.includes(m)}) ? " " : Selector[0];
        switch (analyze) {
            case "#": return Source.getElementById(slice);
            case " ": return All ? Source.querySelectorAll(Selector):Source.querySelector(Selector);
            case ".": Selector = Source.getElementsByClassName(slice);break;
            default: Selector = Source.getElementsByTagName(Selector);
        }
        return All ? Array.from(Selector) : Selector[0];
    }

    /**
     * * { 解析請求後的頁面, 成可查詢的 html 文檔 }
     * @param {htnl} html - 要解析成 html 的文檔 
     * @returns {htnl}    - html 文檔
     */
    DomParse(html) {
        return this.Parser.parseFromString(html, "text/html");
    }

    /**
     * * { 排除不能用做檔名的字串 }
     * @param {string} name - 要變更的字串
     * @returns {string}    - 變更後的字串
     */
    IllegalCharacters(name) {
        return name.replace(/[\/\?<>\\:\*\|":]/g, "");
    }

    /**
     * * { 解析網址字串的副檔名 }
     * @param {string} link - 含有副檔名的連結
     * @returns {string}    - 回傳副檔名字串
     */
    ExtensionName(link) {
        try {
            const match = link.match(/\.([^.]+)$/);
            return match[1].toLowerCase() || "png";
        } catch {return "png"}
    }

    /**
     * * { 創建 Worker 工作文件 }
     * @param {string} code - 運行代碼
     * @returns {Worker}    - 創建的 Worker 連結
     */
    WorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }

    /**
     * * { 添加樣式表到 head }
     * @param {string} Rule - 樣式表
     * @param {string} ID   - 創建 ID
     */
    async AddStyle(Rule, ID="New-Style") {
        let new_style = document.getElementById(ID);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }

    /**
    * * { 添加腳本到 head }
    * @param {string} Rule - Js 腳本
    * @param {string} ID   - 創建 ID
    */
    async AddScript(Rule, ID="New-Script") {
        let new_script = document.getElementById(ID);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }

    /**
     * * { 添加監聽器 (可刪除版) }
     * @param {string} element - 添加元素
     * @param {string} type    - 監聽器類型
     * @param {*} listener     - 監聽後操作
     * @param {object} add     - 附加功能
     */
    async AddListener(element, type, listener, add={}) {
        if (!this.ListenerRecord.has(element) || !this.ListenerRecord.get(element).has(type)) {
            element.addEventListener(type, listener, add);
            if (!this.ListenerRecord.has(element)) {
                this.ListenerRecord.set(element, new Map());
            }
            this.ListenerRecord.get(element).set(type, listener);
        }
    }

    /**
     * * { 刪除 監聽器 }
     * @param {string} element  - 添加元素
     * @param {string} type     - 監聽器類型
     */
    async RemovListener(element, type) {
        if (this.ListenerRecord.has(element) && this.ListenerRecord.get(element).has(type)) {
            const listen = this.ListenerRecord.get(element).get(type);
            element.removeEventListener(type, listen);
            this.ListenerRecord.get(element).delete(type);
        }
    }

    /**
     * * { 簡化版監聽器 (不可刪除) }
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
    async Listen(element, type, listener, add={}, callback=null) {
        try {
            element.addEventListener(type, listener, add);
            callback ? callback(true) : null;
        } catch {callback ? callback(true) : null}
    }

    /**
     * * { 等待元素出現 }
     * 
     * @param {string} selector     - 等待元素
     * @param {boolean} all         - 是否多選
     * @param {number} timeout      - 等待超時 (秒數)
     * @param {function} callback   - 回條函式
     * 
     * @example
     * WaitElem("元素", false, 1, call => {
     *      後續操作...
     *      console.log(call);
     * })
     */
    async WaitElem(selector, all, timeout, callback) {
        let timer, element, result;
        const observer = new MutationObserver(() => {
            element = all ? document.querySelectorAll(selector) : document.querySelector(selector);
            result = all ? element.length > 0 : element;
            if (result) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
    }

    /**
     * * { 等待元素出現 (Map 物件版) }
     * 
     * @param {string} selector     - 等待元素
     * @param {number} timeout      - 等待超時 (秒數)
     * @param {function} callback   - 回條函式
     * 
     * @example
     * WaitElem(["元素1", "元素2", "元素3"], 等待時間(秒), call => {
     *      全部找到後續操作...
     *      const [元素1, 元素2, 元素3] = call;
     * })
     */
    async WaitMap(selectors, timeout, callback) {
        let timer, elements;
        const observer = new MutationObserver(() => {
            elements = selectors.map(selector => document.querySelector(selector))
            if (elements.every(element => element)) {
                observer.disconnect();
                clearTimeout(timer);
                callback(elements);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
    }

    /**
     * * { 打印元素 }
     * @param {*} group - 打印元素標籤盒
     * @param {*} label - 打印的元素
     * @param {string} type - 要打印的類型 ("log", "warn", "error", "count")
     */
    async log(group=null, label="print", type="log") {
        type = typeof type === "string" && this.Template[type] ? type : type = "log";
        if (group == null) {this.Template[type](label)}
        else {
            console.groupCollapsed(group);
            this.Template[type](label);
            console.groupEnd();
        }
    }

    /* ========== 油猴的 API ========== */

    /**
     * * { 操作存储空間 }
     * // @grant GM_setValue
     * // @grant GM_getValue
     * @param {string} operate - 操作類型 ("set", "get", "setjs", "getjs")
     * @param {string} key     - 操作數據索引Key
     * @param {*} orig         - 原始的回傳值
     * @returns {data}         - 獲取的數據值
     * 
     * @example
     * 數據 A = store("get", "資料A")
     * store("setjs", "資料B", "數據B")
     */
    store(operate, key, orig=null){
        switch (operate[0]) {
            case "g": return this.GM[operate](key, orig);
            case "s": return orig !== null ? this.GM[operate](key, orig) : null;
            default: return new Error("wrong type of operation");
        }
    }

    /**
     * * { 菜單註冊 }
     * // @grant GM_registerMenuCommand
     * @param {*} item  - 創建菜單的物件
     * @example
     * Menu({
     *      "菜單1": ()=> 方法1(),
     *      "菜單2": ()=> 方法2(),
     *      ...
     * })
     */
    async Menu(item) {
        for (const [name, call] of Object.entries(item)) {
            GM_registerMenuCommand(name, ()=> {call()});
        }
    }
}
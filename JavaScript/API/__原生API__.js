class Collection {
/**_________________________
 ** { document API }
 * 
 * [ID元素]: document.getElementById(id)
 * [Tag 標籤列表]: document.getElementsByTagName(tagName)
 * [Class 元素列表]: document.getElementsByClassName(className)
 * [多選器, 匹配的第一元素]: document.querySelector(tag /.class /#id)
 * [多選器, 匹配的所有元素]: document.querySelectorAll(同上)
 * [創建元素節點]: document.createElement(tagName)
 * [創建包含文本的節點]: document.createTextNode(text)
 *
 * [添加節點到末端]: 被添加元素.appendChild(添加元素)
 * [刪除節點]: 父節點.removeChild(刪除元素)
 * [替換子節點]: 父節點.replaceChildren("替換內容")
 * [刪除節點]: 節點.remove()
 *
 * [設置元素屬性]: 元素.setAttribute(name, value)
 * [取得元素屬性]: 元素.getAttribute(name)
 * [刪除元素屬性]: 元素.removeAttribute(name)
 * [取得元素文本內容]: 元素.textContent
 * [取得子元素數量]: 元素.childElementCount
 * [取得子元素]: 元素.children
 * 
 * Todo (可配合 .add() / .remov())
 * [取得元素 Html]: 元素.innerHTML (設置: 元素1.innerHTML = html)
 * [獲取元素 文本]: 元素.innerText (同上)
 * [獲取/設置 樣式]: 元素.style
 * [獲取/設置 類別]: 元素.classList
 * 
 * 直接取得標籤:
 * document.title <title>
 * document.head <head>
 * document.body <body>
 * document.scripts <script>
 * document.forms <form>
 * document.images <img>
 * document.links <a>
 * 
 * document.cookie 獲取 cookie
 * document.styleSheets 獲取樣式表
 * document.lastModified 文檔最後修改時間
 * document.characterSet 使用字符編碼
 * document.activeElement 獲取當前網頁焦點元素
 * document.visibilityState 可見狀態
 * document.referrer 來源位置
 * document.domain 文檔網域
 * document.location 文檔位置資訊
 * document.URL 網頁連結
 * document.documentURI 文件連結
 */

/**_________________________
 ** { location API }
 * 
 * window.* (全域) [window.location.href] 獲取完整資訊, 其實基本上和簡化版差不多
 * location.* (簡化版)
 * 
 * [重新載入]: location.reload()
 * [重新導向]: location.assign(url)
 * [替換Url]: location.replace(url)
 * [新狀態替換, 並更新Url]: location.replaceState(stateObj, title, url)
 * [新歷史替換, 並更新Url]: location.pushState(stateObj, title, url)
 * 
 * [網址]: location.href
 * [域名]: location.host (包含端口) / location.hostname (不包含端口)
 * [端口]: location.port
 * [協議]: location.protocol (https)
 * [域名前半]: location.origin (包含域名)
 * [域名後半]: location.pathname (不包含域名)
 * [搜尋符 ? 後面]: location.search
 * [片段符 # 後面]: location.hash
 */

/**_________________________
 ** { addEventListener API }
 * 
 * 元素.addEventListener("監聽類型", "監聽後工作", {附加功能});
 * 
 * 監聽類型:
 * [滑鼠點擊]: "click"
 * [滑鼠滾動]: "scroll"
 * [滑鼠放開]: "mouseup"
 * [滑鼠按下]: "mousedown"
 * [滑鼠懸浮]: "mouseenter"
 * [滑鼠離開]: "mouseleave"
 * [滑鼠於元素上移動]: "mousemove"
 * [鍵盤放開]: "keyup"
 * [鍵盤按下]: "keydown"
 * [元素獲得焦點]: "focus" (通常用於 input 或 textarea)
 * [元素失去焦點]: "blur" (通常用於 input 或 textarea)
 * [提交表單]: "submit"
 * [大小調整]: "resize"
 * [頁面資源載入完成]: "load" (通常用於圖片、音頻、影片等)
 * [DOM 樹載入完成]: "DOMContentLoaded"
 * [歷史紀錄變化]: "popstate" (url 的轉變)
 * [用戶離開頁面]: "beforeunload"
 * 
 * 監聽後工作:
 * document.addEventListener("監聽類型", event => {
 * event.preventDefault() 防止默認行為, 例如跳轉, 送出表單等
 * event.stopPropagation() 防止事件傳播, 用於事件只作用在特定元素
 * event.stopImmediatePropagation() 與上方功能類似, 並防止呼叫其他相同事件類型的事件監聽器
 * event.type 觸發的事件類型
 * event.target 獲取事件物件
 * event.currentTarget 獲取事件觸發元素
 * event.key 獲取鍵盤相關鍵值
 * event.keyCode
 * event.clientX 獲取滑鼠觸發的座標
 * event.clientY
 * })
 * 
 * 附加功能:
 * { capture: true } 立即觸發, 預設是冒泡階段才觸發
 * { once: true } 一次性監聽, 觸發後立即移除
 * { passive: true } 被動模式, 當監聽器不會使用, preventDefault() 取消默認, 添加該參數可提高性能
 */

/**_________________________
 ** { navigator API }
 * 
 * 瀏覽器資訊:
 * navigator.appVersion
 * navigator.userAgent (兩個功能類似, userAgent 比較新)
 * navigator.userAgentData (較完整數據)
 * 
 * [瀏覽器語言]: navigator.language
 * [CPU 核心數]: navigator.hardwareConcurrency
 * [是否聯網]: navigator.onLine
 * [網路資訊]: navigator.connection
 * [使用的serviceWorker]: navigator.serviceWorker
 * [是否啟用Cookie]: navigator.cookieEnabled
 * [媒體元數據]: navigator.mediaSession
 * [頁面激活狀態]: navigator.userActivation
 * [自動化狀態]: navigator.webdriver
 * [內存量]: navigator.deviceMemory (單位 GB)
 */

/**_________________________
 ** { Object 處理 API }
 * 
 * Object.assign(目標, ...來源) [一或多個來源的 Object 合併到目標 Objec
 * Object.keys(物件) [獲取 Object 的 key 值]
 * Object.values(物件) [獲取 Object 的 value 值]
 * Object.entries(物件) [獲取 Object 的, key / value 值]
 * Object.is(物件1, 物件2) [判斷物件是否相同]
 * Object.freeze(物件) [凍結 Object 防止修改]
 * Object.preventExtensions(物件) [防止 Object 擴展]
 */

/**_________________________
 ** { JSON API }
 * 
 * [解析Json為 js 對象]: JSON.parse(JsonString);
 * [js 對象 轉為 Json]: JSON.stringify(Js物件, 替換/null, 縮排/4)
 */

/**_________________________
 ** { 計算處理時間 API}
 *  開始時間 = performance.now()
 *  運行方法...
 *  結束時間 = performance.now()
 *  總共時間 = 結束時間 - 開始時間
 * 
 *  另一種方式
 *  console.time("運行計算")
 *  運行方法...
 *  console.timeEnd("運行計算")
 */
}

/* ==================================================== */

/**
 ** { 簡化查找 DOM 的 API [並非最高效率的寫法] }
 * 
 * @param {string} Selector - 查找元素
 * @param {boolean} All     - 是否查找全部
 * @param {element} Source  - 查找的源頭
 * @returns {element}       - DOM 元素
 * 
 * @example
 * 獲取 = $$("要找的DOM", 使否查找所有, 查找的來源)
 */
function $$(Selector, All=false, Source=document) {
    if (All) {return Source.querySelectorAll(Selector)}
    else {
        const slice = Selector.slice(1);
        const analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : Selector[0];
        switch (analyze) {
            case "#": return Source.getElementById(slice);
            case " ": return Source.querySelector(Selector);
            case ".": return Source.getElementsByClassName(slice)[0];
            default: return Source.getElementsByTagName(Selector)[0];
        }
    }
}

/* ==================================================== */

/**
 ** { 添加 Css 樣式表 API }
 * 
 * @param {string} Rule - Css 樣式規則
 * @param {string} ID   - 創建 ID
 * 
 * @example
 * addstyle(`
 *      . class {
 *          樣式
 *      }
 * `, "ID")
 */
async function addstyle(Rule, ID="Add-Style") {
    let new_style = document.getElementById(ID);
    if (!new_style) {
        new_style = document.createElement("style");
        new_style.id = ID;
        document.head.appendChild(new_style);
    }
    new_style.appendChild(document.createTextNode(Rule));
}

/* ==================================================== */

/**
 ** { 添加 Script 腳本 API }
 * 
 * @param {string} Rule - Js 語法
 * @param {string} ID   - 創建 ID
 * 
 * @example
 * addscript(`
 *      var a = 0;
 *      console.log(a);
 * `, "ID")
 */
async function addscript(Rule, ID="Add-script") {
    let new_script = document.getElementById(ID);
    if (!new_script) {
        new_script = document.createElement("script");
        new_script.id = ID;
        document.head.appendChild(new_script);
    }
    new_script.appendChild(document.createTextNode(Rule));
}

/* ==================================================== */
// ListenerRecord 是用來記錄添加的, 監聽器
let ListenerRecord = new Map(), listen;

/**
 ** { 添加 監聽器 API }
 * 
 * @param {string} element  - 添加元素
 * @param {string} type     - 監聽器類型
 * @param {*} listener      - 監聽後操作
 * @param {object} add      - 附加功能
 * 
 * @example
 * addlistener("元素", "click", (e) => {
 *      操作
 * })
 */
async function addlistener(element, type, listener, add={}) {
    if (!ListenerRecord.has(element) || !ListenerRecord.get(element).has(type)) {
        element.addEventListener(type, listener, add);
        if (!ListenerRecord.has(element)) {
            ListenerRecord.set(element, new Map());
        }
        ListenerRecord.get(element).set(type, listener);
    }
}
/* 簡化版 */
async function addlistener(element, type, listener, add={}) {
    element.addEventListener(type, listener, add);
}

/**
 ** { 刪除 監聽器 API }
 * 
 * @param {string} element  - 添加元素
 * @param {string} type     - 監聽器類型
 * 
 * @example
 * 會自動從紀錄的 ListenerRecord 取出數據進行監聽器的刪除
 * removlistener("元素", "click")
 */
async function removlistener(element, type) {
    if (ListenerRecord.has(element) && ListenerRecord.get(element).has(type)) {
        listen = ListenerRecord.get(element).get(type);
        element.removeEventListener(type, listen);
        ListenerRecord.get(element).delete(type);
    }
}

/* ==================================================== */

/**
 ** { 等待元素出現的 API }
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
async function WaitElem(selector, all, timeout, callback) {
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
    timer = setTimeout(() => {
        observer.disconnect();
    }, (1000 * timeout));
}

//! 查找的部份可用 switch 或 if 切換, 匹配類型自由搭配

/**
 ** { 等待元素出現的 API (Map 物件版) }
 * 
 * @param {string} selector     - 等待元素
 * @param {number} timeout      - 等待超時 (秒數)
 * @param {function} callback   - 回條函式
 * 
 * @example
 * element = ["元素1", "元素2", "元素3"]
 * 
 * WaitElem(element, 1, call => {
 *      全部找到後續操作...
 *      const [元素1, 元素2, 元素3] = call;
 * })
 */
async function WaitElem(selectors, timeout, callback) {
    let timer, elements;
    const observer = new MutationObserver(() => {
        elements = selectors.map(selector => document.getElementById(selector))
        if (elements.every(element => element)) {
            observer.disconnect();
            clearTimeout(timer);
            callback(elements);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = setTimeout(() => {
        observer.disconnect();
    }, (1000 * timeout));
}

/* ==================================================== */

/**
 ** { Worker 的工作創建 API }
 * 
 * @param {*} code  - 放入後台工作的代碼
 * 
 * @example
 * const worker = WorkerCreation(`
 *      接收傳遞訊息
 *      onmessage = function(e) {
 *          const {value1, value2, ...} = e.data;
 *      }
 * 
 *      其餘操作...
 * 
 *      回傳結果訊息
 *      postMessage({result1: 1, result2: 2, ...});
 * `)
 * 
 * 傳遞訊息
 * worker.postMessage({value1: 1, value2: 2, ...});
 * 
 * 接收回傳訊息
 * worker.onmessage = function(e) {
 *   const {result1, result2, ...} = e.data;
 *   接收後操作...
 * }
 */
function WorkerCreation(code) {
    let blob = new Blob([code], {type: "application/javascript"});
    return new Worker(URL.createObjectURL(blob));
}

/* ==================================================== */

/**
 ** {控制台打印 API}
 *
 * @param {*} label     - 打印的數據
 * @param {string} type - 要打印的類型
 * 
 * @example
 * log("打印文字")
 * log("打印錯誤", "error")
 */
function log(label, type="log") {
    const style = {
        group: `padding: 5px;color: #ffffff;font-weight: bold;border-radius: 5px;background-color: #54d6f7;`,
        text: `padding: 3px;color: #ffffff;border-radius: 2px;background-color: #1dc52b;`
    }, template = {
        log: label=> console.log(`%c${label}`, style.text),
        warn: label=> console.warn(`%c${label}`, style.text),
        error: label=> console.error(`%c${label}`, style.text),
        count: label=> console.count(label),
    }
    type = typeof type === "string" && template[type] ? type : type = "log";
    console.groupCollapsed("%c___ 開發除錯 ___", style.group);
    template[type](label);
    console.groupEnd();
}

/* ==================================================== */
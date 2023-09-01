/*window.addEventListener('popstate', function(event) {
    console.log('URL 地址變化:', window.location.href);
});*/
// { capture: true } { passive: true }

/* ==================================================== */

/**
 * 添加 Css 樣式表 API
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
async function addstyle(Rule, ID="New-Add-Style") {
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
 * 添加 Script 腳本 API
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
async function addscript(Rule, ID="New-Add-script") {
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
 * 添加 監聽器 API
 * 
 * @param {string} element  - 添加元素
 * @param {string} type     - 監聽器類型
 * @param {*} listener      - 監聽後操作
 * 
 * @example
 * addlistener("元素", "click", (e) => {
 *      操作
 * })
 */
async function addlistener(element, type, listener) {
    if (!ListenerRecord.has(element) || !ListenerRecord.get(element).has(type)) {
        element.addEventListener(type, listener, true);
        if (!ListenerRecord.has(element)) {
            ListenerRecord.set(element, new Map());
        }
        ListenerRecord.get(element).set(type, listener);
    }
}

/**
 * 刪除 監聽器 API
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
 * 等待元素出現的 API (並非所有狀況都適用, 有時使用 setInterval 會更好)
 * 
 * @param {string} selector     - 等待元素
 * @param {boolean} all         - 是否多選
 * @param {number} timeout      - 等待超時
 * @param {function} callback   - 回條函式
 * 
 * @example
 * WaitElem("元素", false, 1000, call => {
 *      後續操作...
 *      console.log(call);
 * })
 */
async function WaitElem(selector, all, timeout, callback) {
    let timer;
    const observer = new MutationObserver(() => {
        if (all) {
            const element = document.querySelectorAll(selector);
            if (element.length > 0) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        } else {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = setTimeout(() => {
        observer.disconnect();
    }, timeout);
}

/* ==================================================== */
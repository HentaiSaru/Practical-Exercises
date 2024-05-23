class Collection {
/**_________________________
 ** { document }
 *
 * [ID元素]: document.getElementById(id)
 * [Tag 標籤列表]: document.getElementsByTagName(tagName)
 * [Class 元素列表]: document.getElementsByClassName(className)
 * [多選器, 匹配的第一元素]: document.querySelector(tag /.class /#id)
 * [多選器, 匹配的所有元素]: document.querySelectorAll(同上)
 * [創建元素節點]: document.createElement(tagName)
 * [創建文本的節點]: document.createTextNode(text)
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
 * [取得元素第一個子節點]: 元素.firstElementChild
 * [取得元素最後一個子節點]: 元素.lastElementChild
 *
 * Todo (可配合 .add() / .remov())
 * [取得元素 Html]: 元素.innerHTML (設置: 元素1.innerHTML = html)
 * [獲取元素 文本]: 元素.innerText (同上)
 * [獲取/設置 樣式]: 元素.style
 * [獲取/設置 類別]: 元素.classList
 *
 * 直接取得標籤:
 * document.title <title>
 * document.documentElement <html>
 * document.head <head>
 * document.body <body>
 * document.scripts <script>
 * document.embeds <embed>
 * document.forms <form>
 * document.fonts <字體>
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
 ** { location }
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
 ** { addEventListener }
 *
 * 元素.addEventListener("監聽類型", "監聽後工作", {附加功能});
 *
 *? 只能在控制台使用 (獲取整個頁面的監聽器)
 * window.getEventListeners(對象).監聽器類型
 *
 * 監聽類型:
 *? 滑鼠事件 / 對應手機端指針
 * [滑鼠點擊]: "click"
 * [滑鼠點兩下]: "dblclick"
 * [滑鼠滾動]: "scroll"
 * [滑鼠放開]: "mouseup" / "pointerup"
 * [滑鼠按下]: "mousedown" / "pointerdown"
 * [滑鼠移入]: "mouseover" / "pointerover" | 在目標上反覆觸發
 * [滑鼠移開]: "mouseout" / "pointerout" | 在目標外反覆觸發
 * [滑鼠進入]: "mouseenter" / "pointerenter" | 進入觸發一次
 * [滑鼠離開]: "mouseleave" / "pointerleave" | 離開觸發一次
 * [滑鼠於元素上移動]: "mousemove" / "pointermove"
 *
 *? 手機觸碰事件
 * [手機按下]: "touchstart"
 * [手機放開]: "touchend"
 * [手機滑動]: "touchmove"
 *
 * ? 鍵盤事件
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
 *? 監聽後事件:
 * document.addEventListener("監聽類型", event => {
 * event.preventDefault() 防止默認行為, 例如跳轉, 送出表單等
 * event.stopPropagation() 防止事件傳播, 用於事件只作用在特定元素
 * event.stopImmediatePropagation() 與上方功能類似, 並防止呼叫其他相同事件類型的事件監聽器
 *
 * event.type 觸發的事件類型
 * event.target 獲取事件物件
 * event.currentTarget 獲取事件觸發元素
 *
 * event.key 獲取鍵盤相關鍵值
 * event.keyCode 鍵排按鈕的 code 碼
 * event.clientX 獲取滑鼠觸發的座標
 * event.clientY
 * })
 *
 * 附加選項:
 * { capture: true } 立即觸發, 預設是冒泡階段才觸發
 * { once: true } 一次性監聽, 觸發後立即移除
 * { passive: true } 被動模式, 當監聽器不會使用, preventDefault() 取消默認, 添加該參數可提高性能
 */

/**_________________________
 ** { navigator }
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
 ** { Object }
 *
 * Object.assign(目標, ...來源) [一或多個來源的 Object 合併到目標 Objec]
 * Object.keys(物件) [獲取 Object 的 key 值]
 * Object.values(物件) [獲取 Object 的 value 值]
 * Object.entries(物件) [獲取 Object 的, key / value 值]
 * Object.is(物件1, 物件2) [判斷物件是否相同]
 * Object.freeze(物件) [凍結 Object 防止修改]
 * Object.preventExtensions(物件) [防止 Object 擴展]
 * Object.sort((a, b) => b - a); [小到大排序, 反過來就寫 a - b]
 */

/**_________________________
 ** { Array (可使用 Object 類型的一些 api, 但基本用不到) }
 *
 * Array.length [獲取陣列的長度]
 *
 * 添加
 * Array.from() [字串轉陣列]
 * Array.push(新元素) [添加新元素到陣列末端]
 * Array.unshift(新元素) [添加新元素到陣列前端]
 * Array.concat(arr1, arr2, arrn) [將陣列合併, 回傳新的陣列]
 *
 * 刪除
 * Array.pop() [刪除陣列其他元素, 回傳最後一項的值]
 * Array.shift() [刪除陣列其他元素, 回傳第一項的值]
 *
 * 修改
 * Array.flat() [將多維的 陣列 平攤成 一維]
 * Array.join() [輸入值 以該值作為連結字, 例如 * 就會獲取所有 陣列 的數據, 並且以 * 連結]
 * Array.copyWithin() [輸入指定範圍, 複製該範圍的值, 填充陣列]
 * Array.slice(開始索引, 結束索引) [回傳陣列的切片範圍]
 * Array.splice(開始索引, 刪除數量, 選擇新添加元素) [添加刪除或替換陣列中的元素, 修改原始陣列]
 *
 * Array.sort(); [以字母順序進行排序]
 * Array.toSorted(); [與 sort 一樣進行排序, 但他會創新的陣列 , 而不是修改原數據]
 * Array.reverse(); [反轉順序]
 * Array.toReversed() [與 reverse 一樣進行反轉, 但他會創新的陣列 , 而不是修改原數據
 *
 * 數字的排序
 * Array.sort(function(a, b){return a - b}); [升序]
 * Array.sort(function(a, b){return b - a}); [降序]
 *
 * 查找
 * Array.at(索引) [獲取該索引值數據]
 * Array.findLast(查找元素) [重後方查找, 回傳第一個找到的值]
 * Array.indexOf(查找元素, 可選開始索引) [從前面開始查找, 找到就回傳索引, 找不到回傳 -1]
 * Array.lastIndexOf(查找元素, 可選開始索引) [從後面面開始查找, 找到就回傳索引, 找不到回傳 -1]
 * Array.includes(查找元素) [查找是否包含該元素, 回傳 boolean]
 *
 * 帶參數的查找, 回傳 True / False
 * Array.find((查找元素, 查找索引) => { 找到符合條件的值, 沒有就是 undefined })
 * Array.findIndex((查找元素, 查找索引) => { 找到符合條件的索引值, 沒有就是 -1 })
 * Array.findLastIndex() [同上 但重後方開始找]
 *
 * 不帶參數的查找, 回傳符合條件的值
 * Array.find(number => number > 5) [回傳第一個大於 5 的數值]
 * Array.findIndex(number => number > 5) [回傳第一個大於 5 的索引值]
 *
 * Array.forEach() [遍歷數據]
 * Array.filter(number => number % 2 == 0) [過濾出所有的偶數並回傳]
 * Array.reduce((累加值, 當前值) => {return 累加值 + 當前值}, 初始值) [對陣列進行累加]
 * Array.map(參數 => 操作邏輯) [回傳符合邏輯處理後的結果]
 * Array.flatMap() [同上, 但多一個將多維 平攤的功能]
 * Array.reduceRight() [同上, 但反著重後面開始]
 * Array.every(參數 => 判斷) [當所有參數都符合判斷, 回傳 True 反之 False]
 * Array.some(參數 => 判斷) [只要有一個符合判斷, 回傳 True 反之 False]
 */

 /**_________________________
 ** { String }
 *
 * 字串的處理:
 * String.length [獲取字串長度, 不包含 0 有幾個字就是多少]
 * String.charAt() [獲取字串中指定索引值]
 * String.at() [功能與上面差不多]
 * String.charCodeAt() [獲取字串中指定索引值 的 UTF-16 code]
 * String.split(分割字串) [以分割字串為分割點, 將一個字串分割成陣列]
 * String.slice() [進行字串切片, 可提供兩個索引值, 也可是負數, 邏輯與 Python 的切片差不多]
 * String.substring() [只回傳指定索引之間的字串, 其餘的將被排除]
 * String.toUpperCase() [字串都轉大寫]
 * String.toLowerCase() [字串都轉小寫]
 * String.concat(A, B) [用於字串的連結] (用 + 或 `` 模板比較方便吧 w)
 * String.trim() [刪除前後空格]
 * String.trimStart() [只刪除前空格]
 * String.trimEnd() [只刪除後空格]
 * String.padStart(填充數, 填充值) [重前面開始填充, 直到該字串的長度, 與填充數相同, 只有小於填充數的才會運行]
 * String.padEnd(填充數, 填充值) [基本同上, 但重後面來]
 * String.repeat(重複數) [用同一個字串, 根據重複數, 進行累加填充]
 * String.replace(指定字串, 替換的字串) [將字串中的指定字串, 替換成其他字串, 可用正則]
 * String.replaceAll() [基本同上, 但 replace 只會改第一個找到的指定字串, 後續不會變更, 但是使用正則的 /g 就會和 replaceAll 相同]
 *
 * 字串的查找 (查找都可用正則):
 * String.indexOf("查找字串") [查找字串第一次出現的索引位置, 沒找到就回傳 -1]
 * String.search("查找字串") [同上一樣是查找字串, 但不允許添加第二參數, 也就是查找的起始位置, 另外兩個可以]
 * String.lastIndexOf("查找字串") [同上, 但重後面開始找]
 * String.match() [回傳匹配成功的字串]
 * String.matchAll() [回傳 iterator]
 *
 * 字串的判斷:
 * String.startsWith() [是否已指定字串開頭]
 * String.endsWith() [是否已指定字串結尾]
 * String.includes() [是否包含指定字串]
 */

/**_________________________
 ** { Number }
 *
 * BigInt(Number) [轉換長整數]
 * Number.isInteger() [判斷是否是整數]
 * Number.toString() [轉換字串]
 * Number.toFixed(2) [回傳小數點位數到第二位 字串]
 * Number.toPrecision(2) [回傳指定長度的數字]
 *
 * Number() [轉換為整數 類型]
 * parseFloat() [解析為浮點數]
 * parseInt() [解析為整數]
 */

/**_________________________
 ** { JSON }
 *
 * [解析Json為 js 對象]: JSON.parse(JsonString);
 * [js 對象 轉為 Json]: JSON.stringify(Js物件, 替換/null, 縮排/4)
 */

/**_________________________
 ** { 計算處理時間 }
 *  開始時間 = performance.now() | Date.now()
 *  運行方法...
 *  結束時間 = performance.now() | Date.now()
 *  總共時間 = 結束時間 - 開始時間
 *
 *  另一種方式
 *  console.time("運行計算")
 *  運行方法...
 *  console.timeEnd("運行計算")
 */

/**_________________________
 ** { 正則尾部匹配標誌 }
 *
 * /一個正則/i [不區分大小寫]
 * /一個正則/g [全域匹配]
 */
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
async function log(label, type="log") {
    const style = {
        group: `padding: 5px;color: #ffffff;font-weight: bold;border-radius: 5px;background-color: #54d6f7;`,
        text: `padding: 3px;color: #ffffff;border-radius: 2px;background-color: #1dc52b;`
    }, print = {
        log: label=> console.log(`%c${label}`, style.text),
        warn: label=> console.warn(`%c${label}`, style.text),
        error: label=> console.error(`%c${label}`, style.text),
        count: label=> console.count(label),
    }
    type = typeof type === "string" && print[type] ? type : type = "log";
    console.groupCollapsed("%c___ 開發除錯 ___", style.group);
    print[type](label);
    console.groupEnd();
}

/**
 ** {控制台打印 API (無樣式, 增強版)}
 *
 * @param {*} group     - 打印的標籤
 * @param {*} label     - 打印的數據
 * @param {string} type - 要打印的類型
 * 
 * @example
 * log("標籤", "打印文字", "打印類型")
 */
async function log(group=null, label="print", type="log") {
    const print = {
        log: label=> console.log(label),
        warn: label=> console.warn(label),
        error: label=> console.error(label),
        count: label=> console.count(label),
    }
    type = typeof type === "string" && print[type] ? type : type = "log";
    if (group == null) {
        print[type](label);
    } else {
        console.groupCollapsed(group);
        print[type](label);
        console.groupEnd();
    }
}
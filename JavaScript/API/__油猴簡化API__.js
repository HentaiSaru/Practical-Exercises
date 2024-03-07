/**
 ** { 菜單註冊 API }
 * 
 * // @grant GM_registerMenuCommand
 * 
 * @param {*} item  - 創建菜單的物件
 * @example
 * Menu({
 *      "菜單1": ()=> 方法1(),
 *      "菜單2": ()=> 方法2(),
 *      ...
 * })
 */
async function Menu(item) {
    for (const [name, call] of Object.entries(item)) {
        GM_registerMenuCommand(name, ()=> {call()});
    }
}

/* ==================================================== */

/**
 ** { 操作存储空間 (精簡版) }
 * 
 * // @grant GM_setValue
 * // @grant GM_getValue
 * // @grant GM_listValues
 * // @grant GM_deleteValue
 * 
 * @param {string} operate - 操作類型 ("del", "all", "set", "get", "sjs", "gjs")
 * @param {string} key     - 操作數據索引Key
 * @param {*} orig         - 原始的回傳值
 * @returns {data}         - 獲取的數據值
 *
 * @example
 * 數據A = store("get", "資料A")
 * store("setjs", "資料B", "數據B")
 */
function store(operation, key=null, value=null) {
    const verify = val => (val !== void 0 ? val : null);
    return {
        del: (key) => GM_deleteValue(key),
        all: () => verify(GM_listValues()),
        set: (key, value) => GM_setValue(key, value),
        get: (key, defaultValue) => verify(GM_getValue(key, defaultValue)),
        sjs: (key, value) => GM_setValue(key, JSON.stringify(value, null, 4)),
        gjs: (key, defaultValue) => JSON.parse(verify(GM_getValue(key, defaultValue)))
    }[operation](key, value);
}

/**
 ** { 操作存储空間(廢棄) }
 *
 * 使用方法只有差在, 在程式開頭要宣告 GM
 * 改版的有對數據處理做優化
 */
let GM;
function store(operate, key, orig=null){
    if (typeof GM === "undefined") {
        GM = {
            __verify: val => val !== undefined ? val : null,
            set: function(val, put) {GM_setValue(val, put)},
            get: function(val, call) {return this.__verify(GM_getValue(val, call))},
            setjs: function(val, put) {GM_setValue(val, JSON.stringify(put, null, 4))},
            getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
        }
    }
    switch (operate[0]) {
        case "g": return GM[operate](key, orig);
        case "s": return orig !== null ? GM[operate](key, orig) : null;
        default: return new Error("wrong type of operation");
    }
}

/* ==================================================== */
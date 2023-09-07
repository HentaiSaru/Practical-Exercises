/**
 ** { 菜單註冊 API }
 * 
 * @grant GM_registerMenuCommand
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
 ** { 操作存储空間 }
 * 
 * @grant GM_setValue
 * @grant GM_getValue
 * 
 * @param {string} operate - 操作類型 ("set", "get", "setjs", "getjs")
 * @param {string} key     - 操作數據索引Key
 * @param {*} orig         - 原始的回傳值
 * @returns {data}         - 獲取的數據值
 * 
 * @example
 * 數據A = store("get", "資料A")
 * store("setjs", "資料B", "數據B")
 */
function store(operate, key, orig=null){
    return {
        __verify: val => val !== undefined ? val : null,
        set: function(val, put) {return GM_setValue(val, put)},
        get: function(val, call) {return this.__verify(GM_getValue(val, call))},
        setjs: function(val, put) {return GM_setValue(val, JSON.stringify(put, null, 4))},
        getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
    }[operate](key, orig);
}
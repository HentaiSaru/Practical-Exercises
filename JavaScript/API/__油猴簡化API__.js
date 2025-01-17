/**
 ** { 菜單註冊 API }
 * 
 * // @grant GM_registerMenuCommand
 * 
 * @param {object} Item  - 創建菜單的物件
 * @param {string} ID  - 創建菜單的 ID
 * @example
 * Menu({
 * "菜單1": {
 *     func: 方法1(),
 *     hotkey: "a",
 *     close: true,
 * },
 * "菜單2": { func: 方法2() }
 *}, "ID");
 */
async function Menu(Item, ID="Menu") {
    let Index = 1;
    for (const [Name, options] of Object.entries(Item)) {
        GM_registerMenuCommand(Name, ()=> {options.func()}, {
            title: options.desc,
            id: `${ID}-${Index++}`,
            autoClose: options.close,
            accessKey: options.hotkey,
        });
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
    const verify = (val) => (val != void 0 && val != null ? val : null);
    return {
        del: (key) => GM_deleteValue(key),
        all: () => verify(GM_listValues()),
        set: (key, value) => verify(GM_setValue(key, value)),
        get: (key, Value) => verify(GM_getValue(key, Value)),
        sjs: (key, value) => GM_setValue(key, JSON.stringify(value, null, 4)),
        gjs: (key, Value) => JSON.parse(verify(GM_getValue(key, Value)))
    }[operation](key, value);
}

/**
 ** { 操作存储空間 }
 *
 * 該函數需要在程式開頭要宣告 GM
 * 改版的有對數據處理做優化, 且有驗證存入類型, 無法存入空數據
 */
let GM;
function store(operate, key, orig=null){
    if (typeof GM === "undefined") {
        GM = {
            verify: (val) => (val != void 0 && val != null ? val : null),
            set: function(val, put) {GM_setValue(val, put)},
            get: function(val, call) {return this.verify(GM_getValue(val, call))},
            setjs: function(val, put) {GM_setValue(val, JSON.stringify(put, null, 4))},
            getjs: function(val, call) {return JSON.parse(this.verify(GM_getValue(val, call)))},
        }
    }
    switch (operate[0]) {
        case "g": return GM[operate](key, orig);
        case "s": return GM.verify(orig) ? GM[operate](key, orig) : null;
        default: return new Error("wrong type of operation");
    }
}

/* ==================================================== */

/**
 * { 監聽保存值的變化 }
 * 
 * // @grant GM_addValueChangeListener
 * @param {array} object - 一個可遍歷的, 標籤對象物件
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
 *      console.log(call.Key, call.nv);
 * })
 */
async function storeListen(object, callback) {
    object.forEach(label => {
        GM_addValueChangeListener(label, function(Key, old_value, new_value, remote) {
            callback({key: Key, ov: old_value, nv: new_value, far: remote});
        })
    })
}
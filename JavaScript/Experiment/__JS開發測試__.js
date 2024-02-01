let s = /^\s*(\/\*|""")/
let e = /\s*(\*\/|""")\r$/
let p = [];
let t = `/** ---------------------/
    * 設置實驗 json 分類輸出格式
    * 原始連結: "orlink"
    * 圖片數量: "imgnb"
    * 影片數量: "videonb"
    * 連結數量: "dllink"
    * 排除模式: "FilterMode"
    * 唯一模式: "OnlyMode"
    */\r`

for (const a of t.split("\n")) {
    p.push(a);
}

for (const a of p) {
    console.log(`(${s.test(a)}|${e.test(a)}): ${a}`);
}
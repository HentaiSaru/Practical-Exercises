// 特殊函數定義
const sum = new Function("a", "b", "return a + b");
console.log(sum(10, 10));

const str = new Function("str", "return str + ' World'");
console.log(str("Hello"));

// 動態綁定
const book = {
    title: "書本標題",
    author: "作者",
    page: 50,
}
with(book) {
    console.log("標題", title);
    console.log("作者", author);
    console.log("頁數", page);
}

// 轉型
var number = +"50"
console.log(number + 50);
number = parseInt("50");
console.log(number);

function HexToRgba(hex, opacity=1) {
    return `rgba(${+("0x"+hex.slice(1, 3))}, ${+("0x"+hex.slice(3, 5))}, ${+("0x"+hex.slice(5, 7))}, ${opacity})`;
}
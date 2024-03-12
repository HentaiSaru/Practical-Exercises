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

// 轉型 (數字)
var number = +"50"
console.log(number + 50);

number = parseInt("50");
console.log(number);

// 轉型規則
console.log("10" + 20 + 30); // 如果是 + 會先判斷開頭的類型, 並將後面的內容進行轉型, 得到 102030
console.log(10 + 20 + "30"); // 反著以數字相加後加上字串 3030
// 如果不是 + 運算, 會嘗試將字串轉為數字, 如果字串非數字, 將會得到 NaN
console.log(10 - "2");
console.log(10 * "2");
console.log(10 / "2");

function HexToRgba(hex, opacity=1) {
    return `rgba(${+("0x"+hex.slice(1, 3))}, ${+("0x"+hex.slice(3, 5))}, ${+("0x"+hex.slice(5, 7))}, ${opacity})`;
}

// 科學記號表示 (1萬, e 代表 10 後面的數字為次方, 所以 1e4 = 1 * 10 ^ 4)
console.log(1e4);

// true, false 簡短表示
console.log(!0);
console.log(!1);
function MegaAnalysis(data) {
    let title_box = [], link_box = [], result = {}, pass;
    for (let i=0; i<data.length; i++) {
        const str = data[i].textContent.trim();
        if (str.startsWith("Pass")) { // 解析密碼字串
            const ps = data[i].innerHTML.match(/Pass:([^<]*)/);
            try {pass = `Pass : ${ps[1].trim()}`} catch {pass = str}
        } else if (str.toUpperCase() == "MEGA") {
            link_box.push(data[i].parentElement.href);
        } else {
            title_box.push(str.replace(":", "").trim());
        }
    }
    // 合併數據
    for (let i=0; i<title_box.length; i++) {
        result[title_box[i]] = link_box[i]
    }
    return { pass, result };
}
const {pass, result} = MegaAnalysis(document.querySelectorAll("div.post__content strong"));
const link_box = {}
if (pass != undefined) {
    console.log("定義");
} else {
    console.log("未定異");
}
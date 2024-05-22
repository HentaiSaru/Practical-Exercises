/**
 * * { 用於解析格式, 回傳匹配模板的結果 }
 * @param {object} template - 可被匹配的模板
 * @param {string|object} format - 匹配的格式字串, 要匹配模板的對應 key, 使用 {key} 來標記
 * @returns {string}
 *
 * @example
 * format 是字串, template 不傳參
 * format 是物件, template 可自由設置, 傳參或是不傳參
 *
 * const template {
 *      Title: "一個標題",
 *      Name: ()=> 處理邏輯 
 * };
 *
 * const format = "{Title} {Name} {Title}";
 * const result = FormatTemplate(template, format);
 * console.log(result);
 */
function FormatTemplate(template, format) {
    const Type = (object) => Object.prototype.toString.call(object).slice(8, -1);

    if (Type(template) !== "Object") {
        return "Template must be an object";
    }

    // 將 template 的 keys 轉換成小寫
    template = Object.fromEntries(
        Object.entries(template).map(([key, value]) => [key.toLowerCase(), value])
    );

    // 宣告處理的函數, 解析內容
    const Process = (key, value=null) => {
        const temp = template[key.toLowerCase()];
        return Type(temp) === "Function"
            ? temp(value)
            : (temp !== undefined ? temp : "None");
    }

    if (Type(format) === "String") {
        return format.replace(/\{\s*([^}\s]+)\s*\}/g, (match, key)=> Process(key));

    } else if (Type(format) === "Object") {
        return Object.entries(format).map(([key, value]) => Process(key, value));

    } else  {
        return {"Unsupported format": format};

    }
}
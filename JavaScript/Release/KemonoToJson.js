// ==UserScript==
// @name         Get Content Dictionary
// @version      0.0.1
// @author       HentiSaru
// @description  啟動後從當前頁面開始 , 獲取頁面數據 , 直到最後一頁 , 並將所有數據保存成 Json 下載

// @match        https://kemono.su/*
// @match        https://kemono.party/*
// @icon         https://kemono.party/static/favicon.ico

// @license      Apache
// @run-at       document-end

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand

// ==/UserScript==

/* 此腳本只支援 Google 的腳本格式 */

(function() {
    try {
        if (GM_getValue("Enabled", [])) {GetData();}
    } catch (error) {}
})();

/* ==================== 選項菜單 ==================== */
const GetCookiesAutomatically = GM_registerMenuCommand(
    "🔍 獲取內容 [期間請勿操作]",
    function() {
        GM_setValue("Enabled", true);
        GetData();
    }
)/* ==================== 選項菜單 ==================== */

/* ==================== 處理數據方法 ==================== */
function GetData() {
    // 保存的內容字典
    let ContentDict = {} , OrdDict , MergedDict;
    // 獲取內容元素
    let content = document.querySelector('.card-list__items').querySelectorAll('article.post-card');

    // 處理內容元素
    content.forEach(function(content) {
        let link = content.querySelector('a').getAttribute('href');
        let title = content.querySelector('.post-card__header').textContent.trim();
        ContentDict["https://kemono.party" + link] = title;
    });

    try {
        // 讀取先前保存的 OutDict
        OrdDict = JSON.parse(GM_getValue("OutDict", {}));
        // 進行合併
        MergedDict = Object.assign(OrdDict , ContentDict);
    } catch (error) {
        MergedDict = ContentDict;
    }

    // 內容排序
    Object.keys(MergedDict).sort();
    // 保存合併後的數據
    GM_setValue("OutDict", JSON.stringify(MergedDict, null, 4));
    NextPage();
}/* ==================== 處理數據方法 ==================== */

/* ==================== 下一頁自動化操作 ==================== */
function NextPage() {
    let nextButton = document.querySelector('.next');
    if (!nextButton) {
        OutputData(GM_getValue("OutDict", {}));
        GM_setValue("Enabled", false);
        GM_deleteValue("OutDict");
    } else {
        nextButton.click();
    }
}/* ==================== 下一頁自動化操作 ==================== */

/* ==================== 完成輸出下載 ==================== */
function OutputData(data) {
    // 作者名獲取
    const element = document.querySelector('span[itemprop="name"]');
    const author = element.textContent;

    // 創建下載連結元素
    const link = document.createElement("a");
    // 指定下載元素連結
    link.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);

    // 連結保存名
    link.download = author + ".json";
    //點擊下載
    link.click();
}/* ==================== 完成輸出下載 ==================== */
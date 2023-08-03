// ==UserScript==
// @name         腳本名稱
// @version      0.0.1
// @version      2000/01/01
// @author       作者名稱
// @description  腳本說明

// @website      作者網站
// @homepage     作者頁面

// @icon         腳本圖示
// @match        腳本使用網域
// @include      腳本使用網域 (要被淘汰)
// @exclude      腳本排除網域

// @license      授權類型
// @copyright    著作權
// @run-at       document-start (開始時注入)
// @run-at       document-body  (body存在時注入)
// @run-at       document-end   (等待DOM載入完成注入)

// @updateURL    更新URL
// @downloadURL  更新下載URL

// @require      請求外部腳本
// @resource     載入腳本資源 (使用 GM_getResourceURL 和 GM_getResourceText 的 API 來進行操作

// @grant        GM_addElement
// GM_addElement (父節點，標籤名稱，屬性) [只能用很簡單的DOM操作]

// @grant        GM_addStyle
// GM_addStyle(css樣式表)

// @grant        GM_download
// GM_download(url, abc.txt, headers, onload, onerror, onprogress, ontimeout)

// @grant        GM_getResourceText
// GM_getResourceText(腳本資源)

// @grant        GM_notification
// GM_notification(text文字, title標題, image圖片, silent是否播放通知音, timeout自動關閉時間, onclick通知被點觸發, ondone通知關閉觸發(自動關閉也算))

// @grant        GM_openInTab
// GM_openInTab("URL", active(新分頁是否轉移焦點), insert(是否插入至當前頁面的後方))

// @grant        GM_registerMenuCommand
// GM_registerMenuCommand(創建名稱 , 呼叫函數, 訪問快捷(s)當按下s可觸發) 創建菜單

// @grant        GM_unregisterMenuCommand
// GM_unregisterMenuCommand(創建名稱) 刪除菜單

// @grant        GM_setClipboard
// GM_setClipboard(訊息, 文本) 設置剪貼簿的文字

// @grant        GM_getTab
// GM_getTab(不同分頁數據取得)

// @grant        GM_saveTab
// GM_saveTab(不同分頁數據設置)

// @grant        GM_setValue
// GM_setValue(key , value)

// @grant        GM_getValue
// GM_getValue(key, null or [])

// @grant        GM_deleteValue
// GM_deleteValue(key)

// @grant        GM_listValues
// GM_listValues(返回所有保存值的列表)

// @grant        GM_xmlhttpRequest
// GM_xmlhttpRequest(設置資訊) 詳細於下方說明

// ==/UserScript==

/* https://www.tampermonkey.net/documentation.php?ext=dhdg */

/*  GM_addElement 使用文檔
    GM_addElement(document.getElementsByTagName('div')[0], 'img', {
      src: 'https://example.com/image.png'
    });
*///----------------------------------------------------------------//

/*  GM_download 使用文檔

    GM_download("http://example.com/file.txt", "file.txt");

    const download = GM_download({
        url: "http://example.com/file.txt",
        name: "file.txt",
        saveAs: true
    });

    window.setTimeout(() => download.abort(), 5000);
*///----------------------------------------------------------------//

/*  GM_getResourceText 使用文檔

    const scriptText = GM_getResourceText("myscript.js");
    const script = document.createElement("script");
    script.textContent = scriptText;
    document.body.appendChild(script);
*///----------------------------------------------------------------//

/*  GM_notification 使用文檔

    GM_notification({
        text: "測試文字",
        title: "測試標題",
    });
*///----------------------------------------------------------------//

/*  GM_xmlhttpRequest 使用文檔

    method : GET, HEAD, POST
    url : 請求URL
    headers : user-agent
    data : 發送字串
    cookie : 請求 cookie
    nocache : 不緩存資源
    revalidate : 重新驗證緩存
    timeout : 超時
    responseType : 響應類型 [arraybuffer, blob, json , stream]
    onerror : 請求失敗
    onload : 請求成功
    onprogress : 請求追蹤

    回傳 ->

    .response 回傳
    .readyState 請求就緒狀態
    .finalUrl 取得最終網址
    .status 請求的狀態
    .responseHeaders 請求的響應標頭
    .responseXML 回傳 XML
    .responseText 回傳 Text

    GM_xmlhttpRequest({
        method: "GET",
        url: "https://example.com/",
        headers: {
          "Content-Type": "application/json"
        },
        onload: function(response) {
          console.log(response.responseText);
        }
    });
*///----------------------------------------------------------------//
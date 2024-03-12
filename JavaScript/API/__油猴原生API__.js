// ==UserScript==
// @name         腳本名稱
// @name:en      英文名稱
// @version      0.0.1
// @version      2000/01/01
// @author       作者名稱
// @description  腳本說明
// @description:en 英文說明

// @website      作者網站
// @homepage     作者頁面
// @namespace    腳本頁面

// @icon         腳本圖示
// @iconURL      同上
// @icon64       高清版本圖示
// @icon64URL    同上
// @match        腳本使用網域
// @include      腳本使用網站
// @exclude      腳本排除網域

// @license      授權類型
// @copyright    著作權
// @run-at       document-start (開始時注入)
// @run-at       document-body  (body存在時注入)
// @run-at       document-idle  (在DOMContentLoaded 後注入)
// @run-at       document-end   (等待DOM載入完成注入)
// @run-at       context-menu   (菜單點選後注入)

// @connect *    設置檢索網域
// @noframes     禁止在 iframe 中運行
// @updateURL    檢查更新URL
// @downloadURL  更新下載URL
// @supportURL   用戶反饋網址

/**----------
 * @example
 * @require http://...js
 */
// @require      請求外部腳本

/**----------
 * @example
 * @resource css http://...
 * GM_addStyle(GM_getResourceText("css"))
 */
// @resource     載入Css資源 (使用 GM_getResourceURL 或 GM_getResourceText 的 API 來進行操作

/**----------
 * 使用以下 unsafeWindow 可以訪問窗口 API
 * @grant unsafeWindow
 * 
 * @grant window.focus
 * @grant window.close
 */

/**----------
 * @grant GM_addElement
 * @example - 添加元素
 * GM_addElement("父節點", "標籤", "屬性")
 * GM_addElement(document.body, "a", {
 *      href: "https://example.com/"
 * });
 */

/**----------
 * @grant GM_addStyle
 * @example - 添加樣式
 * GM_addStyle(css)
 * GM_addStyle(`
 *      .style {
 *          ...
 *       }
 *      ...
 * `)
 */

/**----------
 * @grant GM_download
 * @example - 下載
 * GM_download(url, file.txt, headers, onload, onerror, onprogress, ontimeout)
 * GM_download({
 *      url: "http://example.com/file.txt",
 *      name: "file.txt",
 *      saveAs: true,
 * })
 */

/**----------
 * @grant GM_getResourceText
 * @example - 載入資源文本
 * GM_getResourceText("資源")
 * cosst js = GM_getResourceText("script.js")
 * cosst css = GM_getResourceText("style.css")
 * 這就是一個文本資訊, 接著添加到網頁 DOM 就好
 * 例如 css=>
 * GM_addStyle(css)
 */

/**----------
 * @grant GM_notification
 * @example - 創建通知
 * GM_notification(text文字, title標題, image圖片, silent是否播放通知音, timeout自動關閉時間, onclick通知被點觸發, ondone通知關閉觸發(自動關閉也算))
 * GM_notification({
 *      title: "標題",
 *      text: "顯示文字",
 *      image: "圖片URL",
 *      timeout: 持續時間
 * })
 */

/**----------
 * @grant GM_openInTab
 * @example - 開新選項卡
 * GM_openInTab("URL", active:新分頁是否轉移焦點, insert:是否插入至當前頁面的後方, setParent:是否將新標籤頁的父頁面設置為當前頁面)
 * GM_openInTab("URL", {
 *      active: false, insert: true, setParent: false
 * })
 */

/**----------
 * @grant GM_registerMenuCommand
 * @example - 創建菜單
 * GM_registerMenuCommand(菜單名稱, 呼叫函數, 訪問快捷(s)當按下s可觸發)
 * GM_registerMenuCommand(菜單名稱, function() {函數()});
 */

/**----------
 * @grant GM_unregisterMenuCommand
 * @example - 刪除菜單
 * const Menu = GM_registerMenuCommand(名稱, 函數)
 * GM_unregisterMenuCommand(Menu)
 */

/**----------
 * @grant GM_setClipboard
 * @example - 設置剪貼簿內容
 * GM_setClipboard(訊息/文本)
 */

/**----------
 * @grant GM_setValue
 * @example - 設置長期存储訊息
 * GM_setValue("索引字串", value)
 */

/**----------
 * @grant GM_getValue
 * @example - 獲取長期存储訊息
 * GM_getValue("索引字串", null or [])
 */

/**----------
 * @grant GM_deleteValue
 * @example - 刪除長期存储訊息
 * GM_deleteValue("索引字串")
 */

/**----------
 * @grant GM_listValues
 * @example - 以列表返回長期存储訊息
 * GM_listValues(返回所有保存值的列表)
 */

/**----------
 * @grant GM_xmlhttpRequest
 * @requires - 發送請求
 * method: [GET, HEAD, POST]
 * url: 請求URL
 * headers: 請求頭
 * data: 要發送字串
 * cookie: 附帶 cookie (通常會自帶)
 * nocache: 是否使用緩存
 * revalidate: 是否重新驗證緩存
 * timeout: 超時
 * responseType: [arraybuffer, blob, json , stream] 響應類型
 * onload: 請求成功操作
 * onprogress: 請求追蹤
 * onerror: 請求失敗操作
 * 
 * @returns
 * onload: response => {
 *      response.response 回傳數據
 *      response.status 請求狀態碼
 *      response.responseHeaders 請求響應頭
 *      response.readyState 請求就緒狀態
 *      response.finalUrl 請求最終網址
 *      response.responseXML 獲取 XML
 *      response.responseText 獲取 Text
 * }
 * 
 * @example
 * GM_xmlhttpRequest({
 *      method: "GET",
 *      url: "https://example.com/",
 *      headers: {
 *        "Content-Type": "application/json"
 *      },
 *      onload: function(response) {
 *        console.log(response.responseText);
 *      }
 * });
 */

// @grant GM_log
// GM_log("打印訊息") 在控制台打印

// @grant GM_info
// GM_info() 獲取腳本資訊

// @grant GM_getTab
// GM_getTab(不知道確切用途)

// @grant GM_saveTab
// GM_saveTab(不知道確切用途)

// ==/UserScript==

/**
 * 油猴 API 文件
 * https://www.tampermonkey.net/documentation.php?ext=dhdg
 */

/* greasyfork 函式庫 API

Web IndexedDB Helper (用於操作 IndexedDB 的 API)
@require https://greasyfork.org/scripts/473362-web-indexeddb-helper/code/Web%20IndexedDB%20Helper.js?version=1237033

Itsnotlupus' MiddleMan (攔截修改的 API)
@require https://greasyfork.org/scripts/472943-itsnotlupus-middleman/code/Itsnotlupus'%20MiddleMan.js?version=1238417

脫放拉伸處理效果
https://cdnjs.com/libraries/moveable
*/
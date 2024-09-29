// https://greasyfork.org/zh-TW/scripts/462234-message
// https://greasyfork.org/zh-TW/scripts/449512-xtiper
(function () {
    // 整個文檔的滾動高
    document.documentElement.scrollHeight
    // 整個可視區域的滾動高
    document.body.scrollHeight
    // 窗口當前滾動的頂 與 文檔頂的偏移量 + 當前視點內的窗口高
    window.scrollY + window.innerHeight
})();
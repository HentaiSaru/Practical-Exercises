window.addEventListener('popstate', function(event) {
    // event.state 包含了新的狀態信息
    // 可以根據 event.state 的值執行特定操作
    // 例如，你可以根據狀態信息加載不同的內容或執行其他操作
    console.log('URL 地址變化:', window.location.href);
});
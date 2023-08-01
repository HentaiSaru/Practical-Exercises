/*width: 1429px;
height: 754px;
left: 0px;
top: -754px;*/

let Video = document.querySelector("video");
Video.style.left = "0rem";
Video.style.top = "0rem";
Video.style.width = "1920px";
Video.style.height = "1080px";

// 預設模式這個地方不會有東西 (劇院模式會放到這邊來)
//<div id="player-container-inner" class="style-scope ytd-watch-flexy"></div>

// 預設模式的內容再這邊
//<div id="player-wide-container" class="style-scope ytd-watch-flexy"></div>

// 監聽網頁上的點選事件
document.addEventListener("click", function(event) {
    // 確認點選的是連結
    if (event.target.tagName === "A") {
      event.preventDefault(); // 阻斷原本的跳轉
      const url = event.target.href; // 獲取連結的網址
      GM_openInTab(url, { active: true, insert: true }); // 在新分頁中開啟連結
    }
  });
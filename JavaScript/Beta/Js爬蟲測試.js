// 受到同源政策影響 , 只能抓取同網域
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    // 處理返回的數據
    const data = this.responseText;
    console.log(data);
  }
};
xhr.open('GET', 'url', true);
xhr.send();

// 此為 Ajex 的請求方式 , 在同網域下 , 可以請求到完整的數據
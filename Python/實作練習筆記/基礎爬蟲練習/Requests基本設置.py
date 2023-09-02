import requests

# 常用幾種設置 (用於偽造請求瀏覽器)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.43"
}

url = "xxx.com"

#Todo 請求方式
# 最基本的請求 , 可設置 params 參數字典
requests.get()
# 安全一點的請求 , 可設置 data 參數字典
requests.post()
# 像伺服器傳遞訊息 , 可設置 data 參數字典
requests.put()
# 請求刪除某指定資源
requests.delete()
# 請求回應標頭 , 如果沒有要數據可使用
requests.head()
# 請求可用的功能選項
requests.options()

#Todo 請求時參數
requests.get(
    params="",
    data="",
    headers="",
    cookies="",
    auth="",
    json="",
    files="",
    timeout="",
    proxies="",
    allow_redirects="",
    stream="",
    verify="",
    cert="",
)
"""
*  params	        GET 使用，傳遞參數 , 字典
*  data	            POST 使用，傳遞參數 , 字典
*  headers	        headers 資訊 , 模擬瀏覽器請求 , 字典
*  cookies	        cookie , 請求的 cookies , 字典
*  auth	            支持 HTTP 認證功能 , 元組
*  json	            JSON 格式的數據，作為 Request 的內容
*  files	        傳輸文件 , 字典
*  timeout	        設定超時時間，以「秒」為單位。
*  proxies	        設定訪問代理伺服器，可以增加認證 , 字典。
*  allow_redirects	True/False, 預設True, 重新定向。
*  stream	        True/False, 預設True, 獲取內容立即下載。
*  verify	        True/False, 預設True, 認證 SSL。
*  cert	            本機 SSL 路徑。
"""

#Todo 回傳類型
result = requests.get()

# 回傳請求網頁的Url
result.url
# 回傳數據的 bytes , 二進位
result.content
# 回傳正常的 str 數據
result.text
# 回傳訊息串流 bytes
result.raw
# 回傳回應的狀態碼
result.status_code
# 回傳數據編碼類型
result.encoding
# 回傳數據標頭
result.headers
# 回傳 cookies , 字典
result.cookies
# 回傳歷史 list
result.history
# 回傳json格式 , 解碼回傳字典
result.json()
# 檢查是否有例外 , 會拋出例外
result.rasise_for_status()

#Todo 請求的狀態碼
"""
*  200  網頁正常
*  301  網頁搬家，重新導向到新的網址
*  400  錯誤的要求
*  401  未授權，需要憑證
*  403  沒有權限
*  404  找不到網頁
*  500  伺服器錯誤
*  503  伺服器暫時無法處理請求
*  504  伺服器沒有回應
"""
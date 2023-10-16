"""
Todo    開啟檔案 open

?   mode 讀取的模式
*   r 只讀
*   w 讀寫(會覆寫) [不存在會直接創建, 其他讀寫不存在會錯誤]
*   a 追加(不會覆寫)
*   x 建立文件, 存在會出錯
*   b 二進位模式, 通常會打 wb
"""
file = open("file.txt", "r", encoding="utf-8")
#* 可對 file 的數據進型讀取後操作
file.close()

#?  上下文管理器 [ 可不使用 close ]
with open("file.txt", "w", encoding="utf-8") as file:
    file.read() # 讀取全部, 也可指定參數, 讀取特定的行數
    file.readline() # 單行讀取, 透過迴圈, 一行一行讀取, 直到全部讀取完畢
    file.readlines() # 讀取全部, 轉換成list
    file.write("寫入")
    #! 以上只寫了常用的 API
"""
!   配合 [打印.py] 觀看
"""

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   字串的切片 (字串索引從 0 開始)
*   (字串和列表差不多)
"""
a = "一個測試用, 的字串, 123"

print(a[1:5]) # 1 ~ 5 的字元, 不包含 5, 只會打印到 1 ~ 4

print(a[-8:-1]) # 從後面開始切 / 從字串的後面往前輸出

print(a[::-1]) # 反轉字串

print(a[:10]) # 從頭開始到 9

print(a[7:]) # 從 8 到結束

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   字串處理
"""
a = "Hello, World!"

print(a.upper()) # 字串全大寫
print(a.lower()) # 字串全小寫 [ .casefold() ]
print(a.split(", ")[1]) # 字串拆分, 以設置字串, 拆分為列表
print(a.replace("Hello", "哈瞜")) # 變換字串, (原始字串, 修改字串)

a = " 測試字串 "

print(a.strip()) # 刪除開頭與結尾空格

"""
!   字串處理其餘常用 API (上方使用過的不會在這)

?   轉換
*   a.capitalize() => 首字母轉大寫
*   a.title() => 所有單字首字母轉大寫
*   a.swapcase() => 小寫變大寫, 大寫變小寫
*   a.center("數量", "佔位符") => a 字串於中間, 並在其前後, 填充指定數量的佔位符 [只有第一參數為必須]
*   a.count("Hello", "開始索引", "結束索引") => 回傳指定範圍內, 指定字串出現的次數 [只有第一參數為必須]
*   a.rsplit("字串", "次數") => 以指定字串, 從右側開始, 分割指定次數 
*   a.encode() => 回傳二進位
*   a.lstrip("可指定刪除的字符") => 刪除左側字符
*   a.rstrip("同上") => 刪除右側字符
*   a.ljust("長度", "字符") => 左對齊右填充字符
*   a.rjust("同上") => 右對齊左填充字符
*   a.maketrans(x, y, z) => 輸入 x,y,z 字串, 從選定的字串中刪除與 xyz 相同的字串
*   a.splitlines() => 將字串以結束或換行符號進行分割, 回傳一個字串 List

?   查找
*   a.find("字串", "開始索引", "結束索引") => 查找字串內, 第一次出現指定字串的索引位置, 如果都沒有回傳 -1 
*   a.rfind() => 和 find 相同, 差在是找到最後一個出現字串的位置
*   a.index() => 和 find 相同, 差在沒有找到, 會出現例外
*   a.rindex() => 同上 與 差異

?   判斷
*   a.startswith("字串", "開始索引", "結束索引") => 判斷是否以指定字串開頭 [只有第一參數為必須]
*   a.endswith("字串", "開始索引", "結束索引") => 判斷是否以指定字串結尾 [只有第一參數為必須]
*   a.isdigit() => 是否都是阿拉伯數字 [不包含 負數/小數]
*   a.isnumeric() => 是否都是數字 包含 羅馬符號 [不包含 負數/小數]
*   a.isspace() => 是否都是空格
*   a.isalnum() => 是否是數字或是字母
*   a.isalpha() => 是否都是英文字母
*   a.istitle() => 每個單字首字母是否為大寫
*   a.casefold() => 單字首字母是否為小寫
*   a.isupper() => 是否均大寫
*   a.islower() => 是否均小寫
*   a.isidentifier() => 是否為有效變數
*   a.isprintable() => 是否是可輸出的字串

?   特殊
*   a.expandtabs(3) => 設置一個字串中, \t 空格數
*   a = "合併字符".join(a) => 詳細使用查詢文檔
"""

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   格式化字串 (基礎 於 [打印.py] 格式化字串打印, 查看)
*   format 的其他用法
"""
print("將我{}合併{}字串使{}format合併".format("要", "的", "用"))
print("另一{1}format{2}併{0}方式".format("的","種","合")) # 這種方式, 是對照索引, 而不是預設位
print("水果1: {apple}, 水果2: {banana}".format(apple="蘋果", banana="香蕉"))
print("顯示到小數後兩位 {:.2f}".format(5.12345))
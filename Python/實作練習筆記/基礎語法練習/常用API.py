"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
?   in
"""
text = "這是一個測試字串"
print(f"text 內是否含有 (測試) : {'測試' in text}")

# 檢查是否不存在 not in
print(f"text 內是否不含有 (無) : {'無' not in text}")

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
?   隨機數 random
*   只展示一種用法
"""
# 導入 API
import random
print(random.randrange(1, 11)) # 1 ~ 10 隨機數

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
?   len()
*   回傳數字, 獲取一個變數的長度
"""
a = "一個字串"
print(f"字串的長度為 : {len(a)}")

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Todo    常用 API

*   isinstance(value, Type) 判斷變數, 是否是指定的類型

*   abs(value) 取得數字的絕對值(正整數)
*   hex(value) 轉換16進位
*   bin(value) 轉換2進位

?   列表類型數據 API

*   list.add(value) 添加新元素 [用於set類型]
*   list.union(value) 將兩個set合併, 回傳一個set排除重複 [用於set類型]
*   list.update(value) 將 value 這個 set 插入, list 這個set中 [用於set類型]
*   list.clear() 清空列表 [通用]
*   list.copy() 複製列表, 回傳數據 [通用]
*   list.difference() 回傳包含差異的 set [不確定]
*   list.discard() 刪除指定的項目
*   list.pop() 刪除一個元素
*   list.remove() 刪除指定元素

"""
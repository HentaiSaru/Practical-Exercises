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
Todo    常用 API

*   isinstance(value, Type) # 判斷變數, 是否是指定的類型

*   abs(value) # 取得數字的絕對值(正整數)
*   hex(value) # 轉換16進位
*   bin(value) # 轉換2進位
"""
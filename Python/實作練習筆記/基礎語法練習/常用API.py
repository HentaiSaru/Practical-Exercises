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
Todo    [ 常用 API ]

*   input("使用者輸入: ")

*   isinstance(value, Type) 判斷變數, 是否是指定的類型

*   abs(value) 取得數字的絕對值(正整數)
*   pow(n, 次方) 獲取 n 值的, 次方數
*   hex(value) 轉換16進位
*   bin(value) 轉換2進位

*   min(list) 最小值 (比對列表中的值)
*   max(list) 最大值

*   len(object) 獲取一個物件的長度

?   隨機數 random
!   import random

*   random.randrange(1, 11) 1 ~ 10 隨機數

?   數學函式 math
!   import math

*   math.sqrt(value) 平方根
*   math.ceil(value) 向前進位取整
*   math.floor(value) 向後捨去取整
*   math.pi 回傳圓周率

?   列表類型數據 API

*   list.add(value) 添加新元素 [用於set類型]
*   list.append() 添加元素到最後的索引 [用於list/array類型]
*   list.extend(另一個列表) 延伸列表數據, 將新列表數據添加至, 舊列表的後方
*   list.insert() 在指定的索引位置, 插入新的元素
*   list.union(value) 將兩個set合併, 回傳一個set排除重複 [用於set類型]
*   list.update(value) 將 value 這個 set 插入, list 這個set中 [用於set類型]
*   list.reverse() 反轉陣列
*   list.sort() 陣列排序
*   list.clear() 清空列表 [通用]
*   list.copy() 複製列表, 回傳數據 [通用]
*   list.difference() 回傳包含差異的 set [不確定]
*   list.discard() 刪除指定的項目
*   list.pop() 刪除一個元素
*   list.remove() 刪除指定元素

?   Josn 數據處理
!   import json

*   json_data = json.loads(*json) 將 Json 數據解析為 Python 的 dict
*   *json = json.dumps(json_data) 將 Python 數據轉換為 Json 數據
*   json.dumps(x, indent=4, separators=(',',':'), sort_keys=True) 設定轉換後的縮排, 和分隔符號, 以 key 進行排序

?   正則表達式處理 [ 不包含正則式說明 ]
!   import re

*   pattern = re.compile("RegEx") 將正則先編譯成一個模板, 例: pattern.match(str) 進行更高效的處理
*   re.findall("RegEx", str) 回傳所有符合條件的元素列表
*   re.search("RegEx", str) 查找字串是否含有指定的條件
*   re.match("RegEx", str) 判斷字串是否完全匹配指定的條件
*   re.split("RegEx", str) 條件分割
*   re.sub("RegEx", "替換值", str)

"""
import re
re.compile()
re.search()
re.match()
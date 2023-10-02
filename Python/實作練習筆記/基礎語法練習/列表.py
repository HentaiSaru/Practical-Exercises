"""
Todo    [ List ]

?   [有序/可變/允許重複]
"""
a = ["1", 2, "3", "2", True, 15.5] # 不同Type
list_length = len(a) # 列表長度

#! 索引也可用切片
print(a[1]) # 打印列表索引位置, 0 ~ n
print(a[-2]) # 負索引, n ~ 0 從後面開始

#* 檢查某元素是否存在於列表中
print(4 in a)

#* 索引修改列表
a[1] = "2"
print(f"修改列表: {a}")

#* 索引插入列表 (下面例子, 就會將索引 3 的位置, 插入 4 的字串)
a.insert(3, "4")
print(f"插入列表: {a}")

#* 尾部追加
a.append(20.0)
print(f"追加列表: {a}")

#* 擴充列表
a.extend(["A", "B", "C"])
print(f"擴充列表: {a}")

#* 刪除第一次出現的值 (不指定就全部刪除)
a.remove("2")
print(f"刪除索引: {a}")

#* 不指定刪除最後一項
a.pop()
print(f"刪除後續: {a}")

"""
Todo    其餘API

刪除索引 del a[0]
直接刪除整個 del a
清空 a.clear()
"""
# 反轉
a.reverse()

# 排序 (因為列表中, 數據不同 Type 排序會錯誤, 將其註解)
# a.sort()

# 複製
b = a.copy()
print(b)

# 遍歷列表
[print(i, end=" ") for i in a]

# 連結列表
c = a + b
print(f"\n{c}")


"""
Todo    [ Tuple ]

?   [有序/不可變/允許重複]
"""
a = ("a", "b", "c") # 有序, 不可變更(要變更可以轉換成列表)
print(type(a))
a = list(a)
a.append("d") # 添加
a = tuple(a) # 轉回元組
print(a)

#* 其餘取索引 刪除的方法 與 list 大同小異, 元組也可使用多重賦值(說明於 賦值 章節)

print(f"元組相乘=>\n{a * 2}")

"""
Todo    [ Set ]

?   [無序/不可變(無索引)/不可重複]
"""

a = set() # 宣告類型
for i in range(1, 6): # 添加項目
    a.add(i)
print(a)

#! 添加 add() / 擴展 union() | update() / 刪除 remove("刪除項")[不存在就會錯誤] | discard("刪除項")[不存在不會錯誤]
#! 隨機刪除 pop() [因為沒有索引, 所以隨機刪除] / 清空 clear() ... 還有許多API

a = {"a", "b", "c", "a"} # 直接宣告 (無序/不可重複)
print(a)

#* 通過 Tuple 數據, 轉換成 Set 排除重複
a = ("a", "a", "b", "b")
print(f"排除前: {a}")
print(f"排除後: {set(a)}")

"""
Todo    [ Dict ]

?   [有序/可遍/Key值不允許重複(後向覆蓋前項)]
"""
Dict = {
    "Key1": "value1",
    "key2": ["value1", "value2"],
    "key3": {"key": "value"}
}
print(Dict.get("Key1")) # 使用 key Get 來取得 value
print(Dict["key2"]) # 透過Key值獲取value
#* 獲取多個數據可以用 for _ in dict.items() 來遍歷數據
print(Dict.keys()) # 獲取所有的key值
print(Dict.values()) # 獲取所有的value值
print(Dict.items()) # 獲取所有數據

#* 另一種字典宣告方式
Dict = dict(key1="value1", key2="value2")
print(Dict)
Dict.update({"key2": "修改數據"})
print(Dict)
Dict["key1"] = "覆蓋修改數據"
print(Dict)
"""
!   此項目展示用, 無法運行
"""

# Text 文字 / 字串類型
str = "一個字串"

# Number 數字類型
int = 10, -10
float = 10.0, -10.0
hex = 0x1F, 0xFF # 16 進位
bin = 0b101, 0b111 # 2 進位
complex = 2+3j, -1-4j # 複雜的數學算法才用的到

# Sequence 序列 / 列表類型
list = ["a", "b", "c"] # 可變序列, 任意類型的數據, 支持增刪改
tuple = ("a", "b", "c") # 不可變序列, 任意類型的數據, 不支持修改
range(1, 10) # 連續的數字序列, 通常用於循環迭代

# Mapping 字典類型
dict = {"key1": "value1", "key2": "value2"}

# Set 類型, 此類型不可有重複值
set = {"a", "b", "c"}
frozenset({"a", "b", "c"})

# Boolean 布林類型
bool = True

# Binary 二進位類型
bytes = b"Hello" # 圖片、聲音、影片 都是二進位數據
bytearray(10)
memoryview(bytes(10)) # 內存視圖 可以對二進製數據進行切片操作，而不需要進行複製或者轉換。

# 無類型
None

"""
Todo 類型的轉換
"""
a = str("字串")
a = eval("10") # 自動判斷
a = str("10")
a = int(10)
a = float(10.0)
a = list((1, 2, 3))
a = tuple((1, 2, 3))
a = dict(key= "鍵值", value= "參數")
""" 題目說明

請撰寫一程式，讓使用者建立一個3*3的矩陣
其內容為從鍵盤輸入的整數（不重複，接著輸出矩陣最大值與最小值的索引。

輸入說明
九個整數

輸出說明
矩陣最大值及其索引
矩陣最小值及其索引

範例輸入
6
4
8
39
12
3
-3
49
33

範例輸出
Index of the largest number 49 is: (2, 1)
Index of the smallest number -3 is: (2, 0)

"""
box = []

for i in range(9):
    n = eval(input("整數:"))
    box.append(n)

Max = max(box)
Min = min(box)

MaxIndex = box.index(Max)
MinIndex = box.index(Min)

print(f"Index of the largest number {Max} is: ({MaxIndex // 3}, {MaxIndex % 3})")
print(f"Index of the smallest number {Min} is: ({MinIndex // 3}, {MinIndex % 3})")


""" 解題思路 

範例輸入轉成 3 * 3 矩陣:

  一維 0
6 , 4 , 8

  一維 1
39 , 12 , 3

  一維 2
-3 , 49 , 33

最大的 49 索引值 一維=2 二維=1
最小的 -3 索引值 一維=2 二維=0

但是他本身是一維的 , 所以只有 , 索引 0 ~ 8
49 的索引 = 7
-3 的索引 = 6

那麼一維的索引就只要 // 3 , 也就是整除3 , 忽略餘數
7 // 3 = 2
6 // 3 = 2

二維索引 %3 , 也就是除3求餘數
7 % 3 = 1
6 % 3 = 0

結果就是這樣來的

另一種方式 , 也可以一開始就輸入成多維array
但是處理 max 和 min 大小 , 就要另外比較多步驟了
"""
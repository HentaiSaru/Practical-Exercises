""" 題目說明

請撰寫一程式，讓使用者輸入十個整數作為樣本數
輸出眾數（樣本中出現最多次的數字）及其出現的次數。

提示：假設樣本中只有一個眾數。

範例輸入
34
18
22
32
18
29
30
38
42
18

範例輸出
18
3

"""
box = []
calculate = [0] * 10

for i in range(10):
    n = int(input("輸入:"))
    box.append(n)
    calculate[box.index(n)] += 1

print(box[calculate.index(max(calculate))])
print(max(calculate))

""" 解題思路

首先每次輸入都存入 box
並且在 calculate 內 [box.index(n)] 的位置記數
.index() 方法會回傳首次找到該值的索引值

根據範例 : 
34 : box.index() = 0
18 : box.index() = 1
22 : box.index() = 2
32 : box.index() = 3
18 : box.index() = 1
29 : box.index() = 5
30 : box.index() = 6
38 : box.index() = 7
42 : box.index() = 8
18 : box.index() = 1

那麼在 calculate 的該所引值 += 1
根據範例 在索引值1 的地方他就是3

出現最多的 : box[] , 索引值就是 calculate.index(max(calculate)) , 就是值為 3 , 索引值為 1
那麼 box 索引值為 1 的就是 18

出現次數 : 就直接將這個 3 打印出來 , 所以就是 max(calculate)

"""
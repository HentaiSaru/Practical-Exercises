""" 題目說明

請撰寫一程式，讓使用者輸入52張牌中的5張
計算並輸出其總和。

提示：J、Q、K以及A分別代表11、12、13以及1。

範例輸入
5
10
K
3
A

範例輸出
32

"""
J = 11
Q = 12
K = 13
A = 1
total = 0

for _ in range(5):
    n = eval(input("輸入:"))
    total += n
print(total)
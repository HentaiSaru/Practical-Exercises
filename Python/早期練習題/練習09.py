""" 題目說明

請使用迴圈敘述撰寫一程式，要求使用者輸入一個數字
此數字代表後面測試資料的數量。
每一筆測試資料是一個正整數(由使用者輸入)
將此正整數的每位數全部加總起來。

輸入與輸出會交雜如下
1
98765
! === 輸出 ===
Sum of all digits of 98765 is 35

輸入與輸出會交雜如下
3

32412
! === 輸出 ===
Sum of all digits of 32412 is 12

0
! === 輸出 ===
Sum of all digits of 0 is 0

769
! === 輸出 ===
Sum of all digits of 769 is 22

"""

for _ in range(int(input("測試數量:"))):
    sum = 0
    n = input("正整數:")
    for i in n:
        sum += int(i)
    print(f"Sum of all digits of {n} is {sum}")

""" 我的天哪這是在考我語文理解吧 """
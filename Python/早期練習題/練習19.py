""" 題目說明

請撰寫一程式，輸入數個整數並儲存至集合
以輸入-9999為結束點(集合中不包含-9999)
最後顯示該集合的長度(Length)、最大值(Max)、最小值(Min)
總和(Sum)。

3. 輸入輸出：
輸入說明
輸入n個整數至集合，直至-9999結束輸入

輸出說明
集合的長度
集合中的最大值
集合中的最小值
集合內的整數總和

範例輸入
34
-23
29
7
0
-1
-9999

範例輸出
Length: 6
Max: 34
Min: -23
Sum: 46

"""
arr = set()

while True:
    n = eval(input("輸入值:"))

    if n == -9999:break

    arr.add(n)

print(f"Length: {len(arr)}")
print(f"Max: {max(arr)}")
print(f"Min: {min(arr)}")
print(f"Sum: {sum(arr)}")

""" 就練習內置函式用法 , 沒啥好說 """
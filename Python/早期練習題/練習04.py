""" 題目說明

請使用選擇敘述撰寫一程式
讓使用者輸入一個正整數
然後判斷它是3或5的倍數
顯示【x is a multiple of 3.】或【x is a multiple of 5.】
若此數值同時為3與5的倍數，顯示【x is a multiple of 3 and 5.】
如此數值皆不屬於3或5的倍數
顯示【x is not a multiple of 3 or 5.】
將使用者輸入的數值代入x。

範例輸入1
55

範例輸出1
55 is a multiple of 5.

範例輸入2
36

範例輸出2
36 is a multiple of 3.

範例輸入3
92

範例輸出3
92 is not a multiple of 3 or 5.

範例輸入4
15

範例輸出4
15 is a multiple of 3 and 5.

"""

a = int(input("輸入數字:"))

if a % 3 == 0 and a % 5 == 0:print(f"{a} is a multiple of 3 and 5.")
elif a % 3 == 0:print(f"{a} is a multiple of 3.")
elif a % 5 == 0:print(f"{a} is a multiple of 5.")
else:print(f"{a} is not a multiple of 3 or 5.")

""" 有夠無聊的題目 , 考這個幹嘛 """
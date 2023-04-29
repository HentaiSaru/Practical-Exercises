""" 題目說明

請撰寫一程式，將使用者輸入的三個整數（代表一元二次方程式的三個係數a、b、c）
作為參數傳遞給一個名為compute()的函式
該函式回傳方程式的解
如無解則輸出【Your equation has no root.】

提示：
輸出有順序性
回傳方程式的解，無須考慮小數點位數

範例輸入1
2
-3
1

範例輸出1
1.0, 0.5

範例輸入2
9
9
8

範例輸出2
Your equation has no root.

範例輸入3
1
2
1

範例輸出3
-1.0

"""

def compute(a,b,c):
    n = b**2 -4 * a * c

    if n < 0:return "Your equation has no root."
    elif n == 0:return -b / 2*a
    else:
        a1 = (-b + n ** 0.5)/(2*a)
        a2 = (-b -n ** 0.5)/(2*a)
        return f"{a1}, {a2}"
    
print(compute(int(input("a值:")),int(input("b值:")),int(input("c值:"))))

""" 又是在考數學.. """
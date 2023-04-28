""" 題目說明

輸入一圓的半徑，並加以計算此圓之面積和周長
最後請印出此圓的半徑（Radius）、周長（Perimeter）和面積（Area）。

提示1：需import math模組，並使用math.pi。
提示2：輸出浮點數到小數點後第二位。

輸入輸出範例
範例輸入1
10

範例輸出1
Radius = 10.00
Perimeter = 62.83
Area = 314.16

範例輸入2
2.5

範例輸出2
Radius = 2.50
Perimeter = 15.71
Area = 19.63

"""
import math

def calculate(radius):

    print("Radius = %.2f" %radius)
    print("Perimeter = %.2f" %((radius*2) * math.pi))
    print("Area = %.2f" %((radius**2) * math.pi))

calculate(eval(input("輸入半徑:")))

""" 這題是練數學是吧 , 公式早忘了 """
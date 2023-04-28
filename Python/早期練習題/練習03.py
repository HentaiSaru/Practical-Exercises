""" 題目說明

假設一賽跑選手在x分y秒的時間跑完z公裡
請撰寫一程式，輸入x、y、z數值
最後顯示此選手每小時的平均英哩速度（1英哩等於1.6公裡）。

提示：輸出浮點數到小數點後第一位。

輸入輸出：
輸入說明
x（min）、y（sec）、z（km）數值

範例輸入
10
25
3

範例輸出
Speed = 10.8

"""
x = eval(input("min:"))
y = eval(input("sec:"))
z = eval(input("km:"))

Speed = ((z/1.6) / ((y/60 + x) / 60))

print("Speed = %.1f" %Speed)

""" 又是考數學是怎樣啦 """
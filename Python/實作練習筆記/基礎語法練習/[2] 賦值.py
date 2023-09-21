# 打印類型
def Type(value):
    print(type(value))

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   Python 於, 賦予值後變更變數類型, 無須事先宣告類型
"""
a = 10
Type(a)

a = "直接轉型"
Type(a)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   指定賦值類型
"""
a = str(10)
Type(a)

a = int(10)
Type(a)

a = float(10)
Type(a)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   多值賦予 / 集合賦予
"""
a, b, c = "a", "b", "c"
a = b = c = "同個值賦予"

# 集合
a, b, c = ["a", "b", "c"]

# 長字串
a = """
a a a
b b b
c c c
"""
print(a)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   特殊宣告, 如果輸入為宣告的變數, 將會打印該變數值
*   需要使用 eval() 來自動判斷
"""
b = "字串 B"
c = "字串 C"
print(eval(input("輸入 (b/c) :")))
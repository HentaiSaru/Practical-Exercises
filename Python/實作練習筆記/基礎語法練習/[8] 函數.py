"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   函數外建立變數
"""
a = "一個變數"

def pr_a():
    print(a)

# 調用
pr_a()

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   當函數外與內部有相同的變數
*   會被視為不同的變數
"""
a = "函數外的變數"

def pr1():
    a = "函數內的變數"
    print(a)
    
pr1()
print(a)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   全域變數 global
*   宣告為全域時, 在函數內將修改函數外的同名變數
"""
a = "函數外的變數"

def pr2():
    global a
    a = "函數內的變數"
    print(a)
    
pr2()
print(a)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   函數參數傳遞
"""

def add(a:int, b):
    print(a+b)
    
add(5, 5)

#* 不知道傳遞的參數數量
def add2(*number):
    _sum = 0
    
    for n in number:
        _sum += n
        
    print(_sum)
    
add2(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)

#* 不知道關鍵字的數量
def merge(**string):
    _str = ""

    for s in string.values():
        _str += s
        
    print(_str)
    
merge(str1="A", str2="B", str3="C")

#* 有回傳值的函數
def get_add(a, b):
    return a + b

print(get_add(10, 10))

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   匿名函數 Lambda
"""
#* a 作為函數名, 傳入的值為n, 進行後續運算後回傳
a = lambda n:n + 5
print(f"Lambda: {a(5)}")

#* 可接受任意數量的參數
a = lambda x, y: x * y
print(f"Lambda: {a(4, 5)}")

a = lambda a, b, c: a + b + c
print(f"Lambda: {a(10, 10, 10)}")

#* 搭配函數的用法
def lam_fanc(n):
    return lambda a: a + n

lam = lam_fanc(20)
print(f"Lambda: {lam(20)}")

lam2 = lam_fanc(30) # 進行第二次實例化
print(f"Lambda: {lam2(20)}")
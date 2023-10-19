"""
Todo    基本類
"""
from typing import Any


class Myclass:
    def __init__(self, name, arg): # 初始化
        self.name = name
        self.arg = arg
        
    def __str__(self): # 直接回傳字串
        return f"名子: {self.name}, 年紀: {self.arg}"
    
    def func(self, number):
        print(f"[{self.name}] 呼叫了方法 [{number}]")
    
cla = Myclass("我", 18) # 實例化, 並賦予值
print(cla) # 打印字串

cla.name = "他"
cla.func(1)

"""
Todo    繼承
"""
class cla1:
    def __init__(self):
        self.name = None
        self.arg = None

class cla2(cla1):
    def __init__(self):
        super().__init__() # 取得繼承的變數

    def __call__(self, name, arg): # 傳遞參數時自動調用
        self.name = name
        self.arg = arg
        self.__print()
        
    def __print(self): # 打印傳入值
        print(self.name, self.arg)

c2 = cla2()
c2("我", 18)
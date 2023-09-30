# !建立數組 set
a_set = set()   #? 空數組
a = ""
b = {1,2,3,4,5}
c = set((1,2,3,4,5))
a_set.add(1)
 
print(a_set)
print(b)
print(c)
print(type(a))
print(type(b))
print(type(c))
print("\n")

# * eval 這個含式 會自動判斷
# * eval(10) 他就會變 int
# * eval(10.0) 他就會變 float

#*---------------------------------

# ! for 的特別用法
test = [1,2,3,4,5]
n = 0

for i in range(len(test)): # ? 直接做 0 ~ 陣列長度
    n += test[i]
print(n)
n = 0

for i in test: # ? 直接將陣列值 每次丟入 i 直接讀取 i 就是值
    n += i
print(n)
print("\n")

text = """多行文字賦予
第二行內容
第三行內容
"""
print(text)
print(text[5])  #? 輸出指定位置的字串
print("free" in text) #? 輸出是否存在該字串
print("free" not in text) #? 輸出是否不存在該字串

# !列表特別的寫法
list = ['a','b','c']
[print(out) for out in list]

# !生成器
def generate():
    for i in range(1,6):
        yield i #? yield 也是回傳值 , 但是不會像是 , return 直接中止

for gen in generate():
    print(gen)
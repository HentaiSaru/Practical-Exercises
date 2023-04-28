""" 題目說明

輸入四個分別含有小數1到4位的浮點數，然後將這四個浮點數以欄寬為7
欄與欄間隔一個空白字元、每列印兩個的方式，先列印向右靠齊，再列印向左靠齊，左右皆以直線
| 作為邊界。

範例輸入

23.12
395.3
100.4617
564.329

範例輸出

|  23.12  395.30|
| 100.46  564.33|
|23.12   395.30 |
|100.46  564.33 |

"""

list = []

class output:
    def right(a,b):
        print("|%7.2f %7.2f|"%(a,b))

    def left(a,b):
        print("|%-7.2f %-7.2f|"%(a,b))

for _ in range(4):
    list.append(eval(input("輸入數字:")))

output.right(list[0],list[1])
output.right(list[2],list[3])

output.left(list[0],list[1])
output.left(list[2],list[3])

""" 其實可以簡單的用 , print打印就好 """
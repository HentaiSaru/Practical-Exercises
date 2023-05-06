""" 題目說明

請撰寫一程式，要求使用者輸入檔名data.txt、字串s1和字串s2。
程式將檔案中的字串s1以s2取代之。

輸入說明
輸入data.txt及兩個字串（分別為s1、s2，字串s1被s2取代）

內容 :
watch shoes skirt
pen trunks pants

輸出說明
輸出檔案中的內容
輸出取代指定字串後的檔案內容

範例輸入
data.txt
pen
sneakers

範例輸出
=== Before the replacement
watch shoes skirt
pen trunks pants
=== After the replacement
watch shoes skirt
sneakers trunks pants

"""
with open(input("檔案名:"), "r") as f:
    file = f.read()
    old = input("")
    new = input("")

    print("=== Before the replacement")
    print(file)

    print("=== After the replacement")
    print(file.replace(old,new))
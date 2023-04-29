""" 題目說明

請撰寫一程式，為一詞典輸入資料（以輸入鍵值"end"作為輸入結束點，詞典中將不包含鍵值"end"）
再輸入一鍵值並檢視此鍵值是否存在於該詞典中。

輸入說明
先輸入一個詞典，直至end結束輸入，再輸入一個鍵值進行搜尋是否存在

輸出說明
鍵值是否存在詞典中

輸入與輸出會交雜如下，輸出的部份以粗體字表示

Key: 123-4567-89
Value: Jennifer

Key: 987-6543-21
Value: Tommy

Key: 246-8246-82
Value: Kay

Key: end

Search key: 246-8246-82
True
"""

dictionary = {}

while True:
    key = input("key: ")
    if key == "end":break

    dictionary[key] = input("Value: ")
    
print(input("Search key: ") in dictionary)
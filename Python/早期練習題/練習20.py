""" 題目說明

全字母句(Pangram)是英文字母表所有的字母都出現至少一次(最好只出現一次)的句子。
請撰寫一程式，要求使用者輸入一正整數k(代表有k筆測試資料)
每一筆測試資料為一句子，程式判斷該句子是否為Pangram
並印出對應結果True(若是)或False(若不是)。

提示：不區分大小寫字母

輸入說明
先輸入一個正整數表示測試資料筆數，再輸入測試資料

輸出說明
輸入的資料是否為全字母句

輸入與輸出會交雜如下，輸出的部份以粗體字表示 第1組
3
The quick brown fox jumps over the lazy dog
True
Learning Python is funny
False
Pack my box with five dozen liquor jugs
True

輸入與輸出會交雜如下，輸出的部份以粗體字表示 第2組
2
Quick fox jumps nightly above wizard
True
These can be weapons of terror
False

"""
PanGram = lambda x: not set("abcdefghijklmnopqrstuvwxyz") - set(x.lower())

for _ in range(eval(input("輸入整數:"))):
    n = input()
    print(PanGram(n))

""" 說明

PanGram 首先使用 set(x.lower()) 將參數 x , 全部轉成小寫 , 並放入set中
可以避免大小寫,和重複問題 , 再來創建一個 set("abcdefghijklmnopqrstuvwxyz") 字母表 set
接著使用 - 去計算兩集合的差集 , 也就是在字母表中 , 但沒有在 x 參數中出現的字母
如果他是空集 , 也就是 x 包含在字母表中的所有字母 , 則回傳 True 反之 False
因為他不是空集 , 代表他出現了 , 沒有出現在字母表的字母

"""
"""
Todo    判斷式 if
"""
#* 判斷就是看條件是否是 True
if True:
    pass # 這邊就會執行

if 10 < 20: # 這是True
    pass
elif False: # 第二個判斷式 (可無限分支, 但會難以維護)
    pass
else: # 當上面都不為 True 最終運行這邊
    pass

#* 一行的寫法 [True 做什麼, 判斷式, False 做什麼], 和三元式一樣的規則
print("一行判斷") if True else null
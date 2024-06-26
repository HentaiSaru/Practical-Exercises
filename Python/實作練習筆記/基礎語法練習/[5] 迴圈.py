"""
Todo    while 迴圈
"""
while True: # 每次迴圈會判斷該條件, 只要他是 True 就會一直運
    break # 無限迴圈可以設置特定條件後用 break 跳出迴圈
    if True: #! 範例
        continue # 設置某特定條件跳過該輪迴圈

"""
Todo    for 迴圈
"""
box = ["數據"] * 5

for i in range(1, 3):
    print(box[i])

print("------------")

for i in range(len(box)):
    print(box[i])
    
print("------------")

for data in box:
    print(data)
    
#* 如果沒有要打印box數據可以這樣
for _ in box:
    print("空")
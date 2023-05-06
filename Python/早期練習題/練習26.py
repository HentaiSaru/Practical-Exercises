""" 題目說明

讀取read.txt（每一行的格式為名字和身高、體重，以空白分隔）

內容:
Ben 175 65
Cathy 155 55
Tony 172 75

輸出說明
輸出檔案中的內容
平均身高
平均體重
最高者
最重者

範例輸出
Ben 175 65

Cathy 155 55

Tony 172 75
Average height: 167.33
Average weight: 65.00
The tallest is Ben with 175.00cm
The heaviest is Tony with 75.00kg

"""
name = []
cm = []
kg = []

with open("read.txt", "r") as f:
    data = f.readlines()

    for n in data:
        print(n)

        Data = n.replace("\n", "").split(" ")
        name.append(Data[0])
        cm.append(int(Data[1]))
        kg.append(int(Data[2]))

print("Average height: %.2f" %(sum(cm)/len(cm)))
print("Average weight: %.2f" %(sum(kg)/len(kg)))
print("The tallest is %s with %.2fcm" %(name[cm.index(max(cm))],max(cm)))
print("The heaviest is %s with %.2fkg" %(name[kg.index(max(kg))],max(kg)))

"""
以上寫法不是很好的寫法 , 但是題目嘛能達成就好
"""
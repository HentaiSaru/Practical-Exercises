""" 題目說明

請撰寫一程式，以不定數迴圈的方式輸入身高與體重
計算出BMI之後再根據以下對照表
印出BMI及相對應的BMI代表意義（State）
假設此不定數迴圈輸入-9999則會結束此迴圈。
標準如下表所示：

BMI值	代表意義
BMI < 18.5	under weight
18.5 <= BMI < 25	normal
25.0 <= BMI < 30	over weight
30 <= BMI	fat
提示：BMI=體重(kg)/身高^2(m 公尺)，輸出浮點數到小數點後第二位。 不需考慮男性或女性標準。

輸入說明
兩個正數（身高cm、體重kg），直至-9999結束輸入

輸入與輸出會交雜如下，輸出的部份以粗體字表示
176
80

BMI: 25.83
State: over weight

170
100

BMI: 34.60
State: fat

-9999

"""

while True:
    h = eval(input("身高:"))
    if h == -9999:break

    w = eval(input("體重:"))
    if w == -9999:break

    bmi = w / (h/100)**2
    print("BMI: %.2f" %bmi)

    if bmi < 18.5:print("State: under weight")
    elif bmi >= 18.5 and bmi < 25:print("State: normal")
    elif bmi >= 25 and bmi < 30:print("State: over weight")
    else:print("State: fat")

import matplotlib.pyplot as plt
import numpy as np

x_point = np.array([1, 8])
y_point = np.array([3, 10])

#Todo   只展示幾個基本API , 更多使用查閱文檔

#* 繪製一條線
plt.plot(x_point, y_point)
plt.show()

#* 繪製兩點
plt.plot(x_point, y_point, "o")
plt.show()

#* 繪製多點線條圖
x_point = np.array([1, 2, 6, 8])
y_point = np.array([3, 8, 1, 10])

plt.plot(x_point, y_point)
plt.show()

#* 指定y點, 與標記
y_point = np.array([3, 8, 1, 10])
plt.title("title", fontdict={'family':'serif','color':'blue','size':20})
plt.xlabel("X label") #? 顯示文字無法直接使用中文
plt.ylabel("y label")
plt.plot(y_point, marker="o", ls="--", ms=10, linewidth=10, mec="r", mfc="g")
plt.grid()  #? 添加網格
plt.show()

#*  圓餅圖
y = np.array([35, 25, 25, 15])
labels = ["Apples", "Bananas", "Cherries", "Dates"]

plt.pie(y, labels=labels)
plt.legend(title="Four Fruits:")
plt.show() 

"""
Todo    Mark 標記類型

*   "O" 圓點
*   "*" 星號
*   "." 點
*   "," 向素
*   "x" 未填滿 x
*   "X" 填滿 x
*   "+" 未填滿 加號
*   "P" 填滿 加號
*   "s" 方塊
*   "D" 鑽石
*   "d" 薄鑽石
*   "p" Pentagon
*   "H" 六邊形
*   "v" 向下三角型
*   "^" 向上三角形
*   "<" 左三角
*   ">" 右三角
*   "|"
*   "_"

Todo    線類型

*   "-" 實心線
*   ":" 虛線
*   "--" 虛線
*   "-."

Todo    顏色

*   "r" 紅色
*   "g" 綠色
*   "b" 藍色
*   "c" 青色
*   "m" 品紅
*   "y" 黃色
*   "k" 黑色
*   "w" 白色
"""
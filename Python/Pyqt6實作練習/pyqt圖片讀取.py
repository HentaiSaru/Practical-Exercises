from PyQt6 import QtWidgets , QtGui
import sys

app = QtWidgets.QApplication(sys.argv)

Form = QtWidgets.QWidget()
Form.setWindowTitle("圖片讀取")
Form.resize(500,500)

# 展示框
Img_view = QtWidgets.QGraphicsView(Form)
Img_view.setGeometry(20,20,460,460)

# 畫布範圍
scene = QtWidgets.QGraphicsScene()
scene.setSceneRect(0, 0, 0, 0)

# 讀取圖片 , 重設大小
img = QtGui.QPixmap("python.png")

img1 = img.scaled(200,200)
qitem1 = QtWidgets.QGraphicsPixmapItem(img1)

img2 = img.scaled(100,100)
qitem2 = QtWidgets.QGraphicsPixmapItem(img2)

# 設置畫布位置 (前兩值 x,y)
scene.setSceneRect(100,100, 200, 200)

# 在畫布添加圖片 , 並將畫布放至展示框
# scene.addPixmap(img1) 單張圖片

scene.addItem(qitem1)
scene.addItem(qitem2)

Img_view.setScene(scene)

Form.show()
sys.exit(app.exec())
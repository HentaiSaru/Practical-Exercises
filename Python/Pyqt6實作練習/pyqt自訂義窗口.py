from PyQt6 import QtWidgets , QtGui , QtCore
import sys

app = QtWidgets.QApplication(sys.argv) # 建立視窗

Form = QtWidgets.QWidget()          # 建立視窗元件

#################################################

Form.setWindowTitle('標題文字')      # 設定視窗標題
Form.resize(1280, 720)               # 設定視窗尺寸
Form.setStyleSheet("background:#fcc;") # 使用網頁css

# 獲取窗口寬高
def getsize():
    print(Form.width())
    print(Form.height())

#################################################

label = QtWidgets.QLabel(Form)      # 在 Form 裡加入標籤
label.setText('使用move方法定位')    # 設定標籤文字
label.move(50, 50)                  # 移動標籤位置
label.setStyleSheet("font-size:30px; color:#00c") # 設置標籤樣式

label1 = QtWidgets.QLabel(Form)
label1.setText("使用Geometry方法定位") # Geometry 可用於設置大小
label1.setGeometry(50,80,150,100) # (x, y, w, h) 當文字超過設置寬度會被裁切

# ! 標籤的樣式設置
label2 = QtWidgets.QLabel(Form)
label2.setText("文字 樣式 設置 練習")
label2.setGeometry(50, 150, 110, 100)
label2.setContentsMargins(0,0,0,0) # 設置邊界
label2.setWordWrap(True) # 可以換行
label2.setAlignment(QtCore.Qt.AlignmentFlag.AlignCenter) # 對齊方式

#################################################

font = QtGui.QFont() # 建立文字樣式元件
font.setFamily("Verdana") # 設置字體
font.setPointSize(20) # 字體大小
font.setBold(True) # 粗體
font.setItalic(True) # 斜體
font.setStrikeOut(True) # 刪除線
font.setUnderline(True) # 底線
label2.setFont(font)

#################################################

img_label = QtWidgets.QLabel(Form)
img_label.setGeometry(250, 50 , 512,512)
img = QtGui.QImage("python.png") # 讀取圖片
img_label.setPixmap(QtGui.QPixmap.fromImage(img)) # 加入圖片

#################################################

btn = QtWidgets.QPushButton(Form)
btn.setText("一個按鈕")
btn.move(50, 300)
# hover 當懸浮時會變色 , 和css功能相同
btn.setStyleSheet(''' 
    QPushButton {
        font-size:20px;
        color: #f00;
        background: #ff0;
        border: 2px solid #000;
    }
    QPushButton:hover {
        color: #ff0;
        background: #f00;
    }
''')
btn.clicked.connect(getsize) # 點擊事件

btn1 = QtWidgets.QPushButton(Form)
btn1.setText("二個按鈕")
btn1.setGeometry(50, 350 , 100 , 50)
btn1.setDisabled(True) # 停用按鈕
btn1.setStyleSheet('''

    background:#ff0;
    color:#f00;
    font-size:20px;
    border:2px solid #000;

    QPushButton:disabled {
        color:#fff;
        background:#ccc;
        border: 2px solid #aaa;
    }
''') # 可以使用 QPushButton:disabled 設置停用按鈕時的樣式

#################################################

Form.show() # 顯示視窗
sys.exit(app.exec())
from PyQt6.QtWidgets import QApplication, QMainWindow, QPushButton
import sys

app = QApplication(sys.argv)
window = QMainWindow()
window.setWindowTitle("Demo")
window.setGeometry(100, 100, 300, 200)

window.show()
sys.exit(app.exec())
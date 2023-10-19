try:
    raise ValueError # 自訂輸出例外
    # 這邊可做任何事情, 當出現例外時就會被捕獲
except ValueError: # 特定類型的例外可以捕獲很多類型, 根據不同例外做不同處理
    print("捕獲特定的例外類型")
except Exception as e: # 通用類型的例外捕獲, 會捕獲所有例外, 他必須寫在捕獲的最下方
    print(f"捕獲通用類型的例外: {e}")
else:
    print("當沒有錯誤時會打印這邊")
finally:
    print("無論是否有錯誤都會打印")
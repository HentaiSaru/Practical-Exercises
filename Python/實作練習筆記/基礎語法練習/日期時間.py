import datetime

time = datetime.datetime.now()
print(f"當前時間: {time}")
print(f"當前年份: {time.year}")
print(f"格式化時間: {time.strftime('%Y %x %p %H %M %S')}")
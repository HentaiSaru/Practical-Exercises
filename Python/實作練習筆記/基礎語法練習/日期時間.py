import datetime

time = datetime.datetime.now()
print(f"當前時間: {time}")
print(f"當前年份: {time.year}")
print(f"格式化時間: {time.strftime('%Y %x %p %H %M %S')}")
print(time.strftime("%y %Y")) #* %y 年份(簡短) %Y 年份完整
print(time.strftime("%b %B %m")) #* %b 月份(簡短) %B 月份(完整) %m 月份(數字)
print(time.strftime("%a %A %w")) #* %a 星期(簡短) %A 星期(完整) %w 星期(數字)
print(time.strftime("%p %H %I")) #* %p 上下午(AM/PM) %H 小時(24) %I 小時(12)
print(time.strftime("%m/%d %H:%M:%S")) #* %M 分鐘 %S 秒鐘
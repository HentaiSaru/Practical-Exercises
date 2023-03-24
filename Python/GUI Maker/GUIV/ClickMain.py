import os
import sys
import time
import pyautogui
import threading
from pynput import keyboard
import configparser as config
from tkinter import messagebox
dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(dir) # 將該文件絕對路徑,加入至Python的文件查找路徑
from Secondaryfunction import *
IntervalsT = ['0'] * 5              # 存放輸入的時間間隔(時,分,秒,1/10,1/100)
shortcutk = ['Alt','F1','Alt','F2'] # 存放快捷鍵(開始1,開始2,結束1,結束2)
MouseB = ['none']                   # 存放滑鼠按鍵
MouseBcache = ['none']              # 滑鼠恢復緩存      
keyboardK = ['none'] * 5            # 存放鍵盤按鍵
keyboardKcache = ['none'] * 5       # 鍵盤恢復緩存
global MS,KS # 滑鼠鍵盤的啟用狀態
global SKeycache , A_startcombo , B_startcombo # 開始緩存狀態,開始組合鍵1,開始組合鍵2
global EKeycache , A_endcombo , B_endcombo     # 結束緩存狀態,結束組合鍵1,結束組合鍵2
MS = KS = False
SKeycache = [Alt,F1] # 開始緩存狀態預設
EKeycache = [Alt,F2] # 結束緩存狀態預設
A_startcombo = Alt   # 開始組合鍵1預設
B_startcombo = F1    # 開始組合鍵2預設
A_endcombo = Alt     # 結束組合鍵1預設
B_endcombo = F2      # 結束組合鍵2預設

# 暫停方法
def stopLoop():
    global stop
    stop = False
# 預設關閉紐方法
def Clos():
    global stop
    stop = False
    os._exit(0)

"""無窮Loop確認快捷鍵設置"""
def shortcut_key_start(keyA,KeyB):
    global SKeycache , A_startcombo , B_startcombo
    keyC = SKeycache[0]
    keyD = SKeycache[1]

    if keyA != keyC or KeyB != keyD:
        SKeycache[0] = keyA
        SKeycache[1] = KeyB
        A_startcombo = keyA
        B_startcombo = KeyB
def shortcut_key_stop(keyA,KeyB):
    global EKeycache , A_endcombo , B_endcombo
    keyC = EKeycache[0]
    keyD = EKeycache[1]

    if keyA != keyC or KeyB != keyD:
        EKeycache[0] = keyA
        EKeycache[1] = KeyB
        A_endcombo = keyA
        B_endcombo = KeyB

"""無窮Loop取得設置"""
def setup():
    while True:
        global button , combospeed
        time.sleep(0.5)
        hour = int(IntervalsT[0])
        Minute = int(IntervalsT[1])
        Seconds = int(IntervalsT[2])
        Tenthofasecond = int(IntervalsT[3])
        Hundredthsofasecond = int(IntervalsT[4])
        
        # 取得滑鼠按鍵
        button = MouseB[0]

        # 時間換算方法
        combospeed = speed(hour,Minute,Seconds,Tenthofasecond,Hundredthsofasecond)

        # 取得快捷鍵變化
        startshortcut = Judgmentshortcut(shortcutk[0],shortcutk[1]) 
        endshortcut = Judgmentshortcut(shortcutk[2],shortcutk[3])

        if startshortcut[0] != endshortcut[0] or startshortcut[1] != endshortcut[1]: 
            shortcut_key_start(*startshortcut)
            shortcut_key_stop(*endshortcut)
        elif startshortcut[1] == endshortcut[1]:
            messagebox.showerror("設置錯誤", "禁止相同的快捷鍵\n請重新設置")
            while True:
                time.sleep(1)
                startshortcut = Judgmentshortcut(shortcutk[0],shortcutk[1]) 
                endshortcut = Judgmentshortcut(shortcutk[2],shortcutk[3])
                if startshortcut[0] != endshortcut[0] or startshortcut[1] != endshortcut[1]: 
                    shortcut_key_start(*startshortcut)
                    shortcut_key_stop(*endshortcut)
                    break
setup = threading.Thread(target=setup)
setup.start()

"""無窮Loop監聽鍵盤按鍵"""
def start_listener():
    record_key = [] # 組合紀錄
    def on_press(key):
        global A_startcombo , B_startcombo , A_endcombo , B_endcombo
        try: 
            record_key.append(str(key)) # 紀錄組合狀態
            if len(record_key) == 2:
                if str(A_startcombo) == record_key[0] and str(B_startcombo) == record_key[1]:SetupComplete()
                elif str(A_endcombo) == record_key[0] and str(B_endcombo) == record_key[1]:stopLoop()    
        except AttributeError:
            pass

    def on_release(key):
        try:
            if len(record_key) > 1: # 當組合超過2鍵時將其清空
                record_key.clear()
        except AttributeError:
            pass
    #持續監聽鍵盤按鍵
    with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
        time.sleep(0.1)
        listener.join()
listener_thread = threading.Thread(target=start_listener)
listener_thread.start()

"""開始運行"""
def SetupComplete():
    global stop , MS , KS # MS = 滑鼠開起狀態 KS = 鍵盤開啟狀態
    stop = True
    
    try:
        # 啟用滑鼠連點
        if combospeed != 0 and button != 'none' and MS:
            Mcombo = threading.Thread(target=MouseRunning,args=(combospeed,button))
            Mcombo.start()
        elif combospeed != 0 and keyboardK.count('none') != 5 and KS:
            Kcombo = threading.Thread(target=keyboardRunning,args=(combospeed,*keyboardK))
            Kcombo.start()
    except NameError:
        messagebox.showerror("設置錯誤", "請設置間隔\n或啟用點擊") 

"""滑鼠連點運行"""
"""
為什麼要這麼麻煩,分開兩個線程,其實可以很簡潔合併?

因為假設我設置的combospeed為1小時,而我是將他設置為time.sleep(combospeed)
這樣設置的原因也是因為當我設 interval=combospeed 的話,我設1小時,迴圈就卡那了
他不能一直判斷我停止他了嗎,當然設置time.sleep(combospeed)也會有這問題
這就是我分成兩個線程的原因,一個用於判斷,另一個用於執行,就算我設1小時,還是能停
"""

# 檢測點擊線程是否被調用狀態
global clickstatu
clickstatu = True # 首次為開啟
# 滑鼠連點線程
def clickstart(combospeed,button):
    global stop , clickstatu 
    clickstatu = False          # 開始運行時先將連點調用關閉
    while stop:                 # 觸發暫停就會停止
        time.sleep(combospeed)  # 迴圈延遲時間就是設置的間隔
        pyautogui.click(x=None, y=None, interval=0 , clicks=numberofclicks(combospeed) , button=button) #點擊間隔0,點擊次數呼叫換算方法
    clickstatu = True           # 點擊完畢就開啟調用(線程中止,自動關閉)
# 該線程用來確認停止
def MouseRunning(combospeed,button):
    global stop , clickstatu
    while stop:             # 當我觸發暫停就會停止
        time.sleep(0.01)    # 每隔0.01去嘗試調用連點線程
        if clickstatu:      # 確認連點被調用狀態
            click = threading.Thread(target=clickstart,args=(combospeed,button)) 
            click.start()   # 開始連點線程
        while not stop:
            sys.exit(1)     # 拋出例外終止線程


"""鍵盤連點運行"""
def Keyboarclickstart(combospeed,*button):
    global stop , clickstatu

    clickstatu = False
    if button.count('none') == 4:
        while stop:
            time.sleep(combospeed)
            pyautogui.press([button[0]])
    elif button.count("none") == 3:
        while stop:
            time.sleep(combospeed)
            pyautogui.press([button[0],button[1]])
    elif button.count("none") == 2:
        while stop:
            time.sleep(combospeed)
            pyautogui.press([button[0],button[1],button[2]])
    elif button.count("none") == 1:
        while stop:
            time.sleep(combospeed)
            pyautogui.press([button[0],button[1],button[2],button[3]])
    elif button.count("none") == 0:
        while stop:
            time.sleep(combospeed)
            pyautogui.press([button[0],button[1],button[2],button[3],button[4]])
    clickstatu = True

def keyboardRunning(combospeed,*button):
    global stop , clickstatu
    while stop:
        time.sleep(0.01)
        if clickstatu:
            Keyboarclick = threading.Thread(target=Keyboarclickstart,args=(combospeed,*button)) 
            Keyboarclick.start()
        while not stop:
            sys.exit(1)

# 保存設置
def SaveSettings():
    # 開始快捷1,開始快捷2,結束快捷1,結束快捷2,滑鼠啟用狀態,鍵盤啟用狀態
    global A_startcombo , B_startcombo , A_endcombo , B_endcombo , MS , KS
    # 連點速度
    combospeed
    # 滑鼠按鈕
    button
    # 鍵盤按鍵
    keyboardK

    print(A_startcombo , B_startcombo , A_endcombo , B_endcombo , MS , KS,combospeed,button,keyboardK)
    messagebox.showinfo("保存設置", "\b\b保存成功\n\n預設為程式目錄下")


"""
try:
    fileName = "./Set.ini"

    infile = config.ConfigParser()
    infile.read(fileName,"UTF-8")

    start = infile.get("set","start")
    m = infile.get("set","minute")
    s = infile.get("set","second")
    button = infile.get("set","button")
    speed = infile.get("set","speed")

    YesorNo = input("已存在上次的設置,是否要重新設置(y/n):")

    if YesorNo == "y" or YesorNo == "Y":
        raise IOError()
    elif YesorNo == "n" or YesorNo == "N":
        pass
    else:
        raise IOError()



except:

    file = open("Set.ini","w")
    file.write("[set]\n")

    while True:

        start = input("請設置開始按鈕:")

        if len(start) == 0:
            print("輸入錯誤,不可為空\n")
        else:
            print("您的開始設定為:"+start+"\n")
            break

    file.write("start="+start+"\n")


    
    while True:

        m = input("請設置執行時間(分)沒有就打0:")
        s = input("請設置執行時間(秒)沒有就打0:")

        if len(m) == 0 or len(s) == 0:
            print("輸入錯誤,不可為空\n")
        else:
            print("執行時間設定為: {}分 {}秒 \n".format(m,s))
            break

    file.write("minute="+m+"\n")
    file.write("second="+s+"\n")



    while True:
        button = input("請設置連點的按鈕為(左鍵left)或(右鍵right),請輸入英文:").lower()
        if button in ['right','left'] :
            print("您的按鈕設定為:"+button+"\n")
            break
        else:
            print("請確認是否有輸入錯誤\n")

    file.write("button="+button+"\n")


    while True:
        speed = input("請設置連點的速度(1秒/0.1秒/0.01秒以此類推,輸入數字即可,太快電腦承受不了):")
        if len(speed) > 0 :
            print("您的速度設定為:"+speed+"\n")
            break
        else:
            print("請確認是否有輸入錯誤\n")

    file.write("speed="+speed+"\n")
    file.close()



def TimeCalculation(m,s,speed):
    
    frequency = (m*60 + s) / speed
    frequency = int(frequency)
    return frequency



time.sleep(0.5)
os.system("cls")

print("可直接在生成設定檔內更改設定")
print("開始快捷鍵:"+start)
print("執行時間為:{}分{}秒".format(m,s))
print("連點按鍵:"+button)
print("連點速度:"+speed)
print("按下 {} 即可開始運行".format(start))



speed = float(speed)
Time = TimeCalculation(int(m),int(s),speed)

def on_press(key):

    try:

        if key.char == start:
            
            print("開始運行~")
            pyautogui.click(x=None, y=None, interval=speed , clicks=Time  , button=button)
            print("結束運行~")

    except AttributeError:
        pass

def on_release(key):

    if key.char == keyboardK.Key.esc:
        print("結束")
        pass

with keyboardK.Listener(
       on_press=on_press,
       on_release=on_release) as listener:
   listener.join()
"""
# 取得輸入的時間
def Intervals(unit,time):
    value = time.get()
    if value != "":
        match unit:
            case "Hour":
                IntervalsT[0] = value
            case "Minute":
                IntervalsT[1] = value
            case "Seconds":
                IntervalsT[2] = value
            case "Tenthofasecond":
                IntervalsT[3] = value
            case "Hundredthsofasecond":
                IntervalsT[4] = value

# 取得快捷鍵設置
def shortcutkey(state,key):
    match state:
        case "S1":
            shortcutk[0] = key
        case "S2":
            shortcutk[1] = key
        case "E1":
            shortcutk[2] = key
        case "E2":
            shortcutk[3] = key

# 確認滑鼠啟用狀態
def MouseSwitch(state):
        global MS
        MS = state
        MouseB[0] = MouseBcache[0] # 當滑鼠啟用,會將前面對於滑鼠的設置還原
        for i in range(len(keyboardK)): # 當滑鼠啟用,會將鍵盤設置全部變成none
            keyboardK[i] = 'none'
# 確認鍵盤啟用狀態
def keyboardSwitch(state):
        global KS
        KS = state
        MouseB[0] = 'none' # 當鍵盤啟用,會將滑鼠設置變成none
        for i in range(len(keyboardKcache)): # 當鍵盤啟用,會將前面對於鍵盤的設置還原
            keyboardK[i] = keyboardKcache[i]

# 取得設置的滑鼠按鍵
def MouseButton(key):
    if MS:
        match key:
            case "無":
                key = "none"
                MouseB[0] = key
            case "右鍵":
                key = "right"
                MouseB[0] = key
            case "左鍵":
                key = "left"
                MouseB[0] = key
    MouseBcache[0] = MouseB[0]

# 取得鍵盤按鍵
def keyboardkey(unit,key):
    value = key.get()
    if KS:
        match unit:
            case "keybA":
                keyboardK[0] = value
            case "keybB":
                keyboardK[1] = value
            case "keybC":
                keyboardK[2] = value
            case "keybD":
                keyboardK[3] = value
            case "keybE":
                keyboardK[4] = value
    for i in range(len(keyboardK)):
        keyboardKcache[i] = keyboardK[i]
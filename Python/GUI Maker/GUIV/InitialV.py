import os
import sys
import time
from tkinter import messagebox , ttk
import tkinter as tk
import warnings
from tkinter import messagebox
dir = os.path.dirname(os.path.abspath(__file__)) 
sys.path.append(dir) # 將該文件絕對路徑,加入至Python的文件查找路徑
from ClickMain import *
from Secondaryfunction import *
from PIL import Image, ImageTk

def InitialGUI():
    
    """載入區域"""
    # 載入GUI介面
    root = tk.Tk()

    # 取得當前完整路徑
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # 將路徑設置為絕對路徑
    icon_path = os.path.join(current_dir,'click.ico')

    # 忽略警告
    warnings.filterwarnings("ignore", message="Image was not the expected size", category=UserWarning)

    # PIL載入圖檔(找絕對路徑)
    image = Image.open(icon_path)
    # 設置圖像大小
    image = image.resize((64, 64))
    # 丟回給tkinter
    titleImage = ImageTk.PhotoImage(image)

    """設置區域"""
    # 將圖片設置為標題圖標
    root.iconphoto(True, titleImage)
    root.title("遊俠牌自動連點器 v1.0 GUI")

    # GUI介面大小
    root.geometry("400x280")
    # GUI每次執行時位置
    root.geometry("+640+320")
    # 按下GUI預設關閉按鈕呼叫方法
    root.protocol("WM_DELETE_WINDOW",Clos)
    # 窗口置頂
    root.wm_attributes('-topmost', True)
    # 鎖定調整大小
    root.resizable(False, False)

    # 顏色設置
    root.configure(background='#C6DCE4')
    root.tk_setPalette(background='#F2D1D1')
    TextColor = "#00235B"
    TextBackgroundColor = "#FFE6E6"
    MarqueeHighlight = "#DAEAF1"
    MarqueeHighlight2 = "#C6DCE4"
    AreaBoxColor = "#FFE6E6"
    BorderColor = "#BE6DB7"


    """============================最外層方框==================================="""
    # 整體外框
    frame_width = 390
    frame_height = 230
    frame_x = 5
    frame_y = 15

    # 創建底部方框
    frame = tk.Canvas(root, width=frame_width , height=frame_height, bd=0, highlightthickness=0 , bg=AreaBoxColor)
    # 方框繪製位置座標
    frame.place(x=frame_x, y=frame_y)
    # 方框繪製起始座標0,0 方框大小
    frame.create_rectangle(0,0,frame_width, frame_height, width=1.5 ,outline=BorderColor)
    """============================頂部速度方框繪製==================================="""
    SpeedBox_width = frame_width-10
    SpeedBox_height = frame_height-160

    SpeedBox = tk.Canvas(frame, width=SpeedBox_width, height=SpeedBox_height, bd=0 , highlightthickness=0 , bg=AreaBoxColor)
    SpeedBox.place(x=frame_x, y=frame_y-10)
    SpeedBox.create_rectangle(0,0,SpeedBox_width,SpeedBox_height,width=1.5,outline=BorderColor,dash=(5,5))
    """============================快捷鍵方框繪製==================================="""
    ShortcutBox_width = frame_width-202.5
    ShortcutBox_height = frame_height-155

    ShortcutBox = tk.Canvas(frame, width=ShortcutBox_width , height=ShortcutBox_height, bd=0, highlightthickness=0 , bg=AreaBoxColor)
    ShortcutBox.place(x=frame_x, y=frame_y+65)
    ShortcutBox.create_rectangle(0,0,ShortcutBox_width,ShortcutBox_height,width=1.5 ,outline=BorderColor)
    """============================滑鼠按鍵方框繪製==================================="""
    MouseBox_width = frame_width-202.5
    MouseBox_height = frame_height-155

    MouseBox = tk.Canvas(frame, width=MouseBox_width , height=MouseBox_height, bd=0, highlightthickness=0 , bg=AreaBoxColor)
    MouseBox.place(x=frame_x+192, y=frame_y+65)
    MouseBox.create_rectangle(0,0,MouseBox_width,MouseBox_height,width=1.5 ,outline=BorderColor)
    """============================鍵盤按鍵方框繪製==================================="""
    keyboardBox_width = frame_width-10
    keyboardBox_height = frame_height-167

    keyboardBox = tk.Canvas(frame, width=keyboardBox_width , height=keyboardBox_height , bd=0 , highlightthickness=0 , bg = AreaBoxColor)
    keyboardBox.place(x=frame_x, y=frame_y+145)
    keyboardBox.create_rectangle(0,0,keyboardBox_width,keyboardBox_height,width=1.5 ,outline=BorderColor)
    """============================底層區域按鈕==================================="""
    BBH = 249

    startbutton = tk.Button(root, text="開始運行" , command=SetupComplete)
    startbutton.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    startbutton.place(x=91,y=BBH)

    stopbutton = tk.Button(root, text="中止運行" , command=stopLoop)
    stopbutton.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    stopbutton.place(x=166,y=BBH)

    savebutton = tk.Button(root, text="保存設置",command=save)
    savebutton.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    savebutton.place(x=241,y=BBH)

    """============================間格設置==================================="""
    label = tk.Label(root, text="點擊間隔")
    label.config(font=("Arial Bold", 11), fg=TextColor , bg=TextBackgroundColor)
    label.place(in_=frame, x=frame_x+10, y=frame_y-23)

    # 調用驗證輸入是否為數字
    timeV = (root.register(validate_numeric_input), "%P")

    HourT = tk.Label(root, text="小時")
    HourT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    HourT.place(in_=SpeedBox, x=frame_x+15, y=frame_y-3)
    Hour = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight, validate="key", validatecommand=timeV)
    Hour.bind("<KeyRelease>", lambda event, unit=Hour: Intervals("Hour", unit))
    Hour.place(in_=SpeedBox, x=frame_x+5, y=frame_y+20)

    MinuteT = tk.Label(root, text="分鐘")
    MinuteT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    MinuteT.place(in_=SpeedBox, x=frame_x+75, y=frame_y-3)
    Minute = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight, validate="key", validatecommand=timeV)
    Minute.bind("<KeyRelease>", lambda event, unit=Minute: Intervals("Minute", unit))
    Minute.place(in_=SpeedBox, x=frame_x+65, y=frame_y+20)

    SecondsT = tk.Label(root, text="秒數")
    SecondsT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    SecondsT.place(in_=SpeedBox, x=frame_x+135, y=frame_y-3)
    Seconds = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight, validate="key", validatecommand=timeV)
    Seconds.bind("<KeyRelease>", lambda event, unit=Seconds: Intervals("Seconds", unit))
    Seconds.place(in_=SpeedBox, x=frame_x+125, y=frame_y+20)

    TenthofasecondT = tk.Label(root, text="1/10秒")
    TenthofasecondT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    TenthofasecondT.place(in_=SpeedBox, x=frame_x+190, y=frame_y-3)
    Tenthofasecond = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight, validate="key", validatecommand=timeV)
    Tenthofasecond.bind("<KeyRelease>", lambda event, unit=Tenthofasecond: Intervals("Tenthofasecond", unit))
    Tenthofasecond.place(in_=SpeedBox, x=frame_x+185, y=frame_y+20)

    HundredthsofasecondT = tk.Label(root, text="1/100秒")
    HundredthsofasecondT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    HundredthsofasecondT.place(in_=SpeedBox, x=frame_x+247, y=frame_y-3)
    Hundredthsofasecond = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight, validate="key", validatecommand=timeV)
    Hundredthsofasecond.bind("<KeyRelease>", lambda event, unit=Hundredthsofasecond: Intervals("Hundredthsofasecond", unit))
    Hundredthsofasecond.place(in_=SpeedBox, x=frame_x+245, y=frame_y+20)

    def unblock():
        key = tk.Toplevel(root)
        key.geometry("220x150+{}+{}".format(int((root.winfo_screenwidth() / 2) - (220 / 2)), int((root.winfo_screenheight() / 2) - (150 / 2))))
        key.title("功能解鎖")

        def verify():
            send_button['state'] = 'disabled'
            for i in range(101):
                bar['value'] = i
                val.set(f'{i}%')
                root.update()
                time.sleep(0.01)
            send_button['state'] = 'normal'
            Authentication(key_entry.get())
            key.destroy()

        val = tk.StringVar()
        val.set('0%')
        label = tk.Label(key, textvariable=val)
        label.place(x=20,y=3)
        bar = ttk.Progressbar(key, mode='determinate')
        bar.pack(pady=3)

        key_label = tk.Label(key, text="請輸入你的 Key:", font=("Arial Bold", 12), fg=TextColor)
        key_label.pack(pady=10)
        key_entry = tk.Entry(key,font=("Arial", 10), width=20)
        key_entry.pack(pady=5)

        button_frame = tk.Frame(key)
        button_frame.place(in_=key,x=50,y=110)
        send_button = tk.Button(button_frame, text="送出", command=verify , font=("Arial Bold", 10), fg=TextColor, bg=TextBackgroundColor)
        send_button.pack(side="left", padx=10)
        cancel_button = tk.Button(button_frame, text="取消", font=("Arial Bold", 10), fg=TextColor, bg=TextBackgroundColor, command=key.destroy)
        cancel_button.pack(side="left", padx=10)

    ReservedT = tk.Label(root, text="功能解鎖")
    ReservedT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    ReservedT.place(in_=SpeedBox, x=frame_x+305, y=frame_y-3)
    Reserved = tk.Button(root, text="解鎖",command=unblock)
    Reserved.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    Reserved.place(in_=SpeedBox,x=frame_x+315,y=frame_y+20)

    """============================快捷設置==================================="""
    startshortcut = tk.Label(root, text="開始快捷:")
    startshortcut.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    startshortcut.place(in_=ShortcutBox, x=frame_x, y=frame_y-6)

    endshortcut = tk.Label(root, text="結束快捷:")
    endshortcut.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    endshortcut.place(in_=ShortcutBox, x=frame_x, y=frame_y+28)

    # 及時取的變化的值,並且傳遞至shortcutkey
    def S1(*Key):
        value = S_shortcutkey1_option.get()
        shortcutkey("S1",value)
    # 開始快捷1
    S_shortcutkey1 = ["Ctrl", "Alt", "Shift"]
    S_shortcutkey1_option = tk.StringVar()
    S_shortcutkey1_option.set(S_shortcutkey1[1])
    S_shortcutkey1_option.trace('w',S1) # W 為及時變化,呼叫S1函式
    dropdown = tk.OptionMenu(ShortcutBox, S_shortcutkey1_option,*S_shortcutkey1)
    dropdown.config(width=3, fg=TextColor , bg=TextBackgroundColor)
    dropdown.place(x=70, y=5)

    # 開始快捷2
    S_shortcutkey2 = ttk.Combobox(ShortcutBox, values=["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"])
    S_shortcutkey2.configure(width=3, height=6, foreground=TextColor, background=TextBackgroundColor, state="readonly")
    S_shortcutkey2.set("F1")
    S_shortcutkey2.bind("<<ComboboxSelected>>", lambda event: shortcutkey("S2",S_shortcutkey2.get()))
    S_shortcutkey2.place(x=139, y=11)

    def E1(*Key):
        value = E_shortcutkey1_option.get()
        shortcutkey("E1",value)
    # 結束快捷1
    E_shortcutkey1 = ["Ctrl", "Alt", "Shift"]
    E_shortcutkey1_option = tk.StringVar()
    E_shortcutkey1_option.set(E_shortcutkey1[1])
    E_shortcutkey1_option.trace('w',E1)
    dropdown = tk.OptionMenu(ShortcutBox, E_shortcutkey1_option,*E_shortcutkey1)
    dropdown.config(width=3, fg=TextColor , bg=TextBackgroundColor)
    dropdown.place(x=70, y=40)

    # 結束快捷2
    E_shortcutkey2 = ttk.Combobox(ShortcutBox, values=["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"])
    E_shortcutkey2.configure(width=3, height=6, foreground=TextColor, background=TextBackgroundColor, state="readonly")
    E_shortcutkey2.set("F2")
    E_shortcutkey2.bind("<<ComboboxSelected>>", lambda event: shortcutkey("E2",E_shortcutkey2.get()))
    E_shortcutkey2.place(x=139, y=45)
    """============================滑鼠設置==================================="""
    def mouse(*Key):
        value = mousebutton_option.get()
        Mousebutton(value)
    mousebutton = ["無","右鍵","左鍵"]
    mousebutton_option = tk.StringVar()
    mousebutton_option.set(mousebutton[0])
    mousebutton_option.trace('w',mouse)

    #單選紐預設為為選取
    mousedefault = tk.BooleanVar(value=False)
    keyboarddefault = tk.BooleanVar(value=False)

    def enablemouse():
        MouseSwitch(True)
        mouseoptions.config(state='normal')
        keyboard_AT.config(state='disabled')
        keyboard_A.config(state='disabled')
        keyboard_BT.config(state='disabled')
        keyboard_B.config(state='disabled')
        keyboard_CT.config(state='disabled')
        keyboard_C.config(state='disabled')
        keyboard_DT.config(state='disabled')
        keyboard_D.config(state='disabled')
        keyboard_ET.config(state='disabled')
        keyboard_E.config(state='disabled')
        keyboarddefault.set(False)

    def enablekeyboard():
        keyboardSwitch(True)
        mouseoptions.config(state='disabled')
        keyboard_AT.config(state='normal')
        keyboard_A.config(state='normal')
        keyboard_BT.config(state='normal')
        keyboard_B.config(state='normal')
        keyboard_CT.config(state='normal')
        keyboard_C.config(state='normal')
        keyboard_DT.config(state='normal')
        keyboard_D.config(state='normal')
        keyboard_ET.config(state='normal')
        keyboard_E.config(state='normal')
        mousedefault.set(False)

    mouseradio = tk.Radiobutton(MouseBox, text="啟用滑鼠連點", variable=mousedefault , command=enablemouse)
    mouseradio.config(fg=TextColor, bg=TextBackgroundColor)
    mouseradio.place(x=5, y=8)

    keyboardradio = tk.Radiobutton(MouseBox, text="啟用鍵盤連點", variable=keyboarddefault , command=enablekeyboard)
    keyboardradio.config(fg=TextColor, bg=TextBackgroundColor)
    keyboardradio.place(x=5, y=40)

    mouseoptionsT = tk.Label(root, text="按鍵選擇")
    mouseoptionsT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor)
    mouseoptionsT.place(in_=MouseBox, x=110, y=8)
    mouseoptions = tk.OptionMenu(MouseBox, mousebutton_option, *mousebutton)
    mouseoptions.config(width=3, fg=TextColor, bg=TextBackgroundColor , state='disabled')
    mouseoptions.place(x=110, y=37)

    """============================鍵盤設置==================================="""
    keyboard_AT = tk.Label(root, text="鍵盤自訂1")
    keyboard_AT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor, state='disabled')
    keyboard_AT.place(in_=keyboardBox, x=frame_x, y=frame_y-13)
    keyboard_A = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight2)
    keyboard_A.config(state='disabled')
    keyboard_A.place(in_=keyboardBox, x=frame_x+4, y=frame_y+10)
    keyboard_A.bind("<KeyRelease>", lambda event, unit=keyboard_A: keyboardkeys("keybA", unit))
    def keyA(event):
        if event.keycode in []:return
        keyboard_A.config(state='normal')
        keyboard_A.delete(0, 'end')
        keyboard_A.insert(0, event.char)
        keyboard_A.config(state='readonly')

    """鍵盤2"""
    keyboard_BT = tk.Label(root, text="鍵盤自訂2")
    keyboard_BT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor, state='disabled')
    keyboard_BT.place(in_=keyboardBox, x=frame_x+70, y=frame_y-13)
    keyboard_B = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight2)
    keyboard_B.config(state='disabled')
    keyboard_B.place(in_=keyboardBox, x=frame_x+74, y=frame_y+10)
    keyboard_B.bind("<KeyRelease>", lambda event, unit=keyboard_B: keyboardkeys("keybB", unit))
    def keyB(event):
        if event.keycode in []:return
        keyboard_B.config(state='normal')
        keyboard_B.delete(0, 'end')
        keyboard_B.insert(0, event.char)
        keyboard_B.config(state='readonly')

    """鍵盤3"""
    keyboard_CT = tk.Label(root, text="鍵盤自訂3")
    keyboard_CT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor, state='disabled')
    keyboard_CT.place(in_=keyboardBox, x=frame_x+140, y=frame_y-13)
    keyboard_C = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight2)
    keyboard_C.config(state='disabled')
    keyboard_C.place(in_=keyboardBox, x=frame_x+144, y=frame_y+10)
    keyboard_C.bind("<KeyRelease>", lambda event, unit=keyboard_C: keyboardkeys("keybC", unit))
    def keyC(event):
        if event.keycode in []:return
        keyboard_C.config(state='normal')
        keyboard_C.delete(0, 'end')
        keyboard_C.insert(0, event.char)
        keyboard_C.config(state='readonly')

    """鍵盤4"""
    keyboard_DT = tk.Label(root, text="鍵盤自訂4")
    keyboard_DT.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor, state='disabled')
    keyboard_DT.place(in_=keyboardBox, x=frame_x+210, y=frame_y-13)
    keyboard_D = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight2)
    keyboard_D.config(state='disabled')
    keyboard_D.place(in_=keyboardBox, x=frame_x+214, y=frame_y+10)
    keyboard_D.bind("<KeyRelease>", lambda event, unit=keyboard_D: keyboardkeys("keybD", unit))
    def keyD(event):
        if event.keycode in []:return
        keyboard_D.config(state='normal')
        keyboard_D.delete(0, 'end')
        keyboard_D.insert(0, event.char)
        keyboard_D.config(state='readonly')

    """鍵盤5"""
    keyboard_ET = tk.Label(root, text="鍵盤自訂5")
    keyboard_ET.config(font=("Arial Bold", 10), fg=TextColor , bg=TextBackgroundColor, state='disabled')
    keyboard_ET.place(in_=keyboardBox, x=frame_x+280, y=frame_y-13)
    keyboard_E = tk.Entry(root, font=("Microsoft Positive Bold", 12), width=5 , justify='center',borderwidth=3, highlightthickness=2.5, highlightcolor=MarqueeHighlight2)
    keyboard_E.config(state='disabled')
    keyboard_E.place(in_=keyboardBox, x=frame_x+284, y=frame_y+10)
    keyboard_E.bind("<KeyRelease>", lambda event, unit=keyboard_E: keyboardkeys("keybE", unit))
    def keyE(event):
        if event.keycode in []:return
        keyboard_E.config(state='normal')
        keyboard_E.delete(0, 'end')
        keyboard_E.insert(0, event.char)
        keyboard_E.config(state='readonly')

    keyboard_A.bind('<Key>', keyA)
    keyboard_B.bind('<Key>', keyB)
    keyboard_C.bind('<Key>', keyC)
    keyboard_D.bind('<Key>', keyD)
    keyboard_E.bind('<Key>', keyE)
    #啟動UI介面監聽直到按下關閉
    root.mainloop()
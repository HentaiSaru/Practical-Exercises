from tkinter import messagebox
import tkinter
from pynput import keyboard
import configparser as config
import win32gui
import win32con
import threading
import os

# 時間輸入驗證是否為數字
def validate_numeric_input(new_value):
    return new_value.isdigit()

# 保存設置
def save():
    messagebox.showinfo("保存設置", "\b\b保存成功\n\n預設為程式目錄下")

# 驗證解鎖
def Authentication(key):
    if  key == '123':
        messagebox.showinfo("高級版解鎖", "功能待開發")
    else:
        messagebox.showerror("高級版解鎖", "功能待開發")


""" Main的方法 """

# 轉換所有時間單位
def speed(h,m,s,t,H):
    if h != 0:
        h *= 3600
    if m != 0:
        m *= 60
    if t != 0:
        t /= 10
    if H != 0:
        H /= 100
    Intervals = h+m+s+t+H
    if Intervals == 'none':
        Intervals = 0
    return Intervals

# 點擊次數換算
def numberofclicks(Var):
    if Var < 1:
        if Var >= 0.1:
            return 20
        else:return 15
    return Var

# 設置Key值
Ctrl = keyboard.Key.ctrl_l
Alt = keyboard.Key.alt_l
Shift = keyboard.Key.shift_l
F1 = keyboard.Key.f1
F2 = keyboard.Key.f2
F3 = keyboard.Key.f3
F4 = keyboard.Key.f4
F5 = keyboard.Key.f5
F6 = keyboard.Key.f6
F7 = keyboard.Key.f7
F8 = keyboard.Key.f8
F9 = keyboard.Key.f9
F10 = keyboard.Key.f10
F11 = keyboard.Key.f11
F12 = keyboard.Key.f12
key_combination = [Ctrl,Alt,Shift,F1,F2,F3,F4,F5,F6,F7,F8,F9,F10,F11,F12]

# 判斷快捷設置(超爛的多層判斷)
def Judgmentshortcut(keyA,KeyB):
    match keyA:
        case 'Ctrl':keyA = Ctrl
        case 'Alt':keyA = Alt
        case 'Shift':keyA = Shift
    match KeyB:
        case "F1":KeyB = F1
        case "F2":KeyB = F2
        case "F3":KeyB = F3
        case "F4":KeyB = F4
        case "F5":KeyB = F5
        case "F6":KeyB = F6
        case "F7":KeyB = F7
        case "F8":KeyB = F8
        case "F9":KeyB = F9
        case "F10":KeyB = F10
        case "F11":KeyB = F11
        case "F12":KeyB = F12
    return keyA,KeyB
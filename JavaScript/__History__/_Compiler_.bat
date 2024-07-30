@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
%1 %2
ver | find "5." >nul && goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof

:Admin
cls

set "file="
set "Choice="
@ ECHO [1m
@ ECHO ===================================
@ ECHO.
@ ECHO   [32mJavaScript Compiler [37m
@ ECHO.
@ ECHO [33m 使用說明:
@ ECHO.
@ ECHO 安裝
@ ECHO [34mnpm install uglify-js -g
@ ECHO npm i -g google-closure-compiler[33m
@ ECHO.
@ ECHO [預設路徑] 輸入為當前目錄, 輸出為 R, 輸入檔名(不含 .js 後墜)
@ ECHO.
@ ECHO Mode:
@ ECHO  [0] uglifyjs 美化
@ ECHO  [1] uglifyjs 壓縮/混淆
@ ECHO  [2] uglifyjs 壓縮/美化
@ ECHO  [3] google-closure-compiler 預設
@ ECHO  [4] uglifyjs(壓縮/混淆) + google-closure-compiler(預設)
@ ECHO  [5] google-closure-compiler(預設) + uglifyjs(壓縮/混淆)
@ ECHO  [6] google-closure-compiler(預設) + uglifyjs(壓縮/美化)[37m
@ ECHO ===================================
set /p file="輸入檔名(Enter) : "
set /p Choice="編譯模式(Mode) : "
cls

if "!Choice!" equ "0" (
    start /B uglifyjs "!file!.js" -b -o R:/U_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "1" (
    start /B uglifyjs "!file!.js" -c -m -o R:/U_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "2" (
    start /B uglifyjs "!file!.js" -c -b -o R:/U_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "3" (
    start /B google-closure-compiler "!file!.js" --js_output_file R:/G_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "4" (
    start /B uglifyjs "!file!.js" -c -m -o R:/U_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "5" (
    start /B google-closure-compiler "!file!.js" --js_output_file R:/G_Compiler.js >nul
    goto :WaitFile
) else if "!Choice!" equ "6" (
    start /B google-closure-compiler "!file!.js" --js_output_file R:/G_Compiler.js >nul
    goto :WaitFile
)

:WaitFile
if not exist "R:/U_Compiler.js" if not exist "R:/G_Compiler.js" (
    timeout /t 1 >nul
    goto WaitFile
)

if exist "R:/U_Compiler.js" start R:/U_Compiler.js >nul
if exist "R:/G_Compiler.js" start R:/G_Compiler.js >nul
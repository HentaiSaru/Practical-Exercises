@echo off
chcp 65001 >nul 2>&1
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
cls

@ ECHO [1m
@ ECHO ===================================
@ ECHO.
@ ECHO        [36m JavaScript Compiler [37m
@ ECHO.
@ ECHO [31m 使用前確保安裝了 [37m
@ ECHO [32m npm i -g google-closure-compiler
@ ECHO  npm install uglify-js -g [37m
@ ECHO.
@ ECHO.
@ ECHO [35m 路徑預設: 輸入為當前目錄/輸出為 R
@ ECHO  只要輸入檔名即可(不含 .js 後墜) [37m
@ ECHO.
@ ECHO ===================================

:choose

@ ECHO.
set /p file="輸入檔名後按下(Enter) : "
@ ECHO.
Choice /C 12 /N /M "選擇編譯模式(1: google / 2: uglifyjs) : "

if %errorlevel% == 1 (

google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js

) else if %errorlevel% == 2 (

uglifyjs %file%.js -m -c -o R:/U_Compiler.js

)
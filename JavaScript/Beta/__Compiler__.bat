@echo off
chcp 65001 >nul 2>&1
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
cls

:: 混淆代碼 但會增加體積 (https://lizh.gitbook.io/knowledge/research/javascript-jia-mi-hun-xiao)
:: npm install --save-dev javascript-obfuscator

@ ECHO [1m
@ ECHO ===================================
@ ECHO.
@ ECHO        [32m JavaScript Compiler [37m
@ ECHO.
@ ECHO [34m npm i -g google-closure-compiler
@ ECHO  npm install uglify-js -g [37m
@ ECHO.
@ ECHO [33m 使用說明:
@ ECHO.
@ ECHO  [預設路徑] 輸入為當前目錄, 輸出為 R, 輸入檔名(不含 .js 後墜)
@ ECHO.
@ ECHO  Mode:
@ ECHO  [1] google-closure-compiler 預設編譯模式
@ ECHO  [2] uglifyjs 壓縮/混淆
@ ECHO  [3] uglifyjs 壓縮/美化 [37m
@ ECHO.
@ ECHO ===================================

:choose

@ ECHO.
set /p file="輸入檔名(Enter) : "
@ ECHO.
Choice /C 123 /N /M "編譯模式(Mode) : "

if %errorlevel% == 1 (

google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js

) else if %errorlevel% == 2 (

uglifyjs %file%.js -c -m -o R:/U_Compiler.js

) else if %errorlevel% == 3 (

uglifyjs %file%.js -c -b -o R:/U_Compiler.js

)
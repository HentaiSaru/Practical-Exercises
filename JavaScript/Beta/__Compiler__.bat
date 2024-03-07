@echo off
chcp 65001 >nul 2>&1
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
cls

:: 混淆代碼 但會增加體積 (https://lizh.gitbook.io/knowledge/research/javascript-jia-mi-hun-xiao)
:: npm install --save-dev javascript-obfuscator

:choose
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
@ ECHO  [1] uglifyjs 壓縮/混淆
@ ECHO  [2] uglifyjs 壓縮/美化
@ ECHO  [3] google-closure-compiler 預設
@ ECHO  [4] uglifyjs(壓縮/混淆) + google-closure-compiler(預設)
@ ECHO  [5] google-closure-compiler(預設) + uglifyjs(壓縮/混淆)  [37m
@ ECHO.
@ ECHO ===================================

@ ECHO.
set /p file="輸入檔名(Enter) : "
@ ECHO.
Choice /C 12345 /N /M "編譯模式(Mode) : "
cls

if %errorlevel% == 1 (

start /B uglifyjs %file%.js -c -m -o R:/U_Compiler.js > NUL
start R:/U_Compiler.js > NUL

goto choose

) else if %errorlevel% == 2 (

start /B uglifyjs %file%.js -c -b -o R:/U_Compiler.js > NUL
start R:/U_Compiler.js > NUL

goto choose

) else if %errorlevel% == 3 (

start /B google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js > NUL
start R:/G_Compiler.js > NUL

goto choose

) else if %errorlevel% == 4 (

start /B uglifyjs %file%.js -c -m -o R:/U_Compiler.js > NUL
start /B google-closure-compiler R:/U_Compiler.js --js_output_file R:/G_Compiler.js > NUL
start R:/G_Compiler.js > NUL
goto choose

) else if %errorlevel% == 5 (

start /B google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js > NUL
start /B uglifyjs R:/G_Compiler.js -c -m -o R:/U_Compiler.js > NUL
start R:/U_Compiler.js > NUL
goto choose

)
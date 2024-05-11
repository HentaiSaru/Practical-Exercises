@echo off
chcp 65001 >nul 2>&1
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
cls

:: 混淆代碼 但會增加體積 (https://lizh.gitbook.io/knowledge/research/javascript-jia-mi-hun-xiao)
:: npm install --save-dev javascript-obfuscator

:Menu
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
@ ECHO  [0] uglifyjs 美化
@ ECHO  [1] uglifyjs 壓縮/混淆
@ ECHO  [2] uglifyjs 壓縮/美化
@ ECHO  [3] google-closure-compiler 預設
@ ECHO  [4] uglifyjs(壓縮/混淆) + google-closure-compiler(預設)
@ ECHO  [5] google-closure-compiler(預設) + uglifyjs(壓縮/混淆)
@ ECHO  [6] google-closure-compiler(預設) + uglifyjs(壓縮/美化)  [37m
@ ECHO.
@ ECHO ===================================

@ ECHO.
set /p file="輸入檔名(Enter) : "
@ ECHO.
set /p Choice="編譯模式(Mode) : "
cls

if %Choice% equ 0 (

start /B uglifyjs %file%.js -b -o R:/U_Compiler.js > NUL

:Wait_00
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_00
)

start R:/U_Compiler.js > NUL

goto Menu

) else if %Choice% equ 1 (

start /B uglifyjs %file%.js -c -m -o R:/U_Compiler.js > NUL

:Wait_01
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_01
)

start R:/U_Compiler.js > NUL

goto Menu

) else if %Choice% equ 2 (

start /B uglifyjs %file%.js -c -b -o R:/U_Compiler.js > NUL

:Wait_02
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_02
)

start R:/U_Compiler.js > NUL

goto Menu

) else if %Choice% equ 3 (

start /B google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js > NUL

:Wait_03
if not exist "R:/G_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_03
)

start R:/G_Compiler.js > NUL

goto Menu

) else if %Choice% equ 4 (

start /B uglifyjs %file%.js -c -m -o R:/U_Compiler.js > NUL

:Wait_04
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_04
)

start /B google-closure-compiler R:/U_Compiler.js --js_output_file R:/G_Compiler.js > NUL

:Wait_05
if not exist "R:/G_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_05
)

start R:/G_Compiler.js > NUL

goto Menu

) else if %Choice% equ 5 (

start /B google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js > NUL

:Wait_06
if not exist "R:/G_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_06
)

start /B uglifyjs R:/G_Compiler.js -c -m -o R:/U_Compiler.js > NUL

:Wait_07
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_07
)

start R:/U_Compiler.js > NUL

goto Menu

) else if %Choice% equ 6 (

start /B google-closure-compiler %file%.js --js_output_file R:/G_Compiler.js > NUL

:Wait_08
if not exist "R:/G_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_08
)

start /B uglifyjs R:/G_Compiler.js -c -b -o R:/U_Compiler.js > NUL

:Wait_09
if not exist "R:/U_Compiler.js" (
    timeout /t 01 >nul
    goto Wait_09
)

start R:/U_Compiler.js > NUL

goto Menu

)
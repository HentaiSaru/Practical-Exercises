[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Global:InitIndex = 0
$Global:ScriptPath = $PSScriptRoot

function Index {
    $Global:InitIndex++
    return "[$InitIndex]"
}

function console {
    param (
        [string]$text,
        [string]$type = 'p',
        [string]$foregroundColor = 'White',
        [string]$backgroundColor = 'Black'
    )
    $Host.UI.RawUI.ForegroundColor = [ConsoleColor]::$foregroundColor
    $Host.UI.RawUI.BackgroundColor = [ConsoleColor]::$backgroundColor

    switch ($type) {
        "i" {return Read-Host "[1m$text"}
        Default {
            Write-Host "[1m$text"
        }
    }
}

function Menu() {
    $file = $null
    $choice = $null
    $Global:InitIndex = 0

    Clear-Host
    console "===================================`n" -foregroundColor 'Magenta'
    console "       JavaScript Compiler`n" -foregroundColor 'Cyan'
    console "安裝:" -foregroundColor 'Red'
    console "mnpm install uglify-js -g" -foregroundColor 'Green'
    console "npm i -g google-closure-compiler`n" -foregroundColor 'Green'
    console "[預設路徑] 輸入為當前目錄, 輸出為 R, 輸入檔名(不含 .js 後墜)`n" -foregroundColor 'Yellow'
    console "模式:" -foregroundColor 'Red'
    console "$(Index) uglifyjs 美化" -foregroundColor 'Yellow'
    console "$(Index) uglifyjs 壓縮/混淆" -foregroundColor 'Yellow'
    console "$(Index) uglifyjs 壓縮/美化" -foregroundColor 'Yellow'
    console "$(Index) google-closure-compiler 預設" -foregroundColor 'Yellow'
    console "$(Index) uglifyjs(壓縮/混淆) + google-closure-compiler(預設)" -foregroundColor 'Yellow'
    console "$(Index) google-closure-compiler(預設) + uglifyjs(壓縮/混淆)" -foregroundColor 'Yellow'
    console "$(Index) google-closure-compiler(預設) + uglifyjs(壓縮/美化)" -foregroundColor 'Yellow'
    console "===================================" -foregroundColor 'Magenta'

    $file = console "輸入檔名(Enter)" 'i'
    $choice = console "編譯模式(Mode)" 'i'

    return $file, $choice
}

function Main {
    $Value = Menu
    $Path = "$Global:ScriptPath\$($Value[0]).js"
    Clear-Host

    if (-not(Test-Path $Path)) {
        console "不存在的路徑" 'Red'
        Start-Sleep -Seconds 1.3
        Main
    }

    $UPath = "R:\U_Compiler.js"
    $GPath = "R:\G_Compiler.js" 
    switch ($Value[1]) {
        0 {exit}
        1 { # uglifyjs 美化
            uglifyjs $Path -b -o $UPath
        }
        2 { # uglifyjs 壓縮/混淆
            uglifyjs $Path -c -m -o $UPath
        }
        3 { # uglifyjs 壓縮/美化
            uglifyjs $Path -c -b -o $UPath
        }
        4 { # google-closure-compiler 預設
            google-closure-compiler $Path --js_output_file $GPath
        }
        5 { # uglifyjs(壓縮/混淆) + google-closure-compiler(預設)
            uglifyjs $Path -c -m -o $UPath
            google-closure-compiler $UPath --js_output_file $GPath
        }
        6 { # google-closure-compiler(預設) + uglifyjs(壓縮/混淆)
            google-closure-compiler $Path --js_output_file $GPath
            uglifyjs $GPath -c -m -o $UPath
        }
        7 { # google-closure-compiler(預設) + uglifyjs(壓縮/美化)
            google-closure-compiler $Path --js_output_file $GPath
            uglifyjs $GPath -c -b -o $UPath
        }
        Default {
            console "不存在的模式" 'Red'
            Start-Sleep -Seconds 1.3
        }
    }

    Main
}

Main
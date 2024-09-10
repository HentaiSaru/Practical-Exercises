# 加載 HtmlAgilityPack 程式集
Add-Type -Path "C:\PowerShellPack\HtmlAgilityPack.dll"

# 請求數據物件
$Global:session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$Global:session.UserAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

class CheckForUpdates {
    # 本地版本文件 (查找規則)
    [string]$LocalVersionPath = "Version*"
    [bool]$Dev = $true # 開發除錯用, false 的話會清除不必要資訊

    # 保存來源路徑
    [string]$RootPath
    # 保存下載路徑
    [string]$DownloadPath
    # 保存本地版本文件 (路徑)
    [string]$LocalVersionFile

    CheckForUpdates([string]$Path, [string]$CheckUrl, [string[]]$CachePath) {
        $this.RootPath = $Path
        $this.DownloadPath = "$Path\Update.rar"

        # 調用清除緩存
        $this.ClearCache($CachePath)
        # 調用檢查
        $this.Check($CheckUrl)
    }

    # 清除緩存
    [void]ClearCache([string[]]$CachePath) {
        if ($CachePath.Length -le 0) { # 沒有數據的物件
            return
        }

        foreach($Path in $CachePath) {
            if (Test-Path $Path) {
                Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }

    # 比對版本號 (遠端版本 是否大於 本地版本)
    [bool]Compare_Versions([string]$localVersion, [string]$remoteVersion) {
        [version]$local = $localVersion
        [version]$remote = $remoteVersion
        return $remote -gt $local
    }

    # 解析 Html
    [object]Parse([string]$htmlContent) {
        $htmlDoc = New-Object HtmlAgilityPack.HtmlDocument # 創建 HtmlDocument 物件
        $htmlDoc.LoadHtml($htmlContent) # 加載 HTML 內容
        return $htmlDoc
    }

    # 輸入確認是否重新請求
    [bool]Confirm_Retry([string]$errorMessage) {
        Write-Host "$errorMessage`n"
        $userInput = Read-Host "是否重新請求？輸入 'y' 重新請求，輸入 'n' 退出"
        return $userInput -ne 'n'
    }

    # 請求
    [object]Request([string]$Url) {

        while ($true) {
            try {
                # 發送網絡請求到 URL
                $response = Invoke-WebRequest -Uri $Url -WebSession $Global:session -ErrorAction Stop
                if ($response.StatusCode -eq 200) { # 檢查請求狀態
                    return $this.Parse($response.Content)
                } else {
                    if (-not (Confirm_Retry "請求失敗，狀態碼: $($response.StatusCode)")) {
                        Write-Host "程式終止..."
                        break
                    }
                }
            } catch {
                if (-not (Confirm_Retry "發生錯誤: $_")) {
                    Write-Host "程式終止..."
                    break
                }
            }
        }

        return $null
    }

    # 更新數據 (不通用, 根據項目修改)
    [void]Updata([string]$url, [string]$remoteVersion) {

        # 獲取需要更新連結
        $updataURL = "https://github.com$url" -replace "tag", "expanded_assets"
        $Html = $this.Request($updataURL)

        if ($null -ne $Html) {
            # 查找新檔案連結
            $node = $Html.DocumentNode.SelectSingleNode("//a[@class='Truncate']")

            if ($null -ne $node) {
                $href = $node.GetAttributeValue("href", "")
                $downloadURL = "https://github.com$href"

                Invoke-WebRequest -Uri $downloadURL -OutFile $this.DownloadPath # 下載文件 到腳本運行路徑

                if (-not (Test-Path $this.DownloadPath)) {
                    Write-Host "下載失敗"
                    return
                }

                & "C:\Program Files\7-Zip\7z.exe" x $this.DownloadPath "-o$($this.RootPath)" "Global\*"
                Remove-Item $this.DownloadPath -Force # 刪除壓縮檔

                $globalPath = Join-Path $this.RootPath "Global" # 獲取 Global 資料夾 的完整路徑
                Get-ChildItem -Path $globalPath -File | ForEach-Object { # 將所有文件移動出來
                    $destination = Join-Path $this.RootPath $_.Name
                    Move-Item $_.FullName $destination -Force # 強制覆蓋同名文件
                }

                Remove-Item $globalPath -Recurse -Force # 移除 Global 資料夾
                Rename-Item $this.LocalVersionFile "Version $remoteVersion" # 更新本地版本文件

                if (-not $this.Dev) {Clear-Host}
                Write-Host "下載完成"
            } else {
                Write-Host "`n未找到下載節點"
            }
        }
    }

    # 檢查更新 (部份不通用, 根據項目修改)
    [void]Check([string]$CheckUrl) {
        # 使用 倉庫 URL 進行請求 (獲取解析的 Html 文件)
        $Html = $this.Request($CheckUrl)

        if ($null -ne $Html) {
            $node = $Html.DocumentNode.SelectSingleNode("//a[@class='Link--primary d-flex no-underline']")

            if ($null -ne $node) {
                # 獲取連結
                $href = $node.GetAttributeValue("href", "")

                # 遠端版本號
                $remoteVersion = $href -split "/" | Select-Object -Last 1

                # 查找本地的版本文件
                $files = Get-ChildItem -Path $this.RootPath -Filter $this.LocalVersionPath -File
                # 本地版本號
                $localVersion = $files -split " " | Select-Object -Last 1

                # 版本文件 路徑
                if (Test-Path $files) {
                    $this.LocalVersionFile = $files
                } else {
                    $this.LocalVersionFile = Join-Path $this.RootPath $files
                }
                

                if ($null -ne $localVersion -and $null -ne $remoteVersion) { # 有版本文件
                    if (-not $this.Dev) {Clear-Host}

                    Write-Host "版本文件: $($this.LocalVersionFile)"
                    Write-Host "本地版本號: $localVersion"
                    Write-Host "遠端版本號: $remoteVersion"

                    if ($this.Compare_Versions($localVersion, $remoteVersion)) {
                        $this.Updata($href, $remoteVersion)
                    } else {
                        Clear-Host
                        Write-Host "`n無需更新"
                    }

                } else { # 沒有版本文件 (直接下載)

                    $VersionDoct = Join-Path $this.RootPath "Version 0.0.0" # 組成版本文件路徑
                    New-Item $VersionDoct File -Force # 創建版本文件

                    $files = Get-ChildItem $this.RootPath -Filter $this.LocalVersionPath -File
                    $this.LocalVersionFile = Join-Path $this.RootPath $files

                    if (-not $this.Dev) {Clear-Host}
                    $this.Updata($href, $remoteVersion)
                }

            } else {
                Clear-Host
                Write-Host "未找到版本節點"
            }
        }
    }
}
function Check {
    param([string]$Path, [string]$CheckUrl, [string[]]$CachePath)
    $null = [CheckForUpdates]::new($Path, $CheckUrl, $CachePath)
}
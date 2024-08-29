$OneDrive = Join-Path -Path $env:USERPROFILE -ChildPath "OneDrive\文件"

function Add-Backup {
    param (
        [string[]]$Backup_Object
    )

    if (-not (Test-Path $OneDrive)) {
        Write-Host "找不到使用者 OneDrive 文件"
        return
    }

    if ($Backup_Object.Length -le 0) {
        Write-Host "備份對象為空"
        return
    }

    foreach ($Object in $Backup_Object) {
        if (Test-Path $Object) {
            $SavePath = Join-Path -Path $OneDrive -ChildPath ([System.IO.Path]::GetFileName($Object))
            if (-not(Test-Path $SavePath)) { # 不存在的才需要添加
                Start-Process cmd.exe -ArgumentList "/c mklink /d $SavePath $Object" -NoNewWindow -Wait
                Write-Host "添加成功: $Object"
            } else {
                Write-Host "已存在項: $Object"
            }
        } else {
            Write-Host "錯誤的備份對象: $Object"
        }
    }
}

Add-Backup @(
    "C:\備份文件1"
    "C:\備份文件2"
)
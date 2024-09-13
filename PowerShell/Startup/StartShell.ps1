$Roaming = $env:APPDATA

<#
?   LoadList (用於開機自啟的載入列表)

^   腳本存放位置:
Todo    1. Win + R 搜尋 Shell:StartUp
Todo    2. 將腳本放到該開啟的資料夾內

^   配置說明:
Todo    Name = 程式的名稱 / 進程名稱
Todo    Service = 程式所需的服務名稱 (目前只能設置一個)
Todo    AutoClose = 如果該程式關閉後會最小化到托盤, 可以設置該功能 (如果啟動後不會開啟窗口, 或 (不需要 or 無法) 最小化到托盤的程式, 就不要設置為 $true) [10 秒超時自動跳過]
Todo    ExtraClose = 額外關閉的進程名稱 (目前只能設置一個)
Todo    CloseWait = 啟用自動關閉時, 觸發關閉前的等待時間 (檢測窗口可操作不完善的臨時解決方式)

#>

$LoadList = @(
    @{
        Name="軟體1"
        Path="$Roaming\軟體1\軟體.exe"
    }
    @{
        Name="軟體2"
        Path="C:\Program Files\軟體2\軟體.exe"
        Service="軟體2服務名"
        AutoClose=$true
        CloseWait=5
    }
)

# 使用 Add-Type 定義 User32 的 API
Add-Type @"
using System;
using System.Runtime.InteropServices;

public class User32 {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll")]
    public static extern bool GetWindowPlacement(IntPtr hWnd, out WINDOWPLACEMENT lpwndpl);

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsWindowEnabled(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT {
        public int x;
        public int y;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int left;
        public int top;
        public int right;
        public int bottom;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct WINDOWPLACEMENT {
        public int length;
        public int flags;
        public int showCmd;
        public POINT ptMinPosition;
        public POINT ptMaxPosition;
        public RECT rcNormalPosition;
        public RECT rcDevice;
    }

    public const uint WM_CLOSE = 0x0010;
    public const int SW_SHOWMAXIMIZED = 3;
    public const int SW_SHOWNORMAL = 1;
}
"@

function AvailString {
    param ($Object)
    return ($Object -is [string] -and $Object.Trim() -ne "")
}

# 載入不會進行報錯 (靜默跳過錯誤)
function Load {
    param (
        [Object]$List
    )

    if ($List.Count -eq 0) { return }

    $windowPlacement = New-Object User32+WINDOWPLACEMENT
    $windowPlacement.length = [System.Runtime.InteropServices.Marshal]::SizeOf($windowPlacement)

    foreach ($item in $List) {
        $Success = $false

        $Name = $item.Name
        $Path = $item.Path
        $Service = $item.Service
        $autoClose = $item.AutoClose
        $extraClose = $item.ExtraClose # 額外關閉對象
        $closeWait = if ( # 等待的預設值
            $null -ne $item.CloseWait -and $item.CloseWait -is [int]
        ) { $item.CloseWait } else { 0 }

        if (AvailString $Service) {
            $exist = Get-Service -Name $Service -ErrorAction SilentlyContinue
            if ($exist) {
                Start-Service -Name $Service
            }
        }

        if (Test-Path $Path) {
            $Success = $true
            Start-Process $Path
        }

        if ($Success) {
            Write-Host "啟動成功: $Name"

            if ($autoClose) {
                $startTime = Get-Date

                while ($true) {
                    # 獲取窗口 窗口句柄
                    $hWnd = [User32]::FindWindow([NullString]::Value, $Name)

                    if ($hWnd -ne [IntPtr]::Zero) {
                        # 檢查窗口可見性和啟用狀態
                        if ([User32]::IsWindowVisible($hWnd) -and [User32]::IsWindowEnabled($hWnd)) {
                            # 獲取窗口位置和狀態
                            if ([User32]::GetWindowPlacement($hWnd, [ref] $windowPlacement)) {
                                # 檢查窗口是否正常顯示
                                if ($windowPlacement.showCmd -eq [User32]::SW_SHOWMAXIMIZED -or $windowPlacement.showCmd -eq [User32]::SW_SHOWNORMAL) {
                                    try {Start-Sleep -Seconds ($closeWait)} catch {} # 嘗試等待幾秒後觸發關閉

                                    # 發送關閉消息
                                    [User32]::SendMessage($hWnd, [User32]::WM_CLOSE, [IntPtr]::Zero, [IntPtr]::Zero)

                                    # 額外關閉進程
                                    if (AvailString $extraClose) {
                                        Stop-Process -Name $extraClose -Force -ErrorAction SilentlyContinue
                                    }

                                    break
                                }
                            }
                        }
                    } else {
                        Start-Sleep -Seconds 1
                    }

                    $elapsedTime = (Get-Date) - $startTime
                    if ($elapsedTime.TotalSeconds -ge 10) {
                        break
                    }

                }
            }
        } else {
            Write-Host "啟動失敗: $Name"
        }
    }
}

Load $LoadList
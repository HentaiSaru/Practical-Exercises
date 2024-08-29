$Roaming = $env:APPDATA

<# LoadList (載入列表)
Name = 程式的名稱 / 進程名稱
Service = 程式所需的服務名稱 (目前只能設置一個)
AutoClose = 如果該程式有關閉後最小化到托盤功能, 可以設置該功能 (如果啟動後不會開啟窗口, 或(不需要 or 無法)最小化到托盤的程式, 就不要設置為 $true) [10 秒超時自動跳過]
CloseWait = 啟用自動關閉後, 再觸發關閉前的等待時間 (檢測窗口可操作不完善的臨時解決方式)
#>

$LoadList = @(
    @{
        Name="軟體1"
        Path="$Roaming\軟體1\軟體.exe"
        Service=$null
        AutoClose=$null
        CloseWait=$null
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

        if ($null -ne $Service) {
            $exist = Get-Service -Name $Service -ErrorAction SilentlyContinue
            if ($exist) {
                $Success = $true
                Start-Service -Name $Service
            }
        }

        if (Test-Path $Path) {
            $Success = $true
            Start-Process $Path
        }

        if ($Success) {
            Write-Host "啟動成功: $Name"

            if ($item.AutoClose) {
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
                                    try {Start-Sleep -Seconds ($item.CloseWait)} catch {} # 嘗試等待幾秒後觸發關閉

                                    # 發送關閉消息
                                    [User32]::SendMessage($hWnd, [User32]::WM_CLOSE, [IntPtr]::Zero, [IntPtr]::Zero)
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
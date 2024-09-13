Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName PresentationFramework

function DefaultSavePath { # 使用者預設的 LocalLow 目錄路徑
    param (
        [string]$ChildPath
    )

    $Path = Join-Path "$($env:LOCALAPPDATA)Low" $ChildPath
    return $Path # 不做路徑檢查
}

function UpperPath {
    param (
        [string]$CurrentPath
    )

    $Path = Split-Path $CurrentPath
    return $Path
}

function CopyFile {
    param (
        [string]$Source,
        [string]$Target
    )

    if (-not(Test-Path $Target)) {
        New-Item $Target -ItemType Directory -Force
    }

    Copy-Item $Source $Target -Recurse -Container -Force
}

function Main { # 主要運行邏輯
    param (
        [string]$BackUpPath, # 調用的運行路徑 (備份存檔點)
        [string]$SavePath # 存檔的文件所在路徑 (輸出存檔點)
    )

$xaml = @"
    <Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        Title="備份操作"
        WindowStartupLocation="CenterScreen"
        SizeToContent="WidthAndHeight"> <!-- 使窗口根據內容自動調整大小 -->
        <Grid Background="#17153B" Cursor="Arrow">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>

            <!-- 上方展示區塊 -->
            <Grid Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="3">
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/>
                    <RowDefinition Height="Auto"/>
                </Grid.RowDefinitions>

                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <!-- 備份路徑 -->
                <TextBlock Grid.Row="0" Grid.Column="0" Text="備份路徑:" FontSize="20" Margin="5" Foreground="#F5F7F8" FontWeight="Bold" VerticalAlignment="Center"/>
                <TextBox Grid.Row="0" Grid.Column="1" Text="$BackUpPath" FontSize="20" Margin="10" Foreground="#F5F7F8" BorderBrush="#2E236C" Background="#433D8B"/>
                <Button Grid.Row="0" Grid.Column="2" Name="OpenBackUpPath" Content="📁" Width="50" Height="30" FontSize="16" Margin="5" Cursor="Hand" HorizontalAlignment="Center" VerticalAlignment="Center" Foreground="#F5F7F8" BorderBrush="#17153B" Background="#17153B"/>

                <!-- 存檔路徑 -->
                <TextBlock Grid.Row="1" Grid.Column="0" Text="存檔路徑:" FontSize="20" Margin="5" Foreground="#F5F7F8" FontWeight="Bold" VerticalAlignment="Center"/>
                <TextBox Grid.Row="1" Grid.Column="1" Text="$SavePath" FontSize="20" Margin="10" Foreground="#F5F7F8" BorderBrush="#2E236C" Background="#433D8B"/>
                <Button Grid.Row="1" Grid.Column="2" Name="OpenSavePath" Content="📁" Width="50" Height="30" FontSize="16" Margin="5" Cursor="Hand" HorizontalAlignment="Center" VerticalAlignment="Center" Foreground="#F5F7F8" BorderBrush="#17153B" Background="#17153B"/>
            </Grid>

            <!-- 下方操作區塊 -->
            <Grid Grid.Row="2" HorizontalAlignment="Center" VerticalAlignment="Center">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>

                <Button Name="BackupSave" Grid.Column="0" Content="備份存檔" Width="120" Height="50" FontSize="20" Margin="20" Cursor="Hand" FontWeight="Bold" Foreground="#F5F7F8" BorderBrush="#2E236C" Background="#433D8B"/>
                <Button Name="RestoreSave" Grid.Column="1" Content="恢復存檔" Width="120" Height="50" FontSize="20" Margin="20" Cursor="Hand" FontWeight="Bold" Foreground="#F5F7F8" BorderBrush="#2E236C" Background="#433D8B"/>
            </Grid>
        </Grid>
    </Window>
"@

    $reader = New-Object System.IO.StringReader($xaml)
    $xmlReader = [System.Xml.XmlReader]::Create($reader)
    $window = [Windows.Markup.XamlReader]::Load($xmlReader)

    <# =================== #>

    $BackUpParent = Split-Path $BackUpPath # 獲備份路徑的 上層路徑
    function BackUpErrorShow {
        [System.Windows.Forms.MessageBox]::Show(
            "路徑錯誤", "找不到存檔相關路徑",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
    }
    $window.FindName("OpenBackUpPath").Add_Click({
        if (Test-Path $BackUpParent) {
            Start-Process $BackUpParent
        } else {
            BackUpErrorShow
        }
    })
    $window.FindName("BackupSave").Add_Click({
        if (Test-Path $SavePath) {
            CopyFile $SavePath $BackUpParent # 複製 存檔路徑 => 備份路徑
            if (Test-Path $BackUpParent) {
                [System.Windows.Forms.MessageBox]::Show(
                    "備份成功", "操作提示",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Information
                )
            } else {
                BackUpErrorShow
            }
        } else {
            BackUpErrorShow
        }
    })

    <# =================== #>

    $SaveParent = Split-Path $SavePath # 獲取保存路徑的 上層路徑
    function SaveErrorShow {
        [System.Windows.Forms.MessageBox]::Show(
            "路徑錯誤", "找不到備份相關路徑",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
    }
    $window.FindName("OpenSavePath").Add_Click({
        if (Test-Path $SaveParent) {
            Start-Process $SaveParent
        } else {
            SaveErrorShow
        }
    })
    $window.FindName("RestoreSave").Add_Click({
        if (Test-Path $BackUpPath) {
            CopyFile $BackUpPath $SaveParent # 複製 備份路徑 => 存檔路徑
            if (Test-Path $SaveParent) {
                [System.Windows.Forms.MessageBox]::Show(
                    "恢復成功", "操作提示",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Information
                )
            } else {
                SaveErrorShow
            }
        } else {
            SaveErrorShow
        }
    })

    try {
        $window.ShowDialog() # 顯示窗口
    } finally {
        $window.Close() # 釋放窗口資源
    }

}
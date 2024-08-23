<# 臨時開發 com_proximabeta_NIKKE 管理器 

用於將該腳本 同路徑下 結構為:

任意名文件
    |__com_proximabeta_NIKKE (資料夾, 需要有數據) [擁有任意一個即可運行]
    |__Original_com_proximabeta_NIKKE (資料夾, 需要有數據) [擁有任意一個即可運行]
    |__任意名展示用圖片 (jpg|png) [可有可無]

符合上述結構即可進行模組管理

該項目臨時寫的
整體架構相當隨意, 也還沒進行優化, 但基本功能已有

主要 Bug

備份文件時使用 Copy-Item, 有時候文件結構會亂掉, 或是多出文件, 所以還是要自行檢查一下
#>

$currentRoot = $PSScriptRoot # 當前腳本路徑
$currentScript = $MyInvocation.MyCommand.Name # 運行腳本名
$nikkePath = Join-Path "$($env:LOCALAPPDATA)Low" "Unity\com_proximabeta_NIKKE" # 妮姬數據路徑

# 獲取腳本運行路徑下, 所有的文件, 但排除自身
$files = Get-ChildItem $currentRoot | Where-Object { $_.Name -ne $currentScript }

<# 取得當前路徑下所有含有 com_proximabeta_NIKKE 資料夾的數據 #>

$displayData = @() # 保存完整數據
$completeData = @{} # 保存完整數據

foreach ($file in $files) {
    $path = Join-Path $currentRoot $file # 將取到的路徑合併出完整路徑

    $check1 = Join-Path $path "com_proximabeta_NIKKE" # 用於添加數據的文件
    $check2 = Join-Path $path "Original_com_proximabeta_NIKKE" # 用於還原數據的文件

    if ((Test-Path $check1) -or (Test-Path $check2)) { # 需要有檢查路徑
        $completeData[$path] = Get-ChildItem $path
    }
}

<# 取得展示用的圖片數據 #>

$haveData = $completeData.Count -gt 0 # 是否有數據

if ($haveData) {

    # 處理展示用數據
    $displayData = [System.Collections.Generic.List[PSCustomObject]]::new()

    foreach ($item in $completeData.GetEnumerator()) {
        $imgPath = ""
        $filePath = $item.Key

        # 嘗試找到圖片名
        $imgName = $item.Value | Where-Object { $_ -match "\.(jpg|png)$" } | Select-Object -First 1

        # 沒有圖片名使用 $item.Key (圖片路徑會是空字串)
        if ($null -eq $imgName) {
            $imgName = $filePath
        } else {
            $imgPath = [System.IO.Path]::Combine($filePath, $imgName)
        }

        $displayData.Add([PSCustomObject]@{
            Path = $filePath; Title = ($imgName -replace "\.(jpg|png)$", ""); ImageSource = $imgPath
        })
    }
}

<# 將取得的數據用於創建 UI #>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName PresentationFramework

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        Title="妮姬 ProximaDeta 管理器" WindowStartupLocation="CenterScreen" SizeToContent="WidthAndHeight">

    <Grid Background="#201E43" Cursor="Arrow">

        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>

        <!-- 左側區域：顯示數據 -->
        <ScrollViewer Grid.Column="0" MaxHeight="720" MaxWidth="640" HorizontalAlignment="Left" VerticalScrollBarVisibility="Auto" HorizontalScrollBarVisibility="Auto">
            <ListBox Name="ItemsListBox" Background="#2E073F" SelectionMode="Multiple">
                <ListBox.ItemTemplate>
                    <DataTemplate>
                        <Border Cursor="Hand" Padding="5,5,5,5" Tag="{Binding Path}">
                            <StackPanel Orientation="Vertical">
                                <TextBlock Text="{Binding Title}" FontSize="24" Margin="0,10,0,10" FontWeight="Bold" Foreground="#FFFFFCFC"/>
                                <Image MaxHeight="360" MaxWidth="640" Stretch="Uniform" Source="{Binding ImageSource}"/>
                            </StackPanel>
                        </Border>
                    </DataTemplate>
                </ListBox.ItemTemplate>
            </ListBox>
        </ScrollViewer>

        <!-- 右側區域：功能按鈕 -->
        <StackPanel Grid.Column="1" MaxHeight="720" HorizontalAlignment="Center">
            <Button Name="Select_All" Content="全部選取" Cursor="Hand" Foreground="#EEEEEE" BorderBrush="#508C9B" Background="#134B70" FontWeight="Bold" FontSize="20" Padding="5" Margin="15,30,15,0"/>
            <Button Name="Cancel_All" Content="全部取消" Cursor="Hand" Foreground="#EEEEEE" BorderBrush="#508C9B" Background="#134B70" FontWeight="Bold" FontSize="20" Padding="5" Margin="15,3,15,0"/>
            <Button Name="Backup" Content="原始備份" Cursor="Hand" Foreground="#EEEEEE" BorderBrush="#508C9B" Background="#134B70" FontWeight="Bold" FontSize="20" Padding="5" Margin="15,3,15,0"/>
            <Button Name="Add" Content="修改添加" Cursor="Hand" Foreground="#EEEEEE" BorderBrush="#508C9B" Background="#134B70" FontWeight="Bold" FontSize="20" Padding="5" Margin="15,30,15,0"/>
            <Button Name="Restore" Content="修改還原" Cursor="Hand" Foreground="#EEEEEE" BorderBrush="#508C9B" Background="#134B70" FontWeight="Bold" FontSize="20" Padding="5" Margin="15,3,15,0"/>
        </StackPanel>

    </Grid>
</Window>
"@

$reader = New-Object System.IO.StringReader($xaml)
$xmlReader = [System.Xml.XmlReader]::Create($reader)
$window = [Windows.Markup.XamlReader]::Load($xmlReader)

# 取得項目列表
$listBox = $window.FindName("ItemsListBox")
# 將數據綁定到 ListBox
$listBox.ItemsSource = $displayData

# 全選功能
$selectAll = $window.FindName("Select_All")
$selectAll.Add_Click({
    foreach ($item in $listBox.Items) {
        $listBox.SelectedItems.Add($item) | Out-Null
    }
})

# 全取消功能
$cancelAll = $window.FindName("Cancel_All")
$cancelAll.Add_Click({
    $listBox.SelectedItems.Clear() | Out-Null
})

<# 其餘功能函數 #>
function GetPathTail {
    param (
        [string]$Str
    )
    return ($Str -split "\\")[-1]
}

function CopyFile {
    param (
        [string]$Source,
        [string]$Target
    )

    $result = Copy-Item $Source $Target -Recurse -PassThru -Force

    # 處理 Copy-Item 造成的目錄結構錯誤 (無法完全正確)
    $souTail = GetPathTail $Source
    if ($souTail -ne (GetPathTail $result[0])) {
        $insideTail = GetPathTail $result[1] # 取得內部資料夾尾數
        $insideFile = Get-ChildItem $result[1] # 取得內部文件
        $newPath = Join-Path $result[1] $insideTail # 取得新的移動路徑

        New-Item $newPath -ItemType Directory -Force -ErrorAction SilentlyContinue # 再內部創建新資料夾
        foreach ($file in $insideFile) { # 將文件移動到新資料夾
            Move-Item (Join-Path $result[1] $file) $newPath -Force -ErrorAction SilentlyContinue
        } 
        Rename-Item $result[1] $souTail -Force -ErrorAction SilentlyContinue # 重新命名
    }
}

#!! 備份功能存在 Bug, 運行完成後需要再自行確認
$backup = $window.FindName("Backup")
$backup.Add_Click({
    if (-not $haveData) {
        [System.Windows.Forms.MessageBox]::Show(
            "當前沒有可操作的對象", "數據錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    if ($listBox.SelectedItems.Count -eq 0) {
        [System.Windows.Forms.MessageBox]::Show(
            "請先選擇需要操作的對象", "選擇錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $backupStatus = $false
    foreach ($item in $listBox.SelectedItems) {
        $filePath = $item.Path

        # 取得模組資料夾數據
        $modePath = Join-Path $filePath "com_proximabeta_NIKKE"
        if (-not (Test-Path $modePath)) {
            continue
        }

        # 取得資料夾數據的子項
        $modeItems = Get-ChildItem $modePath
        if ($modeItems.Count -eq 0) {
            continue
        }

        $backupData = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allFilesExist = $true
        # 取得對應原始連結
        foreach ($modeItem in $modeItems) {
            $origPath = Join-Path $nikkePath $modeItem

            if (-not (Test-Path $origPath)) {
                $allFilesExist = $false
                break
            }

            $backupData.Add($origPath)
        }

        if (-not $allFilesExist) {
            [System.Windows.Forms.MessageBox]::Show(
                "$($item.Path)", "原始數據不完整無法備份",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Error
            )
            continue
        }

        $backupPath = Join-Path $filePath "Original_com_proximabeta_NIKKE"
        foreach ($file in $backupData) {
            CopyFile $file $backupPath
        }

        $backupStatus = $true
    }

    if ($backupStatus) {
        [System.Windows.Forms.MessageBox]::Show(
            "備份完成", "操作說明",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    }
})

$add = $window.FindName("Add")
$add.Add_Click({
    if (-not $haveData) {
        [System.Windows.Forms.MessageBox]::Show(
            "當前沒有可操作的對象", "數據錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    if ($listBox.SelectedItems.Count -eq 0) {
        [System.Windows.Forms.MessageBox]::Show(
            "請先選擇需要操作的對象", "選擇錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $addState = $false
    foreach ($item in $listBox.SelectedItems) {
        $filePath = $item.Path

        $modePath = Join-Path $filePath "com_proximabeta_NIKKE"
        if (-not (Test-Path $modePath)) {
            continue
        }

        $modeItems = Get-ChildItem $modePath
        if ($modeItems.Count -eq 0) {
            continue
        }

        CopyFile $modePath $nikkePath
        $addState = $true
    }

    if ($addState) {
        [System.Windows.Forms.MessageBox]::Show(
            "添加完成", "操作說明",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    }
})

$restore = $window.FindName("Restore")
$restore.Add_Click({
    if (-not $haveData) {
        [System.Windows.Forms.MessageBox]::Show(
            "當前沒有可操作的對象", "數據錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    if ($listBox.SelectedItems.Count -eq 0) {
        [System.Windows.Forms.MessageBox]::Show(
            "請先選擇需要操作的對象", "選擇錯誤",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $restoreState = $false
    foreach ($item in $listBox.SelectedItems) {
        $filePath = $item.Path

        # 取得備份資料夾數據
        $backupPath = Join-Path $filePath "Original_com_proximabeta_NIKKE"

        if (Test-Path $backupPath) {
            $backItems = Get-ChildItem $backupPath

            if ($backItems.Count -gt 0) {
                foreach ($back in $backItems) {
                    CopyFile (Join-Path $backupPath $back) $nikkePath
                }

                $restoreState = $true
            }
        }

        if (-not($restoreState)) {
            # 取得模組資料夾數據
            $modePath = Join-Path $filePath "com_proximabeta_NIKKE"

            if (Test-Path $modePath) {
                $modeItems = Get-ChildItem $modePath

                if ($modeItems.Count -gt 0) {
                    foreach ($mode in $modeItems) {
                        Remove-Item (Join-Path $nikkePath $mode) -Recurse -Force -ErrorAction SilentlyContinue
                    }

                    $restoreState = $true
                }
            } else {
                [System.Windows.Forms.MessageBox]::Show(
                    "沒有備份數據無法還原", "數據錯誤",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Error
                )
                return
            }
        }
    }

    if ($restoreState) {
        [System.Windows.Forms.MessageBox]::Show(
            "還原完成", "操作說明",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    }
})

try {
    $window.ShowDialog() # 顯示窗口
} finally {
    $window.Close() # 釋放窗口資源
}
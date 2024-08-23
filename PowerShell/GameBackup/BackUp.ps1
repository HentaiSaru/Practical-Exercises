$currentRoot = $PSScriptRoot

Import-Module "$currentRoot\BackupCore.psm1"
Main "$PSScriptRoot\Path" (DefaultSavePath "SavePath")
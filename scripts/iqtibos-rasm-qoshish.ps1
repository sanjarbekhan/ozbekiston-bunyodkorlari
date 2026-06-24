cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

Add-Type -AssemblyName System.Windows.Forms

if (!(Test-Path ".\public\iqtiboslar")) {
  New-Item -ItemType Directory -Force -Path ".\public\iqtiboslar" | Out-Null
}

$answer = Read-Host "Eski iqtibos rasmlarini o'chirib, qaytadan qo'shamizmi? ha/yoq"

if ($answer -eq "ha") {
  Remove-Item ".\public\iqtiboslar\*" -Force -ErrorAction SilentlyContinue
  Write-Host "Eski rasmlar o'chirildi."
}

$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = "Iqtiboslar sahifasi uchun rasmlar tanlang"
$dialog.Filter = "Rasm fayllar (*.png;*.jpg;*.jpeg;*.webp)|*.png;*.jpg;*.jpeg;*.webp"
$dialog.Multiselect = $true
$dialog.InitialDirectory = [Environment]::GetFolderPath("Desktop")
$dialog.RestoreDirectory = $true

if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  $count = 1

  foreach ($file in $dialog.FileNames) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $name = "iqtibos-" + (Get-Date -Format "yyyyMMddHHmmss") + "-" + $count + $ext
    $target = ".\public\iqtiboslar\$name"

    Copy-Item $file $target -Force
    $count++
  }

  Write-Host "Rasmlar qo'shildi. Sahifani Ctrl + F5 bilan yangilang."
} else {
  Write-Host "Rasm tanlanmadi."
}
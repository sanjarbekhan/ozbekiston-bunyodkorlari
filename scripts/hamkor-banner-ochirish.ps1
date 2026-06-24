cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

$file = ".\public\tilda\hamkor-loyihasi.html"

if (!(Test-Path $file)) {
  Write-Host "Fayl topilmadi: $file"
  exit
}

$text = Get-Content $file -Raw -Encoding UTF8

Copy-Item $file ".\public\tilda\hamkor-loyihasi.before-banner-remove.html" -Force

# Faqat 3 chiziqli menu ostidagi "Online jurnalimizni o'qing" banner blokini olib tashlaymiz.
# 3 chiziqli menu bloki saqlanib qoladi.
$text = [regex]::Replace(
  $text,
  '(?s)<div id="rec\d+"[^>]*>.*?(nomsiz_dizaynh|ONLINE JURNALIMIZNI|Online jurnalimizni|online jurnal).*?(?=<div id="rec\d+"|<!--/allrecords-->|</body>)',
  '',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

Set-Content $file $text -Encoding UTF8

Write-Host "Tayyor: 3 chiziqli menu qoldi, uning pastidagi Online jurnal banneri olib tashlandi."
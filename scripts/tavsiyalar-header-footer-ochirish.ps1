cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

# Tavsiyalar sahifasini asl Tilda fayldan tiklaymiz
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page132773663.html" ".\public\tilda\tavsiyalari.html" -Force

$file = ".\public\tilda\tavsiyalari.html"
$text = Get-Content $file -Raw -Encoding UTF8

# Backup
Copy-Item $file ".\public\tilda\tavsiyalari.before-header-footer-remove.html" -Force

function Remove-TildaBlockByText {
  param (
    [string]$Html,
    [string]$Needle
  )

  $index = $Html.IndexOf($Needle)

  if ($index -lt 0) {
    return $Html
  }

  $before = $Html.Substring(0, $index)
  $recStart = $before.LastIndexOf('<div id="rec')

  if ($recStart -lt 0) {
    return $Html
  }

  $nextRec = $Html.IndexOf('<div id="rec', $recStart + 10)

  if ($nextRec -gt $recStart) {
    return $Html.Substring(0, $recStart) + $Html.Substring($nextRec)
  }

  $allRecordsEnd = $Html.IndexOf("<!--/allrecords-->", $recStart)

  if ($allRecordsEnd -gt $recStart) {
    return $Html.Substring(0, $recStart) + $Html.Substring($allRecordsEnd)
  }

  return $Html
}

# 1) Ichki Tilda headerni olib tashlaymiz
# Bu header ichida menyu linklari bor: Biz haqimizda, Tavsiyalar, Hamkor loyihasi
$text = Remove-TildaBlockByText $text "Hamkor loyihasi"
$text = Remove-TildaBlockByText $text "Biz haqimizda"

# 2) Ichki Tilda footer / pastdagi ko'k blokni olib tashlaymiz
$text = Remove-TildaBlockByText $text "Biz bilan imidjingizni yaxshilang va tarixga kiring!"
$text = Remove-TildaBlockByText $text "Instagram"
$text = Remove-TildaBlockByText $text "Telegram"

Set-Content $file $text -Encoding UTF8

Write-Host "Tavsiyalar sahifasidagi ichki Tilda header va footer olib tashlandi. Umumiy sayt header/footeri qoladi."
cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

$file = ".\public\tilda\hamkor-loyihasi.html"

if (!(Test-Path $file)) {
  Write-Host "Fayl topilmadi: $file"
  exit
}

Copy-Item $file ".\public\tilda\hamkor-loyihasi.before-blue-footer-remove.html" -Force

$text = Get-Content $file -Raw -Encoding UTF8

# Tilda sahifani rec bloklarga ajratamiz
$matches = [regex]::Matches(
  $text,
  '(?s)<div id="rec\d+"[^>]*>.*?(?=<div id="rec\d+"|<!--/allrecords-->|</body>)'
)

$targetBlock = $null

foreach ($match in $matches) {
  $block = $match.Value

  # Pastdagi ko'k footer odatda Instagram, Telegram, Ariza qoldirish yozuvlarini o'z ichiga oladi
  if (
    $block -match "Instagram" -and
    $block -match "Telegram" -and
    $block -match "Ariza qoldirish"
  ) {
    $targetBlock = $block
  }
}

if ($null -ne $targetBlock) {
  $text = $text.Replace($targetBlock, "")
  Set-Content $file $text -Encoding UTF8
  Write-Host "Hamkor loyihasi sahifasidagi pastki ko'k footer blok o'chirildi."
} else {
  Write-Host "Ko'k footer bloki topilmadi."
  Write-Host "Blok ichida Instagram, Telegram, Ariza qoldirish yozuvlari topilmadi."
}
cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

# Hamkor loyihasi sahifasini karta ma'lumotlari bor asl Tilda sahifadan tiklaymiz
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page134230603.html" ".\public\tilda\hamkor-loyihasi.html" -Force

$file = ".\public\tilda\hamkor-loyihasi.html"
$text = Get-Content $file -Raw -Encoding UTF8

# Backup
Copy-Item $file ".\public\tilda\hamkor-loyihasi.before-edit.html" -Force

# Pastdagi ko'k footer blokni olib tashlaymiz
$marker = "Biz bilan imidjingizni yaxshilang va tarixga kiring!"
$index = $text.IndexOf($marker)

if ($index -gt 0) {
  $recStart = $text.LastIndexOf('<div id="rec', $index)
  $allRecordsEnd = $text.IndexOf("<!--/allrecords-->", $index)

  if ($recStart -ge 0 -and $allRecordsEnd -gt $recStart) {
    $text = $text.Substring(0, $recStart) + $text.Substring($allRecordsEnd)
    Write-Host "Pastdagi ko'k footer olib tashlandi."
  } else {
    Write-Host "Footer bloki aniq topilmadi, sahifa tiklandi."
  }
} else {
  Write-Host "Footer marker topilmadi, sahifa tiklandi."
}

Set-Content $file $text -Encoding UTF8

# Next.js route qayta yoziladi
New-Item -ItemType Directory -Force -Path ".\src\app\hamkor-loyihasi" | Out-Null

@'
export default function HamkorLoyihasiPage() {
  return (
    <main className="min-h-screen bg-white">
      <iframe
        src="/tilda/hamkor-loyihasi.html"
        title="Hamkor loyihasi"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
'@ | Set-Content ".\src\app\hamkor-loyihasi\page.tsx" -Encoding UTF8

Write-Host "Hamkor loyihasi sahifasi tiklandi."
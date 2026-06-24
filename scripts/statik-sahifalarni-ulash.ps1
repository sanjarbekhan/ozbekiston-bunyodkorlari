cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

# Tilda sahifalarini public/tilda ichiga nusxalaymiz
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page132123833.html" ".\public\tilda\haqida.html" -Force
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page132773663.html" ".\public\tilda\tavsiyalari.html" -Force
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page133264153.html" ".\public\tilda\sahifasi.html" -Force
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page134230603.html" ".\public\tilda\ommaviy_ofertasi.html" -Force
Copy-Item ".\tilda-export\ozbekistonbunyodkorlari\page133818413.html" ".\public\tilda\hamkor-loyihasi.html" -Force

# /haqida sahifasini tahrirlaymiz
$file = ".\public\tilda\haqida.html"
$text = Get-Content $file -Raw -Encoding UTF8

Copy-Item $file ".\public\tilda\haqida.before-edit.html" -Force

# Faqat kerakmas bloklarni aniq ID bilan olib tashlaymiz:
# rec2191887863 = tepadagi "Online jurnalimizni o'qing" banneri
# rec2122018013 = "ULAR QAYSI SOHALARDA?" ishlamayotgan feed qismi
# rec2252767703 = pastdagi ko'k Instagram / Telegram footer qismi

$removeIds = @(
  "2191887863",
  "2122018013",
  "2252767703"
)

foreach ($id in $removeIds) {
  $pattern = '(?s)<div id="rec' + $id + '"[^>]*>.*?(?=<div id="rec\d+"|<!--/allrecords-->|</body>)'
  $text = [regex]::Replace($text, $pattern, "")
}

Set-Content $file $text -Encoding UTF8

# Next.js route papkalarini yaratamiz
New-Item -ItemType Directory -Force -Path ".\src\app\haqida" | Out-Null
New-Item -ItemType Directory -Force -Path ".\src\app\tavsiyalari" | Out-Null
New-Item -ItemType Directory -Force -Path ".\src\app\sahifasi" | Out-Null
New-Item -ItemType Directory -Force -Path ".\src\app\ommaviy_ofertasi" | Out-Null
New-Item -ItemType Directory -Force -Path ".\src\app\hamkor-loyihasi" | Out-Null

@'
export default function HaqidaPage() {
  return (
    <main className="min-h-screen bg-white">
      <iframe
        src="/tilda/haqida.html"
        title="Biz haqimizda"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
'@ | Set-Content ".\src\app\haqida\page.tsx" -Encoding UTF8

@'
export default function TavsiyalariPage() {
  return (
    <main className="min-h-screen bg-white">
      <iframe
        src="/tilda/tavsiyalari.html"
        title="Tavsiyalar"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
'@ | Set-Content ".\src\app\tavsiyalari\page.tsx" -Encoding UTF8

@'
export default function SahifasiPage() {
  return (
    <main className="min-h-screen bg-white">
      <iframe
        src="/tilda/sahifasi.html"
        title="Iqtiboslar"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
'@ | Set-Content ".\src\app\sahifasi\page.tsx" -Encoding UTF8

@'
export default function OmmaviyOfertaPage() {
  return (
    <main className="min-h-screen bg-white">
      <iframe
        src="/tilda/ommaviy_ofertasi.html"
        title="Ommaviy oferta"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
'@ | Set-Content ".\src\app\ommaviy_ofertasi\page.tsx" -Encoding UTF8

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

Write-Host "Tayyor: 3 chiziqli menu qoldi, online jurnal banneri, feed va pastki footer olib tashlandi."
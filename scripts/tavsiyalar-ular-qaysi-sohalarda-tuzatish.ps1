cd C:\Users\User\Desktop\ozbekiston-bunyodkorlari

# Supabase maqolalarini beradigan API route yaratamiz
New-Item -ItemType Directory -Force -Path ".\src\app\api\tavsiyalar-articles" | Out-Null

@'
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ articles: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data || [] });
}
'@ | Set-Content ".\src\app\api\tavsiyalar-articles\route.ts" -Encoding UTF8

$file = ".\public\tilda\tavsiyalari.html"

if (!(Test-Path $file)) {
  Write-Host "Fayl topilmadi: $file"
  exit
}

$text = Get-Content $file -Raw -Encoding UTF8

Copy-Item $file ".\public\tilda\tavsiyalari.before-ular-qaysi-sohalarda-fix.html" -Force

# Oldin noto'g'ri joyga qo'shilgan custom maqola bloklarini olib tashlaymiz
$text = [regex]::Replace(
  $text,
  '(?s)<!-- OBY_ARTICLES_START -->.*?<!-- OBY_ARTICLES_END -->',
  ''
)

$text = [regex]::Replace(
  $text,
  '(?s)<div id="custom-tavsiyalar-articles"[^>]*>.*?</script>\s*</div>',
  ''
)

# Aynan "ULAR QAYSI SOHALARDA?" joyiga qo'yiladigan to'g'ri carousel blok
$articlesBlock = @'
<!-- OBY_ARTICLES_START -->
<div id="custom-tavsiyalar-articles" style="padding: 70px 18px 80px; background:#f2f2f2;">
  <style>
    #custom-tavsiyalar-articles * {
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    #custom-tavsiyalar-articles .oby-title-main {
      max-width: 1160px;
      margin: 0 auto 45px;
      text-align: center;
      font-family: Georgia, serif;
      font-size: 56px;
      line-height: 1.05;
      font-weight: 900;
      color: #111;
      text-transform: uppercase;
    }

    #custom-tavsiyalar-articles .oby-scroll {
      max-width: 1160px;
      margin: 0 auto;
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 8px 0 22px;
      scrollbar-width: thin;
    }

    #custom-tavsiyalar-articles .oby-card {
      flex: 0 0 280px;
      scroll-snap-align: start;
      display: block;
      overflow: hidden;
      background: #fff;
      text-decoration: none;
      color: #111827;
      box-shadow: 0 14px 32px rgba(0,0,0,0.08);
      transition: .25s ease;
    }

    #custom-tavsiyalar-articles .oby-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 22px 45px rgba(0,0,0,0.14);
    }

    #custom-tavsiyalar-articles .oby-image-wrap {
      position: relative;
      width: 100%;
      background: #fff;
      overflow: hidden;
    }

    #custom-tavsiyalar-articles .oby-image {
      width: 100%;
      height: auto;
      display: block;
    }

    #custom-tavsiyalar-articles .oby-category {
      position: absolute;
      left: 12px;
      top: 12px;
      background: #0043a4;
      color: #fff;
      padding: 8px 11px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .08em;
      z-index: 2;
    }

    #custom-tavsiyalar-articles .oby-content {
      padding: 20px;
    }

    #custom-tavsiyalar-articles .oby-title {
      font-size: 22px;
      line-height: 1;
      letter-spacing: -0.04em;
      font-weight: 900;
      margin: 0;
    }

    #custom-tavsiyalar-articles .oby-desc {
      margin-top: 14px;
      color: #0043a4;
      font-size: 12px;
      line-height: 1.55;
      font-weight: 800;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    #custom-tavsiyalar-articles .oby-date {
      margin-top: 18px;
      color: #6b7280;
      font-size: 11px;
      letter-spacing: .12em;
      font-weight: 600;
    }

    #custom-tavsiyalar-articles .oby-loading {
      max-width: 1160px;
      margin: 0 auto;
      background: #fff;
      padding: 30px;
      text-align: center;
      font-weight: 900;
      color: #0043a4;
    }

    @media (max-width: 640px) {
      #custom-tavsiyalar-articles {
        padding: 50px 16px 60px;
      }

      #custom-tavsiyalar-articles .oby-title-main {
        margin-bottom: 32px;
        font-size: 29px;
        line-height: 1.05;
      }

      #custom-tavsiyalar-articles .oby-scroll {
        gap: 14px;
        padding-bottom: 16px;
      }

      #custom-tavsiyalar-articles .oby-card {
        flex-basis: 82%;
      }
    }
  </style>

  <h2 class="oby-title-main">ULAR QAYSI SOHALARDA?</h2>

  <div class="oby-loading" id="oby-loading">Maqolalar yuklanmoqda...</div>
  <div class="oby-scroll" id="oby-articles-grid"></div>

  <script>
    function obyCleanText(text) {
      if (!text) return "";
      return String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    function obyFirstCategory(category) {
      if (!category) return "";
      return String(category).split(";").map(function(item) {
        return item.trim();
      }).filter(Boolean)[0] || "";
    }

    function obyFormatDate(date) {
      if (!date) return "";
      var p = String(date).slice(0, 10).split("-");
      if (p.length !== 3) return "";
      return p[2] + "." + p[1] + "." + p[0];
    }

    fetch("/api/tavsiyalar-articles")
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var loading = document.getElementById("oby-loading");
        var grid = document.getElementById("oby-articles-grid");
        var articles = data.articles || [];

        if (loading) loading.style.display = "none";

        if (!articles.length) {
          if (grid) {
            grid.innerHTML = '<div class="oby-loading">Maqola topilmadi</div>';
          }
          return;
        }

        grid.innerHTML = articles.map(function(article) {
          var cat = obyFirstCategory(article.category);
          var desc = obyCleanText(article.description);
          var image = article.image_url || "";
          var date = obyFormatDate(article.created_at);
          var safeTitle = String(article.title || "").replace(/"/g, "&quot;");

          return (
            '<a class="oby-card" href="/bunyodkorlar/' + article.slug + '">' +
              '<div class="oby-image-wrap">' +
                (cat ? '<span class="oby-category">' + cat + '</span>' : '') +
                (image ? '<img class="oby-image" src="' + image + '" alt="' + safeTitle + '">' : '') +
              '</div>' +
              '<div class="oby-content">' +
                '<h3 class="oby-title">' + article.title + '</h3>' +
                (desc ? '<p class="oby-desc">' + desc + '</p>' : '') +
                (date ? '<p class="oby-date">' + date + '</p>' : '') +
              '</div>' +
            '</a>'
          );
        }).join("");
      })
      .catch(function() {
        var loading = document.getElementById("oby-loading");
        if (loading) loading.innerText = "Maqolalarni yuklashda xatolik bo‘ldi";
      });
  </script>
</div>
<!-- OBY_ARTICLES_END -->
'@

# Faqat aniq Tilda record: rec2131821123 = "ULAR QAYSI SOHALARDA?" bloki
$pattern = '(?s)<div id="rec2131821123"[^>]*>.*?(?=<div id="rec\d+"|<!--/allrecords-->|</body>)'

if ([regex]::IsMatch($text, $pattern)) {
  $text = [regex]::Replace($text, $pattern, $articlesBlock, 1)
  Set-Content $file $text -Encoding UTF8
  Write-Host "Tayyor: maqolalar faqat 'ULAR QAYSI SOHALARDA?' joyiga qo'shildi."
} else {
  Write-Host "rec2131821123 topilmadi. Tavsiyalar sahifasi oldin buzilgan bo'lishi mumkin."
}
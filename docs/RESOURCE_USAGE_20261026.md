# Vercel keshini optimallashtirish — 2026-10-26

## Natija va joylash holati

Asosiy kod 3f1e343 commitida saqlandi. O‘zgarishlar lokal production build va HTTP orqali tekshirildi. Kod hali jonli saytga joylanmagan: sanjar3 jamoasida yangi deploy yaratish `402 resource_creation_blocked` — “Your Team exceeded our fair use limits and has been blocked” bilan rad etildi. Ishlayotgan avvalgi deployment o‘rnida qoldi. Limitni loyiha almashish yoki qayta deploy bilan tozalashga urinilmadi; billing yoki foydalanish cheklovi yechilgach master branchni productionga joylash kerak.

## Sarfni kamaytirish

- Bosh sahifa, katalog, biografiya, iqtiboslar, RSS/Atom va sitemap uchun bir daqiqa o‘rniga bir soatlik yangilanish.
- Ommaviy server so‘rovlari alohida anonim, sessiya saqlamaydigan Supabase clientidan foydalanadi. Faqat tegishli public GET/HEAD so‘rovlari keshlanadi.
- Maqola bo‘yicha teglar, kolleksiya, kommentariya va reyting teglarini ajratish: bitta biografiyani tahrirlash boshqa biografiya yozuvlarini eskirtirmaydi.
- Admin tomonidan chop etish/arxivlash/o‘chirish va slug o‘zgarishida yangi va avvalgi havolalar eskirtiriladi. Revalidation endpoint Supabase serverida getUser orqali mavjud admin UUID’ni tekshiradi; foydalanuvchi yuborgan ixtiyoriy pathni qabul qilmaydi.
- Avtomatik aylanadigan biografiya kartalarining spekulyativ prefetch’i o‘chirildi. Kartalarni bosib ochish saqlangan.
- Iqtiboslar uchun 2 MB dan ortiq xom biografiya matnlarini saqlash o‘rniga faqat 12 ta kartaga kerakli qisqa natija keshlanadi.
- Statik tasvir va shriftlar brauzerda qayta ishlatiladi. Vaqtinchalik DB xatosi bo‘sh muvaffaqiyatli sahifa sifatida saqlanmaydi.
- Next.js 16.4.3 va transitive xavfsizlik tuzatishlari lockfile’da saqlandi. PostCSS 8.5.23 override bilan belgilanadi. npm audit: 0 ta qayd etilgan zaiflik.

## Tekshiruv

Production build va TypeScript o‘tdi. Uchta kesh izolyatsiyasi testi o‘tdi. Production HTTP sinovida bosh sahifa, katalog, iqtiboslar, RSS, sitemap va mavjud biografiya 200 qaytardi. Takroriy bosh sahifa bir xil qoldi va HIT qaytardi; biografiya birinchi MISS’dan keyin HIT bo‘ldi. Keshni yangilash endpointi sessiyasiz 401, soxta token bilan 403 qaytardi. Haqiqiy admin sessiyasida maqola chop etish oqimi brauzer orqali tekshirilmagan.

## Keyingi tekshiruv

Vercel cheklovi yechilgach master commitni productionga deploy qiling, custom domenlar yangi versiyaga tegishli ekanini tasdiqlang. Admin orqali bitta maqolani yangilang: katalog, yangi slug va eski slug holatini tekshiring. Vercel Usage’da keyingi ISR Writes, Function Invocations va trafikni loyiha bo‘yicha solishtiring. 60 martaga siyraklashgan interval o‘lchangan haqiqiy hisob sarfi kamayishi degani emas; trafik va tahrirlar soni ta’sir qiladi. Bu o‘zgarishlar bepul kvotani bekor qilmaydi. To‘g‘ridan-to‘g‘ri DB tahrirlari bir soatlik fallback orqali yangilanadi.

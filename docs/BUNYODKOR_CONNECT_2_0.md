# Bunyodkor Connect 2.0 — UI/UX konsepsiya va ishga tushirish talablari

## Mahsulot yo‘nalishi
Bunyodkor Connect — ensiklopediyadagi yoshlar bilan mavzuga mos savol-javob va hamkorlik so‘rovlariga mo‘ljallangan aloqa xizmati. Instagram DM'ning tanish axborot arxitekturasi va ixcham vizual ritmidan ilhomlanadi, lekin Bunyodkor brendining mustaqil interfeysidir. Yangi ijtimoiy tarmoq emas.

## Navigatsiya
* Mobil pastki panel: Bosh, Yoshlar, Iqtiboslar, Ariza, Chat (mavjud tarkib saqlanadi).
* Boshqa sahifalarning yuqori o‘ngida alohida Profil ikonkasi; kirgan foydalanuvchida avatar.
* /chat — immersiv, to‘q rangli xabarlar sahifasi; saytdagi doimiy oq fon o‘zgarmaydi.
* /profil — Kirish, Ro‘yxatdan o‘tish, shaxsiy ma’lumotlar, foto, maqola biriktirish va xabarlar sozlamalari.

## Chat — Instagram DM-ga yaqin
Mobil chat ro‘yxatida: "Xabarlar" sarlavhasi, yangi xabar ikonkasi, profil avatari, qidiruv, Barchasi/O‘qilmagan/So‘rovlar, foydalanuvchi avatari, ismi, oxirgi xabaridan qisqa satr, yuborilgan vaqt, o‘qilmagan ko‘k nuqta. Ro‘yxatga bosilganda to‘liq ekranli suhbat; orqaga qaytish, qabul qiluvchining rasmi va ismi, status, xabarlar, yuborish maydoni, bloklash va shikoyat qilish. Desktop ikkita ustun. Audio/video qo‘ng‘iroq, story, reels va guruh chat qo‘shilmaydi.

## Hisob yaratish
Ism, familiya, yosh, email va parol (kamida 8 belgi). Supabase Auth emailni tasdiqlaydi. Standart email shabloni havola yuborsa, havola; Supabase xat shabloni {{ .Token }} deb moslanganda, 6 xonali kod forma orqali tasdiqlanadi. Email SMS emas. Tizimga kirgach ma’lumotlar shaxsiy kabinetda saqlanadi. Yosh ma’lumoti boshqalarga ko‘rinmaydigan RLS jadvalida; 18 yoshdan kichik akkauntlarda shaxsiy chat ochilmaydi. Yosh self-report: alohida hujjat tekshiruvining o‘rnini bosa olmaydi.

## Profil fotosurati
JPG/PNG/WebP, 2MB; Supabase Storage connect-avatars public bucket; faqat autentifikatsiyadan o‘tgan foydalanuvchi o‘z uid/ papkasiga yoza oladi. Eski avatar yangisiga almashtirilgach o‘chiriladi. Javob kelmaguncha UI muvaffaqiyatli deb ko‘rsatmaydi.

## Nomzodlarni tasdiqlash
Foydalanuvchi maqolasini topadi, izoh bilan biriktirish so‘rovini yuboradi. Admin /admin/connect orqali shaxsni mustaqil tekshiradi. Akkaunt verified_article_id ustunini bevosita o‘zgartira olmaydi. Tasdiqlashdan so‘ng ham qabul qilish sukunatda o‘chiq; nomzod shaxsan yoqadi. Savol berish va Hamkorlik tugmalari faqat ruxsat bergan 18+ egalarining maqolalarida ko‘rsatiladi.

## Maxfiylik va xavfsizlik
Xabarlar faqat ikki suhbat ishtirokchisiga ochiq; PostgreSQL RLS barcha jadvallarda yoqilgan. Yangi suhbatlar pending; qabul qilish yoki rad etish mavjud. Bloklash/shikoyat qilish va tezlik limitlari SQL funksiyalarda tekshiriladi. Anon rolga chatni boshqaruvchi SECURITY DEFINER funksiyalarga EXECUTE berilmagan. Yangi account_details faqat egasiga o‘qiladi. Admin oynasi shikoyatlar matnini ko‘radi, foydalanuvchining barcha xabarlarini emas.

## Dizayn tizimi
DM ranglari: #0A0D12 (fon), #141922 (qoplama), #242C35 (begona xabar), #3386F2 (o‘z xabari), #F6F7FB (asosiy matn), #9AA4B2 (ikkilamchi matn). Profil sahifasi esa oq, #F5F8FD fonli va saytning moviy #245FFF aksentida. Avatar dumaloq. Target 44px touch controls, keyboard va aria-label, mobil safe area, reduced motion, no horizontal overflow.

## MVP qabul mezonlari
1) Ro‘yxatdan o‘tish/Emailni tasdiqlash/kirish/chiqish ishlashi.
2) 2MB dan kichik rasm yuklanishi; boshqaning avatarini almashtirish rad qilinishi.
3) Biriktirishni faqat admin tasdiqlashi; tasdiq oldin chat tugmasi yo‘q.
4) So‘rov yuborish-qabul qilish; ikki akkaunt yozisha olishi.
5) Uchinchi akkaunt xabarlarini SELECT qila olmasligi.
6) Bloklashda yozishmalarni davom ettirish imkonsizligi.
7) 18 yoshdan kichiklarga chat yopiq bo‘lishi.
8) Desktop va mobil ko‘rinishlarda yangi inbox, konversatsiya, profil.
9) Next.js production build / TS tekshiruv; eski ma’lumotlar saqlanishi.

## Keyingi bosqichga qoldirilgan
Audio/video qo‘ng‘iroq, voice messages, fayl almashish, stories, guruh chat, online/seen status, push bildirishnomalar. Email uchun SMTP va 6 xonali OTP shabloni admin dashboarddan alohida tekshiriladi.

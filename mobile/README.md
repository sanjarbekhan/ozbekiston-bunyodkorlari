# Bunyodkor Mobile

Expo Go (SDK 54) asosidagi Bunyodkor mobil ilovasi.

## Ishga tushirish

```bash
npm install
npx expo start --clear
```

Telefon va kompyuter bir xil Wi-Fi tarmog'ida bo'lsa, Expo Go orqali QR-kodni skanerlang.

## Xavfsizlik

- Ilovada faqat Supabase publishable key ishlatiladi.
- Secret/service-role kalitlar mobil kodga kiritilmaydi.
- Barcha yozuvlar RLS siyosatlari bilan himoyalanadi.
- Sessiya tokenlari qurilmaning SecureStore xizmatida saqlanadi.

`supabase/migrations/20260825000000_bunyodkor_mobile_core.sql` migratsiyasi mobil profil, asar, yutuq, aloqa va bildirishnoma jadvallarini yaratadi.

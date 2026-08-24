This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Biografik anketa

CRM orqali kelishilgan nomzodlarga `https://www.bunyodkor.com/anketa` havolasi yuboriladi. Telegram username’ni oldindan to‘ldirish uchun `?telegram=username` query parametridan foydalanish mumkin.

Forma ishga tushishidan oldin `supabase/migrations/202608161200_create_biography_submissions.sql` migratsiyasini saytning Supabase loyihasiga qo‘llang. Forma matnli qoralamani brauzerda 30 kun saqlaydi; foto va hujjatlar xavfsizlik sabab qoralamaga saqlanmaydi.

## Bunyodkor mobil ilovasi

`mobile/` — Expo Go (SDK 54) bilan ishlaydigan Android/iOS ilova. U veb-sayt bilan bir xil Supabase loyihasidan foydalanadi va e’lon qilingan barcha nomzodlarni `articles` jadvalidan avtomatik ko‘rsatadi.

```bash
cd mobile
npm install
npx expo start --clear
```

Mobil profil, qoralama, networking, guruh, chat, referal va bildirishnoma jadvallari quyidagi migratsiyalarda saqlanadi:

- `20260825000000_bunyodkor_mobile_core.sql`
- `20260825001000_harden_mobile_and_trigger_functions.sql`

Mobil ilovada faqat Supabase publishable key mavjud. Secret yoki service-role kalitlarni mobil paketga kiritmang.

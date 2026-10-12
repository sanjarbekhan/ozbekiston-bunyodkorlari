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


## Bunyodkor Connect (chat, 2026-10)

**Status:** implemented in source, **disabled in production until the correct Supabase database is migrated**. Do NOT apply this migration to an unrelated Supabase project.

1. Identify the Supabase project whose `public.articles` table serves bunyodkor.com. In Supabase SQL Editor confirm `select count(*) from public.articles` succeeds.
2. Back up that project's database, review and apply `supabase/migrations/20261012193000_bunyodkor_connect_secure_chat.sql`. It creates six RLS-protected tables and vetted RPCs. It must run against the existing `auth.users` / `public.articles` database.
3. In Supabase Authentication, enable email signup, email confirmation, rate limits, SMTP and approved Site URL / Redirect URLs for `https://www.bunyodkor.com/chat`. Existing Supabase URL and public anon key are reused; **never commit or expose service_role keys**.
4. Test a visitor signup, owner claim, admin review, owner opt-in, conversation request, acceptance, messaging, block/report, and RLS denial for a third user.
5. Only after the migration and tests succeed, set Vercel environment variable `NEXT_PUBLIC_BUNYODKOR_CONNECT_ENABLED=true` for production and redeploy. The fifth mobile tab changes from Menu to Chat; the existing top hamburger remains. Biographical pages show **Savol berish** and **Hamkorlik taklif qilish**.
6. Claims/reports queue: `/admin/connect` under the existing editor account (its existing fixed Supabase Auth UUID is reused). Approve only after human identity verification. Do **not** approve direct messaging for minors before separate safeguarding processes.

Chat permissions: accounts cannot self-assign a biography; admins must approve ownership. Only verified owners can opt into contact. New conversations start in pending and require recipient acceptance. Database functions enforce per-minute and daily rate limits and block rules; messages are private under RLS. Realtime is combined with a visibility-aware fallback refresh. The UI only loads 60 recent conversations/messages; there is no file upload, video call or group chat in this version.

**Rollout caveat:** This GitHub repository does not contain Supabase production credentials. The connected Supabase projects available to this ChatGPT session do not expose the Bunyodkor articles database; applying the migration without verifying the project would risk damaging another application.


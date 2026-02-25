# Frontend - Next.js 15.3.3

Frontend ของระบบเติมเกมที่สร้างด้วย Next.js 15 (App Router)

## Tech Stack

- Next.js 15.3.3
- React 19
- TypeScript 5.8
- Tailwind CSS 3.4
- shadcn/ui
- TanStack Query
- Zustand

## การติดตั้ง

```bash
npm install
```

## การรัน

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## โครงสร้าง

```
src/
├── app/              # App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom hooks
└── lib/             # Utilities
```

## Environment Variables

สร้างไฟล์ `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

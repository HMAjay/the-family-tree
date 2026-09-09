# The Family Tree

A premium ancestry site — a digital heirloom for tracing roots and keeping names.

Build your own tree from a blank page. There is no sample family. Saving and printing require an account.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43217](http://localhost:43217).

## What you can do

- Start from the landing page with **Start creating your family tree**
- Add people and relationships; grandparents, uncles, cousins, and in-laws are inferred
- Walk generations and ask **The Family Guide** (answers only from your tree)
- **Save** or **Print** after you log in or create an account

## Accounts

Register with email and password. Your tree is stored on the server for your account.

Set `AUTH_SECRET` in production. Optional `DATABASE_URL` is documented in Prisma if you later move off the file store.

## Deploy on Vercel

```bash
npx vercel
```

Set `AUTH_SECRET` in the project environment variables. On Vercel’s serverless filesystem, account data lives in `/tmp` unless you attach a database.

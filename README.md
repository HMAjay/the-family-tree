# The Family Tree

A premium ancestry and heritage site — a digital heirloom for tracing roots, celebrating bonds, and keeping names from slipping between houses.

The sample tree is **the Sharma family of Mysuru and Bengaluru**: six generations, inferred kinship, memories, festivals, and a guide that answers only from verified relationships.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43217](http://localhost:43217).

## What you can do

- Explore an interactive family tree (zoom, pan, mini-map, generation collapse, ancestor/descendant highlights)
- Add people and relationships; grandparents, uncles, cousins, and in-laws are inferred from parents and marriages
- Open full profiles with family circles, memories, and a life timeline
- Walk **Our Generations** and **Our Heritage**
- Keep photographs and letters in **Memories That Live On**
- Ask **The Family Guide** questions such as “Who is Rahul’s grandfather?”
- Trace **How Are We Related?** and glow the golden path on the tree

Family data lives in the browser (local storage) so the demo works without a database. Restore the sample family or start empty from Family Settings.

## Architecture

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Motion | Framer Motion |
| Tree | React Flow |
| Kinship engine | Pure TypeScript tools (`getParents`, `getChildren`, `findRelationship`, …) |
| Guide | `/api/chat` calls those tools — it does not invent relatives |
| Schema | `prisma/schema.prisma` (PostgreSQL) for when you attach a real database |

### Optional PostgreSQL

Set `DATABASE_URL` and run Prisma migrate when you are ready to persist families on a server. Until then, the UI store is the source of truth.

## Deploy on Vercel

This project is a standard Next.js app.

```bash
npx vercel
```

Or import the Git repository in the Vercel dashboard. No environment variables are required for the demo.

## Stack notes

The Family Guide never sends the whole database to a language model. It parses the question, runs structured tools against the tree, and writes a natural-language answer from that result. If a link is missing, it says so.

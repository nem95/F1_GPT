# F1 GPT

Hi, the purpose of this project is to build a Formula One chatbot built over a RAG system.

This project is made following the tutorial: "Build and Deploy a RAG Chatbot with JavaScript, LangChain.js, Next.js, Vercel, OpenAI" from FreeCodeCamp thanks to [Ania Kubow](https://www.youtube.com/@aniakubow). 

It uses RAG (retrieval-augmented generation): F1 web pages are scraped, split into chunks, embedded and stored in an Astra DB vector collection. 
When a user asks a question, the most relevant chunks are retrieved and pass to the LLM as context.

If no context, the LLM will try to answer with it's knowledge.

here is all the urls we scrapped for the tutorials (you can remove half of it to reduce uploading time)

[
  'https://en.wikipedia.org/wiki/Formula_One',
  'https://en.wikipedia.org/wiki/Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/Formula_One_car',
  'https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/Formula_One_Grand_Prix',
  'https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/2026_Formula_One_World_Championship',
  'https://en.wikipedia.org/wiki/List_of_Formula_One_driver_records',
  'https://f1salaries.com/',
  'https://www.formula1.com/en/latest',
  'https://en.wikipedia.org/wiki/List_of_female_Formula_One_drivers'
];

## Stack

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat
- **OpenRouter** for both the chat model and the embeddings
- **DataStax Astra DB** as the vector database
- **LangChain** + **Puppeteer** to scrape and chunk the source pages

## How it works

1. **Seeding** (`scripts/loadDB.ts`)
   - Creates the Astra DB collection 
   for Open AI embedding model (vector dimension `1536`, `dot_product` metric).
   - Scrapes a list of F1 pages (Wikipedia seasons and records, formula1.com, f1salaries.com) with Puppeteer.
   - Splits the text into 512 characters chunks with a 100 overlap.
   - Embeds each chunk with the `EMBEDDING_MODEL` and inserts it into the collection.
2. **Chat** (`app/api/chat/route.ts`)
   - Embeds the user's latest message.
   - Fetches the 10 closest chunks from Astra DB.
   - Streams an answer from the `AI_MODEL`, with the chunks injected as context. The assistant only answers Formula One questions.

## Project structure

```
app/
  api/chat/route.ts     # POST /api/chat — retrieval + streaming response
  components/           # Chat bubbles, loading state, prompt suggestions
  page.tsx              # Chat UI
scripts/
  loadDB.ts             # Scrape, chunk, embed and populate the DB
.env.example            # Environment variables template
```

## Prerequisites

- Node.js 20+
- An [Astra DB](https://astra.datastax.com) database (Serverless, vector-enabled)
- An [OpenRouter](https://openrouter.ai) API key

## Environment variables

Copy the template and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `ASTRA_DB_NAMESPACE` | Astra DB keyspace | `default_keyspace` |
| `ASTRA_DB_COLLECTION` | Name of the vector collection | `dbf1` |
| `ASTRA_DB_API_ENDPOINT` | Your database API endpoint (from the Astra dashboard) | — |
| `ASTRA_DB_APPLICATION_TOKEN` | Astra application token | — |
| `OPENROUTER_API_KEY` | OpenRouter API key | — |
| `EMBEDDING_MODEL` | Embedding model on OpenRouter | `openai/text-embedding-3-small` |
| `AI_MODEL` | Chat model on OpenRouter (Free one) | `nvidia/nemotron-3-ultra-550b-a55b:free` |

Notes:

- The default `AI_MODEL` is free. For a paid model, use e.g. `openai/gpt-4o-mini`. See all models at [openrouter.ai/models](https://openrouter.ai/models).
- The collection is created with a vector dimension of `1536`, which matches `text-embedding-3-small`. If you change `EMBEDDING_MODEL`, update the dimension in `scripts/loadDB.ts` to match and re-seed.
- `ASTRA_DB_NAMESPACE` is in the template but not read by the code yet; the client uses the database's default keyspace.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Populate the vector database (run once)
npm run seed

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start asking about Formula One.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run seed` | Scrape, embed and load F1 data into Astra DB |
| `npm run lint` | Run ESLint |

import { DataAPIClient } from "@datastax/astra-db-ts";
import { OpenRouter } from "@openrouter/sdk";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import "dotenv/config";

type SimilarityMetric = "cosine" | "euclidean" | "dot_product";

const { 
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENROUTER_API_KEY,
} = process.env;

const openrouter = new OpenRouter(
  { apiKey: OPENROUTER_API_KEY as string }
);


const f1Data = [
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

const client = new DataAPIClient();
const db = client.db(ASTRA_DB_API_ENDPOINT as string, {
  token: ASTRA_DB_APPLICATION_TOKEN as string,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection =  async (similarityMetric: SimilarityMetric = "dot_product") => {
  try {
    const res = await db.createCollection(
      ASTRA_DB_COLLECTION as string,
      {
        vector: {
          dimension: 1536,
          metric: similarityMetric,
        },
      },
    );
    console.log(res);
    console.log(`Collection ${ASTRA_DB_COLLECTION} created successfully.`);
  } catch (error) {
    console.error(`Error creating collection: ${error}`);
  }
};


const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION as string);
  
  for await (const url of f1Data) {
    try {
      const content = await scrapePage(url,);
      const chunks = await splitter.splitText(content);

      for await (const chunk of chunks) {
        const embedding = await openrouter.embeddings.generate({
          requestBody: {
            model: "openai/text-embedding-3-small",
            input: chunk,
            encodingFormat: "float"
          }
        });

        if (typeof embedding === "string") {
          throw new Error(`Unexpected embeddings response: ${embedding}`);
        }
        
        const vector = embedding.data[0].embedding;

        const res = await collection.insertOne({
          $vector: vector,
          text: chunk,
        });
        
        console.log(res)
      }

      console.log(`Loaded and indexed data from ${url}`);
    } catch (error) {
      console.error(`Error loading data from ${url}: ${error}`);
    }
  } 
}

const scrapePage = async (url: string): Promise<string> => {
  const loader = new PuppeteerWebBaseLoader(url,
    {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async(page, browser) => {
        const result = await page.evaluate(
          () => document.body.innerHTML
        );
        await browser.close();
        return result;
      }
    }
  );
  return (await loader.scrape())?.replace(/<[^>]+>/g, ' ');
}

createCollection().then(() => loadSampleData())
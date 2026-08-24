import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Kérjük, állítsa be a MONGODB_URI környezeti változót.");
}
if (!process.env.MONGODB_DB) {
  throw new Error("Kérjük, állítsa be a MONGODB_DB környezeti változót.");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const connectedClient = await clientPromise;
  const db = connectedClient.db(dbName);
  return { client: connectedClient, db };
}

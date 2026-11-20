import { MongoClient, Db } from 'mongodb'

const DB_NAME = process.env.MONGODB_DB || 'cibuluberdaya'

// Simpan client di globalThis agar tidak membuat koneksi baru di setiap
// hot reload (dev) atau setiap invocation serverless yang masih hangat.
const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<MongoClient> }

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI)
}

export function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI belum diatur')
  }
  if (!globalForMongo._mongoClient) {
    globalForMongo._mongoClient = new MongoClient(uri).connect().catch((error) => {
      globalForMongo._mongoClient = undefined
      throw error
    })
  }
  return globalForMongo._mongoClient
}

export async function connectToDatabase(): Promise<Db> {
  const client = await getClient()
  return client.db(DB_NAME)
}

import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const options = {}

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<Db> {
  if (db) return db

  client = new MongoClient(uri, options)
  await client.connect()
  db = client.db('cibuluberdaya') // otomatis ambil dari nama di URI
  console.log('✅ Terhubung ke MongoDB:', db.databaseName)
  return db
}
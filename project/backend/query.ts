import { config } from 'dotenv';
config();
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function run() {
  const res = await db.select().from(schema.restaurants);
  console.log(JSON.stringify(res, null, 2));
}
run();

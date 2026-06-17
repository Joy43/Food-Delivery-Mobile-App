const { neon } = require('@neondatabase/serverless');

const databaseUrl = "postgresql://neondb_owner:npg_e0FhpqT6sRKz@ep-withered-fog-aq78pnmo-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function run() {
  try {
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    console.log("Columns of users table:", res);
  } catch (err) {
    console.error(err);
  }
}

run();

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const dbUrl = process.env.DATABASE_URL || '';

if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, 'utf8');
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  const isMysql = dbUrl.startsWith('mysql://');

  let targetProvider = 'sqlite';
  if (isPostgres) targetProvider = 'postgresql';
  else if (isMysql) targetProvider = 'mysql';

  const updated = content.replace(/provider\s*=\s*"(sqlite|postgresql|mysql)"/, `provider = "${targetProvider}"`);

  if (content !== updated) {
    fs.writeFileSync(schemaPath, updated, 'utf8');
    console.log(`[prepare-db] Updated Prisma datasource provider to: ${targetProvider}`);
  } else {
    console.log(`[prepare-db] Prisma datasource provider is already: ${targetProvider}`);
  }

  // If a remote cloud database is configured and in CI/build environment, push schema
  if ((isPostgres || isMysql) && (process.env.VERCEL || process.env.RENDER)) {
    console.log(`[prepare-db] Syncing schema to cloud database...`);
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
      console.log(`[prepare-db] Schema sync successful.`);
    } catch (err) {
      console.error(`[prepare-db] Schema push warning:`, err.message);
    }
  }
}

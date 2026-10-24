import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote cloud database (PostgreSQL, MySQL, etc.) is configured, always use it directly
  if (
    envUrl &&
    (envUrl.startsWith('postgres://') ||
      envUrl.startsWith('postgresql://') ||
      envUrl.startsWith('mysql://'))
  ) {
    return envUrl;
  }

  // Detect serverless environment (Vercel, AWS Lambda, Netlify)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.cwd().startsWith('/var/task');

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');

    // On Vercel, root filesystem is read-only. We must use /tmp/dev.db.
    // If /tmp/dev.db doesn't exist or is empty, copy from bundled source
    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
        path.join('/var/task', 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve('./dev.db'),
      ];

      let copied = false;
      for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            fs.chmodSync(tmpDbPath, 0o666);
            console.log(`[Prisma] Seed database initialized at ${tmpDbPath} from ${candidate} (${fs.statSync(tmpDbPath).size} bytes)`);
            copied = true;
            break;
          } catch (err) {
            console.error(`[Prisma] Failed copying database from ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.error('[Prisma] CRITICAL: Seed dev.db was not found in candidate paths:', candidatePaths);
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Standard non-serverless environment (local dev, Docker, Render)
  if (!envUrl || envUrl === 'file:./dev.db' || envUrl === 'file:./prisma/dev.db') {
    const localPrismaDb = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(localPrismaDb)) {
      return `file:${localPrismaDb}`;
    }
  }

  return envUrl || 'file:./prisma/dev.db';
}

const dbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

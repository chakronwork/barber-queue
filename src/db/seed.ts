import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';

async function main() {
  const username = 'admin';
  const password = '123456';

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existing.length > 0) {
    console.log('admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    passwordHash,
  });

  console.log('admin created');
  console.log('username: admin');
  console.log('password: 123456');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

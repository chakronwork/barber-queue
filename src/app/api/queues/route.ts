import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { queues } from '@/db/schema';
import { createQueueSchema } from '@/lib/queue-schema';

export async function GET() {
  const list = await db
    .select()
    .from(queues)
    .orderBy(desc(queues.createdAt));

  return NextResponse.json({ queues: list });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: 'invalid JSON body' },
      { status: 400 }
    );
  }

  const parsed = createQueueSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'validation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const [created] = await db
    .insert(queues)
    .values({
      customerName: parsed.data.customerName,
      service: parsed.data.service,
      note: parsed.data.note,
    })
    .returning();

  return NextResponse.json({ queue: created }, { status: 201 });
}

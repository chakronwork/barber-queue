import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { queues } from '@/db/schema';
import { updateQueueSchema } from '@/lib/queue-schema';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const queueId = Number(id);

  if (!Number.isInteger(queueId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const result = await db
    .select()
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ queue: result[0] });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const queueId = Number(id);

  if (!Number.isInteger(queueId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const parsed = updateQueueSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'validation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(queues)
    .set(parsed.data)
    .where(eq(queues.id, queueId))
    .returning();

  return NextResponse.json({ queue: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const queueId = Number(id);

  if (!Number.isInteger(queueId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  await db.delete(queues).where(eq(queues.id, queueId));

  return NextResponse.json({ success: true });
}

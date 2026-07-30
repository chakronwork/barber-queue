import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: mockDb,
}));

describe('GET /api/queues', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with queues array', async () => {
    const mockQueues = [{ id: 1, customerName: 'Test' }];
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        orderBy: vi.fn().mockResolvedValue(mockQueues),
      })),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.queues).toEqual(mockQueues);
  });
});

describe('POST /api/queues', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/queues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for validation error (empty name)', async () => {
    const req = new Request('http://localhost/api/queues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: '', service: 'haircut' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 on success', async () => {
    const created = { id: 2, customerName: 'สมชาย', service: 'haircut' };
    mockDb.insert.mockReturnValueOnce({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([created]),
      })),
    });

    const req = new Request('http://localhost/api/queues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: 'สมชาย', service: 'haircut' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.queue).toEqual(created);
  });
});

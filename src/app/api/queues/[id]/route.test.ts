import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH, DELETE } from './route';

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: mockDb,
}));

const mockQueue = {
  id: 1,
  customerName: 'สมชาย',
  service: 'haircut',
  status: 'pending',
  note: null,
  createdAt: new Date().toISOString(),
};

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/queues/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid id', async () => {
    const res = await GET(new Request('http://localhost/api/queues/abc'), makeParams('abc'));
    expect(res.status).toBe(400);
  });

  it('returns 404 if not found', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
      })),
    });
    const res = await GET(new Request('http://localhost/api/queues/1'), makeParams('1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 with queue', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([mockQueue]) })),
      })),
    });
    const res = await GET(new Request('http://localhost/api/queues/1'), makeParams('1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.queue).toEqual(mockQueue);
  });
});

describe('PATCH /api/queues/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 if queue not found', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
      })),
    });
    const req = new Request('http://localhost/api/queues/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    const res = await PATCH(req, makeParams('1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 on success', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([mockQueue]) })),
      })),
    });
    mockDb.update.mockReturnValueOnce({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ ...mockQueue, status: 'done' }]),
        })),
      })),
    });

    const req = new Request('http://localhost/api/queues/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    const res = await PATCH(req, makeParams('1'));
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/queues/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 if not found', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
      })),
    });
    const res = await DELETE(new Request('http://localhost/api/queues/1'), makeParams('1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 on success', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([mockQueue]) })),
      })),
    });
    mockDb.delete.mockReturnValueOnce({
      where: vi.fn().mockResolvedValue([]),
    });

    const res = await DELETE(new Request('http://localhost/api/queues/1'), makeParams('1'));
    expect(res.status).toBe(200);
  });
});

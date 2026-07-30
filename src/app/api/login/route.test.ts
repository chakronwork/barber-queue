import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: mockDb,
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const mockUser = {
  id: 1,
  username: 'admin',
  passwordHash: 'hashed',
};

describe('POST /api/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if body is missing', async () => {
    const req = new Request('http://localhost/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 if user not found', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })),
      })),
    });

    const req = new Request('http://localhost/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 and sets cookie on success', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([mockUser]) })),
      })),
    });

    const req = new Request('http://localhost/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('token=');
  });
});

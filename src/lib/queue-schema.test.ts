import { describe, it, expect } from 'vitest';
import { createQueueSchema, updateQueueSchema } from './queue-schema';

describe('createQueueSchema', () => {
  it('accepts valid input', () => {
    const r = createQueueSchema.safeParse({
      customerName: 'สมชาย',
      service: 'haircut',
      note: 'สั้นข้าง',
    });
    expect(r.success).toBe(true);
  });

  it('trims whitespace on name', () => {
    const r = createQueueSchema.safeParse({
      customerName: '  สมชาย  ',
      service: 'shave',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.customerName).toBe('สมชาย');
  });

  it('rejects empty name', () => {
    const r = createQueueSchema.safeParse({ customerName: '', service: 'shave' });
    expect(r.success).toBe(false);
  });

  it('rejects unknown service', () => {
    const r = createQueueSchema.safeParse({ customerName: 'a', service: 'nail' });
    expect(r.success).toBe(false);
  });

  it('rejects note over 500 chars', () => {
    const r = createQueueSchema.safeParse({
      customerName: 'a',
      service: 'color',
      note: 'x'.repeat(501),
    });
    expect(r.success).toBe(false);
  });
});

describe('updateQueueSchema', () => {
  it('rejects empty object (nothing to update)', () => {
    const r = updateQueueSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('accepts partial status', () => {
    const r = updateQueueSchema.safeParse({ status: 'done' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const r = updateQueueSchema.safeParse({ status: 'maybe' });
    expect(r.success).toBe(false);
  });
});

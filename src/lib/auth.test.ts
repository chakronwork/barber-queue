import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './auth';

describe('auth tokens', () => {
  it('sign produces a 3-part jwt string', async () => {
    const token = await signToken({ sub: '1', username: 'admin' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verify returns the same payload', async () => {
    const token = await signToken({ sub: '7', username: 'first' });
    const payload = await verifyToken(token);
    expect(payload.sub).toBe('7');
    expect(payload.username).toBe('first');
  });

  it('verify rejects a malformed token', async () => {
    await expect(verifyToken('not.a.token')).rejects.toThrow();
  });

  it('verify rejects a tampered token', async () => {
    const token = await signToken({ sub: '1', username: 'admin' });
    const tampered = token.slice(0, -4) + 'XXXX';
    await expect(verifyToken(tampered)).rejects.toThrow();
  });
});

import { vi } from 'vitest';

// สร้าง chain object ที่จำลอง Drizzle query builder
// method สุดท้ายของ chain ต้อง return Promise (mockResolvedValue)
function createSelectChain(finalValue: any) {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue(finalValue),
        orderBy: vi.fn().mockResolvedValue(finalValue),
      })),
    })),
  };
}

function createInsertChain(finalValue: any) {
  return {
    values: vi.fn(() => ({
      returning: vi.fn().mockResolvedValue(finalValue),
    })),
  };
}

function createUpdateChain(finalValue: any) {
  return {
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue(finalValue),
      })),
    })),
  };
}

function createDeleteChain(finalValue: any) {
  return {
    where: vi.fn().mockResolvedValue(finalValue),
  };
}

export function createMockDb() {
  return {
    select: vi.fn(() => createSelectChain([])),
    insert: vi.fn(() => createInsertChain([])),
    update: vi.fn(() => createUpdateChain([])),
    delete: vi.fn(() => createDeleteChain([])),
  };
}

export type MockDb = ReturnType<typeof createMockDb>;

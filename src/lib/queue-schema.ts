import { z } from 'zod';

export const SERVICE_OPTIONS = [
  'haircut',
  'shave',
  'haircut_shave',
  'color',
] as const;

export const STATUS_OPTIONS = [
  'pending',
  'in_progress',
  'done',
  'cancelled',
] as const;

export const createQueueSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  service: z.enum(SERVICE_OPTIONS),
  note: z.string().trim().max(500).optional(),
});

export const updateQueueSchema = z
  .object({
    customerName: z.string().trim().min(1).max(100).optional(),
    service: z.enum(SERVICE_OPTIONS).optional(),
    status: z.enum(STATUS_OPTIONS).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'no fields to update',
  });

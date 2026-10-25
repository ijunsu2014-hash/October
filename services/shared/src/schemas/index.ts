import { z } from "zod";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = credentialSchema.extend({
  nickname: z.string().trim().min(1).max(40),
});

export const loginSchema = credentialSchema;

export const queueSchema = z.object({
  gameType: z.literal("omok"),
  rating: z.number().int().nonnegative(),
});

export const omokMoveSchema = z.object({
  row: z.number().int().min(0).max(14),
  column: z.number().int().min(0).max(14),
});

export const uuidSchema = z.string().uuid();

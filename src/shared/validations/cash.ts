import { z } from "zod";

// Validation pour les sessions de caisse
export const cashRegisterSessionSchema = z.object({
  startingCashAmount: z.number().min(0, "Le fonds de caisse doit être positif"),
  notes: z.string().optional(),
});

// Validation pour les paiements
export const cashPaymentSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  paymentMode: z.enum(["cash", "mobile_money", "bank_transfer", "check"], {
    required_error: "Le mode de paiement est requis",
  }),
  feeTypeId: z.string().min(1, "Le type de frais est requis"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Validation pour les mouvements de caisse
export const cashMovementSchema = z.object({
  typeMovement: z.enum(["in", "out"], {
    required_error: "Le type de mouvement est requis",
  }),
  amount: z.string().min(0.01, "Le montant doit être supérieur à 0"),
  reason: z.string().min(1, "Le motif est requis"),
  description: z.string().optional(),
});

// Validation pour la fermeture de session
export const sessionClosingSchema = z.object({
  actualClosingBalance: z
    .number()
    .min(0, "Le montant en caisse doit être positif"),
  notes: z.string().optional(),
});

// Types TypeScript dérivés
export type CashRegisterSessionFormData = z.infer<
  typeof cashRegisterSessionSchema
>;
export type CashPaymentFormData = z.infer<typeof cashPaymentSchema>;
export type CashMovementFormData = z.infer<typeof cashMovementSchema>;
export type SessionClosingFormData = z.infer<typeof sessionClosingSchema>;

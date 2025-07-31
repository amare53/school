import { z } from "zod";

// Schémas de validation pour l'authentification
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      ),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schémas de validation pour les utilisateurs
export const userSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  role: z.enum(
    ["platform_admin", "school_manager", "cashier", "accountant", "student"],
    {
      required_error: "Le rôle est requis",
    }
  ),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s\-()]{8,}$/.test(val), {
      message: "Format de téléphone invalide",
    }),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
});

// Schémas de validation pour les écoles
export const schoolSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de l'école est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
  address: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s\-()]{8,}$/.test(val), {
      message: "Format de téléphone invalide",
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Format d'email invalide",
    }),
  subscriptionPlan: z.string().min(1, "Le plan d'abonnement est requis"),
  currency: z.enum(["CDF", "USD"], {
    required_error: "La devise est requise",
  }),
});

// Schémas de validation pour les élèves
export const studentSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => !val || new Date(val) <= new Date(), {
      message: "La date de naissance ne peut pas être dans le futur",
    }),
  gender: z.enum(["male", "female"]).optional(),
  parentName: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "Le nom du parent doit contenir au moins 2 caractères",
    }),
  parentPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s\-()]{8,}$/.test(val), {
      message: "Format de téléphone invalide",
    }),
  parentEmail: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Format d'email invalide",
    }),
  address: z.string().optional(),
  classId: z.string().nonempty({
    message: "Le champ classe est obligatoire.",
  }),
});

// Schémas de validation pour les années académiques
export const academicYearSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom de l'année académique est requis")
      .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    startDate: z
      .string()
      .min(1, "La date de début est requise")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Format de date invalide",
      }),
    endDate: z
      .string()
      .min(1, "La date de fin est requise")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Format de date invalide",
      }),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"],
  });

// Schémas de validation pour les niveaux
export const levelSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du niveau est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  code: z
    .string()
    .min(1, "Le code du niveau est requis")
    .max(20, "Le code ne peut pas dépasser 20 caractères"),
  orderIndex: z.number().min(0, "L'ordre doit être un nombre positif"),
});

// Schémas de validation pour les sections
export const sectionSchema = z.object({
  levelId: z.string().min(1, "Le niveau est requis"),
  name: z
    .string()
    .min(1, "Le nom de la section est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  code: z
    .string()
    .min(1, "Le code de la section est requis")
    .max(20, "Le code ne peut pas dépasser 20 caractères"),
});

// Schémas de validation pour les classes
export const classSchema = z.object({
  academicYearId: z.string().min(1, "L'année académique est requise"),
  sectionId: z.string().min(1, "La section est requise"),
  name: z
    .string()
    .min(1, "Le nom de la classe est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  capacity: z
    .number()
    .optional()
    .refine((val) => !val || val > 0, {
      message: "La capacité doit être un nombre positif",
    }),
});

// Schémas de validation pour les types de frais
export const feeTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du type de frais est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().optional(),
  amount: z.number().min(0, "Le montant doit être positif"),
  isMandatory: z.boolean().default(true),
  billingFrequency: z
    .enum(["once", "monthly", "quarterly", "annually"])
    .default("once"),
});

// Schémas de validation pour les factures
export const invoiceSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Format de date invalide",
    }),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        feeTypeId: z.string().min(1, "Le type de frais est requis"),
        description: z.string().min(1, "La description est requise"),
        quantity: z.number().min(1, "La quantité doit être au moins 1"),
        unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
        totalPrice: z.number().min(0, "Le prix total doit être positif"),
      })
    )
    .min(1, "Au moins un élément est requis"),
});

// Schémas de validation pour les paiements
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "La facture est requise"),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  paymentDate: z
    .string()
    .min(1, "La date de paiement est requise")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format de date invalide",
    }),
  paymentMethod: z.enum(["cash", "bank_transfer", "check", "mobile_money"], {
    required_error: "La méthode de paiement est requise",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Schémas de validation pour les dépenses
export const expenseSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  amount: z.string().min(0.01, "Le montant doit être supérieur à 0"),
  expenseDate: z
    .string()
    .min(1, "La date de dépense est requise")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format de date invalide",
    }),
  category: z.enum(
    ["salaries", "utilities", "supplies", "maintenance", "other"],
    {
      message: "La catégorie est requise",
    }
  ),
  supplier: z.string().optional(),
  receiptUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "URL invalide",
    }),
});

// Schémas de validation pour la facturation en masse
export const bulkBillingSchema = z.object({
  target: z.enum(["school", "level", "section", "class"], {
    required_error: "La cible est requise",
  }),
  targetId: z.string().optional(),
  feeTypeIds: z
    .array(z.string())
    .min(1, "Au moins un type de frais est requis"),
  dueDate: z
    .string()
    .min(1, "La date d'échéance est requise")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format de date invalide",
    }),
  notes: z.string().optional(),
});

// Types TypeScript dérivés des schémas Zod
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type SchoolFormData = z.infer<typeof schoolSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type AcademicYearFormData = z.infer<typeof academicYearSchema>;
export type LevelFormData = z.infer<typeof levelSchema>;
export type SectionFormData = z.infer<typeof sectionSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type FeeTypeFormData = z.infer<typeof feeTypeSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type BulkBillingFormData = z.infer<typeof bulkBillingSchema>;

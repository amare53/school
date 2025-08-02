// Types pour le système de caisse

export type CashRegisterSessionStatus =
  | "opening_control"
  | "in_progress"
  | "closed";
export type CashMovementType = "in" | "out";
export type PaymentMode = "cash" | "mobile_money" | "bank_transfer" | "check";

export interface CashRegisterSession {
  id: string;
  schoolId: string;
  cashierId: string;
  sessionNumber: string;
  sessionDate: string;
  closingDate?: string;
  startingCashAmount: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number;
  cashDifference?: number;
  status: CashRegisterSessionStatus;
  notes?: string;
  createdAt: string;
  closedAt?: string;

  // Relations
  cashier?: any;
  payments?: Payment[];
  cashMovements?: CashMovement[];
}

export interface Payment {
  id: string;
  sessionId: string;
  schoolId: string;
  studentId: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  feeTypeId: string;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;

  // Relations
  student?: any;
  feeType?: any;
  session?: CashRegisterSession;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  schoolId: string;
  movementNumber: string;
  typeMovement: CashMovementType;
  amount: number;
  movementDate: string;
  reason: string;
  description?: string;
  createdBy: string;
  createdAt: string;

  // Relations
  session?: CashRegisterSession;
}

// Types pour les formulaires
export interface CashRegisterSessionFormData {
  openingBalance: number;
  notes?: string;
}

export interface PaymentFormData {
  studentId: string;
  amount: number;
  paymentMode: PaymentMode;
  feeTypeId: string;
  reference?: string;
  notes?: string;
}

export interface CashMovementFormData {
  type: CashMovementType;
  amount: number;
  reason: string;
  description?: string;
}

export interface SessionClosingFormData {
  actualClosingBalance: number;
  notes?: string;
}

// Types pour les rapports
export interface CashRegisterReport {
  sessionId: string;
  sessionNumber: string;
  cashierName: string;
  openingDate: string;
  closingDate?: string;
  openingBalance: number;
  totalPayments: number;
  totalMovementsIn: number;
  totalMovementsOut: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number;
  cashDifference?: number;
  paymentsByMode: Record<PaymentMode, number>;
  paymentsCount: number;
  movementsCount: number;
}

export interface DailyCashReport {
  date: string;
  sessionsCount: number;
  totalEncaisse: number;
  totalMovementsIn: number;
  totalMovementsOut: number;
  totalDifference: number;
  paymentsByMode: Record<PaymentMode, number>;
  sessions: CashRegisterReport[];
}

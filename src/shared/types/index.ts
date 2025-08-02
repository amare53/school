// Types globaux de l'application

import { USER_ROLES } from "../constants";

// Énumérations
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = "active" | "inactive" | "archived";
export type SchoolStatus = "active" | "suspended" | "archived";
export type StudentStatus =
  | "active"
  | "graduated"
  | "transferred"
  | "dropped_out"
  | "archived";
export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "check" | "mobile_money";
export type Gender = "male" | "female";

// Réexporter les types de caisse
export * from "./cash";

// Entités de base
export interface User {
  id: string;
  schoolId?: string; // Optionnel pour platform_admin
  school?: School; // Optionnel pour platform_admin
  assignedSchools?: string[]; // Pour school_manager qui peut gérer plusieurs écoles
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  archivedAt?: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  status: SchoolStatus;
  subscriptionPlan: string;
  currency: "CDF" | "USD";
  createdAt: string;
  archivedAt?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth?: string;
  gender?: Gender;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  status: StudentStatus;
  createdAt: string;
  archivedAt?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived";
  isCurrent: boolean;
  createdAt: string;
}

export interface Level {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  orderIndex: number;
  createdAt: string;
}

export interface Section {
  id: string;
  schoolId: string;
  levelId: string;
  name: string;
  code: string;
  createdAt: string;
  level?: Level;
}

export interface Class {
  id: string;
  schoolId: string;
  academicYearId: string;
  sectionId: string;
  name: string;
  capacity?: number;
  createdAt: string;
  section?: Section;
  academicYear?: AcademicYear;
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  student?: Student;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  feeTypeId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  feeTypeId: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  student?: Student;
  feeType?: FeeType;
}

export interface AccountingEntry {
  id: string;
  schoolId: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceType: "payment" | "invoice" | "expense";
  referenceId: string;
  debitAmount: number;
  creditAmount: number;
  accountCode: string;
  currency: string;
  createdAt: string;
}

export interface BillingRule {
  id: string;
  schoolId: string;
  feeTypeId: string;
  targetType: "school" | "section" | "class";
  targetId?: string;
  amountOverride?: number;
  createdAt: string;
}

export interface FeeType {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  amount: number;
  isMandatory: boolean;
  billingFrequency: "once" | "monthly" | "quarterly" | "annually";
  createdAt: string;
}

export interface Expense {
  id: string;
  schoolId: string;
  expenseNumber: string;
  description: string;
  amount: number;
  expenseDate: string;
  category: "salaries" | "utilities" | "supplies" | "maintenance" | "other";
  supplier?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: string;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  classId?: string;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  password?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres
export interface StudentFilters {
  academicYear?: string;
  class?: string;
  status?: StudentStatus;
  searchTerm?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
  studentId?: string;
  searchTerm?: string;
}

// Types pour les statistiques
export interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: MonthlyStats[];
  recentPayments: Payment[];
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  students: number;
}

// Types pour les notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  duration?: number;
  createdAt?: string;
  actionUrl?: string;
}

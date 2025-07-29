import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  School, 
  User, 
  AcademicYear, 
  Level, 
  Section, 
  Class, 
  Student,
  Invoice,
  Payment,
  FeeType,
  Expense,
  AccountingEntry
} from '../types';

// Données simulées complètes
interface FakeDataState {
  schools: School[];
  users: User[];
  academicYears: AcademicYear[];
  levels: Level[];
  sections: Section[];
  classes: Class[];
  students: Student[];
  feeTypes: FeeType[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  accountingEntries: AccountingEntry[];
  
  // Méthodes pour récupérer les données
  getSchools: () => School[];
  getSchoolById: (id: string) => School | undefined;
  getUsersBySchool: (schoolId: string) => User[];
  getAcademicYearsBySchool: (schoolId: string) => AcademicYear[];
  getSectionsBySchool: (schoolId: string) => Section[];
  getClassesBySchool: (schoolId: string) => Class[];
  getStudentsBySchool: (schoolId: string) => Student[];
  getEnrollmentsByStudent: (studentId: string) => any[];
  getFeeTypesBySchool: (schoolId: string) => FeeType[];
  getBillingRulesBySchool: (schoolId: string) => any[];
  getInvoicesBySchool: (schoolId: string) => Invoice[];
  getPaymentsBySchool: (schoolId: string) => Payment[];
  getPaymentsByInvoice: (invoiceId: string) => Payment[];
  getAccountingEntriesBySchool: (schoolId: string) => AccountingEntry[];
  getAccountingEntriesByPayment: (paymentId: string) => AccountingEntry[];
  getAccountingEntriesByExpense: (expenseId: string) => AccountingEntry[];
  getExpensesBySchool: (schoolId: string) => Expense[];
  bulkCreateInvoices: (data: any) => Promise<{ created: number; failed: number }>;
  
  // Méthodes CRUD
  addSchool: (school: Omit<School, 'id' | 'createdAt'>) => School;
  updateSchool: (id: string, updates: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addAcademicYear: (year: Omit<AcademicYear, 'id' | 'createdAt'>) => AcademicYear;
  updateAcademicYear: (id: string, updates: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;
  
  addSection: (section: Omit<Section, 'id' | 'createdAt'>) => Section;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  
  addClass: (classItem: Omit<Class, 'id' | 'createdAt'>) => Class;
  updateClass: (id: string, updates: Partial<Class>) => void;
  deleteClass: (id: string) => void;
  
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addEnrollment: (enrollment: any) => any;
  
  addFeeType: (feeType: Omit<FeeType, 'id' | 'createdAt'>) => FeeType;
  updateFeeType: (id: string, updates: Partial<FeeType>) => void;
  deleteFeeType: (id: string) => void;
  
  addBillingRule: (rule: any) => any;
  updateBillingRule: (id: string, updates: any) => void;
  deleteBillingRule: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  addAccountingEntry: (entry: Omit<AccountingEntry, 'id' | 'createdAt'>) => AccountingEntry;
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

// Fonction utilitaire pour générer des IDs
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Données initiales
const initialSchools: School[] = [
  {
    id: 'school-1',
    name: 'École Primaire Les Palmiers',
    address: '123 Avenue de la Paix, Dakar',
    phone: '+221 33 123 45 67',
    email: 'contact@palmiers.sn',
    status: 'active',
    subscriptionPlan: 'premium',
    currency: 'CDF',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'school-2',
    name: 'Collège Moderne de Thiès',
    address: '456 Rue de l\'Indépendance, Thiès',
    phone: '+221 33 987 65 43',
    email: 'info@college-thies.sn',
    status: 'active',
    subscriptionPlan: 'standard',
    currency: 'USD',
    createdAt: '2023-03-20T00:00:00Z',
  },
  {
    id: 'school-3',
    name: 'Lycée Technique de Saint-Louis',
    address: '789 Boulevard Faidherbe, Saint-Louis',
    phone: '+221 33 456 78 90',
    email: 'admin@lycee-sl.sn',
    status: 'suspended',
    subscriptionPlan: 'basic',
    currency: 'CDF',
    createdAt: '2022-09-10T00:00:00Z',
  },
];

const initialUsers: User[] = [
  // Admin Plateforme
  {
    id: 'user-1',
    schoolId: '',
    email: 'admin@school.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'platform_admin',
    phone: '+221 77 123 45 67',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    schoolId: 'school-1',
    email: 'admin.ecole1@school.com',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'school_manager',
    phone: '+221 77 234 56 78',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'user-3',
    schoolId: 'school-1',
    email: 'cashier1@school.com',
    firstName: 'Pierre',
    lastName: 'Durand',
    role: 'cashier',
    phone: '+221 77 345 67 89',
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'user-4',
    schoolId: 'school-1',
    email: 'accountant1@school.com',
    firstName: 'Sophie',
    lastName: 'Bernard',
    role: 'accountant',
    phone: '+221 77 456 78 90',
    status: 'active',
    createdAt: '2024-01-25T00:00:00Z',
  },
  // École 2 - Collège Thiès
  {
    id: 'user-5',
    schoolId: 'school-2',
    email: 'admin.ecole2@school.com',
    firstName: 'Amadou',
    lastName: 'Diallo',
    role: 'school_manager',
    phone: '+221 77 567 89 01',
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-6',
    schoolId: 'school-2',
    email: 'cashier2@school.com',
    firstName: 'Fatou',
    lastName: 'Sow',
    role: 'cashier',
    phone: '+221 77 678 90 12',
    status: 'active',
    createdAt: '2024-02-05T00:00:00Z',
  },
  // École 3 - Lycée Saint-Louis
  {
    id: 'user-7',
    schoolId: 'school-3',
    email: 'admin.ecole3@school.com',
    firstName: 'Ousmane',
    lastName: 'Fall',
    role: 'school_manager',
    phone: '+221 77 789 01 23',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
  },
];

const initialAcademicYears: AcademicYear[] = [
  // École 1
  {
    id: 'year-1',
    schoolId: 'school-1',
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-07-31',
    status: 'active',
    isCurrent: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'year-2',
    schoolId: 'school-1',
    name: '2023-2024',
    startDate: '2023-09-01',
    endDate: '2024-07-31',
    status: 'archived',
    isCurrent: false,
    createdAt: '2023-01-15T00:00:00Z',
  },
  // École 2
  {
    id: 'year-3',
    schoolId: 'school-2',
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-07-31',
    status: 'active',
    isCurrent: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
  // École 3
  {
    id: 'year-4',
    schoolId: 'school-3',
    name: '2024-2025',
    startDate: '2024-09-01',
    endDate: '2025-07-31',
    status: 'active',
    isCurrent: true,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

const initialLevels: Level[] = [
  // École 1 - Primaire
  { id: 'level-1', schoolId: 'school-1', name: 'Cours d\'Initiation (CI)', code: 'CI', orderIndex: 1, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'level-2', schoolId: 'school-1', name: 'Cours Préparatoire (CP)', code: 'CP', orderIndex: 2, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'level-3', schoolId: 'school-1', name: 'Cours Élémentaire 1ère année (CE1)', code: 'CE1', orderIndex: 3, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'level-4', schoolId: 'school-1', name: 'Cours Élémentaire 2ème année (CE2)', code: 'CE2', orderIndex: 4, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'level-5', schoolId: 'school-1', name: 'Cours Moyen 1ère année (CM1)', code: 'CM1', orderIndex: 5, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'level-6', schoolId: 'school-1', name: 'Cours Moyen 2ème année (CM2)', code: 'CM2', orderIndex: 6, createdAt: '2024-01-15T00:00:00Z' },
  
  // École 2 - Collège
  { id: 'level-7', schoolId: 'school-2', name: '6ème', code: '6EME', orderIndex: 1, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'level-8', schoolId: 'school-2', name: '5ème', code: '5EME', orderIndex: 2, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'level-9', schoolId: 'school-2', name: '4ème', code: '4EME', orderIndex: 3, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'level-10', schoolId: 'school-2', name: '3ème', code: '3EME', orderIndex: 4, createdAt: '2024-02-01T00:00:00Z' },
  
  // École 3 - Lycée
  { id: 'level-11', schoolId: 'school-3', name: 'Seconde', code: '2NDE', orderIndex: 1, createdAt: '2024-03-01T00:00:00Z' },
  { id: 'level-12', schoolId: 'school-3', name: 'Première', code: '1ERE', orderIndex: 2, createdAt: '2024-03-01T00:00:00Z' },
  { id: 'level-13', schoolId: 'school-3', name: 'Terminale', code: 'TERM', orderIndex: 3, createdAt: '2024-03-01T00:00:00Z' },
];

const initialSections: Section[] = [
  // École 1 - Sections Congo
  { id: 'section-1', schoolId: 'school-1', levelId: '', name: 'Maternel', code: 'MAT', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'section-2', schoolId: 'school-1', levelId: '', name: 'Primaire', code: 'PRI', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'section-3', schoolId: 'school-1', levelId: '', name: 'Secondaire', code: 'SEC', createdAt: '2024-01-15T00:00:00Z' },
  
  // École 2 - Sections Congo
  { id: 'section-4', schoolId: 'school-2', levelId: '', name: 'Maternel', code: 'MAT', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'section-5', schoolId: 'school-2', levelId: '', name: 'Primaire', code: 'PRI', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'section-6', schoolId: 'school-2', levelId: '', name: 'Secondaire', code: 'SEC', createdAt: '2024-02-01T00:00:00Z' },
  
  // École 3 - Sections Congo
  { id: 'section-7', schoolId: 'school-3', levelId: '', name: 'Maternel', code: 'MAT', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'section-8', schoolId: 'school-3', levelId: '', name: 'Primaire', code: 'PRI', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'section-9', schoolId: 'school-3', levelId: '', name: 'Secondaire', code: 'SEC', createdAt: '2024-03-01T00:00:00Z' },
];

const initialClasses: Class[] = [
  // École 1 - Classes Congo
  { id: 'class-1', schoolId: 'school-1', academicYearId: 'year-1', sectionId: 'section-1', name: 'Maternel-A-2024', capacity: 20, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'class-2', schoolId: 'school-1', academicYearId: 'year-1', sectionId: 'section-2', name: 'Primaire-A-2024', capacity: 30, createdAt: '2024-01-15T00:00:00Z' },
  { id: 'class-3', schoolId: 'school-1', academicYearId: 'year-1', sectionId: 'section-3', name: 'Secondaire-A-2024', capacity: 35, createdAt: '2024-01-15T00:00:00Z' },
  
  // École 2 - Classes Congo
  { id: 'class-4', schoolId: 'school-2', academicYearId: 'year-3', sectionId: 'section-4', name: 'Maternel-A-2024', capacity: 18, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'class-5', schoolId: 'school-2', academicYearId: 'year-3', sectionId: 'section-5', name: 'Primaire-A-2024', capacity: 28, createdAt: '2024-02-01T00:00:00Z' },
  
  // École 3 - Classes Congo
  { id: 'class-6', schoolId: 'school-3', academicYearId: 'year-4', sectionId: 'section-7', name: 'Maternel-A-2024', capacity: 15, createdAt: '2024-03-01T00:00:00Z' },
];

const initialStudents: Student[] = [
  // École 1 - Élèves primaire
  { id: 'student-1', schoolId: 'school-1', studentNumber: 'PAL240001', firstName: 'Aminata', lastName: 'Diop', dateOfBirth: '2018-05-15', gender: 'female', parentName: 'Moussa Diop', parentPhone: '+221 77 111 11 11', parentEmail: 'moussa.diop@email.com', address: 'Dakar, Sénégal', status: 'active', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'student-2', schoolId: 'school-1', studentNumber: 'PAL240002', firstName: 'Ibrahima', lastName: 'Ndiaye', dateOfBirth: '2018-03-22', gender: 'male', parentName: 'Fatou Ndiaye', parentPhone: '+221 77 222 22 22', parentEmail: 'fatou.ndiaye@email.com', address: 'Dakar, Sénégal', status: 'active', createdAt: '2024-01-21T00:00:00Z' },
  { id: 'student-3', schoolId: 'school-1', studentNumber: 'PAL240003', firstName: 'Khadija', lastName: 'Ba', dateOfBirth: '2017-11-08', gender: 'female', parentName: 'Omar Ba', parentPhone: '+221 77 333 33 33', parentEmail: 'omar.ba@email.com', address: 'Dakar, Sénégal', status: 'active', createdAt: '2024-01-22T00:00:00Z' },
  
  // École 2 - Élèves collège
  { id: 'student-4', schoolId: 'school-2', studentNumber: 'THI240001', firstName: 'Mamadou', lastName: 'Sy', dateOfBirth: '2012-07-12', gender: 'male', parentName: 'Aissatou Sy', parentPhone: '+221 77 444 44 44', parentEmail: 'aissatou.sy@email.com', address: 'Thiès, Sénégal', status: 'active', createdAt: '2024-02-05T00:00:00Z' },
  { id: 'student-5', schoolId: 'school-2', studentNumber: 'THI240002', firstName: 'Awa', lastName: 'Cissé', dateOfBirth: '2012-09-30', gender: 'female', parentName: 'Cheikh Cissé', parentPhone: '+221 77 555 55 55', parentEmail: 'cheikh.cisse@email.com', address: 'Thiès, Sénégal', status: 'active', createdAt: '2024-02-06T00:00:00Z' },
  
  // École 3 - Élèves lycée
  { id: 'student-6', schoolId: 'school-3', studentNumber: 'SL240001', firstName: 'Ousmane', lastName: 'Diouf', dateOfBirth: '2008-12-03', gender: 'male', parentName: 'Mariama Diouf', parentPhone: '+221 77 666 66 66', parentEmail: 'mariama.diouf@email.com', address: 'Saint-Louis, Sénégal', status: 'active', createdAt: '2024-03-05T00:00:00Z' },
];

const initialFeeTypes: FeeType[] = [
  // École 1 - Frais primaire
  { id: 'fee-1', schoolId: 'school-1', name: 'Frais d\'inscription', description: 'Frais d\'inscription annuelle', amount: 50000, isMandatory: true, billingFrequency: 'once', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'fee-2', schoolId: 'school-1', name: 'Frais de scolarité', description: 'Frais de scolarité mensuelle', amount: 30000, isMandatory: true, billingFrequency: 'monthly', createdAt: '2024-01-15T00:00:00Z' },
  { id: 'fee-3', schoolId: 'school-1', name: 'Frais de cantine', description: 'Frais de restauration', amount: 15000, isMandatory: false, billingFrequency: 'monthly', createdAt: '2024-01-15T00:00:00Z' },
  
  // École 2 - Frais collège
  { id: 'fee-4', schoolId: 'school-2', name: 'Frais d\'inscription', description: 'Frais d\'inscription annuelle', amount: 150, isMandatory: true, billingFrequency: 'once', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'fee-5', schoolId: 'school-2', name: 'Frais de scolarité', description: 'Frais de scolarité mensuelle', amount: 80, isMandatory: true, billingFrequency: 'monthly', createdAt: '2024-02-01T00:00:00Z' },
  
  // École 3 - Frais lycée
  { id: 'fee-6', schoolId: 'school-3', name: 'Frais d\'inscription', description: 'Frais d\'inscription annuelle', amount: 75000, isMandatory: true, billingFrequency: 'once', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'fee-7', schoolId: 'school-3', name: 'Frais de scolarité', description: 'Frais de scolarité mensuelle', amount: 45000, isMandatory: true, billingFrequency: 'monthly', createdAt: '2024-03-01T00:00:00Z' },
];

const initialInvoices: Invoice[] = [
  // École 1 - Factures
  {
    id: 'invoice-1',
    schoolId: 'school-1',
    studentId: 'student-1',
    invoiceNumber: 'FAC-PAL-202401-0001',
    issueDate: '2024-01-20',
    dueDate: '2024-02-20',
    totalAmount: 50000,
    paidAmount: 50000,
    status: 'paid',
    notes: 'Frais d\'inscription 2024-2025',
    createdBy: 'user-3',
    createdAt: '2024-01-20T00:00:00Z',
    items: [
      {
        id: 'item-1',
        invoiceId: 'invoice-1',
        feeTypeId: 'fee-1',
        description: 'Frais d\'inscription',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
      }
    ],
  },
  {
    id: 'invoice-2',
    schoolId: 'school-1',
    studentId: 'student-2',
    invoiceNumber: 'FAC-PAL-202401-0002',
    issueDate: '2024-01-21',
    dueDate: '2024-02-21',
    totalAmount: 80000,
    paidAmount: 30000,
    status: 'pending',
    notes: 'Frais d\'inscription + 1er mois scolarité',
    createdBy: 'user-3',
    createdAt: '2024-01-21T00:00:00Z',
    items: [
      {
        id: 'item-2',
        invoiceId: 'invoice-2',
        feeTypeId: 'fee-1',
        description: 'Frais d\'inscription',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
      },
      {
        id: 'item-3',
        invoiceId: 'invoice-2',
        feeTypeId: 'fee-2',
        description: 'Frais de scolarité - Janvier 2024',
        quantity: 1,
        unitPrice: 30000,
        totalPrice: 30000,
      }
    ],
  },
];

const initialPayments: Payment[] = [
  {
    id: 'payment-1',
    schoolId: 'school-1',
    studentId: 'student-1',
    feeTypeId: 'fee-1',
    paymentNumber: 'PAY-PAL-202401-0001',
    amount: 50000,
    paymentDate: '2024-01-20',
    paymentMethod: 'cash',
    reference: '',
    notes: 'Paiement complet en espèces',
    createdBy: 'user-3',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'payment-2',
    schoolId: 'school-1',
    studentId: 'student-2',
    feeTypeId: 'fee-2',
    paymentNumber: 'PAY-PAL-202401-0002',
    amount: 30000,
    paymentDate: '2024-01-21',
    paymentMethod: 'mobile_money',
    reference: 'MM123456789',
    notes: 'Paiement partiel via Mobile Money',
    createdBy: 'user-3',
    createdAt: '2024-01-21T00:00:00Z',
  },
];

const initialBillingRules: any[] = [
  {
    id: 'rule-1',
    schoolId: 'school-1',
    feeTypeId: 'fee-2',
    targetType: 'section',
    targetId: 'section-3', // Secondaire
    amountOverride: 40000, // Surcharge pour le secondaire
    createdAt: '2024-01-15T00:00:00Z',
  },
];

const initialAccountingEntries: AccountingEntry[] = [
  // Écritures pour le paiement 1
  {
    id: 'entry-1',
    schoolId: 'school-1',
    entryNumber: 'ECR-PAY-PAL-202401-0001',
    entryDate: '2024-01-20',
    description: 'Encaissement paiement PAY-PAL-202401-0001',
    referenceType: 'payment',
    referenceId: 'payment-1',
    debitAmount: 50000,
    creditAmount: 0,
    accountCode: '5111',
    currency: 'CDF',
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'entry-2',
    schoolId: 'school-1',
    entryNumber: 'ECR-PAY-PAL-202401-0001-2',
    entryDate: '2024-01-20',
    description: 'Règlement client PAY-PAL-202401-0001',
    referenceType: 'payment',
    referenceId: 'payment-1',
    debitAmount: 0,
    creditAmount: 50000,
    accountCode: '4111',
    currency: 'CDF',
    createdAt: '2024-01-20T00:00:00Z',
  },
  // Écritures pour le paiement 2
  {
    id: 'entry-3',
    schoolId: 'school-1',
    entryNumber: 'ECR-PAY-PAL-202401-0002',
    entryDate: '2024-01-21',
    description: 'Encaissement paiement PAY-PAL-202401-0002',
    referenceType: 'payment',
    referenceId: 'payment-2',
    debitAmount: 30000,
    creditAmount: 0,
    accountCode: '5111',
    currency: 'CDF',
    createdAt: '2024-01-21T00:00:00Z',
  },
  {
    id: 'entry-4',
    schoolId: 'school-1',
    entryNumber: 'ECR-PAY-PAL-202401-0002-2',
    entryDate: '2024-01-21',
    description: 'Règlement client PAY-PAL-202401-0002',
    referenceType: 'payment',
    referenceId: 'payment-2',
    debitAmount: 0,
    creditAmount: 30000,
    accountCode: '4111',
    currency: 'CDF',
    createdAt: '2024-01-21T00:00:00Z',
  },
  // Écritures pour les dépenses
  {
    id: 'entry-5',
    schoolId: 'school-1',
    entryNumber: 'ECR-DEP-PAL-202401-0001',
    entryDate: '2024-01-15',
    description: 'Dépense Fournitures scolaires',
    referenceType: 'expense',
    referenceId: 'expense-1',
    debitAmount: 25000,
    creditAmount: 0,
    accountCode: '6011',
    currency: 'CDF',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'entry-6',
    schoolId: 'school-1',
    entryNumber: 'ECR-DEP-PAL-202401-0001-2',
    entryDate: '2024-01-15',
    description: 'Sortie de caisse DEP-PAL-202401-0001',
    referenceType: 'expense',
    referenceId: 'expense-1',
    debitAmount: 0,
    creditAmount: 25000,
    accountCode: '5111',
    currency: 'CDF',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

const initialExpenses: Expense[] = [
  // École 1 - Dépenses
  {
    id: 'expense-1',
    schoolId: 'school-1',
    expenseNumber: 'DEP-PAL-202401-0001',
    description: 'Achat de fournitures scolaires pour le trimestre',
    amount: 25000,
    expenseDate: '2024-01-15',
    category: 'supplies',
    supplier: 'Librairie Moderne',
    receiptUrl: 'https://storage.example.com/receipts/fournitures-jan-2024.pdf',
    createdBy: 'user-3',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'expense-2',
    schoolId: 'school-1',
    expenseNumber: 'DEP-PAL-202401-0002',
    description: 'Facture d\'électricité - Janvier 2024',
    amount: 45000,
    expenseDate: '2024-01-25',
    category: 'utilities',
    supplier: 'SENELEC',
    receiptUrl: 'https://storage.example.com/receipts/electricite-jan-2024.pdf',
    createdBy: 'user-3',
    createdAt: '2024-01-25T00:00:00Z',
  },
  {
    id: 'expense-3',
    schoolId: 'school-1',
    expenseNumber: 'DEP-PAL-202401-0003',
    description: 'Salaire enseignant - Janvier 2024',
    amount: 150000,
    expenseDate: '2024-01-30',
    category: 'salaries',
    supplier: '',
    receiptUrl: '',
    createdBy: 'user-2',
    createdAt: '2024-01-30T00:00:00Z',
  },
  
  // École 2 - Dépenses
  {
    id: 'expense-4',
    schoolId: 'school-2',
    expenseNumber: 'DEP-THI-202401-0001',
    description: 'Réparation du système informatique',
    amount: 75,
    expenseDate: '2024-01-20',
    category: 'maintenance',
    supplier: 'TechService Thiès',
    receiptUrl: 'https://storage.example.com/receipts/reparation-jan-2024.pdf',
    createdBy: 'user-6',
    createdAt: '2024-01-20T00:00:00Z',
  },
];

export const useFakeDataStore = create<FakeDataState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // État initial
      schools: initialSchools,
      users: initialUsers,
      academicYears: initialAcademicYears,
      levels: [],
      sections: initialSections,
      classes: initialClasses,
      students: initialStudents,
      feeTypes: initialFeeTypes,
      invoices: initialInvoices,
      payments: initialPayments,
      expenses: initialExpenses,
      accountingEntries: initialAccountingEntries,

      // Méthodes de récupération
      getSchools: () => get().schools,
      
      getSchoolById: (id: string) => get().schools.find(s => s.id === id),
      
      getUsersBySchool: (schoolId: string) => {
        const { users } = get();
        return schoolId ? users.filter(u => u.schoolId === schoolId) : users;
      },
      
      getAcademicYearsBySchool: (schoolId: string) => {
        const { academicYears } = get();
        return academicYears.filter(y => y.schoolId === schoolId);
      },
      
      getSectionsBySchool: (schoolId: string) => {
        const { sections } = get();
        return sections
          .filter(s => s.schoolId === schoolId)
          .map(section => section);
      },
      
      getClassesBySchool: (schoolId: string) => {
        const { classes, sections, academicYears } = get();
        return classes
          .filter(c => c.schoolId === schoolId)
          .map(classItem => ({
            ...classItem,
            section: sections.find(s => s.id === classItem.sectionId),
            academicYear: academicYears.find(y => y.id === classItem.academicYearId)
          }));
      },
      
      getStudentsBySchool: (schoolId: string) => {
        const { students } = get();
        return students.filter(s => s.schoolId === schoolId);
      },
      
      getEnrollmentsByStudent: (studentId: string) => {
        // Simulation - à implémenter avec une vraie table d'inscriptions
        return [];
      },
      
      getFeeTypesBySchool: (schoolId: string) => {
        const { feeTypes } = get();
        return feeTypes.filter(f => f.schoolId === schoolId);
      },
      
      getBillingRulesBySchool: (schoolId: string) => {
        return initialBillingRules.filter(r => r.schoolId === schoolId);
      },
      
      getInvoicesBySchool: (schoolId: string) => {
        const { invoices } = get();
        return invoices.filter(i => i.schoolId === schoolId);
      },
      
      getPaymentsBySchool: (schoolId: string) => {
        const { payments } = get();
        return payments.filter(p => p.schoolId === schoolId);
      },
      
      getPaymentsByInvoice: (invoiceId: string) => {
        const { payments } = get();
        return []; // Plus utilisé car plus de factures
      },
      
      getAccountingEntriesBySchool: (schoolId: string) => {
        const { accountingEntries } = get();
        return accountingEntries.filter(e => e.schoolId === schoolId);
      },
      
      getAccountingEntriesByPayment: (paymentId: string) => {
        const { accountingEntries } = get();
        return accountingEntries.filter(e => e.referenceType === 'payment' && e.referenceId === paymentId);
      },
      
      getAccountingEntriesByExpense: (expenseId: string) => {
        const { accountingEntries } = get();
        return accountingEntries.filter(e => e.referenceType === 'expense' && e.referenceId === expenseId);
      },
      
      getExpensesBySchool: (schoolId: string) => {
        const { expenses } = get();
        return expenses.filter(e => e.schoolId === schoolId);
      },
      
      bulkCreateInvoices: async (data: any) => {
        // Simulation de création en masse
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { students } = get();
        const affectedStudents = students.filter(s => s.schoolId === data.schoolId);
        const created = Math.floor(affectedStudents.length * 0.9); // 90% de succès
        const failed = affectedStudents.length - created;
        
        return { created, failed };
      },

      // Méthodes CRUD pour Schools
      addSchool: (schoolData) => {
        const newSchool: School = {
          ...schoolData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.schools.push(newSchool);
        });
        
        return newSchool;
      },

      updateSchool: (id, updates) => {
        set((state) => {
          const index = state.schools.findIndex(s => s.id === id);
          if (index !== -1) {
            Object.assign(state.schools[index], updates);
          }
        });
      },

      deleteSchool: (id) => {
        set((state) => {
          state.schools = state.schools.filter(s => s.id !== id);
          // Supprimer aussi toutes les données liées
          state.users = state.users.filter(u => u.schoolId !== id);
          state.academicYears = state.academicYears.filter(y => y.schoolId !== id);
          state.levels = state.levels.filter(l => l.schoolId !== id);
          state.sections = state.sections.filter(s => s.schoolId !== id);
          state.classes = state.classes.filter(c => c.schoolId !== id);
          state.students = state.students.filter(s => s.schoolId !== id);
        });
      },

      // Méthodes CRUD pour Users
      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.users.push(newUser);
        });
        
        return newUser;
      },

      updateUser: (id, updates) => {
        set((state) => {
          const index = state.users.findIndex(u => u.id === id);
          if (index !== -1) {
            Object.assign(state.users[index], updates);
          }
        });
      },

      deleteUser: (id) => {
        set((state) => {
          state.users = state.users.filter(u => u.id !== id);
        });
      },

      // Méthodes CRUD pour Academic Years
      addAcademicYear: (yearData) => {
        const newYear: AcademicYear = {
          ...yearData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.academicYears.push(newYear);
        });
        
        return newYear;
      },

      updateAcademicYear: (id, updates) => {
        set((state) => {
          const index = state.academicYears.findIndex(y => y.id === id);
          if (index !== -1) {
            Object.assign(state.academicYears[index], updates);
          }
        });
      },

      deleteAcademicYear: (id) => {
        set((state) => {
          state.academicYears = state.academicYears.filter(y => y.id !== id);
          // Supprimer les classes liées
          state.classes = state.classes.filter(c => c.academicYearId !== id);
        });
      },


      // Méthodes CRUD pour Sections
      addSection: (sectionData) => {
        const newSection: Section = {
          ...sectionData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.sections.push(newSection);
        });
        
        return newSection;
      },

      updateSection: (id, updates) => {
        set((state) => {
          const index = state.sections.findIndex(s => s.id === id);
          if (index !== -1) {
            Object.assign(state.sections[index], updates);
          }
        });
      },

      deleteSection: (id) => {
        set((state) => {
          state.sections = state.sections.filter(s => s.id !== id);
          // Supprimer les classes liées
          state.classes = state.classes.filter(c => c.sectionId !== id);
        });
      },

      // Méthodes CRUD pour Classes
      addClass: (classData) => {
        const newClass: Class = {
          ...classData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.classes.push(newClass);
        });
        
        return newClass;
      },

      updateClass: (id, updates) => {
        set((state) => {
          const index = state.classes.findIndex(c => c.id === id);
          if (index !== -1) {
            Object.assign(state.classes[index], updates);
          }
        });
      },

      deleteClass: (id) => {
        set((state) => {
          state.classes = state.classes.filter(c => c.id !== id);
        });
      },

      // Méthodes CRUD pour Students
      addStudent: (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.students.push(newStudent);
        });
        
        return newStudent;
      },

      updateStudent: (id, updates) => {
        set((state) => {
          const index = state.students.findIndex(s => s.id === id);
          if (index !== -1) {
            Object.assign(state.students[index], updates);
          }
        });
      },

      deleteStudent: (id) => {
        set((state) => {
          state.students = state.students.filter(s => s.id !== id);
        });
      },
      
      // Méthodes CRUD pour Enrollments (simulation)
      addEnrollment: (enrollmentData) => {
        // Pour l'instant, on simule juste l'ajout
        // Dans une vraie implémentation, on aurait une table enrollments
        console.log('Enrollment added:', enrollmentData);
        return { id: generateId(), ...enrollmentData, createdAt: new Date().toISOString() };
      },
      
      // Méthodes CRUD pour FeeTypes
      addFeeType: (feeTypeData) => {
        const newFeeType: FeeType = {
          ...feeTypeData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.feeTypes.push(newFeeType);
        });
        
        return newFeeType;
      },

      updateFeeType: (id, updates) => {
        set((state) => {
          const index = state.feeTypes.findIndex(f => f.id === id);
          if (index !== -1) {
            Object.assign(state.feeTypes[index], updates);
          }
        });
      },

      deleteFeeType: (id) => {
        set((state) => {
          state.feeTypes = state.feeTypes.filter(f => f.id !== id);
        });
      },
      
      // Méthodes CRUD pour BillingRules (simulation)
      addBillingRule: (ruleData) => {
        const newRule = { id: generateId(), ...ruleData, createdAt: new Date().toISOString() };
        initialBillingRules.push(newRule);
        return newRule;
      },

      updateBillingRule: (id, updates) => {
        const index = initialBillingRules.findIndex(r => r.id === id);
        if (index !== -1) {
          Object.assign(initialBillingRules[index], updates);
        }
      },
        
      deleteBillingRule: (id) => {
        const index = initialBillingRules.findIndex(r => r.id === id);
        if (index !== -1) {
          initialBillingRules.splice(index, 1);
        }
      },
      
      // Méthodes CRUD pour Invoices
      addInvoice: (invoiceData) => {
        const newInvoice: Invoice = {
          ...invoiceData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.invoices.push(newInvoice);
        });
        
        return newInvoice;
      },

      updateInvoice: (id, updates) => {
        set((state) => {
          const index = state.invoices.findIndex(i => i.id === id);
          if (index !== -1) {
            Object.assign(state.invoices[index], updates);
          }
        });
      },

      deleteInvoice: (id) => {
        set((state) => {
          state.invoices = state.invoices.filter(i => i.id !== id);
        });
      },
      
      // Méthodes CRUD pour Payments
      addPayment: (paymentData) => {
        const newPayment: Payment = {
          ...paymentData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.payments.push(newPayment);
        });
        
        return newPayment;
      },

      updatePayment: (id, updates) => {
        set((state) => {
          const index = state.payments.findIndex(p => p.id === id);
          if (index !== -1) {
            Object.assign(state.payments[index], updates);
          }
        });
      },

      deletePayment: (id) => {
        set((state) => {
          state.payments = state.payments.filter(p => p.id !== id);
        });
      },
      
      // Méthodes pour AccountingEntries
      addAccountingEntry: (entryData) => {
        const newEntry: AccountingEntry = {
          ...entryData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.accountingEntries.push(newEntry);
        });
        
        return newEntry;
      },
      
      // Méthodes CRUD pour Expenses
      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          state.expenses.push(newExpense);
        });
        
        return newExpense;
      },

      updateExpense: (id, updates) => {
        set((state) => {
          const index = state.expenses.findIndex(e => e.id === id);
          if (index !== -1) {
            Object.assign(state.expenses[index], updates);
          }
        });
      },

      deleteExpense: (id) => {
        set((state) => {
          state.expenses = state.expenses.filter(e => e.id !== id);
        });
      },
    }))
  )
);
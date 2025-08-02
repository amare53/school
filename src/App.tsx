import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { UserProfile } from "./features/auth/components/UserProfile";
import { SchoolsListPage } from "./features/schools/pages/SchoolsListPage";
import { AcademicStructurePage } from "./features/academic/pages/AcademicStructurePage";
import { AcademicYearsPage } from "./features/academic/pages/AcademicYearsPage";
import { SectionsPage } from "./features/academic/pages/SectionsPage";
import { ClassesPage } from "./features/academic/pages/ClassesPage";
import { StudentsListPage } from "./features/students/pages/StudentsListPage";
import { StudentDetailsPage } from "./features/students/pages/StudentDetailsPage";
import { StudentCreatePage } from "./features/students/pages/StudentCreatePage";
import { StudentEditPage } from "./features/students/pages/StudentEditPage";
import { StudentEnrollPage } from "./features/students/pages/StudentEnrollPage";
import { BillingPage } from "./features/billing/pages/BillingPage";
import { PaymentsPage } from "./features/payments/pages/PaymentsPage";
import { ExpensesPage } from "./features/expenses/pages/ExpensesPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { SchoolManagersListPage } from "./features/users/pages/SchoolManagersListPage";
import { UsersListPage } from "./features/users/pages/UsersListPage";
import { CashRegisterPage } from "./features/cash/pages/CashRegisterPage";
import { CashReportsPage } from "./features/cash/pages/CashReportsPage";
import { USER_ROLES } from "./shared/constants";

// Pages temporaires pour la démonstration
const Dashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <p className="text-gray-600">Vue d'ensemble de votre école</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Élèves</h3>
        <p className="text-3xl font-bold text-blue-600">1,234</p>
        <p className="text-sm text-gray-500">Total inscrits</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
        <p className="text-3xl font-bold text-green-600">2,450,000 CDF</p>
        <p className="text-sm text-gray-500">Ce mois</p>
      </div>

      {/* <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Factures</h3>
        <p className="text-3xl font-bold text-orange-600">45</p>
        <p className="text-sm text-gray-500">En attente</p>
      </div> */}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">Paiements</h3>
        <p className="text-3xl font-bold text-purple-600">156</p>
        <p className="text-sm text-gray-500">Aujourd'hui</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              requiredRoles={[
                USER_ROLES.PLATFORM_ADMIN,
                USER_ROLES.SCHOOL_MANAGER,
                USER_ROLES.ACCOUNTANT,
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schools"
          element={
            <ProtectedRoute
              requiredRoles={[
                USER_ROLES.PLATFORM_ADMIN,
                USER_ROLES.SCHOOL_MANAGER,
              ]}
            >
              <SchoolsListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/structure"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.SCHOOL_MANAGER]}>
              <AcademicStructurePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sections"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.SCHOOL_MANAGER]}>
              <SectionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academic-years"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.SCHOOL_MANAGER]}>
              <AcademicYearsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.SCHOOL_MANAGER]}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <StudentsListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/create"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <StudentCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <StudentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id/edit"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <StudentEditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id/enroll"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <StudentEnrollPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <BillingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute
              requiredRoles={[
                USER_ROLES.PLATFORM_ADMIN,
                USER_ROLES.SCHOOL_MANAGER,
                USER_ROLES.CASHIER,
              ]}
            >
              <ExpensesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute
              requiredRoles={[]}
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/school-managers"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.PLATFORM_ADMIN]}>
              <SchoolManagersListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRoles={[USER_ROLES.SCHOOL_MANAGER]}>
              <UsersListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cash"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <CashRegisterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cashier/reports"
          element={
            <ProtectedRoute
              requiredRoles={[USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER]}
            >
              <CashReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Routes temporaires pour la navigation */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900">
                  Page en construction
                </h1>
                <p className="text-gray-600 mt-2">
                  À implémenter dans les prochaines étapes
                </p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

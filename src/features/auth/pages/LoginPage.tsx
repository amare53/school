import React from "react";
import { Navigate } from "react-router-dom";
import { School, Shield, Users, BarChart3 } from "lucide-react";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../../../shared/hooks";
import { USER_ROLES } from "@/shared/constants";

const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role !== USER_ROLES.CASHIER ? "/dashboard" : "/students"}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Section gauche - Informations */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-blue-700 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          {/* Logo et titre */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <School className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SchoolManager Pro</h1>
                <p className="text-blue-100">Gestion scolaire intégrée</p>
              </div>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Gestion des Élèves
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Gérez facilement les dossiers élèves, inscriptions et suivez
                  leur parcours académique en temps réel.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Facturation Intelligente
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Automatisez la facturation, suivez les paiements et générez
                  des rapports financiers détaillés.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Sécurité & Conformité
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Données sécurisées, accès contrôlés par rôles et conformité
                  aux réglementations en vigueur.
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mt-12 pt-8 border-t border-white border-opacity-20">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-blue-100 text-sm">Écoles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50k+</div>
                <div className="text-blue-100 text-sm">Élèves</div>
              </div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-blue-100 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire de connexion */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                <School className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  SchoolManager Pro
                </h1>
                <p className="text-gray-600 text-sm">
                  Gestion scolaire intégrée
                </p>
              </div>
            </div>
          </div>

          {/* Titre du formulaire */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre tableau de bord
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <LoginForm />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 SchoolManager Pro. Tous droits réservés.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-blue-600">
                Conditions d'utilisation
              </a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600">
                Politique de confidentialité
              </a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
